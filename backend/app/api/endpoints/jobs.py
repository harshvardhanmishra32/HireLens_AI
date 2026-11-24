from fastapi import APIRouter, HTTPException, status
from typing import List
from app.schemas.job import JobCreate, JobOut

router = APIRouter()

# In-memory storage with initial default LinkedIn-style jobs
_JOBS_STORE: List[dict] = [
    {
        "id": 1,
        "title": "Senior Frontend Engineer",
        "company_name": "HireLens AI",
        "department": "Engineering",
        "location": "San Francisco, CA",
        "workplace_type": "Hybrid",
        "employment_type": "Full-time",
        "openings_count": 3,
        "experience_level": "Mid-Senior level",
        "salary_range": "$155,000 - $190,000 / yr",
        "description": "We are seeking a Senior Frontend Engineer to build high-performance web applications using React 19, Next.js, and TypeScript. You will work on real-time neural OCR visualization tools, design systems, and client-side data pipelines.",
        "required_skills": ["React", "Next.js", "TypeScript", "Tailwind CSS", "HTML5", "CSS3", "JavaScript", "GraphQL", "Docker", "AWS"],
        "posted_date": "1 day ago"
    },
    {
        "id": 2,
        "title": "AI/ML Research Scientist",
        "company_name": "Anthropic Labs",
        "department": "Research",
        "location": "Remote",
        "workplace_type": "Remote",
        "employment_type": "Full-time",
        "openings_count": 2,
        "experience_level": "Senior level",
        "salary_range": "$185,000 - $240,000 / yr",
        "description": "Design and build generative AI models, NLP pipelines, neural OCR algorithms, and deep learning architectures with PyTorch and Python. Focus on document intelligence and anti-fraud detection.",
        "required_skills": ["Python", "PyTorch", "TensorFlow", "Machine Learning", "Deep Learning", "NLP", "Large Language Models", "Scikit-Learn", "NumPy", "Pandas"],
        "posted_date": "2 days ago"
    },
    {
        "id": 3,
        "title": "DevOps Engineer",
        "company_name": "Stripe Infrastructure",
        "department": "Infrastructure",
        "location": "Seattle, WA",
        "workplace_type": "Hybrid",
        "employment_type": "Full-time",
        "openings_count": 4,
        "experience_level": "Mid-Senior level",
        "salary_range": "$160,000 - $205,000 / yr",
        "description": "Manage multi-cloud infrastructure, CI/CD automated deployment pipelines, container orchestration, and Kubernetes clusters. Ensure 99.99% system availability.",
        "required_skills": ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform", "Linux", "Prometheus", "Python", "Git", "Nginx"],
        "posted_date": "4 days ago"
    },
    {
        "id": 4,
        "title": "Full Stack Software Engineer",
        "company_name": "Linear Tech",
        "department": "Engineering",
        "location": "New York, NY",
        "workplace_type": "On-site",
        "employment_type": "Full-time",
        "openings_count": 2,
        "experience_level": "Associate / Mid level",
        "salary_range": "$140,000 - $175,000 / yr",
        "description": "Develop end-to-end features spanning React frontend interfaces, Node.js and FastAPI microservices, and PostgreSQL database schemas with high operational rigor.",
        "required_skills": ["React", "Node.js", "TypeScript", "Python", "FastAPI", "PostgreSQL", "Docker", "REST API", "Git", "AWS"],
        "posted_date": "1 week ago"
    }
]

@router.get("", response_model=List[JobOut])
async def list_jobs():
    """
    List all open job positions in the pipeline with full LinkedIn-style attributes.
    """
    return _JOBS_STORE

@router.post("", response_model=JobOut, status_code=status.HTTP_201_CREATED)
async def create_job(job_in: JobCreate):
    """
    Create a new job position with company name, title, description, openings count, location, and salary.
    """
    new_id = len(_JOBS_STORE) + 1
    job_record = {
        "id": new_id,
        "title": job_in.title,
        "company_name": job_in.company_name or "HireLens AI",
        "department": job_in.department,
        "location": job_in.location or "Remote",
        "workplace_type": job_in.workplace_type or "Hybrid",
        "employment_type": job_in.employment_type or "Full-time",
        "openings_count": job_in.openings_count or 1,
        "experience_level": job_in.experience_level or "Mid-Senior level",
        "salary_range": job_in.salary_range or "$140,000 - $185,000 / yr",
        "description": job_in.description or f"Open position for {job_in.title} at {job_in.company_name}.",
        "required_skills": job_in.required_skills or [],
        "posted_date": "Just now"
    }
    _JOBS_STORE.append(job_record)
    return job_record
