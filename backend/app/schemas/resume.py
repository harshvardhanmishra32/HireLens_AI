from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Dict, Any

class ContactInfo(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None

class ScoreBreakdown(BaseModel):
    skills_score: float
    semantic_score: float
    experience_score: float
    formatting_score: float
    penalty: float

class ATSReportOut(BaseModel):
    filename: str
    score: int
    matching: List[str]
    missing: List[str]
    extraction_method: str
    is_scanned: bool
    is_fraud_flagged: bool
    fraud_alerts: List[str]
    tips: List[str]
    experience_years: Optional[float] = None
    education: List[str] = []
    contact_info: Optional[ContactInfo] = None
    breakdown: Optional[ScoreBreakdown] = None
    
    model_config = ConfigDict(from_attributes=True)

class CandidatePipelineItem(BaseModel):
    id: str
    name: str
    email: str
    score: float
    matching_skills: List[str]
    pipeline_placement: str
    fraud_status: str
    is_fraud: bool
    filename: str

    model_config = ConfigDict(from_attributes=True)
