import re
from typing import Dict, Any, List, Set, Optional

# Comprehensive curated skills catalog
SKILL_TAXONOMY = {
    # Frontend
    "React": ["react", "react.js", "reactjs", "react 18", "react 19"],
    "Next.js": ["next.js", "nextjs", "next 14", "next 15"],
    "TypeScript": ["typescript", "ts"],
    "JavaScript": ["javascript", "js", "ecmascript"],
    "Tailwind CSS": ["tailwind", "tailwindcss"],
    "Vue.js": ["vue", "vue.js", "vuejs", "vue 3"],
    "Angular": ["angular", "angularjs", "angular 2+"],
    "HTML5": ["html", "html5"],
    "CSS3": ["css", "css3", "sass", "scss", "less"],
    "Redux": ["redux", "redux toolkit", "rtk"],
    "GraphQL": ["graphql", "apollo graphql"],
    "Webpack": ["webpack", "vite", "turbopack"],

    # Backend
    "Python": ["python", "python3", "python 3"],
    "FastAPI": ["fastapi"],
    "Node.js": ["node", "node.js", "nodejs"],
    "Django": ["django", "django rest framework", "drf"],
    "Flask": ["flask"],
    "Java": ["java", "java 17", "java 21"],
    "Spring Boot": ["spring boot", "spring framework", "spring"],
    "Go": ["golang", "go programming", r"\bgo\b"],
    "Rust": ["rust", "rustlang"],
    "C++": ["c++", "cpp"],
    "C#": ["c#", "csharp", ".net", "dotnet", ".net core"],
    "Ruby": ["ruby", "ruby on rails", "rails"],
    "PHP": ["php", "laravel"],
    "REST API": ["rest", "restful", "rest api", "restful apis"],
    "Microservices": ["microservices", "microservice architecture"],
    "gRPC": ["grpc", "protocol buffers", "protobuf"],

    # Databases
    "PostgreSQL": ["postgresql", "postgres", "psql"],
    "MongoDB": ["mongodb", "mongo"],
    "MySQL": ["mysql"],
    "Redis": ["redis"],
    "SQLite": ["sqlite", "sqlite3"],
    "Cassandra": ["cassandra"],
    "DynamoDB": ["dynamodb"],
    "Elasticsearch": ["elasticsearch", "elastic search", "opensearch"],
    "SQL": ["sql", "rdbms"],
    "Prisma": ["prisma", "sqlalchemy", "hibernate"],

    # Cloud & DevOps
    "AWS": ["aws", "amazon web services", "ec2", "s3", "lambda", "rds", "ecs", "fargate"],
    "Docker": ["docker", "containerization", "docker-compose"],
    "Kubernetes": ["kubernetes", "k8s"],
    "GCP": ["gcp", "google cloud", "google cloud platform", "bigquery"],
    "Azure": ["azure", "microsoft azure"],
    "CI/CD": ["ci/cd", "continuous integration", "github actions", "gitlab ci", "jenkins"],
    "Terraform": ["terraform", "iac", "infrastructure as code"],
    "Linux": ["linux", "ubuntu", "bash", "shell scripting"],
    "Nginx": ["nginx"],
    "Prometheus": ["prometheus", "grafana"],

    # AI & Data
    "Machine Learning": ["machine learning", "ml", "statistical modeling"],
    "Deep Learning": ["deep learning", "neural networks"],
    "PyTorch": ["pytorch"],
    "TensorFlow": ["tensorflow", "keras"],
    "NLP": ["nlp", "natural language processing", "bert", "transformers"],
    "Large Language Models": ["llm", "llms", "large language models", "rag", "langchain", "llamaindex", "genai", "generative ai"],
    "Computer Vision": ["computer vision", "opencv"],
    "Scikit-Learn": ["scikit-learn", "sklearn"],
    "Pandas": ["pandas"],
    "NumPy": ["numpy"],

    # Tools & Methodologies
    "Git": ["git", "github", "gitlab"],
    "Agile": ["agile", "scrum", "kanban", "sprints"],
    "JIRA": ["jira", "confluence"],
    "Unit Testing": ["unit testing", "pytest", "jest", "cypress", "playwright", "tdd"],
    "System Design": ["system design", "distributed systems", "high availability"],

    # Soft Skills
    "Leadership": ["leadership", "led team", "team lead", "mentorship", "managed"],
    "Communication": ["communication", "cross-functional collaboration", "stakeholder management"],
    "Problem Solving": ["problem solving", "analytical thinking", "critical thinking"]
}

class ResumeParser:
    def extract_contact_info(self, text: str) -> Dict[str, Optional[str]]:
        # Email
        email_match = re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text)
        email = email_match.group(0) if email_match else None

        # Phone
        phone_match = re.search(
            r"(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}", text
        )
        phone = phone_match.group(0) if phone_match else None

        # LinkedIn
        linkedin_match = re.search(r"(?:https?://)?(?:www\.)?linkedin\.com/in/[a-zA-Z0-9_-]+", text, re.IGNORECASE)
        linkedin = linkedin_match.group(0) if linkedin_match else None

        # GitHub
        github_match = re.search(r"(?:https?://)?(?:www\.)?github\.com/[a-zA-Z0-9_-]+", text, re.IGNORECASE)
        github = github_match.group(0) if github_match else None

        # Extract name heuristic (usually in top lines)
        name = None
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        for line in lines[:5]:
            # If line is 2-4 words, starts with capital, and doesn't contain email/phone/links/resume keywords
            if (
                re.match(r"^[A-Z][a-zA-Z'-]+(?:\s+[A-Z][a-zA-Z'-]+){1,3}$", line)
                and not any(k in line.lower() for k in ["curriculum", "resume", "cv", "page", "developer", "engineer"])
            ):
                name = line
                break

        return {
            "name": name,
            "email": email,
            "phone": phone,
            "linkedin": linkedin,
            "github": github
        }

    def extract_skills(self, text: str) -> List[str]:
        """
        Extract matching skills from the resume text using exact token boundaries.
        """
        lower_text = " " + text.lower() + " "
        extracted_skills: Set[str] = set()

        for canonical_name, aliases in SKILL_TAXONOMY.items():
            for alias in aliases:
                # If regex pattern
                if "\\" in alias:
                    if re.search(alias, lower_text, re.IGNORECASE):
                        extracted_skills.add(canonical_name)
                        break
                else:
                    # Boundary matching
                    pattern = r"(?<![a-zA-Z0-9])" + re.escape(alias) + r"(?![a-zA-Z0-9])"
                    if re.search(pattern, lower_text):
                        extracted_skills.add(canonical_name)
                        break

        return sorted(list(extracted_skills))

    def extract_experience_years(self, text: str) -> Optional[float]:
        """
        Estimate years of experience by analyzing date ranges (e.g. 2018 - 2023, 2020 - Present).
        """
        current_year = 2026
        # Match year ranges like 2018 - 2023 or 2019 - Present / Current
        year_pattern = r"\b(19\d{2}|20\d{2})\s*(?:-|–|to)\s*(19\d{2}|20\d{2}|present|current)\b"
        matches = re.findall(year_pattern, text, re.IGNORECASE)
        
        spans: List[tuple[int, int]] = []
        for start_str, end_str in matches:
            try:
                start = int(start_str)
                end = current_year if end_str.lower() in ("present", "current") else int(end_str)
                if 1980 <= start <= current_year and start <= end <= current_year + 1:
                    spans.append((start, end))
            except ValueError:
                continue

        if not spans:
            # Fallback: look for explicit text like "5+ years of experience"
            exp_text_match = re.search(r"(\d+(?:\.\d+)?)\+?\s*years?(?:\s+of)?\s+experience", text, re.IGNORECASE)
            if exp_text_match:
                try:
                    return float(exp_text_match.group(1))
                except ValueError:
                    pass
            return None

        # Merge overlapping intervals
        spans.sort()
        merged = []
        for start, end in spans:
            if not merged:
                merged.append([start, end])
            else:
                prev_start, prev_end = merged[-1]
                if start <= prev_end:
                    merged[-1][1] = max(prev_end, end)
                else:
                    merged.append([start, end])

        total_years = sum(end - start for start, end in merged)
        return float(max(1.0, min(total_years, 35.0)))

    def extract_education(self, text: str) -> List[str]:
        """
        Identify education degrees and background.
        """
        degrees = []
        degree_patterns = [
            (r"\b(?:ph\.?d|doctor\s+of\s+philosophy)\b", "Ph.D."),
            (r"\b(?:master(?:'s)?|m\.s\.?|m\.tech|msc|mba)\b", "Master's Degree"),
            (r"\b(?:bachelor(?:'s)?|b\.s\.?|b\.tech|bsc|b\.e\.?|bba)\b", "Bachelor's Degree"),
            (r"\b(?:associate(?:'s)?\s+degree)\b", "Associate Degree"),
            (r"\b(?:high\s+school\s+diploma)\b", "High School Diploma")
        ]
        lower = text.lower()
        for pattern, label in degree_patterns:
            if re.search(pattern, lower):
                degrees.append(label)
        return degrees

    def detect_sections(self, text: str) -> List[str]:
        """
        Check for expected standard ATS resume sections.
        """
        sections = []
        section_markers = [
            ("Contact Information", [r"contact", r"phone", r"email", r"address"]),
            ("Professional Summary", [r"summary", r"profile", r"about\s+me", r"objective"]),
            ("Work Experience", [r"experience", r"employment", r"work\s+history", r"work\s+experience"]),
            ("Skills", [r"skills", r"technical\s+skills", r"competencies", r"technologies"]),
            ("Education", [r"education", r"academic\s+background", r"qualifications"]),
            ("Projects", [r"projects", r"personal\s+projects", r"portfolio"]),
            ("Certifications", [r"certifications", r"licenses", r"credentials"])
        ]
        lower = text.lower()
        for section_name, markers in section_markers:
            if any(re.search(r"\b" + m + r"\b", lower) for m in markers):
                sections.append(section_name)
        return sections

    def parse(self, text: str) -> Dict[str, Any]:
        return {
            "contact_info": self.extract_contact_info(text),
            "skills": self.extract_skills(text),
            "experience_years": self.extract_experience_years(text),
            "education": self.extract_education(text),
            "sections": self.detect_sections(text),
            "word_count": len(text.split()),
            "character_count": len(text)
        }

resume_parser = ResumeParser()
