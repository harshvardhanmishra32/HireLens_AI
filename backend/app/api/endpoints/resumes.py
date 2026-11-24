import uuid
from typing import List, Optional
import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from app.services.ocr import ocr_service
from app.services.ats_scorer import ats_scorer
from app.schemas.resume import ATSReportOut, CandidatePipelineItem
from app.api.endpoints.jobs import _JOBS_STORE

router = APIRouter()

MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".png", ".jpg", ".jpeg", ".tiff", ".bmp", ".webp", ".txt", ".md"}

def validate_uploaded_file(file: UploadFile, content: bytes) -> None:
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty."
        )
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {MAX_FILE_SIZE_BYTES // (1024*1024)}MB."
        )
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed formats: {', '.join(sorted(ALLOWED_EXTENSIONS))}."
        )

# In-memory candidate pipeline store
_PIPELINE_STORE: List[dict] = [
    {
        "id": "cand-1",
        "name": "Sarah Jenkins",
        "email": "sarah.j@gmail.com",
        "score": 94.8,
        "matching_skills": ["React", "Next.js", "TypeScript", "Tailwind CSS", "HTML5"],
        "pipeline_placement": "Technical Assessment",
        "fraud_status": "Clear",
        "is_fraud": False,
        "filename": "sarah_jenkins_resume.pdf"
    },
    {
        "id": "cand-2",
        "name": "David Chen",
        "email": "d.chen@aiux.org",
        "score": 88.2,
        "matching_skills": ["Python", "PyTorch", "NLP", "Machine Learning", "Scikit-Learn"],
        "pipeline_placement": "Applied",
        "fraud_status": "Clear",
        "is_fraud": False,
        "filename": "david_chen_cv.docx"
    },
    {
        "id": "cand-3",
        "name": "Alex Mercer",
        "email": "alexm@cloudops.net",
        "score": 62.5,
        "matching_skills": ["AWS", "Kubernetes", "Docker", "Linux"],
        "pipeline_placement": "Applied",
        "fraud_status": "White Text Found",
        "is_fraud": True,
        "filename": "alex_mercer_devops.pdf"
    }
]

@router.post("/analyze", response_model=ATSReportOut)
async def analyze_resume(
    file: UploadFile = File(...),
    job_title: Optional[str] = Form(None),
    job_description: Optional[str] = Form(None)
):
    """
    Direct Resume Analysis and ATS Scoring Endpoint:
    1. Extracts text from file (PDF native, PDF OCR fallback, DOCX, or direct images).
    2. Runs Anti-Fraud checks (detects white text or keyword stuffing).
    3. Calculates ATS compatibility match score against target job title/description.
    4. Identifies matched skills, missing skills, and custom improvement recommendations.
    """
    try:
        content = await file.read()
        validate_uploaded_file(file, content)

        # 1. Document Extraction & OCR
        doc_result = ocr_service.process_file(content, file.filename or "resume.pdf")
        raw_text = doc_result["raw_text"]

        if not raw_text.strip():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Unable to extract text from document. Ensure the document is readable."
            )

        # 2. ATS Scoring & Fraud Analysis
        score_report = ats_scorer.score(
            resume_text=raw_text,
            job_title=job_title,
            job_description=job_description,
            has_hidden_text=doc_result.get("has_hidden_text", False),
            hidden_text_snippets=doc_result.get("hidden_text_snippets", [])
        )

        return ATSReportOut(
            filename=file.filename or "resume.pdf",
            score=score_report["score"],
            matching=score_report["matching"],
            missing=score_report["missing"],
            extraction_method=doc_result["extraction_method"],
            is_scanned=doc_result["is_scanned"],
            is_fraud_flagged=score_report["is_fraud_flagged"],
            fraud_alerts=score_report["fraud_alerts"],
            tips=score_report["tips"],
            experience_years=score_report.get("experience_years"),
            education=score_report.get("education", []),
            contact_info=score_report.get("contact_info"),
            breakdown=score_report.get("breakdown")
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Resume screening analysis failed: {str(e)}"
        )

@router.post("/screen", response_model=CandidatePipelineItem)
async def screen_candidate_resume(
    file: UploadFile = File(...),
    job_id: int = Form(1),
    candidate_name: Optional[str] = Form(None),
    candidate_email: Optional[str] = Form(None)
):
    """
    Screen candidate resume for recruiter pipeline.
    Parses resume, computes score against selected job, detects fraud, and adds candidate to pipeline.
    """
    content = await file.read()
    validate_uploaded_file(file, content)

    # Find job spec
    job = next((j for j in _JOBS_STORE if j["id"] == job_id), _JOBS_STORE[0])

    doc_result = ocr_service.process_file(content, file.filename or "resume.pdf")
    score_report = ats_scorer.score(
        resume_text=doc_result["raw_text"],
        job_title=job["title"],
        job_description=job.get("description"),
        required_skills_input=job.get("required_skills"),
        has_hidden_text=doc_result.get("has_hidden_text", False),
        hidden_text_snippets=doc_result.get("hidden_text_snippets", [])
    )

    contact = score_report.get("contact_info") or {}
    resolved_name = candidate_name or contact.get("name") or file.filename.split(".")[0].replace("_", " ").title()
    resolved_email = candidate_email or contact.get("email") or f"{resolved_name.lower().replace(' ', '.')}@example.com"

    score = score_report["score"]
    is_fraud = score_report["is_fraud_flagged"]
    fraud_status = "White Text Found" if doc_result.get("has_hidden_text") else ("Fraud Alert" if is_fraud else "Clear")

    if score >= 85 and not is_fraud:
        placement = "Technical Assessment"
    elif score >= 70:
        placement = "Under Review"
    else:
        placement = "Applied"

    item = {
        "id": f"cand-{uuid.uuid4().hex[:6]}",
        "name": resolved_name,
        "email": resolved_email,
        "score": float(score),
        "matching_skills": score_report["matching"],
        "pipeline_placement": placement,
        "fraud_status": fraud_status,
        "is_fraud": is_fraud,
        "filename": file.filename or "resume.pdf"
    }
    _PIPELINE_STORE.insert(0, item)
    return item

@router.get("/pipeline", response_model=List[CandidatePipelineItem])
async def get_candidate_pipeline():
    """
    Get all screened candidates in the pipeline for recruiters.
    """
    return _PIPELINE_STORE
