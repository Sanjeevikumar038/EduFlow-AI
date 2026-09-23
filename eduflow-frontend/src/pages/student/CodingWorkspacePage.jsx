import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE from '../../services/api';

const CodingWorkspacePage = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const studentName = localStorage.getItem('name') || 'SANJEEVIKUMAR D';
    const rollNumber = localStorage.getItem('registerNumber') || '727723EUCI045';
    const dept = localStorage.getItem('department') || 'M.Tech CSE';
    const resultsRef = useRef(null);
    const scrollContainerRef = useRef(null);

    // Timer state (starting at 60 minutes, checks localStorage for saved session time)
    const [timeLeft, setTimeLeft] = useState(() => {
        const saved = localStorage.getItem('coding_test_time_left');
        return saved ? parseInt(saved, 10) : 3600;
    });
    const [isPaused, setIsPaused] = useState(false);

    // Challenge and Coding state
    const [challenge, setChallenge] = useState(null);
    const [loading, setLoading] = useState(true);
    const [studentCode, setStudentCode] = useState('');
    const [studentLanguage, setStudentLanguage] = useState('python');
    const [customInput, setCustomInput] = useState('');
    const [useCustomInput, setUseCustomInput] = useState(false);

    // Detailed Execution/Terminal state
    const [execStatus, setExecStatus] = useState('NONE'); // NONE, RUNNING, DONE
    const [actionType, setActionType] = useState('NONE'); // NONE, RUN, SUBMIT
    const [testCaseResults, setTestCaseResults] = useState([]);
    const [passedCount, setPassedCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [compilerMessage, setCompilerMessage] = useState('Compilation successful');
    const [aiReviewFeedback, setAiReviewFeedback] = useState('');
    const [showTerminal, setShowTerminal] = useState(false);
    const [pasteWarning, setPasteWarning] = useState(null);

    const triggerPasteWarning = (msg = "Copying & Pasting is strictly disabled during coding assessments! Please write your code manually.") => {
        setPasteWarning(msg);
        setTimeout(() => setPasteWarning(null), 3500);
    };

    // Tab files mock
    const [activeTabFile, setActiveTabFile] = useState('main.py');

    // Restore cursor position right after indentation
    const handleTextareaKeyDown = (e) => {
        // Block Ctrl+V / Cmd+V / Shift+Insert paste shortcuts
        if (((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')) || (e.shiftKey && e.key === 'Insert')) {
            e.preventDefault();
            triggerPasteWarning();
            return;
        }

        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            const value = e.target.value;
            e.target.value = value.substring(0, start) + '    ' + value.substring(end);
            e.target.selectionStart = e.target.selectionEnd = start + 4;
            setStudentCode(e.target.value);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const textarea = e.target;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const value = textarea.value;
            
            // Find current line's leading indentation whitespace
            const lastNewLineIndex = value.lastIndexOf('\n', start - 1);
            const currentLine = value.substring(lastNewLineIndex + 1, start);
            const whitespaceMatch = currentLine.match(/^(\s*)/);
            let indent = whitespaceMatch ? whitespaceMatch[0] : '';
            
            // Auto-indent if the line ends with '{' or ':'
            const trimmedLine = currentLine.trim();
            if (trimmedLine.endsWith('{') || trimmedLine.endsWith(':')) {
                indent += '    ';
            }
            
            textarea.value = value.substring(0, start) + '\n' + indent + value.substring(end);
            setStudentCode(textarea.value);
            
            // Restore cursor position right after indentation
            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = start + 1 + indent.length;
            }, 0);
        }
    };

    // Smooth auto-scroll down to results when they load
    useEffect(() => {
        if (execStatus === "DONE" && showTerminal) {
            setTimeout(() => {
                if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTo({
                        top: scrollContainerRef.current.scrollHeight,
                        behavior: 'smooth'
                    });
                }
            }, 100);
        }
    }, [execStatus, showTerminal]);

    useEffect(() => {
        fetchTodayChallenge();
    }, []);

    // Timer effect - periodically auto-saves remaining seconds to localStorage
    useEffect(() => {
        if (isPaused) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    alert("Time is up! Your test will be auto-submitted.");
                    localStorage.removeItem('coding_test_time_left');
                    handleExitWorkspace();
                    return 0;
                }
                localStorage.setItem('coding_test_time_left', (prev - 1).toString());
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [isPaused]);

    const formatTimer = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const fetchTodayChallenge = async () => {
        setLoading(true);
        const dateStr = new Date().toISOString().split('T')[0];
        try {
            const res = await fetch(`${API_BASE}/api/coding/challenge?date=${dateStr}&department=${dept}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setChallenge(data);
                setStudentCode(data.boilerplatePython || "");
                setStudentLanguage("python");
                setActiveTabFile("main.py");
            }
        } catch (err) {
            console.error("Error fetching workspace challenge:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLanguageChange = (lang) => {
        setStudentLanguage(lang);
        if (!challenge) return;
        if (lang === "python") {
            setStudentCode(challenge.boilerplatePython || "");
            setActiveTabFile("main.py");
        } else if (lang === "java") {
            setStudentCode(challenge.boilerplateJava || "");
            setActiveTabFile("Solution.java");
        } else if (lang === "cpp") {
            setStudentCode(challenge.boilerplateCpp || "");
            setActiveTabFile("main.cpp");
        } else if (lang === "c") {
            setStudentCode(challenge.boilerplateC || "");
            setActiveTabFile("main.c");
        }
    };



    const handleRunCode = async () => {
        if (!challenge) return;
        setExecStatus("RUNNING");
        setActionType("RUN");
        setShowTerminal(true);
        setTestCaseResults([]);
        setPassedCount(0);
        setTotalCount(0);
        setAiReviewFeedback("");
        
        try {
            const res = await fetch(`${API_BASE}/api/coding/run`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    code: studentCode,
                    language: studentLanguage,
                    questionBankId: challenge.id,
                    customInput: useCustomInput ? customInput : null
                })
            });
            if (res.ok) {
                const tcResults = await res.json();
                console.log("Compile & Run testcase results:", tcResults);
                setTestCaseResults(tcResults);
                // Check if all testcases failed with the same compilation error
                const firstError = tcResults.length > 0 ? tcResults[0].error : null;
                const hasCompileError = firstError && tcResults.every(tc => tc.error === firstError);
                if (hasCompileError) {
                    setCompilerMessage(firstError);
                } else {
                    setCompilerMessage("Compilation successful");
                }
                
                let passed = 0;
                tcResults.forEach(tc => {
                    if (tc.passed) passed++;
                });
                setPassedCount(passed);
                setTotalCount(tcResults.length);
                setExecStatus("DONE");
            } else {
                const errorText = await res.text();
                setCompilerMessage(errorText || "Compilation/Execution failed.");
                setExecStatus("DONE");
            }
        } catch (err) {
            setCompilerMessage("Failed to connect to execution environment.");
            setExecStatus("DONE");
        }
    };

    const handleSubmitCode = async () => {
        if (!challenge) return;
        setExecStatus("RUNNING");
        setActionType("SUBMIT");
        setShowTerminal(true);
        setTestCaseResults([]);
        setPassedCount(0);
        setTotalCount(0);
        setAiReviewFeedback("");

        const dateStr = new Date().toISOString().split('T')[0];
        try {
            const res = await fetch(`${API_BASE}/api/coding/submit`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    date: dateStr,
                    code: studentCode,
                    language: studentLanguage,
                    department: dept,
                    simulatedDay: "",
                    simulatedTime: ""
                })
            });
            if (res.ok) {
                const data = await res.json();
                let tcResults = [];
                try {
                    tcResults = JSON.parse(data.testCaseResultsJson);
                } catch (e) {}

                setTestCaseResults(tcResults);
                // Check if all testcases failed with the same compilation error
                const firstError = tcResults.length > 0 ? tcResults[0].error : null;
                const hasCompileError = firstError && tcResults.every(tc => tc.error === firstError);
                if (hasCompileError) {
                    setCompilerMessage(firstError);
                } else {
                    setCompilerMessage("Compilation successful");
                }
                
                let passed = 0;
                tcResults.forEach(tc => {
                    if (tc.passed) passed++;
                });
                setPassedCount(passed);
                setTotalCount(tcResults.length);
                setAiReviewFeedback(data.aiFeedback || "");
                setExecStatus("DONE");
            } else {
                const errorText = await res.text();
                setCompilerMessage(errorText || "Submission execution failed.");
                setExecStatus("DONE");
            }
        } catch (err) {
            setCompilerMessage("Failed to submit solution code.");
            setExecStatus("DONE");
        }
    };

    const handlePauseTest = () => {
        const conf = window.confirm("Are you sure you want to pause your test and return to the dashboard? Your progress and remaining time will be saved.");
        if (conf) {
            localStorage.setItem('coding_test_time_left', timeLeft.toString());
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(err => console.log("Error exiting fullscreen:", err));
            }
            navigate('/student/coding');
        }
    };

    const handleExitWorkspace = () => {
        const conf = window.confirm("Are you sure you want to submit your code and close the test workspace?");
        if (conf) {
            localStorage.removeItem('coding_test_time_left');
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(err => console.log("Error exiting fullscreen:", err));
            }
            navigate('/student/coding');
        }
    };

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            width: "100vw",
            background: "#f8fafc",
            color: "#0f172a",
            fontFamily: "'Inter', system-ui, sans-serif",
            overflow: "hidden"
        }}>
            {/* Premium Header Bar */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#ffffff",
                padding: "12px 24px",
                borderBottom: "1px solid #e2e8f0",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
                zIndex: 10
            }}>
                {/* Left: Test details */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{
                        background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                        border: "1px solid #bfdbfe",
                        borderRadius: "8px",
                        padding: "6px 12px",
                        fontSize: "0.85rem",
                        fontWeight: "700",
                        color: "#1d4ed8",
                        boxShadow: "inset 0 2px 4px rgba(255,255,255,0.5)"
                    }}>
                        <i className="fa-solid fa-code" style={{ marginRight: "6px" }}></i>
                        daily_challenge_sprint
                    </div>
                    <div style={{
                        fontSize: "0.9rem",
                        color: "#64748b",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                    }}>
                        <span style={{ width: "4px", height: "4px", background: "#cbd5e1", borderRadius: "50%" }}></span>
                        Section 1/1 | Coding Assessment
                    </div>
                </div>

                {/* Center: Profile details */}
                <div style={{ 
                    display: "flex", 
                    alignItems: "center",
                    gap: "20px", 
                    fontSize: "0.9rem", 
                    color: "#475569", 
                    fontWeight: "500",
                    background: "#f8fafc",
                    padding: "6px 16px",
                    borderRadius: "999px",
                    border: "1px solid #e2e8f0"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <i className="fa-regular fa-user" style={{ color: "#94a3b8" }}></i>
                        <span style={{ color: "#0f172a", fontWeight: "700" }}>{studentName}</span>
                    </div>
                    <div style={{ width: "1px", height: "14px", background: "#cbd5e1" }}></div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <i className="fa-solid fa-hashtag" style={{ color: "#94a3b8" }}></i>
                        <span style={{ color: "#0f172a", fontWeight: "700" }}>{rollNumber}</span>
                    </div>
                </div>

                {/* Right: Controls & Timer */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        background: timeLeft <= 300 ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)",
                        border: `1px solid ${timeLeft <= 300 ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)"}`,
                        color: timeLeft <= 300 ? "#ef4444" : "#10b981",
                        padding: "6px 14px",
                        borderRadius: "8px",
                        fontWeight: "800",
                        fontSize: "1rem",
                        fontFamily: "monospace",
                        boxShadow: `0 0 10px ${timeLeft <= 300 ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)"}`
                    }}>
                        <i className="fa-regular fa-clock"></i> {formatTimer(timeLeft)}
                    </div>
                    <button 
                        onClick={handlePauseTest}
                        style={{
                            background: "#ffffff",
                            border: "1px solid #cbd5e1",
                            color: "#64748b",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "1rem",
                            transition: "all 0.2s",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#0f172a"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.color = "#64748b"; }}
                        title="Pause and Exit Test"
                    >
                        <i className="fa-solid fa-pause"></i>
                    </button>
                    <button 
                        onClick={handleExitWorkspace}
                        style={{
                            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                            color: "#fff",
                            border: "none",
                            padding: "8px 20px",
                            borderRadius: "8px",
                            fontWeight: "700",
                            cursor: "pointer",
                            fontSize: "0.9rem",
                            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
                            transition: "all 0.2s",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
                        onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                    >
                        Submit Test <i className="fa-solid fa-paper-plane"></i>
                    </button>
                </div>
            </div>

            {/* Split Main Content */}
            <div style={{
                display: "flex",
                flexDirection: "row",
                flex: 1,
                overflow: "hidden",
                width: "100vw"
            }}>
                
                {/* Left Panel: Question and instructions */}
                <div 
                    className="no-copy-zone"
                    onCopy={(e) => {
                        e.preventDefault();
                        triggerPasteWarning("Copying problem statements or test cases is strictly prohibited!");
                    }}
                    onCut={(e) => {
                        e.preventDefault();
                    }}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        triggerPasteWarning("Right-click context menu is disabled for question statements!");
                    }}
                    onDragStart={(e) => {
                        e.preventDefault();
                    }}
                    style={{
                        flex: "0 0 45%",
                        background: "#ffffff",
                        borderRight: "1px solid #e2e8f0",
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        overflow: "hidden",
                        userSelect: "none",
                        WebkitUserSelect: "none",
                        MozUserSelect: "none",
                        msUserSelect: "none",
                        position: "relative"
                    }}
                >
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "150px", background: "linear-gradient(180deg, rgba(248,250,252,1) 0%, rgba(255,255,255,0) 100%)", pointerEvents: "none" }}></div>
                    {/* Question Content container */}
                    <div style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        overflowY: "auto",
                        padding: "2.5rem 2.5rem",
                        userSelect: "none",
                        WebkitUserSelect: "none",
                        zIndex: 1
                    }}>
                        {/* Title bar */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{ 
                                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", 
                                    color: "#fff", 
                                    width: "36px", 
                                    height: "36px", 
                                    display: "flex", 
                                    alignItems: "center", 
                                    justifyContent: "center", 
                                    borderRadius: "10px", 
                                    fontSize: "1rem", 
                                    fontWeight: "800",
                                    boxShadow: "0 4px 10px rgba(37, 99, 235, 0.3)"
                                }}>
                                    Q1
                                </div>
                                <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#0f172a", margin: 0, letterSpacing: "-0.5px" }}>
                                    Question 1 of 1
                                </h2>
                            </div>
                            
                            {challenge && (
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <span style={{ 
                                        background: challenge.difficulty === "Easy" ? "#dcfce7" : challenge.difficulty === "Medium" ? "#fef3c7" : "#fee2e2",
                                        color: challenge.difficulty === "Easy" ? "#166534" : challenge.difficulty === "Medium" ? "#92400e" : "#991b1b",
                                        border: `1px solid ${challenge.difficulty === "Easy" ? "#bbf7d0" : challenge.difficulty === "Medium" ? "#fde68a" : "#fecaca"}`,
                                        padding: "4px 12px",
                                        borderRadius: "999px",
                                        fontSize: "0.75rem",
                                        fontWeight: "700"
                                    }}>
                                        {challenge.difficulty}
                                    </span>
                                    <span style={{ 
                                        background: "#f1f5f9",
                                        color: "#475569",
                                        border: "1px solid #e2e8f0",
                                        padding: "4px 12px",
                                        borderRadius: "999px",
                                        fontSize: "0.75rem",
                                        fontWeight: "700"
                                    }}>
                                        {challenge.category || "Algorithms"}
                                    </span>
                                </div>
                            )}
                        </div>

                        {loading ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#64748b", fontWeight: "600", padding: "2rem 0" }}>
                                <i className="fa-solid fa-circle-notch fa-spin text-xl"></i> Loading challenge environment...
                            </div>
                        ) : challenge ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
                                {/* Description Card */}
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                                        <i className="fa-regular fa-file-lines" style={{ color: "#2563eb", fontSize: "1.1rem" }}></i>
                                        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: "800", color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                            Problem Statement
                                        </h3>
                                    </div>
                                    <div style={{
                                        color: "#334155",
                                        fontSize: "0.95rem",
                                        lineHeight: "1.7",
                                        whiteSpace: "pre-line",
                                        background: "#f8fafc",
                                        padding: "1.5rem",
                                        borderRadius: "16px",
                                        border: "1px solid #e2e8f0"
                                    }}>
                                        {challenge.description}
                                    </div>
                                </div>

                                {/* Sample Test Cases Terminals */}
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                                        <i className="fa-solid fa-vial" style={{ color: "#8b5cf6", fontSize: "1.1rem" }}></i>
                                        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: "800", color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                            Sample I/O
                                        </h3>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                        {/* Input Box */}
                                        <div style={{
                                            background: "#09090b",
                                            borderRadius: "12px",
                                            overflow: "hidden",
                                            boxShadow: "0 4px 15px rgba(0,0,0,0.05)"
                                        }}>
                                            <div style={{ background: "#18181b", padding: "8px 16px", borderBottom: "1px solid #27272a", display: "flex", alignItems: "center", gap: "8px" }}>
                                                <div style={{ display: "flex", gap: "6px" }}><div style={{width:10,height:10,borderRadius:"50%",background:"#ef4444"}}></div><div style={{width:10,height:10,borderRadius:"50%",background:"#f59e0b"}}></div><div style={{width:10,height:10,borderRadius:"50%",background:"#10b981"}}></div></div>
                                                <span style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "#94a3b8", fontWeight: "600", marginLeft: "8px" }}>stdin</span>
                                            </div>
                                            <pre style={{ margin: 0, padding: "16px", fontFamily: "'Fira Code', monospace", fontSize: "0.9rem", color: "#e4e4e7", overflowX: "auto" }}>
                                                {challenge.sampleInput}
                                            </pre>
                                        </div>
                                        {/* Output Box */}
                                        <div style={{
                                            background: "#09090b",
                                            borderRadius: "12px",
                                            overflow: "hidden",
                                            boxShadow: "0 4px 15px rgba(0,0,0,0.05)"
                                        }}>
                                            <div style={{ background: "#18181b", padding: "8px 16px", borderBottom: "1px solid #27272a", display: "flex", alignItems: "center", gap: "8px" }}>
                                                <div style={{ display: "flex", gap: "6px" }}><div style={{width:10,height:10,borderRadius:"50%",background:"#ef4444"}}></div><div style={{width:10,height:10,borderRadius:"50%",background:"#f59e0b"}}></div><div style={{width:10,height:10,borderRadius:"50%",background:"#10b981"}}></div></div>
                                                <span style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "#94a3b8", fontWeight: "600", marginLeft: "8px" }}>stdout (expected)</span>
                                            </div>
                                            <pre style={{ margin: 0, padding: "16px", fontFamily: "'Fira Code', monospace", fontSize: "0.9rem", color: "#10b981", overflowX: "auto", fontWeight: "600" }}>
                                                {challenge.sampleOutput}
                                            </pre>
                                        </div>
                                    </div>
                                </div>

                                {/* Constraints */}
                                {challenge.constraints && (
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                                            <i className="fa-solid fa-triangle-exclamation" style={{ color: "#f59e0b", fontSize: "1.1rem" }}></i>
                                            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: "800", color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                                Constraints
                                            </h3>
                                        </div>
                                        <div style={{ 
                                            background: "#fffbeb", 
                                            border: "1px solid #fde68a",
                                            borderRadius: "12px", 
                                            padding: "16px", 
                                            fontSize: "0.9rem", 
                                            color: "#92400e",
                                            fontFamily: "monospace",
                                            fontWeight: "600"
                                        }}>
                                            {challenge.constraints}
                                        </div>
                                    </div>
                                )}

                                {/* Tips & Workspace Guidelines Card */}
                                <div style={{
                                    marginTop: "0.5rem",
                                    background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                                    border: "1px solid #cbd5e1",
                                    borderRadius: "16px",
                                    padding: "20px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "12px",
                                    boxShadow: "0 4px 15px rgba(0,0,0,0.02)"
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#334155", fontWeight: "800", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                        <i className="fa-solid fa-lightbulb" style={{ color: "#eab308", fontSize: "1.2rem" }}></i> Workspace Guidelines
                                    </div>
                                    <ul style={{ margin: 0, paddingLeft: "1.5rem", fontSize: "0.85rem", color: "#475569", lineHeight: "1.6", display: "flex", flexDirection: "column", gap: "8px" }}>
                                        <li>Write code that reads input variables from <strong style={{ color: "#0f172a" }}>Standard Input (stdin)</strong>.</li>
                                        <li>Your program output must match the <strong style={{ color: "#0f172a" }}>Expected Output</strong> format exactly.</li>
                                        <li>Make sure to handle edge cases to pass hidden test suites.</li>
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <div style={{ color: "#ef4444", fontWeight: "600", padding: "2rem 0", display: "flex", alignItems: "center", gap: "8px" }}>
                                <i className="fa-solid fa-circle-exclamation"></i> No coding challenge is assigned for today.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Editor and Results stacked vertically */}
                <div style={{
                    flex: "0 0 55%",
                    background: "#09090b",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    overflow: "hidden"
                }}>
                    
                    {/* Editor Tabs and Toolbar */}
                    <div style={{
                        background: "#18181b",
                        borderBottom: "1px solid #27272a",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0",
                        paddingRight: "16px",
                        flexShrink: 0
                    }}>
                        {/* File tab file tabs */}
                        <div style={{ display: "flex" }}>
                            <div style={{
                                background: "#09090b",
                                color: "#38bdf8",
                                borderTop: "2px solid #3b82f6",
                                padding: "12px 24px",
                                fontSize: "0.85rem",
                                fontWeight: "600",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                cursor: "default",
                                borderRight: "1px solid #27272a"
                            }}>
                                <i className="fa-solid fa-code"></i>
                                {activeTabFile}
                            </div>
                        </div>

                        {/* Toolbar items */}
                        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
                            <span style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "6px 12px",
                                borderRadius: "999px",
                                backgroundColor: "rgba(239, 68, 68, 0.1)",
                                border: "1px solid rgba(239, 68, 68, 0.2)",
                                color: "#f87171",
                                fontSize: "0.75rem",
                                fontWeight: "700",
                                userSelect: "none"
                            }}>
                                <i className="fa-solid fa-shield-halved"></i>
                                Anti-Cheat Active
                            </span>

                            <div style={{ display: "flex", alignItems: "center", background: "#27272a", borderRadius: "8px", padding: "4px" }}>
                                <select
                                    value={studentLanguage}
                                    onChange={(e) => handleLanguageChange(e.target.value)}
                                    style={{
                                        background: "transparent",
                                        border: "none",
                                        color: "#e4e4e7",
                                        fontSize: "0.8rem",
                                        fontWeight: "600",
                                        padding: "4px 8px",
                                        outline: "none",
                                        cursor: "pointer"
                                    }}
                                >
                                    <option value="python">Python 3</option>
                                    <option value="java">Java 17</option>
                                    <option value="cpp">C++ 17</option>
                                    <option value="c">C (GCC)</option>
                                </select>
                            </div>
                            
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem", color: "#a1a1aa", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "#a1a1aa"} title="Settings">
                                    <i className="fa-solid fa-gear"></i>
                                </button>
                                <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem", color: "#a1a1aa", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "#a1a1aa"} title="Expand Screen">
                                    <i className="fa-solid fa-expand"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Floating Anti-Cheat / Paste Warning Toast */}
                    {pasteWarning && (
                        <div style={{
                            position: "fixed",
                            top: "24px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
                            color: "#ffffff",
                            padding: "0.85rem 1.6rem",
                            borderRadius: "12px",
                            boxShadow: "0 10px 30px rgba(239, 68, 68, 0.45), 0 4px 10px rgba(0,0,0,0.3)",
                            zIndex: 99999,
                            display: "flex",
                            alignItems: "center",
                            gap: "0.85rem",
                            fontSize: "0.9rem",
                            fontWeight: "700",
                            letterSpacing: "0.2px",
                            border: "1px solid rgba(255, 255, 255, 0.25)",
                            animation: "bounce 0.3s ease-out"
                        }}>
                            <i className="fa-solid fa-shield-halved" style={{ fontSize: "1.25rem", color: "#fef08a" }}></i>
                            <span>{pasteWarning}</span>
                        </div>
                    )}

                    {/* Scrollable workspace content */}
                    <div 
                        ref={scrollContainerRef}
                        style={{
                            flex: 1,
                            overflowY: "auto",
                            display: "flex",
                            flexDirection: "column",
                            background: "#09090b"
                        }}
                    >
                        {/* Actual Text Editor Area - Fixed Height for Scrolling */}
                        <div style={{
                            height: "55vh",
                            minHeight: "400px",
                            display: "flex",
                            flexDirection: "row",
                            background: "#09090b",
                            overflow: "hidden",
                            position: "relative",
                            flexShrink: 0
                        }}>
                            {/* Editor Line numbers */}
                            <div style={{
                                width: "48px",
                                background: "#09090b",
                                borderRight: "1px solid #27272a",
                                display: "flex",
                                flexDirection: "column",
                                padding: "16px 0",
                                color: "#52525b",
                                fontFamily: "'Fira Code', monospace",
                                fontSize: "0.9rem",
                                lineHeight: "1.6rem",
                                userSelect: "none",
                                boxSizing: "border-box",
                                textAlign: "center"
                             }}>
                                {Array.from({ length: 50 }).map((_, i) => (
                                    <div key={i}>{i + 1}</div>
                                ))}
                            </div>

                            {/* Main code input area with anti-cheat protection */}
                            <textarea
                                value={studentCode}
                                onChange={(e) => setStudentCode(e.target.value)}
                                onKeyDown={handleTextareaKeyDown}
                                onPaste={(e) => {
                                    e.preventDefault();
                                    triggerPasteWarning();
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    triggerPasteWarning("Dragging and dropping code into the editor is disabled!");
                                }}
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    triggerPasteWarning("Right-click context menu is disabled in assessment mode!");
                                }}
                                spellCheck="false"
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="off"
                                style={{
                                    flex: 1,
                                    background: "transparent",
                                    border: "none",
                                    outline: "none",
                                    resize: "none",
                                    color: "#f4f4f5",
                                    fontFamily: "'Fira Code', Consolas, monospace",
                                    fontSize: "0.9rem",
                                    padding: "16px",
                                    lineHeight: "1.6rem",
                                    boxSizing: "border-box",
                                    caretColor: "#3b82f6"
                                }}
                            />
                        </div>

                        {/* Draggable Custom Input toggle */}
                        <div style={{
                            background: "#18181b",
                            borderTop: "1px solid #27272a",
                            borderBottom: "1px solid #27272a",
                            padding: "12px 24px",
                            flexShrink: 0
                        }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "8px", color: "#a1a1aa", fontSize: "0.85rem", cursor: "pointer", fontWeight: "600", userSelect: "none" }}>
                                <input 
                                    type="checkbox" 
                                    checked={useCustomInput} 
                                    onChange={(e) => setUseCustomInput(e.target.checked)}
                                    style={{ accentColor: "#3b82f6", width: "16px", height: "16px", cursor: "pointer" }}
                                />
                                Provide Custom Input
                            </label>
                            
                            {useCustomInput && (
                                <textarea
                                    value={customInput}
                                    onChange={(e) => setCustomInput(e.target.value)}
                                    placeholder="Enter your custom stdin test input here..."
                                    rows={3}
                                    style={{
                                        width: "100%",
                                        background: "#09090b",
                                        border: "1px solid #3f3f46",
                                        borderRadius: "8px",
                                        marginTop: "12px",
                                        padding: "12px",
                                        color: "#f4f4f5",
                                        fontSize: "0.85rem",
                                        fontFamily: "'Fira Code', monospace",
                                        outline: "none",
                                        resize: "none",
                                        transition: "border 0.2s"
                                    }}
                                    onFocus={e => e.currentTarget.style.borderColor = "#3b82f6"}
                                    onBlur={e => e.currentTarget.style.borderColor = "#3f3f46"}
                                />
                            )}
                        </div>

                        {/* Results Panel */}
                        {showTerminal && (
                            <div 
                                ref={resultsRef}
                                style={{
                                    background: "#09090b",
                                    borderTop: "1px solid #27272a",
                                    display: "flex",
                                    flexDirection: "column",
                                    color: "#f4f4f5",
                                    flexShrink: 0
                                }}
                            >
                                <div style={{
                                    background: "#18181b",
                                    padding: "12px 24px",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    borderBottom: "1px solid #27272a"
                                }}>
                                    <span style={{ fontSize: "0.85rem", color: "#e4e4e7", fontWeight: "700", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "8px" }}>
                                        <i className="fa-solid fa-terminal" style={{ color: "#38bdf8" }}></i> Assessment Terminal
                                    </span>
                                    <button 
                                        onClick={() => setShowTerminal(false)}
                                        style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer", fontSize: "0.85rem", fontWeight: "700", transition: "color 0.2s" }}
                                        onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                                        onMouseLeave={e => e.currentTarget.style.color = "#a1a1aa"}
                                    >
                                        ✕ Clear
                                    </button>
                                </div>
                                <div style={{ padding: "24px", color: "#f4f4f5" }}>
                                    {execStatus === "RUNNING" ? (
                                        <div style={{ color: "#38bdf8", fontWeight: "700", display: "flex", alignItems: "center", gap: "12px", fontSize: "0.95rem" }}>
                                            <i className="fa-solid fa-circle-notch fa-spin"></i> Executing code on isolated server...
                                        </div>
                                    ) : (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                            
                                            {/* Result Summary Banner */}
                                            <div>
                                                <h4 style={{ margin: "0 0 8px 0", fontSize: "0.85rem", color: "#a1a1aa", fontWeight: "700", textTransform: "uppercase" }}>Test Result</h4>
                                                <div style={{
                                                    background: passedCount === totalCount && totalCount > 0 ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
                                                    border: `1px solid ${passedCount === totalCount && totalCount > 0 ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.3)"}`,
                                                    borderRadius: "8px",
                                                    padding: "12px 20px",
                                                    fontSize: "1rem",
                                                    fontWeight: "800",
                                                    color: passedCount === totalCount && totalCount > 0 ? "#10b981" : "#f59e0b",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "10px"
                                                }}>
                                                    {passedCount === totalCount && totalCount > 0 ? <i className="fa-solid fa-circle-check"></i> : <i className="fa-solid fa-triangle-exclamation"></i>}
                                                    {actionType === 'RUN' 
                                                        ? `${passedCount}/${totalCount} Sample Testcase${totalCount > 1 ? 's' : ''} Passed`
                                                        : `${passedCount}/${totalCount} Testcases Passed`
                                                    }
                                                </div>
                                            </div>

                                            {/* Compiler Message */}
                                            <div>
                                                <h4 style={{ margin: "0 0 8px 0", fontSize: "0.85rem", color: "#a1a1aa", fontWeight: "700", textTransform: "uppercase" }}>Compiler Log</h4>
                                                <div style={{
                                                    background: "#18181b",
                                                    border: "1px solid #27272a",
                                                    borderRadius: "8px",
                                                    padding: "16px",
                                                    fontSize: "0.85rem",
                                                    fontFamily: "'Fira Code', monospace",
                                                    color: compilerMessage.includes("successful") ? "#10b981" : "#ef4444",
                                                    whiteSpace: "pre-wrap",
                                                    maxHeight: "150px",
                                                    overflowY: "auto"
                                                }}>
                                                    {compilerMessage}
                                                </div>
                                            </div>

                                            {/* Action Specific Outputs */}
                                            {actionType === 'RUN' && (
                                                <div>
                                                    <h4 style={{ margin: "0 0 12px 0", fontSize: "0.85rem", color: "#a1a1aa", fontWeight: "700", textTransform: "uppercase" }}>Testcase Details</h4>
                                                    {testCaseResults.map((tc, idx) => (
                                                        <div key={idx} style={{ marginBottom: "16px", borderRadius: "8px", overflow: "hidden", border: "1px solid #27272a" }}>
                                                            <div style={{
                                                                background: "#18181b",
                                                                padding: "10px 16px",
                                                                fontSize: "0.85rem",
                                                                fontWeight: "700",
                                                                color: tc.passed ? "#10b981" : "#ef4444",
                                                                borderBottom: "1px solid #27272a",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: "8px"
                                                            }}>
                                                                {tc.passed ? <i className="fa-solid fa-check"></i> : <i className="fa-solid fa-xmark"></i>}
                                                                Testcase {idx + 1}
                                                            </div>
                                                            <div style={{
                                                                display: "grid",
                                                                gridTemplateColumns: "1fr 1fr",
                                                                gap: "1px",
                                                                background: "#27272a"
                                                            }}>
                                                                <div style={{ background: "#09090b", padding: "16px" }}>
                                                                    <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#a1a1aa", marginBottom: "8px" }}>Expected Output</div>
                                                                    <div style={{
                                                                        background: "#18181b",
                                                                        border: "1px solid #27272a",
                                                                        padding: "12px",
                                                                        borderRadius: "6px",
                                                                        fontFamily: "'Fira Code', monospace",
                                                                        fontSize: "0.85rem",
                                                                        height: "100px",
                                                                        overflowY: "auto",
                                                                        whiteSpace: "pre-wrap",
                                                                        color: "#e4e4e7"
                                                                    }}>{tc.expected}</div>
                                                                </div>
                                                                <div style={{ background: "#09090b", padding: "16px" }}>
                                                                    <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#a1a1aa", marginBottom: "8px" }}>Your Output</div>
                                                                    <div style={{
                                                                        background: "#18181b",
                                                                        border: "1px solid #27272a",
                                                                        padding: "12px",
                                                                        borderRadius: "6px",
                                                                        fontFamily: "'Fira Code', monospace",
                                                                        fontSize: "0.85rem",
                                                                        height: "100px",
                                                                        overflowY: "auto",
                                                                        whiteSpace: "pre-wrap",
                                                                        color: tc.passed ? "#10b981" : "#ef4444"
                                                                    }}>{tc.output || tc.error || "No output"}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {actionType === 'SUBMIT' && (
                                                <div>
                                                    <h4 style={{ margin: "0 0 12px 0", fontSize: "0.85rem", color: "#a1a1aa", fontWeight: "700", textTransform: "uppercase" }}>Test Cases Execution Details</h4>
                                                    <div style={{ overflowX: "auto", border: "1px solid #27272a", borderRadius: "8px", background: "#09090b" }}>
                                                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left", color: "#e4e4e7" }}>
                                                            <thead>
                                                                <tr style={{ background: "#18181b", borderBottom: "1px solid #27272a" }}>
                                                                    <th style={{ padding: "12px 16px", color: "#a1a1aa" }}>Test Case</th>
                                                                    <th style={{ padding: "12px 16px", color: "#a1a1aa" }}>Result</th>
                                                                    <th style={{ padding: "12px 16px", color: "#a1a1aa" }}>Status</th>
                                                                    <th style={{ padding: "12px 16px", color: "#a1a1aa" }}>Time (ms)</th>
                                                                    <th style={{ padding: "12px 16px", color: "#a1a1aa" }}>Message</th>
                                                                    <th style={{ padding: "12px 16px", color: "#a1a1aa" }}>Time Compl.</th>
                                                                    <th style={{ padding: "12px 16px", color: "#a1a1aa" }}>Space Compl.</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {testCaseResults.map((tc, idx) => (
                                                                    <tr key={idx} style={{ borderBottom: "1px solid #18181b" }}>
                                                                        <td style={{ padding: "12px 16px", fontWeight: "700" }}>{idx + 1}</td>
                                                                        <td style={{ padding: "12px 16px" }}>
                                                                            {tc.passed 
                                                                                ? <span style={{ color: "#10b981", fontSize: "1.1rem" }}><i className="fa-solid fa-check"></i></span>
                                                                                : <span style={{ color: "#ef4444", fontSize: "1.1rem" }}><i className="fa-solid fa-xmark"></i></span>
                                                                            }
                                                                        </td>
                                                                        <td style={{ padding: "12px 16px", fontWeight: "600", color: tc.passed ? "#10b981" : "#ef4444" }}>
                                                                            {tc.passed ? "Success" : "Wrong Answer"}
                                                                        </td>
                                                                        <td style={{ padding: "12px 16px" }}>
                                                                            {200 + (idx * 94) % 450} ms
                                                                        </td>
                                                                        <td style={{ padding: "12px 16px", color: "#94a3b8" }}>
                                                                            {tc.passed ? "Compilation successful" : tc.error || "Wrong Answer"}
                                                                        </td>
                                                                        <td style={{ padding: "12px 16px", color: "#52525b" }}>-</td>
                                                                        <td style={{ padding: "12px 16px", color: "#52525b" }}>-</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>

                                                    {aiReviewFeedback && (
                                                        <div style={{ marginTop: "24px", background: "rgba(168, 85, 247, 0.1)", border: "1px solid rgba(168, 85, 247, 0.3)", borderRadius: "12px", padding: "20px" }}>
                                                            <div style={{ fontSize: "0.9rem", color: "#c084fc", fontWeight: "800", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                                                                <i className="fa-solid fa-wand-magic-sparkles"></i> AI Code Review
                                                            </div>
                                                            <div style={{ fontSize: "0.9rem", color: "#e4e4e7", whiteSpace: "pre-line", lineHeight: "1.6" }}>
                                                                {aiReviewFeedback}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Fixed Action Footer pinned to the bottom */}
                    <div style={{
                        background: "#18181b",
                        borderTop: "1px solid #27272a",
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "12px 24px",
                        alignItems: "center",
                        flexShrink: 0
                    }}>
                        <button 
                            onClick={() => setStudentCode(challenge ? (studentLanguage === "python" ? challenge.boilerplatePython : studentLanguage === "java" ? challenge.boilerplateJava : studentLanguage === "cpp" ? challenge.boilerplateCpp : challenge.boilerplateC) : "")}
                            style={{
                                background: "#27272a",
                                color: "#e4e4e7",
                                border: "1px solid #3f3f46",
                                padding: "8px 20px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "0.85rem",
                                fontWeight: "600",
                                transition: "all 0.2s"
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = "#3f3f46"}
                            onMouseLeave={e => e.currentTarget.style.background = "#27272a"}
                        >
                            <i className="fa-solid fa-rotate-right" style={{ marginRight: "6px" }}></i> Reset Code
                        </button>
                        
                        <div style={{ display: "flex", gap: "12px" }}>
                            <button 
                                onClick={handleRunCode}
                                disabled={execStatus === "RUNNING"}
                                style={{
                                    background: "#27272a",
                                    color: "#f4f4f5",
                                    border: "1px solid #3f3f46",
                                    padding: "8px 24px",
                                    borderRadius: "8px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    fontSize: "0.85rem",
                                    transition: "all 0.2s",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    opacity: execStatus === "RUNNING" ? 0.6 : 1
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "#3f3f46"}
                                onMouseLeave={e => e.currentTarget.style.background = "#27272a"}
                            >
                                <i className="fa-solid fa-play"></i> Compile & Run
                            </button>
                            <button 
                                onClick={handleSubmitCode}
                                disabled={execStatus === "RUNNING"}
                                style={{
                                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                    color: "#fff",
                                    border: "none",
                                    padding: "8px 32px",
                                    borderRadius: "8px",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                    fontSize: "0.85rem",
                                    transition: "all 0.2s",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    opacity: execStatus === "RUNNING" ? 0.6 : 1,
                                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)"
                                }}
                                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                            >
                                Submit Code <i className="fa-solid fa-cloud-arrow-up"></i>
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default CodingWorkspacePage;
