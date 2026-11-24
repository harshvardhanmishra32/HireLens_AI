import io
import pytest
from httpx import AsyncClient
from fastapi import status
from PIL import Image, ImageDraw
import pymupdf
import docx

from app.services.ocr import ocr_service
from app.services.resume_parser import resume_parser
from app.services.ats_scorer import ats_scorer

pytestmark = pytest.mark.asyncio

def create_sample_pdf(text: str) -> bytes:
    doc = pymupdf.open()
    page = doc.new_page()
    page.insert_text((50, 72), text, fontsize=11)
    buf = doc.write()
    doc.close()
    return buf

def create_sample_docx(text: str) -> bytes:
    doc = docx.Document()
    doc.add_heading("Candidate Resume", 0)
    for para in text.split("\n"):
        if para.strip():
            doc.add_paragraph(para)
    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()

def create_image_with_text(text: str) -> bytes:
    img = Image.new("RGB", (600, 150), color="white")
    draw = ImageDraw.Draw(img)
    draw.text((20, 50), text, fill="black")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()

def create_pdf_with_white_text(visible_text: str, hidden_text: str) -> bytes:
    doc = pymupdf.open()
    page = doc.new_page()
    page.insert_text((50, 72), visible_text, fontsize=11, color=(0, 0, 0))
    # Insert white text (color=(1, 1, 1) in RGB 0-1 range)
    page.insert_text((50, 200), hidden_text, fontsize=10, color=(1, 1, 1))
    buf = doc.write()
    doc.close()
    return buf

# ==================== TEST OCR & EXTRACTION ====================

async def test_native_pdf_extraction():
    sample_text = "John Doe\nEmail: john@example.com\nSkills: React, Next.js, TypeScript, Python"
    pdf_bytes = create_sample_pdf(sample_text)
    res = ocr_service.process_file(pdf_bytes, "resume.pdf")
    assert res["extraction_method"] == "native_pdf"
    assert "John Doe" in res["raw_text"]
    assert "React" in res["raw_text"]
    assert res["has_hidden_text"] is False

async def test_image_ocr_extraction():
    img_bytes = create_image_with_text("Python FastAPI Engineer")
    res = ocr_service.process_file(img_bytes, "scanned_resume.png")
    assert res["extraction_method"] == "ocr_image"
    assert "Python" in res["raw_text"] or "FastAPI" in res["raw_text"] or "Engineer" in res["raw_text"]
    assert res["is_scanned"] is True

async def test_docx_extraction():
    sample_text = "Jane Smith\nSenior DevOps Engineer\nSkills: AWS, Docker, Kubernetes, Terraform"
    docx_bytes = create_sample_docx(sample_text)
    res = ocr_service.process_file(docx_bytes, "resume.docx")
    assert res["extraction_method"] == "docx"
    assert "Jane Smith" in res["raw_text"]
    assert "Kubernetes" in res["raw_text"]

async def test_white_text_fraud_detection():
    visible = "Software Developer with standard skills."
    hidden = "python machine learning pytorch tensorflow docker aws"
    pdf_bytes = create_pdf_with_white_text(visible, hidden)
    res = ocr_service.process_file(pdf_bytes, "fraud_resume.pdf")
    assert res["has_hidden_text"] is True
    assert len(res["hidden_text_snippets"]) > 0

# ==================== TEST ATS SCORING ====================

async def test_ats_scoring_high_match():
    resume_text = """
    Sarah Jenkins
    Email: sarah@example.com | Phone: 555-123-4567
    Professional Summary
    Senior Frontend Engineer with 6 years of experience building modern web apps.
    Experience
    2018 - Present: Lead Frontend Engineer at TechCorp
    - Built responsive dashboards using React, Next.js, TypeScript, and Tailwind CSS.
    - Optimized performance and HTML5 / CSS3 rendering pipelines.
    Skills
    React, Next.js, TypeScript, Tailwind CSS, HTML5, CSS3, JavaScript, GraphQL, Docker
    Education
    Bachelor's Degree in Computer Science, 2018
    """
    report = ats_scorer.score(resume_text, job_title="Senior Frontend Engineer")
    assert report["score"] >= 80
    assert "React" in report["matching"]
    assert "Next.js" in report["matching"]
    assert report["is_fraud_flagged"] is False
    assert len(report["tips"]) > 0

async def test_ats_scoring_with_fraud_penalty():
    resume_text = "Junior developer with basic skills."
    report = ats_scorer.score(
        resume_text,
        job_title="Senior Frontend Engineer",
        has_hidden_text=True,
        hidden_text_snippets=["keyword stuffing in white font"]
    )
    assert report["is_fraud_flagged"] is True
    assert len(report["fraud_alerts"]) > 0
    assert "White/Invisible text detected" in report["fraud_alerts"][0]

# ==================== TEST API ENDPOINTS ====================

async def test_api_analyze_resume(client: AsyncClient):
    sample_text = """
    Alex Rivera
    Email: alex@example.com
    Experience: 2019 - Present (5 years)
    Skills: Python, PyTorch, Machine Learning, Deep Learning, NLP, Scikit-Learn
    Education: Master's Degree
    """
    pdf_bytes = create_sample_pdf(sample_text)
    
    files = {"file": ("alex_resume.pdf", pdf_bytes, "application/pdf")}
    data = {"job_title": "AI/ML Research Scientist"}
    
    response = await client.post("/api/v1/resumes/analyze", files=files, data=data)
    assert response.status_code == status.HTTP_200_OK
    res = response.json()
    assert res["filename"] == "alex_resume.pdf"
    assert res["score"] > 60
    assert "Python" in res["matching"]
    assert res["extraction_method"] == "native_pdf"
    assert len(res["tips"]) > 0

async def test_api_screen_candidate(client: AsyncClient):
    sample_text = """
    DevOps Specialist
    Skills: AWS, Docker, Kubernetes, CI/CD, Terraform, Linux
    Experience: 2020 - 2026
    """
    pdf_bytes = create_sample_pdf(sample_text)
    
    files = {"file": ("devops_cand.pdf", pdf_bytes, "application/pdf")}
    data = {
        "job_id": "3",
        "candidate_name": "DevOps Candidate",
        "candidate_email": "devops@example.com"
    }
    
    response = await client.post("/api/v1/resumes/screen", files=files, data=data)
    assert response.status_code == status.HTTP_200_OK
    res = response.json()
    assert res["name"] == "DevOps Candidate"
    assert res["score"] > 60
    assert "AWS" in res["matching_skills"]

async def test_api_jobs_crud(client: AsyncClient):
    # List jobs
    list_res = await client.get("/api/v1/jobs")
    assert list_res.status_code == status.HTTP_200_OK
    jobs = list_res.json()
    assert len(jobs) >= 3

    # Create job
    new_job = {
        "title": "Cloud Architect",
        "department": "Infrastructure",
        "description": "Design secure cloud systems on AWS.",
        "required_skills": ["AWS", "Terraform", "Kubernetes"]
    }
    create_res = await client.post("/api/v1/jobs", json=new_job)
    assert create_res.status_code == status.HTTP_201_CREATED
    created = create_res.json()
    assert created["title"] == "Cloud Architect"
    assert created["id"] > 3

async def test_api_unsupported_file_extension(client: AsyncClient):
    files = {"file": ("malicious.exe", b"binarycontent", "application/octet-stream")}
    response = await client.post("/api/v1/resumes/analyze", files=files)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Unsupported file format" in response.json()["detail"]

async def test_api_empty_file_rejected(client: AsyncClient):
    files = {"file": ("empty.pdf", b"", "application/pdf")}
    response = await client.post("/api/v1/resumes/analyze", files=files)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "empty" in response.json()["detail"].lower()
