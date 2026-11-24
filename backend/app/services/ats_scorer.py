import re
from typing import Dict, Any, List, Optional
from rapidfuzz import fuzz
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.services.resume_parser import resume_parser, SKILL_TAXONOMY

# Default job specs if none provided
DEFAULT_JOB_SPECS = {
    "Senior Frontend Engineer": {
        "required_skills": ["React", "Next.js", "TypeScript", "Tailwind CSS", "HTML5", "CSS3", "JavaScript", "GraphQL", "Docker", "AWS"],
        "min_experience_years": 5.0,
        "keywords": "frontend user interface react next.js typescript web performance responsive design client state management"
    },
    "AI/ML Research Scientist": {
        "required_skills": ["Python", "PyTorch", "TensorFlow", "Machine Learning", "Deep Learning", "NLP", "Large Language Models", "Scikit-Learn", "NumPy", "Pandas"],
        "min_experience_years": 3.0,
        "keywords": "machine learning deep learning pytorch research artificial intelligence neural networks natural language processing data science"
    },
    "DevOps Engineer": {
        "required_skills": ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform", "Linux", "Prometheus", "Python", "Git", "Nginx"],
        "min_experience_years": 4.0,
        "keywords": "devops infrastructure kubernetes docker cloud automation terraform monitoring deployment ci/cd aws"
    },
    "Full Stack Engineer": {
        "required_skills": ["React", "Node.js", "TypeScript", "Python", "FastAPI", "PostgreSQL", "Docker", "REST API", "Git", "AWS"],
        "min_experience_years": 3.0,
        "keywords": "full stack web development frontend backend rest apis database architecture docker react node.js"
    }
}

class ATSScorer:
    def compute_tfidf_similarity(self, text_a: str, text_b: str) -> float:
        """
        Calculate cosine similarity between two text corpuses using TF-IDF.
        """
        if not text_a.strip() or not text_b.strip():
            return 0.5
        try:
            vectorizer = TfidfVectorizer(stop_words="english", max_features=1000)
            tfidf_matrix = vectorizer.fit_transform([text_a, text_b])
            sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            return float(max(0.0, min(1.0, sim)))
        except Exception:
            return 0.5

    def check_keyword_stuffing(self, text: str) -> List[str]:
        """
        Detect unnatural keyword stuffing (words repeated excessively).
        """
        words = [w.lower() for w in re.findall(r"\b[a-zA-Z]{3,}\b", text)]
        total = len(words)
        if total < 50:
            return []
        
        freq = {}
        for w in words:
            freq[w] = freq.get(w, 0) + 1
        
        flagged = []
        for word, count in freq.items():
            density = count / total
            # If a single non-stopword occurs more than 4% of total words
            if density > 0.04 and count > 8:
                flagged.append(f"Keyword '{word}' repeated {count} times ({density*100:.1f}% density)")
        return flagged

    def score(
        self,
        resume_text: str,
        job_title: Optional[str] = None,
        job_description: Optional[str] = None,
        required_skills_input: Optional[List[str]] = None,
        has_hidden_text: bool = False,
        hidden_text_snippets: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Calculate comprehensive ATS Compatibility Score and produce actionable intelligence.
        """
        # Parse resume entities
        parsed = resume_parser.parse(resume_text)
        resume_skills = set(parsed["skills"])

        # Determine target job criteria
        matched_job_spec = None
        if job_title:
            for title_key, spec in DEFAULT_JOB_SPECS.items():
                if fuzz.partial_ratio(title_key.lower(), job_title.lower()) >= 70:
                    matched_job_spec = spec
                    break

        if not matched_job_spec:
            matched_job_spec = DEFAULT_JOB_SPECS["Full Stack Engineer"]

        # Derive required skills
        req_set = set(required_skills_input or matched_job_spec.get("required_skills", []))
        if job_description:
            jd_skills = resume_parser.extract_skills(job_description)
            req_set.update(jd_skills)

        required_skills = sorted(list(req_set)) if req_set else matched_job_spec["required_skills"]

        # Match skills (Exact + Fuzzy)
        matching_skills: List[str] = []
        missing_skills: List[str] = []

        for req in required_skills:
            # Exact check
            if req in resume_skills:
                matching_skills.append(req)
            else:
                # Fuzzy check
                matched = False
                for r_skill in resume_skills:
                    if fuzz.ratio(req.lower(), r_skill.lower()) >= 85:
                        matching_skills.append(req)
                        matched = True
                        break
                if not matched:
                    missing_skills.append(req)

        # 1. Skills Match Score (0 - 100) -> 50%
        skills_ratio = len(matching_skills) / max(1, len(required_skills))
        skills_score = min(100.0, skills_ratio * 100.0)

        # 2. Semantic Relevance Score (0 - 100) -> 20%
        target_corpus = (job_description or "") + " " + matched_job_spec.get("keywords", "")
        semantic_sim = self.compute_tfidf_similarity(resume_text, target_corpus)
        semantic_score = min(100.0, max(50.0, semantic_sim * 160.0 + (skills_score * 0.4)))

        # 3. Experience Score (0 - 100) -> 15%
        target_exp = matched_job_spec.get("min_experience_years", 3.0)
        actual_exp = parsed.get("experience_years") or 2.0
        if actual_exp >= target_exp:
            exp_score = 100.0
        else:
            exp_score = min(100.0, max(40.0, (actual_exp / target_exp) * 100.0))

        # 4. ATS Formatting & Completeness Score (0 - 100) -> 15%
        sections_found = parsed.get("sections", [])
        formatting_score = min(100.0, (len(sections_found) / 5.0) * 100.0)
        
        # Weighted composite score
        composite_score = (
            (skills_score * 0.50) +
            (semantic_score * 0.20) +
            (exp_score * 0.15) +
            (formatting_score * 0.15)
        )

        # Fraud & Trap Checks
        fraud_alerts: List[str] = []
        penalty = 0

        if has_hidden_text:
            penalty += 35
            snippet_preview = ", ".join(hidden_text_snippets[:3]) if hidden_text_snippets else ""
            fraud_alerts.append(
                f"White/Invisible text detected in document: '{snippet_preview}'. This is treated as ATS manipulation."
            )

        stuffing_warnings = self.check_keyword_stuffing(resume_text)
        if stuffing_warnings:
            penalty += 15
            for w in stuffing_warnings:
                fraud_alerts.append(f"Keyword stuffing detected: {w}")

        final_score = int(max(10, min(99, round(composite_score - penalty))))

        # Actionable recommendations
        tips: List[str] = []
        if missing_skills:
            top_missing = ", ".join(missing_skills[:4])
            tips.append(f"Add experience or projects highlighting missing role skills: {top_missing}.")
        
        tips.append("Quantify your achievements with measurable business impact (e.g. 'Reduced API latency by 42%').")

        if "Professional Summary" not in sections_found:
            tips.append("Include a concise Professional Summary section aligned with the target job title.")
        if "Certifications" not in sections_found:
            tips.append("Add relevant industry certifications or completed courses to increase credential score.")
        
        if has_hidden_text:
            tips.append("Remove all invisible, white, or micro-font text layers. Modern ATS systems flag these immediately.")
        else:
            tips.append("Keep resume formatting clean with standard fonts, no multi-column graphics or image tables.")

        return {
            "score": final_score,
            "matching": matching_skills,
            "missing": missing_skills,
            "sections_found": sections_found,
            "experience_years": parsed.get("experience_years"),
            "contact_info": parsed.get("contact_info"),
            "education": parsed.get("education"),
            "fraud_alerts": fraud_alerts,
            "is_fraud_flagged": len(fraud_alerts) > 0,
            "tips": tips[:4],
            "word_count": parsed.get("word_count", 0),
            "breakdown": {
                "skills_score": round(skills_score, 1),
                "semantic_score": round(semantic_score, 1),
                "experience_score": round(exp_score, 1),
                "formatting_score": round(formatting_score, 1),
                "penalty": penalty
            }
        }

ats_scorer = ATSScorer()
