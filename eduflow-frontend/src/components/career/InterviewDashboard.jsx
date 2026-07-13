import React, { useState, useEffect } from 'react';
import speechRecognitionService from '../../services/SpeechRecognitionService';
import API_BASE from '../../services/api';

const InterviewDashboard = () => {
    const [domains, setDomains] = useState([]);
    const [history, setHistory] = useState([]);
    const [selectedDomain, setSelectedDomain] = useState('');
    const [attempt, setAttempt] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    
    const [isRecording, setIsRecording] = useState(false);
    const [liveTranscript, setLiveTranscript] = useState('');
    const [loading, setLoading] = useState(false);
    
    // UI States
    const [viewState, setViewState] = useState('DASHBOARD'); // DASHBOARD, INTERVIEW, RESULT
    const [timerIntervalId, setTimerIntervalId] = useState(null);

    useEffect(() => {
        fetchDomains();
        fetchHistory();
        
        speechRecognitionService.setCallbacks(
            (transcript, isFinal) => setLiveTranscript(transcript),
            (error) => {
                console.error("Speech error", error);
                if (error === 'not_supported') alert("Your browser does not support Speech Recognition. Try Chrome.");
            }
        );

        return () => {
            if (timerIntervalId) clearInterval(timerIntervalId);
        };
    }, []);

    const fetchDomains = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/interview/domains`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setDomains(await res.json());
    };

    const fetchHistory = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/interview/history`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setHistory(await res.json());
    };

    const startInterview = async () => {
        if (!selectedDomain) return alert("Select a domain first!");
        
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/interview/attempt/start`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ domainId: selectedDomain })
        });
        
        if (res.ok) {
            const data = await res.json();
            setAttempt(data);
            setCurrentQuestionIndex(0);
            setViewState('INTERVIEW');
            resetForNextQuestion(data, 0);
        }
    };

    const resetForNextQuestion = (activeAttempt, qIndex) => {
        setLiveTranscript('');
        setIsRecording(false);
        speechRecognitionService.stopRecording();
        setTimeLeft(60);
        
        // Clear any previous interval first
        if (timerIntervalId) clearInterval(timerIntervalId);
        
        const id = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(id);
                    submitResponse(activeAttempt, qIndex);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        setTimerIntervalId(id);
        
        // Auto-start recording
        setTimeout(() => {
            speechRecognitionService.startRecording();
            setIsRecording(true);
        }, 500);
    };

    const submitResponse = async (activeAttempt = attempt, qIndex = currentQuestionIndex) => {
        if (timerIntervalId) clearInterval(timerIntervalId);
        if (isRecording) {
            speechRecognitionService.stopRecording();
            setIsRecording(false);
        }
        
        const finalTranscript = speechRecognitionService.getTranscript() || liveTranscript || "No answer provided.";
        setLoading(true);

        const currentQ = activeAttempt.responses[qIndex];
        const token = localStorage.getItem('token');
        
        const res = await fetch(`${API_BASE}/api/interview/attempt/${activeAttempt.id}/response`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                questionId: currentQ.questionId,
                questionNumber: qIndex + 1,
                transcript: finalTranscript
            })
        });

        if (res.ok) {
            const updatedResponse = await res.json();
            const updatedAttempt = {...activeAttempt};
            updatedAttempt.responses[qIndex] = updatedResponse;
            setAttempt(updatedAttempt);
            
            if (qIndex < 4) {
                const nextIdx = qIndex + 1;
                setCurrentQuestionIndex(nextIdx);
                resetForNextQuestion(updatedAttempt, nextIdx);
            } else {
                completeInterview(updatedAttempt);
            }
        }
        setLoading(false);
    };

    const completeInterview = async (activeAttempt = attempt) => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/interview/attempt/${activeAttempt.id}/complete`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
            const finalData = await res.json();
            setAttempt(finalData);
            setViewState('RESULT');
            fetchHistory();
        }
        setLoading(false);
    };

    // DASHBOARD VIEW
    if (viewState === 'DASHBOARD') return (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }} className="animate-fade-in pb-8">
            
            {/* Header info */}
            <div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
                🎙️ AI Mock Interview Prep
              </h2>
              <p style={{ color: "var(--text-muted)", marginTop: "8px", fontSize: "0.95rem" }}>
                Practice simulated placement interviews with real-time audio transcriptions and smart evaluation feedback.
              </p>
            </div>

            {/* Start session centered card */}
            <div className="glass-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px", textAlign: "center", borderRadius: "16px" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>🎙️</div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--text-main)", marginBottom: "8px" }}>Ready for your mock interview?</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", maxW: "500px", marginBottom: "24px" }}>
                    Select your domain below. You will be asked 5 sequential technical and behavioral questions, with 60 seconds to speak for each answer.
                </p>

                <div style={{ display: "flex", gap: "12px", width: "100%", maxWidth: "450px", flexWrap: "wrap", justifyContent: "center" }}>
                    <select 
                        value={selectedDomain} 
                        onChange={(e) => setSelectedDomain(e.target.value)}
                        style={{
                            padding: "0.65rem 1rem",
                            background: "var(--input-bg)",
                            border: "1px solid var(--input-border)",
                            borderRadius: "10px",
                            color: "var(--text-main)",
                            fontSize: "0.9rem",
                            outline: "none",
                            flex: "1 1 200px"
                        }}
                    >
                        <option value="">Choose Interview Domain...</option>
                        {domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    <button 
                        onClick={startInterview}
                        style={{
                            padding: "0.65rem 1.5rem",
                            background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
                            color: "#fff",
                            border: "none",
                            borderRadius: "10px",
                            fontWeight: "600",
                            fontSize: "0.9rem",
                            cursor: "pointer",
                            transition: "all 0.2s"
                        }}
                    >
                        Start Session
                    </button>
                </div>
            </div>

            {/* History logs card */}
            <div className="glass-card" style={{ padding: "24px", borderRadius: "16px" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-main)", borderBottom: "1px solid var(--card-border)", paddingBottom: "12px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>⏳</span> Session Logs & Evaluation History
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {history.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)", fontSize: "0.95rem" }}>
                            No interview attempts recorded yet. Launch your first mock session above!
                        </div>
                    ) : (
                        history.map(a => (
                            <div 
                                key={a.id} 
                                onClick={() => {setAttempt(a); setViewState('RESULT');}}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "16px 20px",
                                    borderRadius: "10px",
                                    border: "1px solid var(--card-border)",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease"
                                }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--nav-hover-bg)"}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                            >
                                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                    <span style={{ fontWeight: "700", color: "var(--text-main)", fontSize: "0.95rem" }}>{a.domainName}</span>
                                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{new Date(a.startedAt).toLocaleString()}</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                                    <span style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--primary)" }}>{a.overallScore}%</span>
                                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>SCORE</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );

    // INTERVIEW VIEW (ACTIVE TEST)
    if (viewState === 'INTERVIEW') {
        const currentQ = attempt.responses[currentQuestionIndex];
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "800px", margin: "0 auto" }} className="animate-fade-in pt-8 pb-8">
                
                {/* Visual Progress Steps */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                        {[0,1,2,3,4].map(i => (
                            <div 
                                key={i} 
                                style={{
                                    height: "8px", 
                                    width: "48px", 
                                    borderRadius: "999px",
                                    background: i === currentQuestionIndex ? 'var(--primary)' : i < currentQuestionIndex ? '#10b981' : 'var(--card-border)',
                                    transition: "all 0.4s ease"
                                }}
                            />
                        ))}
                    </div>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>Question {currentQuestionIndex + 1} of 5</span>
                </div>

                {/* Question panel card */}
                <div className="glass-card" style={{ padding: "32px", borderRadius: "20px", display: "flex", flexDirection: "column", gap: "24px", position: "relative" }}>
                    
                    {/* Floating Timer */}
                    <div style={{ position: "absolute", top: "24px", right: "24px" }}>
                        <span style={{
                            fontSize: "1.75rem", 
                            fontWeight: "800", 
                            fontFamily: "monospace", 
                            color: timeLeft <= 10 ? '#f43f5e' : 'var(--primary)'
                        }}>
                            00:{timeLeft.toString().padStart(2, '0')}
                        </span>
                    </div>

                    <div style={{ paddingRight: "80px" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--primary)", textTransform: "uppercase", letterSpacing: "1px" }}>{attempt.domainName}</span>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--text-main)", marginTop: "8px", lineHeight: "1.4" }}>
                            {currentQ.questionText}
                        </h2>
                    </div>

                    {/* Microphone listening transcript state */}
                    <div style={{
                        background: "rgba(10,15,30,0.4)",
                        border: "1px solid var(--card-border)",
                        padding: "20px",
                        borderRadius: "12px",
                        minHeight: "150px",
                        position: "relative",
                        fontFamily: "monospace",
                        fontSize: "0.9rem",
                        color: "var(--text-main)",
                        lineHeight: "1.5"
                    }}>
                        {loading ? (
                            <div style={{
                                position: "absolute",
                                inset: 0,
                                background: "rgba(0,0,0,0.7)",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "12px",
                                borderRadius: "12px"
                            }}>
                                <span style={{ fontSize: "1.5rem", animation: "spin 1s infinite linear" }}>🔄</span>
                                <span style={{ fontWeight: "700", color: "var(--primary)" }}>AI evaluating response...</span>
                            </div>
                        ) : (
                            liveTranscript || <span style={{ color: "var(--text-muted)" }}>🎙️ Listening... Speak clearly. Remaining seconds indicator dictates time before auto-submit.</span>
                        )}
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button
                            onClick={() => submitResponse(attempt, currentQuestionIndex)}
                            disabled={loading}
                            style={{
                                padding: "0.75rem 1.75rem",
                                background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
                                color: "#fff",
                                border: "none",
                                borderRadius: "10px",
                                fontWeight: "600",
                                fontSize: "0.95rem",
                                cursor: "pointer",
                                opacity: loading ? 0.5 : 1,
                                display: "flex",
                                alignItems: "center",
                                gap: "8px"
                            }}
                        >
                            {currentQuestionIndex === 4 ? 'Complete Interview 🏁' : 'Submit & Next ➔'}
                        </button>
                    </div>
                </div>

            </div>
        );
    }

    // RESULT / REVIEW VIEW
    let aiSummary = null;
    try {
        if (attempt.aiSummary) aiSummary = JSON.parse(attempt.aiSummary);
    } catch (e) {
        console.error("Failed to parse aiSummary", e);
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }} className="animate-fade-in pb-8">
            
            {/* Header action row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button 
                    onClick={() => {setViewState('DASHBOARD'); fetchHistory();}} 
                    style={{
                        padding: "0.5rem 1rem",
                        background: "transparent",
                        border: "1px solid var(--card-border)",
                        color: "var(--text-main)",
                        borderRadius: "8px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                    }}
                >
                    ⬅️ Back to Performance Hub
                </button>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "700" }}>{attempt.domainName} Evaluation</span>
            </div>

            {/* AI Summary Key Stats card */}
            {aiSummary && (
                <div className="glass-card" style={{ padding: "24px", borderRadius: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: "24px", textAlign: "center" }}>
                        
                        {/* Circle Score */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <div style={{ width: "100px", height: "100px", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <svg style={{ position: "absolute", width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                                    <circle cx="50" cy="50" r="42" fill="none" stroke="var(--card-border)" strokeWidth="6" />
                                    <circle cx="50" cy="50" r="42" fill="none" stroke="var(--primary)" strokeWidth="6" strokeDasharray={2 * Math.PI * 42} strokeDashoffset={2 * Math.PI * 42 - (attempt.overallScore / 100) * (2 * Math.PI * 42)} strokeLinecap="round" />
                                </svg>
                                <span style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>{attempt.overallScore}%</span>
                            </div>
                            <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", marginTop: "8px" }}>Overall Grade</span>
                        </div>

                        {/* Hiring Status */}
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                            <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "4px" }}>Hiring Status</span>
                            <span style={{ fontSize: "1.5rem", fontWeight: "800", color: aiSummary.hiringRecommendation?.toLowerCase().includes('hire') ? '#10b981' : '#fbbf24' }}>
                                {aiSummary.hiringRecommendation || "Evaluating"}
                            </span>
                        </div>

                        {/* Rating */}
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                            <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "4px" }}>Rating</span>
                            <span style={{ fontSize: "1.75rem", fontWeight: "800", color: "#fbbf24", letterSpacing: "1px" }}>
                                {aiSummary.interviewRating || "⭐⭐⭐⭐"}
                            </span>
                        </div>

                        {/* Placement readiness */}
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                            <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "4px" }}>Readiness Level</span>
                            <span style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--primary)" }}>
                                {aiSummary.placementReadiness || "Intermediate"}
                            </span>
                        </div>

                    </div>
                </div>
            )}

            {/* Score bars block card */}
            <div className="glass-card" style={{ padding: "24px", borderRadius: "16px" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Component Metrics</span>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
                    {[
                        {label: 'Communication', val: attempt.communicationScore},
                        {label: 'Technical Domain', val: attempt.technicalScore},
                        {label: 'Confidence level', val: attempt.confidenceScore},
                        {label: 'Grammar', val: attempt.grammarScore},
                        {label: 'Language Fluency', val: attempt.fluencyScore},
                        {label: 'Professionalism', val: attempt.professionalismScore},
                        {label: 'Answer Completeness', val: attempt.completenessScore},
                    ].map((metric, idx) => (
                        <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: "600", color: "var(--text-main)" }}>
                                <span>{metric.label}</span>
                                <span>{metric.val}%</span>
                            </div>
                            <div style={{ height: "6px", width: "100%", background: "var(--card-border)", borderRadius: "999px", overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${metric.val}%`, background: "var(--primary)", borderRadius: "999px", transition: "width 1s ease" }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Feedback panels: Strengths / Weaknesses / Recommendations */}
            {aiSummary && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", width: "100%" }}>
                    
                    {/* Strengths card */}
                    <div className="glass-card" style={{ padding: "24px", borderRadius: "16px", borderLeft: "4px solid #10b981" }}>
                        <h4 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#10b981", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                            <span>✓</span> Highlighted Strengths
                        </h4>
                        <p style={{ color: "var(--text-main)", fontSize: "0.85rem", lineHeight: "1.5" }}>{aiSummary.strongestArea}</p>
                    </div>

                    {/* Weaknesses card */}
                    <div className="glass-card" style={{ padding: "24px", borderRadius: "16px", borderLeft: "4px solid #f43f5e" }}>
                        <h4 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#f43f5e", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                            <span>✗</span> Areas for Improvement
                        </h4>
                        <p style={{ color: "var(--text-main)", fontSize: "0.85rem", lineHeight: "1.5" }}>{aiSummary.weakestArea}</p>
                    </div>

                    {/* Recommendations card */}
                    <div className="glass-card" style={{ padding: "24px", borderRadius: "16px", borderLeft: "4px solid var(--primary)" }}>
                        <h4 style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--primary)", marginBottom: "8px" }}>
                            📚 Recommended Action Items
                        </h4>
                        <ul style={{ paddingLeft: "16px", margin: 0, display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem", color: "var(--text-main)" }}>
                            {(aiSummary.recommendedLearningPath || []).map((path, i) => (
                                <li key={i}>{path}</li>
                            ))}
                            {(aiSummary.recommendedLearningPath || []).length === 0 && (
                                <li>Practice mock domain interview sessions sequentially to unlock resources.</li>
                            )}
                        </ul>
                    </div>

                </div>
            )}

        </div>
    );
};

export default InterviewDashboard;
