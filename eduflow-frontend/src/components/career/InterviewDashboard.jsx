import React, { useState, useEffect } from 'react';
import speechRecognitionService from '../../services/SpeechRecognitionService';

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
    const [expandedQuestion, setExpandedQuestion] = useState(null);

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

        return () => clearInterval(timerIntervalId);
    }, []);

    const fetchDomains = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8080/api/interview/domains', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setDomains(await res.json());
    };

    const fetchHistory = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8080/api/interview/history', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setHistory(await res.json());
    };

    const startInterview = async () => {
        if (!selectedDomain) return alert("Select a domain first!");
        
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8080/api/interview/attempt/start', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ domainId: selectedDomain })
        });
        
        if (res.ok) {
            const data = await res.json();
            setAttempt(data);
            setCurrentQuestionIndex(0);
            setViewState('INTERVIEW');
            resetForNextQuestion();
        }
    };

    const resetForNextQuestion = () => {
        setLiveTranscript('');
        setIsRecording(false);
        speechRecognitionService.stopRecording();
        setTimeLeft(60);
        if (timerIntervalId) clearInterval(timerIntervalId);
        
        const id = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(id);
                    submitResponse();
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

    const submitResponse = async () => {
        if (timerIntervalId) clearInterval(timerIntervalId);
        if (isRecording) {
            speechRecognitionService.stopRecording();
            setIsRecording(false);
        }
        
        const finalTranscript = speechRecognitionService.getTranscript() || liveTranscript || "No answer provided.";
        setLoading(true);

        const currentQuestion = attempt.responses[currentQuestionIndex];
        const token = localStorage.getItem('token');
        
        const res = await fetch(`http://localhost:8080/api/interview/attempt/${attempt.id}/response`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                questionId: currentQuestion.questionId,
                questionNumber: currentQuestionIndex + 1,
                transcript: finalTranscript
            })
        });

        if (res.ok) {
            const updatedResponse = await res.json();
            const updatedAttempt = {...attempt};
            updatedAttempt.responses[currentQuestionIndex] = updatedResponse;
            setAttempt(updatedAttempt);
            
            if (currentQuestionIndex < 4) {
                setCurrentQuestionIndex(prev => prev + 1);
                resetForNextQuestion();
            } else {
                completeInterview();
            }
        }
        setLoading(false);
    };

    const completeInterview = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:8080/api/interview/attempt/${attempt.id}/complete`, {
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
        <div className="space-y-6 animate-fade-in">
            <div className="glass-card p-8 rounded-3xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h2 className="text-3xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">Premium AI Mock Interview</h2>
                        <p className="text-slate-400 mt-2 text-lg">Select a domain to start a timed, 5-question mock interview.</p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <select 
                            value={selectedDomain} 
                            onChange={(e) => setSelectedDomain(e.target.value)}
                            className="bg-black/40 text-white rounded-xl p-3 border border-white/10 flex-1 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        >
                            <option value="">Select Domain</option>
                            {domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                        <button 
                            onClick={startInterview}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:scale-105"
                        >
                            Start Session
                        </button>
                    </div>
                </div>
            </div>

            <div className="glass-card p-8 rounded-3xl">
                <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Attempt History
                </h3>
                <div className="space-y-4">
                    {history.map(a => (
                        <div key={a.id} className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-white/20 transition-all group hover:bg-white/10 cursor-pointer" onClick={() => {setAttempt(a); setViewState('RESULT');}}>
                            <div>
                                <div className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{a.domainName}</div>
                                <div className="text-sm text-slate-400">{new Date(a.startedAt).toLocaleString()}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">{a.overallScore}%</div>
                                <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">Overall</div>
                            </div>
                        </div>
                    ))}
                    {history.length === 0 && <p className="text-slate-500 text-center py-8">No interview history yet. Take your first attempt!</p>}
                </div>
            </div>
        </div>
    );

    // INTERVIEW VIEW
    if (viewState === 'INTERVIEW') {
        const currentQ = attempt.responses[currentQuestionIndex];
        return (
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pt-8">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex gap-2">
                        {[0,1,2,3,4].map(i => (
                            <div key={i} className={`h-2 w-12 rounded-full transition-all duration-500 ${i === currentQuestionIndex ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : i < currentQuestionIndex ? 'bg-emerald-500' : 'bg-white/10'}`}></div>
                        ))}
                    </div>
                    <div className="text-slate-400 font-medium">Question {currentQuestionIndex + 1} of 5</div>
                </div>

                <div className="glass-card p-10 rounded-[2rem] border border-white/10 relative overflow-hidden shadow-2xl shadow-blue-900/20">
                    <div className="absolute top-0 right-0 p-8">
                        <div className={`text-4xl font-black tabular-nums transition-colors ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}>
                            00:{timeLeft.toString().padStart(2, '0')}
                        </div>
                    </div>
                    
                    <div className="pr-32 mb-10">
                        <h3 className="text-sm text-blue-400 font-bold tracking-widest uppercase mb-4">{attempt.domainName}</h3>
                        <h2 className="text-3xl font-medium text-white leading-relaxed">{currentQ.questionText}</h2>
                    </div>

                    <div className="bg-black/30 p-6 rounded-2xl min-h-[200px] text-slate-300 font-mono text-base border border-white/5 relative group">
                        {loading ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-2xl">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    <div className="text-blue-400 font-bold animate-pulse">Groq AI is evaluating...</div>
                                </div>
                            </div>
                        ) : (
                            liveTranscript || <span className="text-slate-600">Listening to your answer... Speak clearly.</span>
                        )}
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button 
                            onClick={submitResponse}
                            disabled={loading}
                            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] flex items-center gap-2"
                        >
                            {currentQuestionIndex === 4 ? 'Complete Interview' : 'Submit & Next'}
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // RESULT VIEW
    let aiSummary = null;
    try {
        if (attempt.aiSummary) aiSummary = JSON.parse(attempt.aiSummary);
    } catch (e) {
        console.error("Failed to parse aiSummary", e);
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <button onClick={() => {setViewState('DASHBOARD'); fetchHistory();}} className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors mb-6">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back to Dashboard
            </button>

            {/* Header: AI Summary Key Stats */}
            {aiSummary && (
                <div className="glass-card p-8 rounded-3xl relative overflow-hidden border border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.1)] mb-6">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <svg width="150" height="150" viewBox="0 0 24 24" fill="currentColor" className="text-blue-500">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                        </svg>
                    </div>
                    <div className="flex flex-col md:flex-row items-center justify-around relative z-10 gap-8 text-center md:text-left">
                        <div className="flex flex-col items-center">
                            <div className="relative w-32 h-32 flex items-center justify-center">
                                <svg className="absolute w-full h-full transform -rotate-90">
                                    <circle cx="64" cy="64" r="56" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                                    <circle cx="64" cy="64" r="56" fill="none" stroke={attempt.overallScore >= 80 ? "#10b981" : attempt.overallScore >= 60 ? "#f59e0b" : "#ef4444"} strokeWidth="8" strokeDasharray={2 * Math.PI * 56} strokeDashoffset={2 * Math.PI * 56 - (attempt.overallScore / 100) * (2 * Math.PI * 56)} strokeLinecap="round" />
                                </svg>
                                <div className="text-center z-10 absolute inset-0 flex items-center justify-center">
                                    <div className="text-3xl font-black text-white">{attempt.overallScore}%</div>
                                </div>
                            </div>
                            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-3">Overall Score</div>
                        </div>

                        <div>
                            <h4 className="text-slate-400 font-bold text-sm uppercase tracking-wider mb-2">Hiring Status</h4>
                            <div className={`text-3xl font-bold ${aiSummary.hiringRecommendation?.toLowerCase().includes('hire') ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {aiSummary.hiringRecommendation || "N/A"}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-slate-400 font-bold text-sm uppercase tracking-wider mb-2">Interview Rating</h4>
                            <div className="text-4xl text-amber-400 tracking-widest drop-shadow-md">{aiSummary.interviewRating || "N/A"}</div>
                        </div>
                        
                        <div>
                            <h4 className="text-slate-400 font-bold text-sm uppercase tracking-wider mb-2">Placement Readiness</h4>
                            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">{aiSummary.placementReadiness || "N/A"}</div>
                        </div>
                    </div>
                </div>
            )}

            <div className="glass-card p-8 rounded-3xl mb-6 font-mono text-slate-300">
                <pre className="whitespace-pre-wrap leading-[2.5]">
                    {[
                        {label: 'Communication', val: attempt.communicationScore},
                        {label: 'Technical', val: attempt.technicalScore},
                        {label: 'Confidence', val: attempt.confidenceScore},
                        {label: 'Grammar', val: attempt.grammarScore},
                        {label: 'Fluency', val: attempt.fluencyScore},
                        {label: 'Professionalism', val: attempt.professionalismScore},
                        {label: 'Completeness', val: attempt.completenessScore},
                    ].map(score => {
                        const filledBlocks = Math.round(score.val / 10);
                        const emptyBlocks = 10 - filledBlocks;
                        const bar = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
                        return `${score.label.padEnd(20)} ${bar} ${score.val}%`;
                    }).join('\n\n')}
                </pre>
            </div>

            {/* Strengths & Weaknesses */}
            {aiSummary && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <div className="glass-card p-8 rounded-3xl border-t-4 border-emerald-500/50">
                        <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2"><span className="text-xl">✓</span> Strengths</h3>
                        <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">{aiSummary.strongestArea}</div>
                    </div>
                    <div className="glass-card p-8 rounded-3xl border-t-4 border-red-500/50">
                        <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2"><span className="text-xl">✗</span> Weaknesses</h3>
                        <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">{aiSummary.weakestArea}</div>
                    </div>
                    <div className="glass-card p-8 rounded-3xl border-t-4 border-blue-500/50">
                        <h3 className="text-lg font-bold text-blue-400 mb-4">📚 Recommended Resources</h3>
                        <ul className="space-y-3">
                            {(aiSummary.recommendedLearningPath || []).map((path, i) => (
                                <li key={i} className="flex items-start gap-3 text-slate-300 bg-white/5 p-3 rounded-lg border border-white/5">
                                    <span className="text-blue-400 mt-0.5">•</span> {path}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

        </div>
    );
};

export default InterviewDashboard;
