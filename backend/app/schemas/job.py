from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional

class JobBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=150)
    company_name: str = Field(default="HireLens AI", min_length=1, max_length=150)
    department: str = Field(default="Engineering", max_length=100)
    location: str = Field(default="San Francisco, CA", max_length=150)
    workplace_type: str = Field(default="Hybrid", max_length=50) # "Remote", "Hybrid", "On-site"
    employment_type: str = Field(default="Full-time", max_length=50) # "Full-time", "Contract", "Part-time", "Internship"
    openings_count: int = Field(default=1, ge=1, le=1000)
    experience_level: str = Field(default="Mid-Senior level", max_length=50)
    salary_range: Optional[str] = Field(default="$140,000 - $185,000 / yr")
    description: Optional[str] = None
    required_skills: Optional[List[str]] = []

class JobCreate(JobBase):
    pass

class JobOut(JobBase):
    id: int
    posted_date: Optional[str] = "Just now"
    model_config = ConfigDict(from_attributes=True)
