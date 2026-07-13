import React, { useState, useEffect, useRef } from 'react';
import API_BASE from '../../services/api';

const ResumeManagement = () => {
    const [resumes, setResumes] = useState([]);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // Tabs: 'analysis' | 'matcher'
    const [activeTab, setActiveTab] = useState('analysis');
    
    // Job Matcher State
    const [jobs, setJobs] = useState([]);
    const [matchingJobId, setMatchingJobId] = useState(null);
    const [matchResult, setMatchResult] = useState(null);

    // Drag and Drop State & Refs
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type === "application/pdf" || droppedFile.name.toLowerCase().endsWith(".pdf")) {
                setFile(droppedFile);
            } else {
                alert("Please upload a PDF file only.");
            }
        }
    };

    const onButtonClick = () => {
        fileInputRef.current.click();
    };

    useEffect(() => {
        fetchResumes();
    }, []);

    useEffect(() => {
        if (activeTab === 'matcher') {
            fetchJobs();
        }
    }, [activeTab]);

    const fetchResumes = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/resume/my`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            setResumes(await res.json());
        }
    };

    const fetchJobs = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/resume/jobs`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            setJobs(await res.json());
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;
        setLoading(true);
        console.log("Uploading file:", file.name, "to", `${API_BASE}/api/resume/upload`);
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await fetch(`${API_BASE}/api/resume/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            console.log("Upload response status:", res.status);
            if (res.ok) {
                setFile(null);
                fetchResumes();
            } else {
                const text = await res.text();
                console.error("Upload error body:", text);
                alert(`Failed to analyze resume. Server returned ${res.status}: ${text || "Unknown Error"}`);
            }
        } catch (err) {
            console.error("Upload fetch error:", err);
            alert(`Network error uploading resume: ${err.message}`);
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        const token = localStorage.getItem('token');
        await fetch(`${API_BASE}/api/resume/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchResumes();
    };

    const handleDownload = async (id, fileName) => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/resume/download/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            a.click();
        }
    };

    const handleMatchJob = async (jobId) => {
        setMatchingJobId(jobId);
        setMatchResult(null);
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/resume/match/${jobId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            setMatchResult(await res.json());
        } else {
            alert("Ensure you have uploaded a resume first.");
        }
        setMatchingJobId(null);
    };

    const parseJSON = (str) => {
        try {
            const parsed = JSON.parse(str);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    };

    const latestResume = resumes.length > 0 ? resumes[0] : null;

    let atsBreakdown = {};
    let strengths = [];
    let weaknesses = [];
    let skillsFound = [];
    let recommendedSkills = [];
    let improvementSuggestions = [];

    if (latestResume) {
        try { 
            const parsed = JSON.parse(latestResume.atsBreakdown || '{}'); 
            atsBreakdown = (parsed && typeof parsed === 'object') ? parsed : {};
        } catch {
            atsBreakdown = {};
        }
        strengths = parseJSON(latestResume.strengths);
        weaknesses = parseJSON(latestResume.weaknesses);
        skillsFound = parseJSON(latestResume.skillsFound);
        recommendedSkills = parseJSON(latestResume.recommendedSkills);
        improvementSuggestions = parseJSON(latestResume.improvementSuggestions);
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", animation: "fadeIn 0.3s ease-out" }}>
            
            {/* Header / Navigation card */}
            <div className="glass-card" style={{
                padding: "20px 24px",
                borderRadius: "16px",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "16px",
                border: "1px solid var(--card-border)"
            }}>
                <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "800", color: "var(--text-main)" }}>
                    📄 Resume & ATS Hub
                </h2>
                <div style={{ display: "flex", background: "var(--nav-hover-bg)", padding: "4px", borderRadius: "10px", border: "1px solid var(--card-border)" }}>
                    <button 
                        onClick={() => setActiveTab('analysis')}
                        style={{
                            padding: "6px 16px",
                            borderRadius: "8px",
                            border: "none",
                            background: activeTab === 'analysis' ? 'var(--primary)' : 'transparent',
                            color: activeTab === 'analysis' ? '#fff' : 'var(--text-muted)',
                            fontWeight: "600",
                            fontSize: "0.85rem",
                            cursor: "pointer",
                            transition: "all 0.2s"
                        }}
                    >
                        ATS Analysis
                    </button>
                    <button 
                        onClick={() => setActiveTab('matcher')}
                        style={{
                            padding: "6px 16px",
                            borderRadius: "8px",
                            border: "none",
                            background: activeTab === 'matcher' ? 'var(--primary)' : 'transparent',
                            color: activeTab === 'matcher' ? '#fff' : 'var(--text-muted)',
                            fontWeight: "600",
                            fontSize: "0.85rem",
                            cursor: "pointer",
                            transition: "all 0.2s"
                        }}
                    >
                        Job Matcher
                    </button>
                </div>
            </div>

            {activeTab === 'analysis' && (
                <>
                    {/* Upload Card */}
                    <div className="glass-card" style={{
                        padding: "24px",
                        borderRadius: "16px",
                        border: "1px solid var(--card-border)",
                        background: "var(--bg-secondary)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px"
                    }}>
                        <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "var(--text-main)" }}>
                            📤 Upload Resume for Parsing
                        </h3>
                        <form 
                            onSubmit={handleUpload} 
                            onDragEnter={handleDrag}
                            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
                        >
                            <input 
                                ref={fileInputRef}
                                type="file" 
                                accept=".pdf"
                                onChange={(e) => setFile(e.target.files[0])}
                                style={{ display: "none" }}
                            />
                            
                            <div 
                                onDragEnter={handleDrag}
                                onDragOver={handleDrag}
                                onDragLeave={handleDrag}
                                onDrop={handleDrop}
                                onClick={onButtonClick}
                                style={{
                                    border: `2px dashed ${dragActive ? 'var(--primary)' : 'var(--card-border)'}`,
                                    borderRadius: "12px",
                                    padding: "32px 20px",
                                    textAlign: "center",
                                    background: dragActive ? 'rgba(99, 102, 241, 0.05)' : 'rgba(255, 255, 255, 0.01)',
                                    cursor: "pointer",
                                    transition: "all 0.2s ease-in-out",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "12px",
                                    minHeight: "150px"
                                }}
                            >
                                {!file ? (
                                    <>
                                        <div style={{
                                            width: "48px",
                                            height: "48px",
                                            borderRadius: "50%",
                                            background: "rgba(99, 102, 241, 0.1)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "1.5rem",
                                            color: "var(--primary)"
                                        }}>
                                            📄
                                        </div>
                                        <div>
                                            <p style={{ margin: "0 0 4px 0", fontSize: "0.95rem", fontWeight: "700", color: "var(--text-main)" }}>
                                                Drag & drop your PDF resume here
                                            </p>
                                            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)" }}>
                                                or <span style={{ color: "var(--primary)", textDecoration: "underline", fontWeight: "600" }}>browse files</span> from your device
                                            </p>
                                        </div>
                                        <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--text-muted)" }}>
                                            Only PDF files are supported
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <div style={{
                                            width: "48px",
                                            height: "48px",
                                            borderRadius: "50%",
                                            background: "rgba(16, 185, 129, 0.1)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "1.5rem",
                                            color: "var(--success)"
                                        }}>
                                            ✅
                                        </div>
                                        <div>
                                            <p style={{ margin: "0 0 4px 0", fontSize: "0.95rem", fontWeight: "700", color: "var(--text-main)", wordBreak: "break-all" }}>
                                                {file.name}
                                            </p>
                                            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)" }}>
                                                {(file.size / 1024).toFixed(1)} KB • Ready to analyze
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFile(null);
                                            }}
                                            style={{
                                                background: "rgba(239, 68, 68, 0.1)",
                                                border: "none",
                                                color: "var(--error)",
                                                fontSize: "0.75rem",
                                                fontWeight: "600",
                                                cursor: "pointer",
                                                padding: "6px 12px",
                                                borderRadius: "6px",
                                                transition: "background 0.2s"
                                            }}
                                        >
                                            Remove file
                                        </button>
                                    </>
                                )}
                            </div>

                            {file && (
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    style={{
                                        width: "100%",
                                        padding: "0.75rem",
                                        background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "8px",
                                        fontWeight: "700",
                                        fontSize: "0.9rem",
                                        cursor: "pointer",
                                        transition: "opacity 0.2s",
                                        opacity: loading ? 0.6 : 1,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "8px"
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <span style={{ 
                                                width: "16px", 
                                                height: "16px", 
                                                border: "2px solid #fff", 
                                                borderRightColor: "transparent", 
                                                borderRadius: "50%", 
                                                display: "inline-block", 
                                                animation: "spin 0.75s linear infinite" 
                                            }}></span>
                                            Analyzing with AI...
                                        </>
                                    ) : (
                                        <>📤 Upload & Analyze Resume</>
                                    )}
                                </button>
                            )}
                        </form>
                    </div>

                    {latestResume ? (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", alignItems: "start" }}>
                            
                            {/* Left Column (Score Breakdown & Strengths) */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "24px", gridColumn: "span 2" }}>
                                
                                {/* ATS Score Card */}
                                <div className="glass-card" style={{ padding: "24px", borderRadius: "16px", border: "1px solid var(--card-border)" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--card-border)", paddingBottom: "16px", marginBottom: "20px" }}>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: "1.3rem", fontWeight: "800", color: "var(--text-main)" }}>ATS Score Overview</h3>
                                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>Powered by AI</span>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <div style={{ fontSize: "2.2rem", fontWeight: "900", color: "var(--primary)", lineHeight: "1" }}>
                                                {latestResume.atsScore}<span style={{ fontSize: "1rem", color: "var(--text-muted)" }}>/100</span>
                                            </div>
                                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>Overall Assessment</span>
                                        </div>
                                    </div>

                                    {latestResume.summary && (
                                        <p style={{ margin: "0 0 24px 0", fontSize: "0.9rem", fontStyle: "italic", color: "var(--text-main)", background: "var(--bg-primary)", padding: "16px", borderRadius: "10px", lineHeight: "1.5" }}>
                                            "{latestResume.summary}"
                                        </p>
                                    )}

                                    <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
                                        {[
                                            {label: 'Formatting & Layout', val: atsBreakdown.Formatting || 0},
                                            {label: 'Grammar & Tone', val: atsBreakdown.Grammar || 0},
                                            {label: 'Projects & Experience', val: atsBreakdown.Projects || 0},
                                            {label: 'Skills Match Rate', val: atsBreakdown.Skills || 0},
                                            {label: 'Achievements & Impact', val: atsBreakdown.Achievements || 0},
                                            {label: 'Keywords Coverage', val: atsBreakdown.Keywords || 0},
                                        ].map((score, idx) => {
                                            const rawVal = Math.round(score.val);
                                            let val = rawVal;
                                            if (val > 0 && val <= 10) {
                                                val = val * 10;
                                            }
                                            let barColor = "var(--success)";
                                            if (val < 60) {
                                                barColor = "var(--error)";
                                            } else if (val < 80) {
                                                barColor = "var(--warning)";
                                            }
                                            
                                            return (
                                                <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.82rem", fontWeight: "600" }}>
                                                        <span style={{ color: "var(--text-main)" }}>{score.label}</span>
                                                        <span style={{ color: barColor, fontWeight: "700" }}>{val}%</span>
                                                    </div>
                                                    <div style={{ height: "6px", width: "100%", background: "var(--divider)", borderRadius: "999px", overflow: "hidden" }}>
                                                        <div style={{
                                                            height: "100%",
                                                            width: `${val}%`,
                                                            background: barColor,
                                                            borderRadius: "999px",
                                                            transition: "width 1s ease-out"
                                                        }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Strengths and Weaknesses Card */}
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px" }}>
                                    
                                    <div className="glass-card" style={{ padding: "20px", borderRadius: "16px", border: "1px solid var(--card-border)" }}>
                                        <h4 style={{ margin: "0 0 12px 0", color: "var(--success)", fontSize: "0.9rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                                            ✓ Strengths
                                        </h4>
                                        <ul style={{ display: "flex", flexDirection: "column", gap: "8px", padding: 0, margin: 0, listStyle: "none" }}>
                                            {strengths.map((s, i) => (
                                                <li key={i} style={{ background: "rgba(16, 185, 129, 0.06)", border: "1px solid rgba(16, 185, 129, 0.15)", padding: "10px 12px", borderRadius: "8px", fontSize: "0.8rem", color: "var(--text-main)", lineHeight: "1.4" }}>
                                                    {s}
                                                </li>
                                            ))}
                                            {strengths.length === 0 && <li style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>No specific strengths indexed.</li>}
                                        </ul>
                                    </div>

                                    <div className="glass-card" style={{ padding: "20px", borderRadius: "16px", border: "1px solid var(--card-border)" }}>
                                        <h4 style={{ margin: "0 0 12px 0", color: "var(--error)", fontSize: "0.9rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                                            ✗ Weaknesses
                                        </h4>
                                        <ul style={{ display: "flex", flexDirection: "column", gap: "8px", padding: 0, margin: 0, listStyle: "none" }}>
                                            {weaknesses.map((s, i) => (
                                                <li key={i} style={{ background: "rgba(239, 68, 68, 0.06)", border: "1px solid rgba(239, 68, 68, 0.15)", padding: "10px 12px", borderRadius: "8px", fontSize: "0.8rem", color: "var(--text-main)", lineHeight: "1.4" }}>
                                                    {s}
                                                </li>
                                            ))}
                                            {weaknesses.length === 0 && <li style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>No specific gaps identified.</li>}
                                        </ul>
                                    </div>

                                </div>

                                {/* Improvement Suggestions */}
                                <div className="glass-card" style={{ padding: "24px", borderRadius: "16px", border: "1px solid var(--card-border)" }}>
                                    <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: "700", color: "var(--text-main)" }}>
                                        💡 AI Feedback & Action Items
                                    </h3>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                        {improvementSuggestions.map((s, i) => (
                                            <div key={i} style={{
                                                display: "flex",
                                                gap: "12px",
                                                alignItems: "flex-start",
                                                background: "rgba(99, 102, 241, 0.05)",
                                                border: "1px solid rgba(99, 102, 241, 0.15)",
                                                padding: "16px",
                                                borderRadius: "12px"
                                            }}>
                                                <span style={{ fontSize: "1rem" }}>💡</span>
                                                <p style={{ margin: 0, color: "var(--text-main)", fontSize: "0.82rem", lineHeight: "1.5" }}>{s}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>

                            {/* Right Column (Skills & History) */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                
                                {/* Skills Found */}
                                <div className="glass-card" style={{ padding: "20px", borderRadius: "16px", border: "1px solid var(--card-border)" }}>
                                    <h3 style={{ margin: "0 0 12px 0", fontSize: "0.95rem", fontWeight: "700", color: "var(--text-main)" }}>
                                        Skills Detected
                                    </h3>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                        {skillsFound.map((s, i) => (
                                            <span key={i} style={{
                                                padding: "4px 10px",
                                                background: "var(--nav-hover-bg)",
                                                color: "var(--text-main)",
                                                fontSize: "0.75rem",
                                                borderRadius: "20px",
                                                border: "1px solid var(--card-border)",
                                                fontWeight: "600"
                                            }}>{s}</span>
                                        ))}
                                        {skillsFound.length === 0 && <span style={{ fontStyle: "italic", fontSize: "0.8rem", color: "var(--text-muted)" }}>None parsed.</span>}
                                    </div>
                                </div>

                                {/* Recommended Skills */}
                                <div className="glass-card" style={{ padding: "20px", borderRadius: "16px", border: "1px solid var(--card-border)" }}>
                                    <h3 style={{ margin: "0 0 12px 0", fontSize: "0.95rem", fontWeight: "700", color: "var(--text-main)" }}>
                                        Recommended Skills
                                    </h3>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                        {recommendedSkills.map((s, i) => (
                                            <span key={i} style={{
                                                padding: "4px 10px",
                                                background: "rgba(245, 158, 11, 0.08)",
                                                color: "var(--warning)",
                                                fontSize: "0.75rem",
                                                borderRadius: "20px",
                                                border: "1px solid rgba(245, 158, 11, 0.2)",
                                                fontWeight: "600"
                                            }}>{s}</span>
                                        ))}
                                        {recommendedSkills.length === 0 && <span style={{ fontStyle: "italic", fontSize: "0.8rem", color: "var(--text-muted)" }}>None recommended.</span>}
                                    </div>
                                </div>

                                {/* History Logs */}
                                <div className="glass-card" style={{ padding: "20px", borderRadius: "16px", border: "1px solid var(--card-border)" }}>
                                    <h3 style={{ margin: "0 0 12px 0", fontSize: "0.95rem", fontWeight: "700", color: "var(--text-main)" }}>
                                        Resume History
                                    </h3>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "250px", overflowY: "auto" }} className="custom-scrollbar">
                                        {resumes.map(r => (
                                            <div key={r.id} style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                padding: "10px 12px",
                                                background: "var(--nav-hover-bg)",
                                                borderRadius: "10px",
                                                border: "1px solid var(--card-border)"
                                            }}>
                                                <div style={{ overflow: "hidden" }}>
                                                    <p style={{ margin: 0, fontWeight: "600", fontSize: "0.8rem", color: "var(--text-main)", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.fileName}>
                                                        {r.fileName}
                                                    </p>
                                                    <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                                                        {new Date(r.uploadedDate).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div style={{ display: "flex", gap: "6px" }}>
                                                    <button 
                                                        onClick={() => handleDownload(r.id, r.fileName)} 
                                                        style={{ background: "rgba(99, 102, 241, 0.12)", color: "var(--primary)", border: "none", borderRadius: "6px", width: "26px", height: "26px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                                        title="Download"
                                                    >
                                                        ↓
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(r.id)} 
                                                        style={{ background: "rgba(239, 68, 68, 0.12)", color: "var(--error)", border: "none", borderRadius: "6px", width: "26px", height: "26px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                                        title="Delete"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>

                        </div>
                    ) : (
                        <div className="glass-card" style={{
                            textAlign: "center",
                            padding: "48px 24px",
                            borderRadius: "16px",
                            border: "1px dashed var(--card-border)",
                            color: "var(--text-muted)"
                        }}>
                            📤 No resumes analyzed yet. Upload your first PDF resume above to run ATS scoring!
                        </div>
                    )}
                </>
            )}

            {activeTab === 'matcher' && (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    
                    {/* Available Job Roles Card */}
                    <div className="glass-card" style={{ padding: "24px", borderRadius: "16px", border: "1px solid var(--card-border)" }}>
                        <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: "700", color: "var(--text-main)" }}>
                            💼 Available Placement Job Openings
                        </h3>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                            {jobs.map(job => (
                                <div key={job.id} style={{
                                    background: "var(--nav-hover-bg)",
                                    border: "1px solid var(--card-border)",
                                    padding: "20px",
                                    borderRadius: "12px",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    gap: "12px"
                                }}>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "700", color: "var(--success)" }}>{job.title}</h4>
                                        <p style={{ margin: "2px 0 8px 0", fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: "600" }}>{job.companyName}</p>
                                        <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-main)", lineHeight: "1.4", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                            {job.descriptionText}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => handleMatchJob(job.id)}
                                        disabled={matchingJobId === job.id}
                                        style={{
                                            width: "100%",
                                            padding: "8px",
                                            background: "rgba(16, 185, 129, 0.12)",
                                            border: "1px solid rgba(16, 185, 129, 0.25)",
                                            color: "#34d399",
                                            borderRadius: "8px",
                                            fontWeight: "700",
                                            fontSize: "0.8rem",
                                            cursor: "pointer",
                                            transition: "all 0.2s"
                                        }}
                                    >
                                        {matchingJobId === job.id ? 'Analyzing match...' : 'Match My Resume'}
                                    </button>
                                </div>
                            ))}
                            {jobs.length === 0 && (
                                <p style={{ textAlign: "center", gridColumn: "span 3", color: "var(--text-muted)", padding: "24px" }}>
                                    No placement drives open right now.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Match Result Overlay/Card */}
                    {matchResult && (
                        <div className="glass-card" style={{
                            padding: "24px",
                            borderRadius: "16px",
                            border: "1px solid rgba(16, 185, 129, 0.3)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "24px",
                            animation: "fadeIn 0.3s ease-out"
                        }}>
                            <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "800", color: "var(--text-main)" }}>🎯 Resume Match Report</h3>
                            
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", alignItems: "center" }}>
                                
                                {/* Radial Score Meter */}
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)", padding: "20px", borderRadius: "16px", border: "1px solid var(--card-border)" }}>
                                    <div style={{ position: "relative", width: "120px", height: "120px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <svg style={{ position: "absolute", width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                                            <circle cx="60" cy="60" r="50" fill="none" stroke="var(--card-border)" strokeWidth="8" />
                                            <circle 
                                                cx="60" cy="60" r="50" 
                                                fill="none" 
                                                stroke={matchResult.matchScore >= 80 ? 'var(--success)' : matchResult.matchScore >= 50 ? 'var(--warning)' : 'var(--error)'} 
                                                strokeWidth="8" 
                                                strokeDasharray={2 * Math.PI * 50} 
                                                strokeDashoffset={2 * Math.PI * 50 - (matchResult.matchScore / 100) * (2 * Math.PI * 50)} 
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div style={{ zIndex: 10 }}>
                                            <span style={{ fontSize: "1.85rem", fontWeight: "900", color: "var(--text-main)" }}>{matchResult.matchScore}%</span>
                                        </div>
                                    </div>
                                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "700", marginTop: "12px", textTransform: "uppercase" }}>Matching Matrix Rate</span>
                                </div>

                                {/* Skills Alignment Grid */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "16px", gridColumn: "span 2" }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                        <div>
                                            <h4 style={{ margin: "0 0 8px 0", color: "var(--success)", fontSize: "0.85rem", fontWeight: "700" }}>✓ Matched Skills</h4>
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                                {matchResult.matchedSkills.map((s, i) => (
                                                    <span key={i} style={{ padding: "4px 8px", background: "rgba(16, 185, 129, 0.08)", color: "#34d399", fontSize: "0.72rem", borderRadius: "20px", border: "1px solid rgba(16, 185, 129, 0.2)", fontWeight: "600" }}>{s}</span>
                                                ))}
                                                {matchResult.matchedSkills.length === 0 && <span style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: "0.8rem" }}>None found</span>}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 style={{ margin: "0 0 8px 0", color: "var(--error)", fontSize: "0.85rem", fontWeight: "700" }}>✗ Missing Skills</h4>
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                                {matchResult.missingSkills.map((s, i) => (
                                                    <span key={i} style={{ padding: "4px 8px", background: "rgba(239, 68, 68, 0.08)", color: "#f87171", fontSize: "0.72rem", borderRadius: "20px", border: "1px solid rgba(239, 68, 68, 0.2)", fontWeight: "600" }}>{s}</span>
                                                ))}
                                                {matchResult.missingSkills.length === 0 && <span style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: "0.8rem" }}>None missing</span>}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div style={{ paddingTop: "16px", borderTop: "1px solid var(--card-border)" }}>
                                        <h4 style={{ margin: "0 0 8px 0", color: "var(--warning)", fontSize: "0.85rem", fontWeight: "700" }}>💡 Skill Gaps & Alignment Suggestions</h4>
                                        <ul style={{ display: "flex", flexDirection: "column", gap: "6px", padding: 0, margin: 0, listStyle: "none" }}>
                                            {matchResult.suggestions.map((s, i) => (
                                                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "10px 12px", background: "var(--bg-primary)", border: "1px solid var(--card-border)", borderRadius: "8px", fontSize: "0.8rem", color: "var(--text-main)", lineHeight: "1.4" }}>
                                                    <span style={{ color: "var(--warning)" }}>⚡</span>
                                                    <span>{s}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ResumeManagement;
