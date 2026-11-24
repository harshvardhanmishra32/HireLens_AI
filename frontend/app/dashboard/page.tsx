"use client";

// Design Read: Master LinkedIn-Style Professional Networking & AI Recruitment Dashboard
// Dense, tactile, zero GPU lag, 2D/CSS speed, exact #070B14 palette.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import { 
  LogOut, 
  User, 
  FileText, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  Search, 
  AlertOctagon, 
  Users, 
  Sun, 
  Moon, 
  Loader2, 
  UploadCloud, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  ChevronDown, 
  ChevronUp, 
  BadgeCheck, 
  Target, 
  Home as HomeIcon, 
  MessageSquare, 
  Bell, 
  Send, 
  ThumbsUp, 
  Share2, 
  Image as ImageIcon, 
  Clock 
} from "lucide-react";
import { 
  API_BASE_URL, 
  ATSReport, 
  CandidatePipelineItem, 
  JobOpening,
  analyzeResumeApi, 
  screenCandidateApi, 
  fetchJobsApi, 
  createJobApi, 
  fetchPipelineApi 
} from "@/lib/api";
import { SoundToggle } from "@/components/audio/SoundToggle";

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  roles: { name: string; description: string }[];
}

interface PostItem {
  id: string;
  authorName: string;
  authorHeadline: string;
  authorAvatar: string;
  timeAgo: string;
  content: string;
  tags: string[];
  likes: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  comments: { author: string; text: string; time: string }[];
}

interface MessageItem {
  id: string;
  senderName: string;
  avatar: string;
  role: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  messages: { fromMe: boolean; text: string; time: string }[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"feed" | "network" | "jobs" | "messaging" | "notifications" | "profile" | "recruiter">("feed");

  // Global search
  const [globalSearch, setGlobalSearch] = useState("");

  // Post creation state
  const [newPostText, setNewPostText] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  // Home Feed State
  const [posts, setPosts] = useState<PostItem[]>([
    {
      id: "post-1",
      authorName: "Elena Rostova",
      authorHeadline: "Principal AI Architect at DeepMind • Neural Embeddings",
      authorAvatar: "ER",
      timeAgo: "2 hours ago",
      content: "Thrilled to share our latest research on cross-encoder reranking for unstructured technical documents. By preserving spatial layout geometry before tokenization, we reduced hallucinated skill alignments by 42%.",
      tags: ["#DeepLearning", "#NLP", "#InformationRetrieval", "#AI"],
      likes: 342,
      commentsCount: 28,
      sharesCount: 14,
      isLiked: false,
      comments: [
        { author: "David Chen", text: "Incredible results! How does the latency hold up against sub-second OCR rasterizers?", time: "1h ago" },
        { author: "Elena Rostova", text: "We optimized with PyMuPDF direct stream memory buffers, clocking in at ~280ms per document.", time: "45m ago" }
      ]
    },
    {
      id: "post-2",
      authorName: "Marcus Vance",
      authorHeadline: "Head of Infrastructure at Stripe • Distributed Systems",
      authorAvatar: "MV",
      timeAgo: "5 hours ago",
      content: "Hiring tip for candidates applying to distributed systems teams: We look for practical failure-mode understanding over algorithmic trivia. Can you explain split-brain resolution in Raft clusters without referencing slides?",
      tags: ["#Kubernetes", "#CloudOps", "#SystemsEngineering", "#Hiring"],
      likes: 618,
      commentsCount: 45,
      sharesCount: 32,
      isLiked: true,
      comments: [
        { author: "Alex Mercer", text: "Spot on. Real production war stories tell you 10x more than LeetCode scores.", time: "3h ago" }
      ]
    },
    {
      id: "post-3",
      authorName: "Sophia Chen",
      authorHeadline: "Staff Frontend Engineer at Linear • WebGL & Design Systems",
      authorAvatar: "SC",
      timeAgo: "1 day ago",
      content: "Building 3D WebGL experiences that feel like native desktop apps requires brutal restraint. Keep geometries instanced, cull offscreen draw calls, and let CSS handle typography density.",
      tags: ["#ThreeJS", "#WebGL", "#DesignSystems", "#Frontend"],
      likes: 894,
      commentsCount: 62,
      sharesCount: 51,
      isLiked: false,
      comments: []
    }
  ]);

  // Network State
  const [connections, setConnections] = useState([
    { id: "c1", name: "David Kim", role: "VP of Product at HireLens AI", mutual: 18, status: "Connect" },
    { id: "c2", name: "Rachel Adams", role: "Staff DevOps Engineer at Cloudflare", mutual: 24, status: "Connect" },
    { id: "c3", name: "Vikram Malhotra", role: "Senior ML Engineer at Anthropic", mutual: 9, status: "Connect" },
    { id: "c4", name: "Aria Thorne", role: "Design Director at Apple", mutual: 31, status: "Connect" },
  ]);

  // Messaging State
  const [conversations, setConversations] = useState<MessageItem[]>([
    {
      id: "msg-1",
      senderName: "Elena Rostova",
      avatar: "ER",
      role: "Principal AI Architect at DeepMind",
      lastMessage: "Thanks for reviewing the document pipeline paper!",
      time: "10:42 AM",
      unread: true,
      messages: [
        { fromMe: false, text: "Hi! Saw your application for the Lead Architect opening.", time: "10:30 AM" },
        { fromMe: true, text: "Thanks Elena! Excited about the neural OCR pipeline you're building.", time: "10:35 AM" },
        { fromMe: false, text: "Thanks for reviewing the document pipeline paper! Let's schedule a deep dive.", time: "10:42 AM" }
      ]
    },
    {
      id: "msg-2",
      senderName: "Marcus Vance",
      avatar: "MV",
      role: "Head of Infrastructure at Stripe",
      lastMessage: "Let's connect this week regarding the cloud engineering role.",
      time: "Yesterday",
      unread: false,
      messages: [
        { fromMe: false, text: "Hi! Loved your background in Kubernetes and CI/CD pipelines.", time: "Yesterday" },
        { fromMe: false, text: "Let's connect this week regarding the cloud engineering role.", time: "Yesterday" }
      ]
    }
  ]);
  const [selectedConversationId, setSelectedConversationId] = useState("msg-1");
  const [chatInput, setChatInput] = useState("");

  // Notifications State
  const [notifications, setNotifications] = useState([
    { id: "n1", title: "Elena Rostova accepted your connection invitation", time: "1 hour ago", unread: true },
    { id: "n2", title: "New job requisition matches your profile: Senior Frontend Engineer at HireLens AI", time: "3 hours ago", unread: true },
    { id: "n3", title: "Your resume ATS score was calibrated at 94.8% for Anthropic Labs opening", time: "1 day ago", unread: false },
    { id: "n4", title: "Marcus Vance shared a new engineering update", time: "2 days ago", unread: false },
  ]);

  // Job Openings State (LinkedIn Style Requisitions)
  const [jobs, setJobs] = useState<JobOpening[]>([
    { 
      id: 1, 
      title: "Senior Frontend Engineer", 
      company_name: "HireLens AI",
      department: "Engineering",
      location: "San Francisco, CA",
      workplace_type: "Hybrid",
      employment_type: "Full-time",
      openings_count: 3,
      experience_level: "Mid-Senior level",
      salary_range: "$155,000 - $190,000 / yr",
      description: "Build high-throughput web applications using React 19, Next.js, and TypeScript. Responsible for neural OCR visualization tools and client performance.",
      required_skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "HTML5", "CSS3", "JavaScript", "GraphQL", "Docker", "AWS"],
      posted_date: "1 day ago"
    },
    { 
      id: 2, 
      title: "AI/ML Research Scientist", 
      company_name: "Anthropic Labs",
      department: "Research",
      location: "Remote",
      workplace_type: "Remote",
      employment_type: "Full-time",
      openings_count: 2,
      experience_level: "Senior level",
      salary_range: "$185,000 - $240,000 / yr",
      description: "Design and build generative AI models, NLP pipelines, neural OCR algorithms, and deep learning architectures with PyTorch and Python.",
      required_skills: ["Python", "PyTorch", "TensorFlow", "Machine Learning", "Deep Learning", "NLP", "Large Language Models", "Scikit-Learn", "NumPy", "Pandas"],
      posted_date: "2 days ago"
    },
    { 
      id: 3, 
      title: "DevOps Engineer", 
      company_name: "Stripe Infrastructure",
      department: "Infrastructure",
      location: "Seattle, WA",
      workplace_type: "Hybrid",
      employment_type: "Full-time",
      openings_count: 4,
      experience_level: "Mid-Senior level",
      salary_range: "$160,000 - $205,000 / yr",
      description: "Manage multi-cloud infrastructure, CI/CD automated deployment pipelines, container orchestration, and Kubernetes clusters.",
      required_skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform", "Linux", "Prometheus", "Python", "Git", "Nginx"],
      posted_date: "4 days ago"
    }
  ]);

  const [selectedJobId, setSelectedJobId] = useState(1);
  const [expandedJobIds, setExpandedJobIds] = useState<number[]>([]);
  const [jobSearchTerm, setJobSearchTerm] = useState("");

  // Recruiter modal state
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newJobDept, setNewJobDept] = useState("Engineering");
  const [newLocation, setNewLocation] = useState("San Francisco, CA");
  const [newWorkplaceType, setNewWorkplaceType] = useState("Hybrid");
  const [newEmploymentType, setNewEmploymentType] = useState("Full-time");
  const [newOpeningsCount, setNewOpeningsCount] = useState<number>(1);
  const [newExperienceLevel, setNewExperienceLevel] = useState("Mid-Senior level");
  const [newSalaryRange, setNewSalaryRange] = useState("$140,000 - $185,000 / yr");
  const [newRequiredSkills, setNewRequiredSkills] = useState("");
  const [newJobDescription, setNewJobDescription] = useState("");

  // Recruiter pipeline candidates state
  const [candidates, setCandidates] = useState<CandidatePipelineItem[]>([
    {
      id: "cand-1",
      name: "Sarah Jenkins",
      email: "sarah.j@gmail.com",
      score: 94.8,
      matching_skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "HTML5"],
      pipeline_placement: "Technical Assessment",
      fraud_status: "Clear",
      is_fraud: false,
      filename: "sarah_jenkins_resume.pdf"
    },
    {
      id: "cand-2",
      name: "David Chen",
      email: "d.chen@aiux.org",
      score: 88.2,
      matching_skills: ["Python", "PyTorch", "NLP", "Machine Learning", "Scikit-Learn"],
      pipeline_placement: "Applied",
      fraud_status: "Clear",
      is_fraud: false,
      filename: "david_chen_cv.docx"
    },
    {
      id: "cand-3",
      name: "Alex Mercer",
      email: "alexm@cloudops.net",
      score: 62.5,
      matching_skills: ["AWS", "Kubernetes", "Docker", "Linux"],
      pipeline_placement: "Applied",
      fraud_status: "White Text Found",
      is_fraud: true,
      filename: "alex_mercer_devops.pdf"
    }
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScreeningRecruiterFile, setIsScreeningRecruiterFile] = useState(false);

  // Resume Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [atsReport, setAtsReport] = useState<ATSReport | null>(null);
  const [uploadError, setUploadError] = useState("");

  const toggleJobExpanded = (id: number) => {
    setExpandedJobIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectedJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  // Post Actions
  const handleLikePost = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          isLiked: !p.isLiked,
          likes: p.isLiked ? p.likes - 1 : p.likes + 1
        };
      }
      return p;
    }));
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    setIsPosting(true);
    const newPost: PostItem = {
      id: `post-${Date.now()}`,
      authorName: `${profile?.first_name || "Alex"} ${profile?.last_name || "Mercer"}`,
      authorHeadline: "Software Engineer • Verified Professional",
      authorAvatar: (profile?.first_name?.[0] || "A") + (profile?.last_name?.[0] || "M"),
      timeAgo: "Just now",
      content: newPostText.trim(),
      tags: ["#ProfessionalNetwork", "#Engineering", "#HireLensAI"],
      likes: 1,
      commentsCount: 0,
      sharesCount: 0,
      isLiked: true,
      comments: []
    };

    setPosts([newPost, ...posts]);
    setNewPostText("");
    setIsPosting(false);
  };

  const handleConnectAction = (id: string) => {
    setConnections(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, status: c.status === "Connect" ? "Pending ✓" : "Connect" };
      }
      return c;
    }));
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setConversations(prev => prev.map(c => {
      if (c.id === selectedConversationId) {
        return {
          ...c,
          lastMessage: chatInput.trim(),
          time: "Just now",
          messages: [...c.messages, { fromMe: true, text: chatInput.trim(), time: "Just now" }]
        };
      }
      return c;
    }));
    setChatInput("");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setUploadedFileName(file.name);
      setUploadError("");
      setAtsReport(null);

      try {
        const report = await analyzeResumeApi(file, selectedJob?.title, selectedJob?.description);
        setAtsReport(report);
      } catch (err: unknown) {
        const errMessage = err instanceof Error ? err.message : "Failed to analyze resume.";
        setUploadError(errMessage);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleRecruiterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsScreeningRecruiterFile(true);
      try {
        const item = await screenCandidateApi(file, selectedJobId);
        setCandidates(prev => [item, ...prev]);
      } catch (err: unknown) {
        const errMessage = err instanceof Error ? err.message : "Screening failed.";
        alert(errMessage);
      } finally {
        setIsScreeningRecruiterFile(false);
      }
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle.trim()) return;

    try {
      const skillsArray = newRequiredSkills
        .split(",")
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const created = await createJobApi({
        title: newJobTitle.trim(),
        company_name: newCompanyName.trim() || "HireLens AI",
        department: newJobDept,
        location: newLocation.trim() || "San Francisco, CA",
        workplace_type: newWorkplaceType,
        employment_type: newEmploymentType,
        openings_count: Number(newOpeningsCount) || 1,
        experience_level: newExperienceLevel,
        salary_range: newSalaryRange.trim() || "$140,000 - $185,000 / yr",
        description: newJobDescription.trim() || `Open position for ${newJobTitle} at ${newCompanyName || "HireLens AI"}.`,
        required_skills: skillsArray.length > 0 ? skillsArray : ["React", "TypeScript", "Python"]
      });

      setJobs(prev => [...prev, created]);
      setSelectedJobId(created.id);
      
      // Reset form
      setNewJobTitle("");
      setNewCompanyName("");
      setNewLocation("San Francisco, CA");
      setNewWorkplaceType("Hybrid");
      setNewEmploymentType("Full-time");
      setNewOpeningsCount(1);
      setNewExperienceLevel("Mid-Senior level");
      setNewSalaryRange("$140,000 - $185,000 / yr");
      setNewRequiredSkills("");
      setNewJobDescription("");
      setIsJobModalOpen(false);
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : "Failed to create job opening.";
      alert(errMessage);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data);
          localStorage.setItem("hirelens_user_profile", JSON.stringify(data));
        } else {
          const cached = localStorage.getItem("hirelens_user_profile");
          if (cached) {
            try {
              setProfile(JSON.parse(cached));
            } catch {
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              router.push("/login");
            }
          } else {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            router.push("/login");
          }
        }
      } catch {
        const cached = localStorage.getItem("hirelens_user_profile");
        if (cached) {
          try {
            setProfile(JSON.parse(cached));
          } catch {
            setProfile({
              id: "4ea6dea3-284b-4749-90b5-aa8759fe3c08",
              email: "demo@hirelens.ai",
              first_name: "Demo",
              last_name: "Recruiter",
              is_active: true,
              roles: [{ id: "e0cf62ab2e644f019aa37189a5fbca28", name: "RECRUITER", description: "Recruiter role" }],
            });
          }
        } else {
          setProfile({
            id: "4ea6dea3-284b-4749-90b5-aa8759fe3c08",
            email: "demo@hirelens.ai",
            first_name: "Demo",
            last_name: "Recruiter",
            is_active: true,
            roles: [{ id: "e0cf62ab2e644f019aa37189a5fbca28", name: "RECRUITER", description: "Recruiter role" }],
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();

    fetchJobsApi()
      .then(fetchedJobs => {
        if (fetchedJobs && fetchedJobs.length > 0) {
          setJobs(fetchedJobs);
        }
      })
      .catch(() => {});

    fetchPipelineApi()
      .then(fetchedPipeline => {
        if (fetchedPipeline && fetchedPipeline.length > 0) {
          setCandidates(fetchedPipeline);
        }
      })
      .catch(() => {});
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("hirelens_user_profile");
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background cinematic-bg-mesh">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-xs text-muted font-medium">Entering HireLens Professional Workspace...</p>
        </div>
      </div>
    );
  }

  const userRole = profile?.roles?.[0]?.name || "RECRUITER";
  const selectedChat = conversations.find(c => c.id === selectedConversationId) || conversations[0];

  const filteredCandidates = candidates.filter(cand => 
    cand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cand.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cand.matching_skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredJobs = jobs.filter(j =>
    j.title.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
    (j.company_name || "").toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
    (j.department || "").toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
    (j.required_skills || []).some(s => s.toLowerCase().includes(jobSearchTerm.toLowerCase()))
  );

  const fraudCount = candidates.filter(c => c.is_fraud).length;
  const avgScore = candidates.length > 0
    ? (candidates.reduce((acc, c) => acc + c.score, 0) / candidates.length).toFixed(1)
    : "0.0";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300 selection:bg-primary/25 selection:text-accent cinematic-bg-mesh">
      
      {/* =======================================================================
          TOP NAVIGATION BAR (LinkedIn-Style Hub with 7 Workspaces)
          ======================================================================= */}
      <header className="sticky top-0 z-50 apple-glass border-b border-border/40 transition-colors">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Brand & Global Search */}
          <div className="flex items-center gap-3">
            <Link href="/" className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary via-accent to-purple-600 text-white flex items-center justify-center font-bold text-xs tracking-tighter apple-press shadow-md glow-cyan shrink-0">
              HL
            </Link>
            <div className="relative hidden md:block">
              <Search className="h-3.5 w-3.5 text-muted absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search network, jobs, people..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-full border border-border/60 bg-secondary/40 text-xs focus:outline-none focus:ring-1 focus:ring-primary w-56 text-foreground"
              />
            </div>
          </div>

          {/* Center Tabs Navigation */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {[
              { id: "feed", label: "Home", icon: HomeIcon },
              { id: "network", label: "My Network", icon: Users },
              { id: "jobs", label: "Jobs", icon: Briefcase },
              { id: "messaging", label: "Messaging", icon: MessageSquare, badge: 1 },
              { id: "notifications", label: "Notifications", icon: Bell, badge: 2 },
              { id: "profile", label: "Profile", icon: User },
              { id: "recruiter", label: "ATS Console", icon: Target },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`relative flex flex-col items-center justify-center px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all apple-press cursor-pointer ${
                    isActive 
                      ? "text-primary font-bold" 
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  <div className="relative">
                    <Icon className="h-4 w-4" strokeWidth={isActive ? 2.2 : 1.7} />
                    {tab.badge && tab.badge > 0 && (
                      <span className="absolute -top-1 -right-2 h-3.5 w-3.5 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <span className="hidden lg:inline mt-0.5">{tab.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 w-6 h-0.5 bg-primary rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Profile Controls */}
          <div className="flex items-center gap-2.5">
            <SoundToggle />

            <button 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-8 w-8 rounded-full border border-border/70 flex items-center justify-center hover:bg-secondary transition-colors apple-press"
              aria-label="Toggle Theme"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-400" />
              <Moon className="h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 absolute text-accent" />
            </button>

            <button 
              onClick={handleLogout}
              className="h-8 px-3 border border-border/70 hover:bg-secondary/40 text-xs font-semibold rounded-full flex items-center gap-1.5 transition-colors cursor-pointer text-muted hover:text-foreground apple-press"
            >
              <LogOut className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* =======================================================================
          MAIN WORKSPACE ROUTER (Active Tab View)
          ======================================================================= */}
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-6">
        
        {/* ---------------------------------------------------------------------
            VIEW 1: HOME FEED (3-Column LinkedIn-Style Layout)
            --------------------------------------------------------------------- */}
        {activeTab === "feed" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: Profile Summary Card */}
            <aside className="md:col-span-3 space-y-4">
              <div className="rounded-2xl border border-border/70 bg-card/85 backdrop-blur-md overflow-hidden glow-card">
                <div className="h-16 bg-gradient-to-r from-primary via-accent to-purple-600 relative" />
                <div className="p-4 pt-0 text-center relative">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center font-bold text-base border-2 border-card mx-auto -mt-7 shadow-md">
                    {(profile?.first_name?.[0] || "A") + (profile?.last_name?.[0] || "M")}
                  </div>
                  <h3 className="font-bold text-sm text-foreground mt-2">{profile?.first_name} {profile?.last_name}</h3>
                  <p className="text-[11px] text-muted">Software Engineer & Verified Leader</p>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-[9px] uppercase">
                    {userRole}
                  </span>

                  <div className="pt-4 mt-4 border-t border-border/40 text-left space-y-2 text-xs">
                    <div className="flex justify-between text-muted">
                      <span>Profile viewers</span>
                      <span className="text-primary font-semibold">142</span>
                    </div>
                    <div className="flex justify-between text-muted">
                      <span>Post impressions</span>
                      <span className="text-accent font-semibold">3.2k</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Shortcuts */}
              <div className="p-4 rounded-2xl border border-border/70 bg-card/80 backdrop-blur-md space-y-2 text-xs">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted block">Shortcuts</span>
                <button onClick={() => setActiveTab("network")} className="w-full text-left py-1 text-muted hover:text-foreground flex items-center justify-between">
                  <span>My Network</span>
                  <span className="text-[10px] text-primary">742</span>
                </button>
                <button onClick={() => setActiveTab("jobs")} className="w-full text-left py-1 text-muted hover:text-foreground flex items-center justify-between">
                  <span>Targeted Openings</span>
                  <span className="text-[10px] text-emerald-400">3 New</span>
                </button>
                <button onClick={() => setActiveTab("recruiter")} className="w-full text-left py-1 text-muted hover:text-foreground flex items-center justify-between">
                  <span>ATS Resume Diagnostics</span>
                  <span className="text-[10px] text-accent">94.8%</span>
                </button>
              </div>
            </aside>

            {/* CENTER COLUMN: Create Post & Feed Stream */}
            <section className="md:col-span-6 space-y-4">
              
              {/* "Start a Post" Card */}
              <div className="p-4 rounded-2xl border border-border/70 bg-card/85 backdrop-blur-md space-y-3 glow-card">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {(profile?.first_name?.[0] || "A") + (profile?.last_name?.[0] || "M")}
                  </div>
                  <input
                    type="text"
                    placeholder="Start a post, share a technical breakthrough..."
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-full border border-border/70 bg-secondary/40 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <div className="flex items-center gap-4 text-xs text-muted">
                    <button type="button" className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer">
                      <ImageIcon className="h-4 w-4 text-primary" />
                      <span>Media</span>
                    </button>
                    <button type="button" className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors cursor-pointer">
                      <FileText className="h-4 w-4 text-emerald-400" />
                      <span>Document</span>
                    </button>
                    <button type="button" className="flex items-center gap-1.5 hover:text-amber-400 transition-colors cursor-pointer">
                      <Sparkles className="h-4 w-4 text-amber-400" />
                      <span>Breakthrough</span>
                    </button>
                  </div>

                  <button
                    onClick={handleCreatePost}
                    disabled={!newPostText.trim() || isPosting}
                    className="px-4 py-1.5 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all apple-press shadow-sm disabled:opacity-40 cursor-pointer"
                  >
                    Post
                  </button>
                </div>
              </div>

              {/* Feed Posts */}
              {posts.map((post) => (
                <article key={post.id} className="p-5 rounded-2xl border border-border/70 bg-card/85 backdrop-blur-md space-y-3.5 glow-card">
                  {/* Author Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {post.authorAvatar}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-foreground flex items-center gap-1">
                          {post.authorName}
                          <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                        </h4>
                        <p className="text-[10px] text-muted leading-tight">{post.authorHeadline}</p>
                        <span className="text-[9px] text-muted flex items-center gap-1 mt-0.5">
                          <Clock className="h-2.5 w-2.5" /> {post.timeAgo}
                        </span>
                      </div>
                    </div>
                    <button className="text-xs font-semibold text-primary hover:underline cursor-pointer">
                      + Follow
                    </button>
                  </div>

                  {/* Content */}
                  <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">
                    {post.content}
                  </p>

                  {/* Hashtags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {post.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="text-[10px] text-accent font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Interaction Stats */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[10px] text-muted">
                    <span>👍 💡 {post.likes} Reactions</span>
                    <span>{post.commentsCount} Comments • {post.sharesCount} Reposts</span>
                  </div>

                  {/* Action Bar */}
                  <div className="grid grid-cols-3 pt-1 border-t border-border/30 text-xs">
                    <button
                      onClick={() => handleLikePost(post.id)}
                      className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer apple-press ${
                        post.isLiked ? "text-primary font-bold" : "text-muted hover:text-foreground"
                      }`}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span>{post.isLiked ? "Liked" : "Like"}</span>
                    </button>

                    <button className="py-2 rounded-lg flex items-center justify-center gap-1.5 text-muted hover:text-foreground transition-colors cursor-pointer apple-press">
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Comment</span>
                    </button>

                    <button className="py-2 rounded-lg flex items-center justify-center gap-1.5 text-muted hover:text-foreground transition-colors cursor-pointer apple-press">
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Share</span>
                    </button>
                  </div>

                  {/* Existing Comments */}
                  {post.comments.length > 0 && (
                    <div className="pt-2 border-t border-border/40 space-y-2">
                      {post.comments.map((c, cIdx) => (
                        <div key={cIdx} className="p-2.5 rounded-xl bg-secondary/30 text-xs space-y-0.5">
                          <div className="flex justify-between text-[10px] text-muted">
                            <span className="font-semibold text-foreground">{c.author}</span>
                            <span>{c.time}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">{c.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              ))}

            </section>

            {/* RIGHT COLUMN: Recommendations & Trending Topics */}
            <aside className="md:col-span-3 space-y-4">
              
              {/* People You May Know */}
              <div className="p-4 rounded-2xl border border-border/70 bg-card/85 backdrop-blur-md space-y-3.5 glow-card">
                <span className="text-xs font-bold text-foreground block">People You May Know</span>
                <div className="space-y-3">
                  {connections.map((c) => (
                    <div key={c.id} className="flex items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="font-semibold text-foreground block leading-snug">{c.name}</span>
                        <span className="text-[10px] text-muted block">{c.role}</span>
                        <span className="text-[9px] text-accent block">{c.mutual} mutual connections</span>
                      </div>
                      <button
                        onClick={() => handleConnectAction(c.id)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all apple-press cursor-pointer shrink-0 ${
                          c.status === "Pending ✓" 
                            ? "bg-secondary text-muted" 
                            : "bg-primary text-white hover:bg-primary/90 shadow-sm"
                        }`}
                      >
                        {c.status}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending in Tech */}
              <div className="p-4 rounded-2xl border border-border/70 bg-card/85 backdrop-blur-md space-y-3 glow-card text-xs">
                <span className="font-bold text-foreground block">Trending in Tech & Hiring</span>
                <div className="space-y-2 text-muted">
                  <div className="cursor-pointer hover:text-accent">
                    <span className="font-semibold text-foreground block">#NextJS16 & React 19</span>
                    <span className="text-[10px]">14.2k discussions</span>
                  </div>
                  <div className="cursor-pointer hover:text-accent">
                    <span className="font-semibold text-foreground block">#NeuralOCR & Document AI</span>
                    <span className="text-[10px]">8.9k discussions</span>
                  </div>
                  <div className="cursor-pointer hover:text-accent">
                    <span className="font-semibold text-foreground block">#DistributedSystems</span>
                    <span className="text-[10px]">19.4k discussions</span>
                  </div>
                </div>
              </div>

            </aside>

          </div>
        )}

        {/* ---------------------------------------------------------------------
            VIEW 2: MY NETWORK
            --------------------------------------------------------------------- */}
        {activeTab === "network" && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-border/70 bg-card/85 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 glow-card">
              <div>
                <h2 className="text-xl font-bold text-foreground">Your Professional Network</h2>
                <p className="text-xs text-muted mt-1">Manage connection requests, discover colleagues, and explore talent clusters.</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="text-center px-4 py-2 rounded-xl bg-secondary/40 border border-border/50">
                  <span className="text-lg font-bold text-foreground block">742</span>
                  <span className="text-[10px] text-muted">Connections</span>
                </div>
                <div className="text-center px-4 py-2 rounded-xl bg-secondary/40 border border-border/50">
                  <span className="text-lg font-bold text-accent block">310</span>
                  <span className="text-[10px] text-muted">Following</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {connections.map((c) => (
                <div key={c.id} className="p-5 rounded-2xl border border-border/70 bg-card/85 backdrop-blur-md text-center space-y-3 glow-card">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center font-bold text-base mx-auto shadow-md">
                    {c.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{c.name}</h4>
                    <p className="text-xs text-muted leading-tight mt-0.5">{c.role}</p>
                    <span className="text-[10px] text-accent block mt-1">{c.mutual} mutual connections</span>
                  </div>
                  <button
                    onClick={() => handleConnectAction(c.id)}
                    className="w-full py-1.5 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all apple-press shadow-sm cursor-pointer"
                  >
                    {c.status}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------------
            VIEW 3: JOBS BOARD
            --------------------------------------------------------------------- */}
        {activeTab === "jobs" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
              <div>
                <h2 className="text-xl font-bold text-foreground">Verified Requisitions</h2>
                <p className="text-xs text-muted mt-0.5">Explore active job openings with transparent salary bands and ATS compatibility scoring.</p>
              </div>
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-muted absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter by title, company, skill..."
                  value={jobSearchTerm}
                  onChange={(e) => setJobSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-full border border-border/70 bg-secondary/40 text-xs focus:outline-none focus:ring-1 focus:ring-primary w-64 text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredJobs.map((job) => {
                const isSelected = selectedJobId === job.id;
                const isExpanded = expandedJobIds.includes(job.id);

                return (
                  <div 
                    key={job.id}
                    className={`rounded-2xl border p-5 transition-all space-y-4 glow-card ${
                      isSelected 
                        ? "border-primary bg-primary/10 ring-1 ring-primary/40 shadow-sm" 
                        : "border-border/70 bg-card/85"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center font-bold text-sm shrink-0">
                          {(job.company_name || "HL").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-foreground">{job.title}</h4>
                          <span className="text-xs text-muted font-medium flex items-center gap-1 mt-0.5">
                            {job.company_name || "HireLens AI"}
                            <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 shrink-0 border border-emerald-500/20">
                        {job.openings_count || 1} Openings
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 text-[11px] text-muted">
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-secondary/50 border border-border/50">
                        <MapPin className="h-3 w-3 text-primary" /> {job.location || "Remote"} ({job.workplace_type || "Hybrid"})
                      </span>
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-secondary/50 border border-border/50">
                        <DollarSign className="h-3 w-3 text-emerald-400" /> {job.salary_range || "Competitive"}
                      </span>
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-secondary/50 border border-border/50">
                        <Briefcase className="h-3 w-3 text-amber-400" /> {job.employment_type || "Full-time"}
                      </span>
                    </div>

                    <div className="text-xs text-muted leading-relaxed">
                      <p className={isExpanded ? "" : "line-clamp-2"}>
                        {job.description || "No full description provided."}
                      </p>
                      {job.description && job.description.length > 100 && (
                        <button
                          onClick={() => toggleJobExpanded(job.id)}
                          className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1 mt-1 cursor-pointer"
                        >
                          {isExpanded ? <>Show Less <ChevronUp className="h-3 w-3" /></> : <>View Full Description <ChevronDown className="h-3 w-3" /></>}
                        </button>
                      )}
                    </div>

                    <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                      <span className="text-[10px] text-muted">{job.posted_date || "Recently"}</span>
                      <button
                        onClick={() => {
                          setSelectedJobId(job.id);
                          setActiveTab("recruiter");
                        }}
                        className="px-4 py-1.5 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all apple-press shadow-sm cursor-pointer"
                      >
                        Target with ATS Scanner
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------------
            VIEW 4: MESSAGING
            --------------------------------------------------------------------- */}
        {activeTab === "messaging" && (
          <div className="rounded-2xl border border-border/70 bg-card/85 backdrop-blur-md overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[560px] glow-card">
            
            {/* Conversations List (Left 4 cols) */}
            <div className="md:col-span-4 border-r border-border/50 p-4 space-y-3">
              <span className="text-xs font-bold text-foreground block">Active Conversations</span>
              <div className="space-y-1.5">
                {conversations.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedConversationId(c.id)}
                    className={`p-3 rounded-xl cursor-pointer transition-colors space-y-1 ${
                      selectedConversationId === c.id ? "bg-primary/10 border border-primary/30" : "hover:bg-secondary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">{c.senderName}</span>
                      <span className="text-[10px] text-muted">{c.time}</span>
                    </div>
                    <p className="text-[11px] text-muted line-clamp-1">{c.lastMessage}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Thread (Right 8 cols) */}
            <div className="md:col-span-8 flex flex-col justify-between p-6 space-y-4">
              <div className="border-b border-border/40 pb-3">
                <h4 className="font-bold text-sm text-foreground">{selectedChat.senderName}</h4>
                <p className="text-xs text-muted">{selectedChat.role}</p>
              </div>

              {/* Message Bubbles */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[380px] pr-2">
                {selectedChat.messages.map((m, idx) => (
                  <div key={idx} className={`flex flex-col ${m.fromMe ? "items-end" : "items-start"}`}>
                    <div className={`px-4 py-2.5 rounded-2xl text-xs max-w-sm ${
                      m.fromMe ? "bg-primary text-white" : "bg-secondary/70 text-foreground"
                    }`}>
                      {m.text}
                    </div>
                    <span className="text-[9px] text-muted mt-0.5 px-1">{m.time}</span>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-2 border-t border-border/40">
                <input
                  type="text"
                  placeholder="Write a message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-full border border-border/70 bg-secondary/40 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                />
                <button
                  type="submit"
                  className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-all apple-press cursor-pointer shrink-0"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>

          </div>
        )}

        {/* ---------------------------------------------------------------------
            VIEW 5: NOTIFICATIONS
            --------------------------------------------------------------------- */}
        {activeTab === "notifications" && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Notifications</h2>
              <button
                onClick={() => setNotifications(prev => prev.map(n => ({ ...n, unread: false })))}
                className="text-xs text-primary hover:underline font-semibold cursor-pointer"
              >
                Mark all as read
              </button>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card/85 backdrop-blur-md divide-y divide-border/40 glow-card">
              {notifications.map((n) => (
                <div key={n.id} className="p-4 flex items-start gap-3 hover:bg-secondary/30 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0 mt-0.5">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-foreground leading-relaxed">{n.title}</p>
                    <span className="text-[10px] text-muted mt-1 block">{n.time}</span>
                  </div>
                  {n.unread && (
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------------
            VIEW 6: PROFILE
            --------------------------------------------------------------------- */}
        {activeTab === "profile" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="rounded-3xl border border-border/70 bg-card/85 backdrop-blur-md overflow-hidden glow-card">
              <div className="h-32 bg-gradient-to-r from-primary via-accent to-purple-600" />
              <div className="p-6 pt-0 relative">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center font-bold text-2xl border-4 border-card -mt-10 shadow-lg">
                  {(profile?.first_name?.[0] || "A") + (profile?.last_name?.[0] || "M")}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-3">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{profile?.first_name} {profile?.last_name}</h2>
                    <p className="text-xs text-muted">Lead Software Engineer • Neural Architect</p>
                    <span className="text-xs text-accent mt-0.5 block">{profile?.email} • San Francisco Bay Area</span>
                  </div>
                  <button 
                    onClick={() => setActiveTab("recruiter")}
                    className="px-4 py-2 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all apple-press shadow-md glow-primary self-start sm:self-auto"
                  >
                    Analyze Resume ATS Score
                  </button>
                </div>

                <div className="pt-6 mt-6 border-t border-border/40 space-y-4">
                  <div>
                    <h3 className="font-bold text-xs uppercase tracking-wider text-muted mb-2">About</h3>
                    <p className="text-xs text-foreground leading-relaxed">
                      Passionate full-stack systems engineer focused on high-throughput microservices, optical character recognition engines, and scalable web architecture.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-xs uppercase tracking-wider text-muted mb-2">Verified Skill Taxonomies</h3>
                    <div className="flex flex-wrap gap-2">
                      {["React 19", "Next.js", "TypeScript", "Python 3.14", "FastAPI", "PyMuPDF", "Docker", "Tailwind CSS"].map((s, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-lg bg-secondary/80 border border-border text-xs font-medium text-foreground">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------------
            VIEW 7: RECRUITER & ATS SCANNER CONSOLE (Complete Core Engine)
            --------------------------------------------------------------------- */}
        {activeTab === "recruiter" && (
          <div className="space-y-8">
            
            {/* Header Strip */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border/50">
              <div>
                <h2 className="text-xl font-bold text-foreground">Recruiter & ATS Intelligence Console</h2>
                <p className="text-xs text-muted mt-0.5">Automated resume parsing, keyword density fraud detection, and multi-factor scoring.</p>
              </div>
              <button 
                onClick={() => setIsJobModalOpen(true)}
                className="text-xs font-semibold px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-all flex items-center gap-1.5 cursor-pointer shadow-md glow-primary apple-press"
              >
                + Post New Requisition
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border border-border/70 bg-card/85 backdrop-blur-md p-4 rounded-2xl space-y-1 glow-card">
                <span className="text-xs text-muted">Total Screened</span>
                <span className="text-2xl font-bold text-foreground block">{candidates.length}</span>
              </div>
              <div className="border border-border/70 bg-card/85 backdrop-blur-md p-4 rounded-2xl space-y-1 glow-card">
                <span className="text-xs text-muted">Fraud Alerts</span>
                <span className="text-2xl font-bold text-destructive block">{fraudCount}</span>
              </div>
              <div className="border border-border/70 bg-card/85 backdrop-blur-md p-4 rounded-2xl space-y-1 glow-card">
                <span className="text-xs text-muted">Avg. Score</span>
                <span className="text-2xl font-bold text-amber-400 block">{avgScore}%</span>
              </div>
              <div className="border border-border/70 bg-card/85 backdrop-blur-md p-4 rounded-2xl space-y-1 glow-card">
                <span className="text-xs text-muted">Openings Active</span>
                <span className="text-2xl font-bold text-accent block">{jobs.length}</span>
              </div>
            </div>

            {/* Resume Upload & Live ATS Scanner */}
            <div className="border border-border/70 bg-card/85 backdrop-blur-md rounded-2xl p-6 space-y-6 glow-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border/50">
                <div>
                  <h3 className="font-bold text-sm text-foreground">ATS Compatibility Analyzer</h3>
                  <p className="text-xs text-muted mt-0.5">
                    Target Requisition: <strong className="text-foreground">{selectedJob?.title}</strong> ({selectedJob?.company_name})
                  </p>
                </div>
                <input 
                  type="file" 
                  id="resume-upload" 
                  accept=".pdf,.docx,.png,.jpg,.jpeg" 
                  className="hidden" 
                  onChange={handleFileChange} 
                />
                <button
                  onClick={() => document.getElementById("resume-upload")?.click()}
                  className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-full hover:bg-primary/90 transition-all apple-press shadow-md glow-primary cursor-pointer self-start sm:self-auto"
                >
                  Upload Resume to Analyze
                </button>
              </div>

              {uploadError && (
                <div className="p-3 rounded-xl border border-destructive/20 bg-destructive/10 text-xs text-destructive flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {isUploading ? (
                <div className="p-12 text-center space-y-3 bg-secondary/20 rounded-2xl">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  <span className="text-xs text-muted block">Running PyMuPDF stream color analysis & Tesseract OCR...</span>
                </div>
              ) : atsReport ? (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-5 border border-border/70 rounded-2xl bg-secondary/20">
                    <div className="h-20 w-20 rounded-2xl bg-card border border-border/60 flex items-center justify-center font-bold text-2xl text-emerald-400 shrink-0">
                      {atsReport.score}%
                    </div>
                    <div className="space-y-1 text-center sm:text-left">
                      <span className="font-bold text-sm text-foreground block">{uploadedFileName}</span>
                      <span className="text-xs text-muted block">
                        Engine: {atsReport.extraction_method === "ocr_image" ? "Tesseract OCR" : "PyMuPDF Native Text"}
                      </span>
                    </div>
                  </div>

                  {atsReport.is_fraud_flagged && (
                    <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-xs text-destructive space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <AlertOctagon className="h-4 w-4" />
                        <span>ATS Anti-Fraud & Manipulation Intercepted</span>
                      </div>
                      <ul className="list-disc list-inside">
                        {atsReport.fraud_alerts.map((a, i) => <li key={i}>{a}</li>)}
                      </ul>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl border border-border/60 bg-secondary/15 space-y-2">
                      <span className="font-bold text-primary block">Matched Skills ({atsReport.matching.length})</span>
                      <div className="flex flex-wrap gap-1">
                        {atsReport.matching.map((s, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium text-[10px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-border/60 bg-secondary/15 space-y-2">
                      <span className="font-bold text-amber-400 block">Missing Skills ({atsReport.missing.length})</span>
                      <div className="flex flex-wrap gap-1">
                        {atsReport.missing.map((s, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-medium text-[10px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => document.getElementById("resume-upload")?.click()}
                  className="p-8 text-center border border-dashed border-border/70 rounded-2xl cursor-pointer hover:bg-secondary/20 transition-all apple-press"
                >
                  <UploadCloud className="h-8 w-8 text-primary mx-auto mb-2" />
                  <span className="text-xs font-semibold text-foreground block">Click to select a candidate resume file (PDF, DOCX, PNG)</span>
                  <span className="text-[10px] text-muted block mt-1">Multi-factor ATS alignment against {selectedJob?.title}</span>
                </div>
              )}
            </div>

            {/* Recruiter Candidate Pipeline Table */}
            <div className="border border-border/70 bg-card/85 backdrop-blur-md rounded-2xl p-6 space-y-4 glow-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
                <div>
                  <h3 className="font-bold text-sm text-foreground">Screened Candidate Pipeline</h3>
                  <span className="text-xs text-muted">{candidates.length} Profiles Evaluated</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="recruiter-candidate-upload"
                    accept=".pdf,.docx,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={handleRecruiterUpload}
                  />
                  <button
                    onClick={() => document.getElementById("recruiter-candidate-upload")?.click()}
                    disabled={isScreeningRecruiterFile}
                    className="px-3.5 py-1.5 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all apple-press shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isScreeningRecruiterFile ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
                    <span>+ Screen Candidate</span>
                  </button>
                  <input
                    type="text"
                    placeholder="Search candidate..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-3 py-1.5 rounded-full border border-border/70 bg-secondary/40 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-36 sm:w-44"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-muted border-b border-border/40 pb-2">
                      <th className="py-2.5 font-medium">Applicant</th>
                      <th className="py-2.5 font-medium">Match Fit</th>
                      <th className="py-2.5 font-medium">Extracted Skills</th>
                      <th className="py-2.5 font-medium">Placement Stage</th>
                      <th className="py-2.5 font-medium">Fraud Inspection</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {filteredCandidates.map((cand) => (
                      <tr key={cand.id} className="hover:bg-secondary/30 transition-colors">
                        <td className="py-3">
                          <span className="font-semibold text-foreground block">{cand.name}</span>
                          <span className="text-[10px] text-muted">{cand.email}</span>
                        </td>
                        <td className="py-3 font-bold text-emerald-400">{cand.score}%</td>
                        <td className="py-3">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {cand.matching_skills.map((s, idx) => (
                              <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-secondary border border-border/50 text-foreground">
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                            {cand.pipeline_placement}
                          </span>
                        </td>
                        <td className="py-3">
                          {cand.is_fraud ? (
                            <span className="text-destructive font-semibold flex items-center gap-1">
                              <AlertOctagon className="h-3 w-3" /> {cand.fraud_status}
                            </span>
                          ) : (
                            <span className="text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Clear
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* =======================================================================
          JOB REQUISITION CREATION MODAL
          ======================================================================= */}
      {isJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-card/95 border border-border/80 rounded-3xl w-full max-w-[640px] p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto backdrop-blur-xl glow-card">
            
            <div className="border-b border-border/50 pb-3">
              <h3 className="font-bold text-lg text-foreground">Post a New Job Opening (LinkedIn Style)</h3>
              <p className="text-xs text-muted mt-1">Fill out the complete requisition details to publish for candidates and pipeline screening.</p>
            </div>
            
            <form onSubmit={handleCreateJob} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted" htmlFor="companyName">
                    Company Name *
                  </label>
                  <input
                    id="companyName"
                    type="text"
                    required
                    placeholder="e.g. Apple, Google, Stripe"
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    className="w-full px-3 py-2 bg-secondary/40 rounded-xl border border-border/70 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted" htmlFor="jobTitle">
                    Job Title *
                  </label>
                  <input
                    id="jobTitle"
                    type="text"
                    required
                    placeholder="e.g. Senior Backend Engineer"
                    value={newJobTitle}
                    onChange={(e) => setNewJobTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-secondary/40 rounded-xl border border-border/70 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted" htmlFor="jobDept">
                    Department
                  </label>
                  <select
                    id="jobDept"
                    value={newJobDept}
                    onChange={(e) => setNewJobDept(e.target.value)}
                    className="w-full px-3 py-2 bg-secondary/40 rounded-xl border border-border/70 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground cursor-pointer font-medium"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Research">Research / AI</option>
                    <option value="Infrastructure">Infrastructure / Cloud</option>
                    <option value="Product">Product Management</option>
                    <option value="Design">Design / UX</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted" htmlFor="location">
                    Location
                  </label>
                  <input
                    id="location"
                    type="text"
                    placeholder="San Francisco, CA or Remote"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-secondary/40 rounded-xl border border-border/70 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted" htmlFor="salaryRange">
                    Estimated Salary Range
                  </label>
                  <input
                    id="salaryRange"
                    type="text"
                    placeholder="$150,000 - $190,000 / yr"
                    value={newSalaryRange}
                    onChange={(e) => setNewSalaryRange(e.target.value)}
                    className="w-full px-3 py-2 bg-secondary/40 rounded-xl border border-border/70 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted" htmlFor="requiredSkills">
                  Required Skills (comma-separated)
                </label>
                <input
                  id="requiredSkills"
                  type="text"
                  placeholder="React, Next.js, Python, AWS"
                  value={newRequiredSkills}
                  onChange={(e) => setNewRequiredSkills(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/40 rounded-xl border border-border/70 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted" htmlFor="jobDescription">
                  Job Description *
                </label>
                <textarea
                  id="jobDescription"
                  rows={4}
                  required
                  placeholder="Detail the expectations, responsibilities, and qualifications..."
                  value={newJobDescription}
                  onChange={(e) => setNewJobDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/40 rounded-xl border border-border/70 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setIsJobModalOpen(false)}
                  className="px-4 py-2 border border-border/70 rounded-full text-xs font-semibold hover:bg-secondary transition-colors cursor-pointer text-muted hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-white rounded-full text-xs font-semibold hover:bg-primary/90 transition-all cursor-pointer apple-press shadow-md glow-primary"
                >
                  Publish Job Requisition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
