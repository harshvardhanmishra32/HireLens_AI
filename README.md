# HireLens AI

> **AI-Powered Resume Screening & Candidate Intelligence Platform**

HireLens AI is a production-ready, enterprise-grade SaaS application designed to streamline recruiting workflows. It matches candidate resumes to job specifications using semantic matching, detects resume fraud, and analyzes hiring metrics.

---

## 🛠️ Project Status: End-to-End System Verified

Authentication, Full OCR Document Parsing, ATS Scoring Engine, Resume Anti-Fraud Screening, and Frontend Workspace are fully implemented and verified.

### Backend Capabilities:
- **FastAPI Core**: Fully typed backend running on Python 3.13+.
- **OCR & Document Parsing Engine**: Supports native vector PDF extraction via `PyMuPDF`, scanned PDF image OCR fallback and direct image uploads (PNG/JPG) via `Tesseract OCR` (`pytesseract`), and Word documents via `python-docx`.
- **ATS Scoring & Skills Matcher**: Automated skill extraction across 200+ technology keywords, exact and fuzzy matching (`rapidfuzz`), semantic TF-IDF cosine similarity, experience tenure analysis, and ATS format scoring.
- **Resume Anti-Fraud & Trap Detector**: Inspects PDF font properties for white text (0xFFFFFF / invisible fonts) and unnatural keyword stuffing.
- **SQLAlchemy 2.0 Async**: Enterprise models for `users`, `roles`, `permissions`, `companies`, and `refresh_tokens`.
- **JWT & Password Security**: Hashing using raw `bcrypt` and session tokens with rotation using `jose`.
- **Auto-Migrated Database**: Database updates managed via Alembic (configured with an automatic SQLite fallback for simple local development).

### Frontend Capabilities:
- **Next.js 16 App Router & Apple Design System**: Minimalist and high-contrast typography, Cupertino-inspired glassmorphism, spring physics, and zero generic AI slop.
- **LinkedIn-Style Job Openings System**:
  - **Recruiter Dashboard**: Post new job openings with Company Name, Job Title, Number of Openings, Workplace Type (Remote / Hybrid / On-site), Employment Type (Full-time / Contract / etc.), Experience Level, Salary Range, Detailed Role Description, and Required Skills tags.
  - **Candidate / Jobseeker Dashboard**: Explore all live open job postings with company logos, number of open seats, location, compensation, and required skills badges. Single-click **"Target & Scan ATS"** to instantly align resume evaluations with the selected role.
- **Live ATS Resume Upload & Analysis**: Real multipart file upload directly connected to FastAPI backend; displays real-time score, extraction method (OCR vs Native), skills matched, skill gaps, fraud alerts, and compliance recommendations.
- **Recruiter Pipeline**: Live screening with dynamic job selection, live candidate status table, and dynamic job opening creation.
- **Seamless Navigation**: Floating top-left back navigation anchors on authentication pages and session-routing middleware.

---

## 🚀 Local Development Setup 

Follow these steps to set up and run the services locally.

### 1. Prerequisites
Ensure you have **Python 3.13** and **Node.js** installed on your system.

### 2. Backend Setup
From the project root:

```bash
# Create Python virtual environment
python3 -m venv .venv

# Activate virtual environment
source .venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r backend/requirements.txt

# Run database migrations
cd backend
alembic upgrade head

# Start backend server
PYTHONPATH=. python main.py
```
- **API Server Address**: `http://localhost:8000`
- **Interactive OpenAPI Documentation**: `http://localhost:8000/docs`

### 3. Frontend Setup
Open a new terminal session, navigate to the project root, and execute:

```bash
cd frontend

# Install package dependencies
npm install

# Start development server
npm run dev
```
- **Frontend App Address**: `http://localhost:3000`
- **Authentication Pages**: `/login` (pre-filled recruiter/candidate demo accounts), `/register`, and `/dashboard`.

---

## 🧪 Testing

To run the backend integration test suite:
```bash
cd backend
source ../.venv/bin/activate
PYTHONPATH=. pytest
```
All tests use an in-memory SQLite database and execute in under 2 seconds.

---

## 📁 Repository Structure
```
HireLens-AI/
├── backend/                   # FastAPI Backend
│   ├── app/
│   │   ├── api/               # API Router & Middleware (deps.py)
│   │   │   └── endpoints/     # Route handlers (auth.py)
│   │   ├── core/              # Config, database connections, and security logic
│   │   ├── models/            # SQLAlchemy database tables (user.py)
│   │   ├── repositories/      # Database Access Object layer (base.py, user.py)
│   │   ├── schemas/           # Pydantic validation schemas (user.py)
│   │   └── services/          # Core Business logic handlers (user.py)
│   ├── alembic/               # Database migrations folder
│   ├── tests/                 # Integration tests (conftest.py, test_auth.py)
│   ├── alembic.ini            # Alembic configuration
│   ├── pytest.ini             # Pytest config rules
│   ├── requirements.txt       # Dependencies list
│   └── main.py                # App entrypoint
├── frontend/                  # Next.js 15 Frontend App
│   ├── app/                   # App Router views (login, register, dashboard, page.tsx)
│   ├── components/            # Providers and client UI nodes
│   └── package.json           # Frontend dependencies
├── .venv/                     # Python Virtual Environment
├── task.md                    # Core roadmap TODO tracking sheet
├── walkthrough.md             # Implementation & validation log
└── README.md                  # This file
```
