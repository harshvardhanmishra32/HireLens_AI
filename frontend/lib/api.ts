export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ATSReport {
  filename: string;
  score: number;
  matching: string[];
  missing: string[];
  extraction_method: string;
  is_scanned: boolean;
  is_fraud_flagged: boolean;
  fraud_alerts: string[];
  tips: string[];
  experience_years?: number | null;
  education?: string[];
  contact_info?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    linkedin?: string | null;
    github?: string | null;
  };
  breakdown?: {
    skills_score: number;
    semantic_score: number;
    experience_score: number;
    formatting_score: number;
    penalty: number;
  };
}

export interface CandidatePipelineItem {
  id: string;
  name: string;
  email: string;
  score: number;
  matching_skills: string[];
  pipeline_placement: string;
  fraud_status: string;
  is_fraud: boolean;
  filename: string;
}

export interface JobOpening {
  id: number;
  title: string;
  company_name?: string;
  department: string;
  location?: string;
  workplace_type?: string;
  employment_type?: string;
  openings_count?: number;
  experience_level?: string;
  salary_range?: string;
  description?: string;
  required_skills?: string[];
  posted_date?: string;
}

export async function analyzeResumeApi(
  file: File,
  jobTitle?: string,
  jobDescription?: string
): Promise<ATSReport> {
  const formData = new FormData();
  formData.append("file", file);
  if (jobTitle) formData.append("job_title", jobTitle);
  if (jobDescription) formData.append("job_description", jobDescription);

  const res = await fetch(`${API_BASE_URL}/api/v1/resumes/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to analyze resume.");
  }

  return await res.json();
}

export async function screenCandidateApi(
  file: File,
  jobId: number,
  name?: string,
  email?: string
): Promise<CandidatePipelineItem> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("job_id", String(jobId));
  if (name) formData.append("candidate_name", name);
  if (email) formData.append("candidate_email", email);

  const res = await fetch(`${API_BASE_URL}/api/v1/resumes/screen`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to screen resume.");
  }

  return await res.json();
}

export async function fetchJobsApi(): Promise<JobOpening[]> {
  const res = await fetch(`${API_BASE_URL}/api/v1/jobs`);
  if (!res.ok) {
    throw new Error("Failed to fetch jobs.");
  }
  return await res.json();
}

export async function createJobApi(jobData: {
  title: string;
  company_name?: string;
  department: string;
  location?: string;
  workplace_type?: string;
  employment_type?: string;
  openings_count?: number;
  experience_level?: string;
  salary_range?: string;
  description?: string;
  required_skills?: string[];
}): Promise<JobOpening> {
  const res = await fetch(`${API_BASE_URL}/api/v1/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(jobData),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to create job.");
  }

  return await res.json();
}

export async function fetchPipelineApi(): Promise<CandidatePipelineItem[]> {
  const res = await fetch(`${API_BASE_URL}/api/v1/resumes/pipeline`);
  if (!res.ok) {
    throw new Error("Failed to fetch pipeline candidates.");
  }
  return await res.json();
}
