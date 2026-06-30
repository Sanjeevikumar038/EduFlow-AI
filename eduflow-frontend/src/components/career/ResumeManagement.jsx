import React, { useState, useEffect } from 'react';

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
        const res = await fetch('http://localhost:8080/api/resume/my', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            setResumes(await res.json());
        }
    };

    const fetchJobs = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8080/api/resume/jobs', {
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
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('http://localhost:8080/api/resume/upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        if (res.ok) {
            setFile(null);
            fetchResumes();
        } else {
            alert("Failed to analyze resume. Please check the backend logs.");
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:8080/api/resume/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchResumes();
    };

    const handleDownload = async (id, fileName) => {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:8080/api/resume/download/${id}`, {
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
        const res = await fetch(`http://localhost:8080/api/resume/match/${jobId}`, {
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
            return JSON.parse(str);
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
        try { atsBreakdown = JSON.parse(latestResume.atsBreakdown || '{}'); } catch {}
        strengths = parseJSON(latestResume.strengths);
        weaknesses = parseJSON(latestResume.weaknesses);
        skillsFound = parseJSON(latestResume.skillsFound);
        recommendedSkills = parseJSON(latestResume.recommendedSkills);
        improvementSuggestions = parseJSON(latestResume.improvementSuggestions);
    }



    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header with Tabs */}
            <div className="glass-card p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-bold text-white">Career Profile</h2>
                <div className="flex bg-white/5 p-1 rounded-xl">
                    <button 
                        onClick={() => setActiveTab('analysis')}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === 'analysis' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        Resume Analysis
                    </button>
                    <button 
                        onClick={() => setActiveTab('matcher')}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === 'matcher' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        Job Matcher
                    </button>
                </div>
            </div>

            {activeTab === 'analysis' && (
                <>
                    <div className="glass-card p-6 rounded-2xl">
                        <h3 className="text-xl font-semibold mb-4 text-white">Upload New Resume</h3>
                        <form onSubmit={handleUpload} className="flex gap-4 items-center">
                            <input 
                                type="file" 
                                accept=".pdf"
                                onChange={(e) => setFile(e.target.files[0])}
                                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/20 file:text-blue-300 hover:file:bg-blue-500/30 text-slate-300"
                            />
                            <button 
                                type="submit" 
                                disabled={!file || loading}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-full transition-all"
                            >
                                {loading ? 'Analyzing with AI...' : 'Upload & Analyze'}
                            </button>
                        </form>
                    </div>

                    {latestResume && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="glass-card p-6 rounded-2xl">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h3 className="text-2xl font-bold text-white">ATS Analysis</h3>
                                            <p className="text-slate-400 text-sm">Powered by Groq AI</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-4xl font-black text-blue-400">{latestResume.atsScore}<span className="text-xl text-slate-500">/100</span></div>
                                            <div className="text-sm text-slate-400">Overall ATS Score</div>
                                        </div>
                                    </div>
                                    
                                    <p className="text-slate-300 mb-6 italic">"{latestResume.summary}"</p>

                                    <div className="bg-black/20 p-6 rounded-2xl mb-8 font-mono text-slate-300 border border-white/5">
                                        <pre className="whitespace-pre-wrap leading-[2.5]">
                                            {[
                                                {label: 'Formatting', val: atsBreakdown.Formatting || 0},
                                                {label: 'Grammar', val: atsBreakdown.Grammar || 0},
                                                {label: 'Projects', val: atsBreakdown.Projects || 0},
                                                {label: 'Skills', val: atsBreakdown.Skills || 0},
                                                {label: 'Impact', val: atsBreakdown.Achievements || 0},
                                                {label: 'Keywords', val: atsBreakdown.Keywords || 0},
                                            ].map(score => {
                                                const filledBlocks = Math.round(score.val / 10);
                                                const emptyBlocks = 10 - filledBlocks;
                                                const bar = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
                                                return `${score.label.padEnd(20)} ${bar} ${score.val}%`;
                                            }).join('\n\n')}
                                        </pre>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="text-emerald-400 font-medium mb-3 flex items-center gap-2">✓ Strengths</h4>
                                            <ul className="space-y-2 text-slate-300 text-sm">
                                                {strengths.map((s, i) => <li key={i} className="bg-emerald-500/10 px-3 py-2 rounded-lg">{s}</li>)}
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="text-red-400 font-medium mb-3 flex items-center gap-2">✗ Weaknesses</h4>
                                            <ul className="space-y-2 text-slate-300 text-sm">
                                                {weaknesses.map((s, i) => <li key={i} className="bg-red-500/10 px-3 py-2 rounded-lg">{s}</li>)}
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass-card p-6 rounded-2xl">
                                    <h3 className="text-xl font-semibold mb-4 text-white">AI Suggestions</h3>
                                    <div className="space-y-3">
                                        {improvementSuggestions.map((s, i) => (
                                            <div key={i} className="flex gap-3 items-start bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                                                <span className="text-blue-400">💡</span>
                                                <p className="text-slate-200 text-sm">{s}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="glass-card p-6 rounded-2xl">
                                    <h3 className="text-lg font-semibold mb-4 text-white">Skills Detected</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {skillsFound.map((s, i) => (
                                            <span key={i} className="px-3 py-1 bg-white/10 text-slate-300 text-sm rounded-full border border-white/5">{s}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="glass-card p-6 rounded-2xl">
                                    <h3 className="text-lg font-semibold mb-4 text-white">Recommended Skills</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {recommendedSkills.map((s, i) => (
                                            <span key={i} className="px-3 py-1 bg-amber-500/10 text-amber-300 text-sm rounded-full border border-amber-500/20">{s}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="glass-card p-6 rounded-2xl">
                                    <h3 className="text-lg font-semibold mb-4 text-white">Resume History</h3>
                                    <div className="space-y-3 overflow-y-auto max-h-64 pr-2">
                                        {resumes.map(r => (
                                            <div key={r.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                                                <div>
                                                    <p className="text-slate-200 font-medium text-sm truncate w-32" title={r.fileName}>{r.fileName}</p>
                                                    <p className="text-slate-400 text-xs">{new Date(r.uploadedDate).toLocaleDateString()}</p>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button onClick={() => handleDownload(r.id, r.fileName)} className="p-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/40">
                                                        ↓
                                                    </button>
                                                    <button onClick={() => handleDelete(r.id)} className="p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/40">
                                                        ×
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {activeTab === 'matcher' && (
                <div className="space-y-6">
                    <div className="glass-card p-6 rounded-2xl">
                        <h3 className="text-xl font-bold text-white mb-4">Available Job Roles</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {jobs.map(job => (
                                <div key={job.id} className="bg-white/5 border border-white/10 p-5 rounded-xl flex flex-col justify-between">
                                    <div>
                                        <h4 className="text-lg font-bold text-emerald-400">{job.title}</h4>
                                        <p className="text-slate-400 text-sm mb-4">{job.companyName}</p>
                                        <p className="text-slate-300 text-sm line-clamp-3 mb-6">{job.descriptionText}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleMatchJob(job.id)}
                                        disabled={matchingJobId === job.id}
                                        className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 rounded-lg font-medium transition-colors border border-emerald-500/30"
                                    >
                                        {matchingJobId === job.id ? 'Analyzing match...' : 'Match My Resume'}
                                    </button>
                                </div>
                            ))}
                            {jobs.length === 0 && (
                                <p className="text-slate-400 col-span-3 text-center py-8">No jobs available right now.</p>
                            )}
                        </div>
                    </div>

                    {matchResult && (
                        <div className="glass-card p-8 rounded-2xl border border-emerald-500/30 animate-fade-in relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                            
                            <h3 className="text-2xl font-bold text-white mb-8 relative z-10">Match Result</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                                <div className="col-span-1 flex flex-col items-center justify-center bg-white/5 p-6 rounded-2xl border border-white/5">
                                    <div className="relative w-32 h-32 flex items-center justify-center">
                                        <svg className="absolute w-full h-full transform -rotate-90">
                                            <circle cx="64" cy="64" r="56" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
                                            <circle 
                                                cx="64" cy="64" r="56" 
                                                fill="none" 
                                                stroke={matchResult.matchScore >= 80 ? '#10b981' : matchResult.matchScore >= 50 ? '#f59e0b' : '#ef4444'} 
                                                strokeWidth="12" 
                                                strokeDasharray={2 * Math.PI * 56} 
                                                strokeDashoffset={2 * Math.PI * 56 - (matchResult.matchScore / 100) * (2 * Math.PI * 56)} 
                                                strokeLinecap="round" 
                                                className="transition-all duration-1000 ease-out" 
                                            />
                                        </svg>
                                        <div className="text-center z-10">
                                            <div className="text-3xl font-black text-white">{matchResult.matchScore}%</div>
                                        </div>
                                    </div>
                                    <div className="mt-4 text-center text-slate-400 font-medium">Match Score</div>
                                </div>

                                <div className="col-span-2 space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="text-emerald-400 font-medium mb-3 flex items-center gap-2">✓ Matched Skills</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {matchResult.matchedSkills.map((s, i) => (
                                                    <span key={i} className="px-3 py-1 bg-emerald-500/10 text-emerald-300 text-sm rounded-full border border-emerald-500/20">{s}</span>
                                                ))}
                                                {matchResult.matchedSkills.length === 0 && <span className="text-slate-500 italic text-sm">None detected</span>}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-red-400 font-medium mb-3 flex items-center gap-2">✗ Missing Skills</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {matchResult.missingSkills.map((s, i) => (
                                                    <span key={i} className="px-3 py-1 bg-red-500/10 text-red-300 text-sm rounded-full border border-red-500/20">{s}</span>
                                                ))}
                                                {matchResult.missingSkills.length === 0 && <span className="text-slate-500 italic text-sm">None missing</span>}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-4 border-t border-white/10">
                                        <h4 className="text-amber-400 font-medium mb-3 flex items-center gap-2">💡 AI Suggestions to Improve Match</h4>
                                        <ul className="space-y-2">
                                            {matchResult.suggestions.map((s, i) => (
                                                <li key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl text-slate-300 text-sm border border-white/5">
                                                    <span className="text-amber-500 shrink-0">⚡</span>
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
