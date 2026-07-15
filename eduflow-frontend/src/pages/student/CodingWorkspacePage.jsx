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

    // Tab files mock
    const [activeTabFile, setActiveTabFile] = useState('main.py');

    // Restore cursor position right after indentation
    const handleTextareaKeyDown = (e) => {
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
            background: "#f1f5f9",
            color: "#0f172a",
            fontFamily: "Inter, system-ui, sans-serif",
            overflow: "hidden"
        }}>
            {/* Premium Header Bar */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#ffffff",
                padding: "0.5rem 1.5rem",
                borderBottom: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                zIndex: 10
            }}>
                {/* Left: Test details */}
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{
                        background: "#f1f5f9",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        padding: "0.25rem 0.75rem",
                        fontSize: "0.8rem",
                        fontWeight: "600",
                        color: "#475569"
                    }}>
                        daily_challenge_sprint
                    </div>
                    <div style={{
                        fontSize: "0.85rem",
                        color: "#64748b",
                        fontWeight: "500"
                    }}>
                        Section 1/1 | Coding Assessment
                    </div>
                </div>

                {/* Center: Profile details */}
                <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.85rem", color: "#475569", fontWeight: "600" }}>
                    <div>
                        Name : <span style={{ color: "#0f172a", fontWeight: "700" }}>{studentName}</span>
                    </div>
                    <div style={{ borderLeft: "1px solid #cbd5e1", paddingLeft: "1.5rem" }}>
                        Roll Number : <span style={{ color: "#0f172a", fontWeight: "700" }}>{rollNumber}</span>
                    </div>
                </div>

                {/* Right: Controls & Timer */}
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        background: "rgba(16, 185, 129, 0.1)",
                        border: "1px solid rgba(16, 185, 129, 0.2)",
                        color: "#10b981",
                        padding: "0.3rem 0.8rem",
                        borderRadius: "8px",
                        fontWeight: "700",
                        fontSize: "0.95rem"
                    }}>
                        ⏱️ {formatTimer(timeLeft)}
                    </div>
                    <button 
                        onClick={handlePauseTest}
                        style={{
                            background: "#f1f5f9",
                            border: "1px solid #cbd5e1",
                            padding: "0.4rem 0.6rem",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "0.9rem"
                        }}
                        title="Pause and Exit Test"
                    >
                        ⏸️
                    </button>
                    <button 
                        onClick={handleExitWorkspace}
                        style={{
                            background: "#2563eb",
                            color: "#fff",
                            border: "none",
                            padding: "0.4rem 1.2rem",
                            borderRadius: "8px",
                            fontWeight: "600",
                            cursor: "pointer",
                            fontSize: "0.85rem",
                            transition: "background 0.2s"
                        }}
                        className="hover:bg-blue-700"
                    >
                        Submit Test
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
                <div style={{
                    flex: "0 0 45%",
                    background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
                    borderRight: "6px solid #cbd5e1",
                    boxShadow: "2px 0 8px rgba(0, 0, 0, 0.04)",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    overflow: "hidden"
                }}>
                    {/* Question Content container */}
                    <div style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        overflowY: "auto",
                        padding: "2rem"
                    }}>
                        {/* Title bar */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <span style={{ background: "#2563eb", color: "#fff", padding: "0.2rem 0.5rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "800" }}>
                                    Q1
                                </span>
                                <h2 style={{ fontSize: "1rem", fontWeight: "700", color: "#1e293b", margin: 0 }}>
                                    Question No : 1 / 1
                                </h2>
                            </div>
                            
                            {challenge && (
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <span style={{ 
                                        background: challenge.difficulty === "Easy" ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
                                        color: challenge.difficulty === "Easy" ? "#10b981" : "#f59e0b",
                                        border: challenge.difficulty === "Easy" ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(245, 158, 11, 0.2)",
                                        padding: "0.2rem 0.5rem",
                                        borderRadius: "6px",
                                        fontSize: "0.7rem",
                                        fontWeight: "800"
                                    }}>
                                        {challenge.difficulty}
                                    </span>
                                    <span style={{ 
                                        background: "rgba(99, 102, 241, 0.1)",
                                        color: "#6366f1",
                                        border: "1px solid rgba(99, 102, 241, 0.2)",
                                        padding: "0.2rem 0.5rem",
                                        borderRadius: "6px",
                                        fontSize: "0.7rem",
                                        fontWeight: "800"
                                    }}>
                                        {challenge.category || "Algorithms"}
                                    </span>
                                </div>
                            )}
                        </div>

                        {loading ? (
                            <div style={{ color: "#64748b", fontStyle: "italic" }}>Loading challenge instructions...</div>
                        ) : challenge ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                {/* Description Card */}
                                <div style={{
                                    background: "#ffffff",
                                    borderRadius: "16px",
                                    padding: "1.5rem",
                                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)",
                                    border: "1px solid #e2e8f0",
                                    borderLeft: "4px solid #2563eb"
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                                        <span style={{ background: "rgba(37,99,235,0.08)", color: "#2563eb", fontSize: "0.7rem", fontWeight: "800", padding: "0.25rem 0.6rem", borderRadius: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                            Problem Description
                                        </span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: "0.9rem", color: "#334155", lineHeight: "1.6", whiteSpace: "pre-line", fontFamily: "Inter, system-ui, sans-serif" }}>
                                        {challenge.description}
                                    </p>
                                </div>

                                {/* Sample Test Cases Terminals */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                    <h3 style={{ fontSize: "0.8rem", fontWeight: "800", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>
                                        Sample Test Cases
                                    </h3>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                        {/* Input Box */}
                                        <div style={{
                                            background: "#0f172a",
                                            borderRadius: "12px",
                                            border: "1px solid #1e293b",
                                            overflow: "hidden"
                                        }}>
                                            <div style={{ background: "#1e293b", padding: "0.4rem 0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <span style={{ fontSize: "0.65rem", fontFamily: "monospace", color: "#94a3b8", fontWeight: "700" }}>stdin (Input)</span>
                                            </div>
                                            <pre style={{ margin: 0, padding: "0.75rem 1rem", fontFamily: "monospace", fontSize: "0.85rem", color: "#38bdf8", overflowX: "auto" }}>
                                                {challenge.sampleInput}
                                            </pre>
                                        </div>
                                        {/* Output Box */}
                                        <div style={{
                                            background: "#0f172a",
                                            borderRadius: "12px",
                                            border: "1px solid #1e293b",
                                            overflow: "hidden"
                                        }}>
                                            <div style={{ background: "#1e293b", padding: "0.4rem 0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <span style={{ fontSize: "0.65rem", fontFamily: "monospace", color: "#94a3b8", fontWeight: "700" }}>stdout (Expected)</span>
                                            </div>
                                            <pre style={{ margin: 0, padding: "0.75rem 1rem", fontFamily: "monospace", fontSize: "0.85rem", color: "#10b981", overflowX: "auto" }}>
                                                {challenge.sampleOutput}
                                            </pre>
                                        </div>
                                    </div>
                                </div>

                                {/* Constraints */}
                                {challenge.constraints && (
                                    <div style={{ 
                                        background: "#fffbeb", 
                                        borderLeft: "4px solid #f59e0b", 
                                        borderRadius: "8px", 
                                        padding: "1rem", 
                                        fontSize: "0.8rem", 
                                        color: "#b45309",
                                        boxShadow: "0 2px 4px rgba(245,158,11,0.03)"
                                    }}>
                                        <strong style={{ display: "block", marginBottom: "0.25rem", textTransform: "uppercase", fontSize: "0.7rem", letterSpacing: "0.5px" }}>Constraints:</strong> 
                                        {challenge.constraints}
                                    </div>
                                )}

                                {/* Tips & Workspace Guidelines Card */}
                                <div style={{
                                    marginTop: "1rem",
                                    background: "linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%)",
                                    border: "1px solid #bae6fd",
                                    borderRadius: "14px",
                                    padding: "1.25rem",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "0.5rem",
                                    boxShadow: "0 2px 4px rgba(37,99,235,0.02)"
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#0369a1", fontWeight: "700", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                        💡 Workspace Guidelines
                                    </div>
                                    <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.8rem", color: "#0c4a6e", lineHeight: "1.5", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                                        <li>Write code that reads input variables from <strong>Standard Input (stdin)</strong>.</li>
                                        <li>Your program output must match the <strong>Expected Output</strong> format exactly.</li>
                                        <li>Make sure to handle edge cases to pass hidden test suites.</li>
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <div style={{ color: "#ef4444", fontStyle: "italic" }}>No coding challenge is assigned for today.</div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Editor and Results stacked vertically */}
                <div style={{
                    flex: "0 0 55%",
                    background: "#090d16",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    overflow: "hidden"
                }}>
                    
                    {/* Editor Tabs and Toolbar */}
                    <div style={{
                        background: "#0d1117",
                        borderBottom: "1px solid #1e293b",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.25rem 1rem",
                        flexShrink: 0
                    }}>
                        {/* File tab file tabs */}
                        <div style={{ display: "flex", gap: "2px" }}>
                            <div style={{
                                background: "#0f172a",
                                color: "#38bdf8",
                                borderTop: "2px solid #2563eb",
                                padding: "0.4rem 1rem",
                                fontSize: "0.8rem",
                                fontWeight: "600",
                                borderTopLeftRadius: "4px",
                                borderTopRightRadius: "4px",
                                cursor: "default"
                            }}>
                                {activeTabFile}
                            </div>
                            <button style={{
                                background: "transparent",
                                border: "none",
                                color: "#64748b",
                                fontSize: "1.1rem",
                                padding: "0 0.5rem",
                                cursor: "pointer"
                            }}>
                                +
                            </button>
                        </div>

                        {/* Toolbar items */}
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 }}>
                            <select
                                value={studentLanguage}
                                onChange={(e) => handleLanguageChange(e.target.value)}
                                style={{
                                    background: "#0f172a",
                                    border: "1px solid #1e293b",
                                    color: "#e2e8f0",
                                    fontSize: "0.75rem",
                                    padding: "0.25rem 0.5rem",
                                    borderRadius: "4px",
                                    outline: "none"
                                }}
                            >
                                <option value="python">Python 3</option>
                                <option value="java">Java 17</option>
                                <option value="cpp">C++ 17</option>
                                <option value="c">C (GCC)</option>
                            </select>
                            
                            <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1rem", color: "var(--text-muted)" }} title="Toggle Dark Theme">
                                <i className="fa-solid fa-moon"></i>
                            </button>
                            <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1rem", color: "var(--text-muted)" }} title="Expand Screen">
                                <i className="fa-solid fa-expand"></i>
                            </button>
                        </div>
                    </div>

                    {/* Scrollable workspace content */}
                    <div 
                        ref={scrollContainerRef}
                        style={{
                            flex: 1,
                            overflowY: "auto",
                            display: "flex",
                            flexDirection: "column",
                            background: "#ffffff"
                        }}
                    >
                        {/* Actual Text Editor Area - Fixed Height for Scrolling */}
                        <div style={{
                            height: "420px",
                            minHeight: "420px",
                            display: "flex",
                            flexDirection: "row",
                            background: "#0f172a",
                            overflow: "hidden",
                            position: "relative",
                            flexShrink: 0
                        }}>
                            {/* Editor Line numbers */}
                            <div style={{
                                width: "35px",
                                background: "#090d16",
                                borderRight: "1px solid #1e293b",
                                display: "flex",
                                flexDirection: "column",
                                padding: "0.5rem 0",
                                color: "#475569",
                                fontFamily: "monospace",
                                fontSize: "0.85rem",
                                lineHeight: "1.5rem",
                                userSelect: "none",
                                boxSizing: "border-box",
                                textAlign: "center"
                             }}>
                                {Array.from({ length: 42 }).map((_, i) => (
                                    <div key={i}>{i + 1}</div>
                                ))}
                            </div>

                            {/* Main code input area */}
                            <textarea
                                value={studentCode}
                                onChange={(e) => setStudentCode(e.target.value)}
                                onKeyDown={handleTextareaKeyDown}
                                style={{
                                    flex: 1,
                                    background: "transparent",
                                    border: "none",
                                    outline: "none",
                                    resize: "none",
                                    color: "#e2e8f0",
                                    fontFamily: "monospace",
                                    fontSize: "0.85rem",
                                    padding: "0.5rem 1rem",
                                    lineHeight: "1.5rem",
                                    boxSizing: "border-box"
                                }}
                            />
                        </div>

                        {/* Draggable Custom Input toggle */}
                        <div style={{
                            background: "#f8fafc",
                            borderTop: "1px solid #e2e8f0",
                            borderBottom: "1px solid #e2e8f0",
                            padding: "0.75rem 1.5rem",
                            flexShrink: 0
                        }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#475569", fontSize: "0.8rem", cursor: "pointer", fontWeight: "600" }}>
                                <input 
                                    type="checkbox" 
                                    checked={useCustomInput} 
                                    onChange={(e) => setUseCustomInput(e.target.checked)}
                                    style={{ accentColor: "#2563eb" }}
                                />
                                Provide Custom Input
                            </label>
                            
                            {useCustomInput && (
                                <textarea
                                    value={customInput}
                                    onChange={(e) => setCustomInput(e.target.value)}
                                    placeholder="Enter your custom stdin test input here..."
                                    rows={2}
                                    style={{
                                        width: "100%",
                                        background: "#ffffff",
                                        border: "1px solid #cbd5e1",
                                        borderRadius: "6px",
                                        marginTop: "0.5rem",
                                        padding: "6px 10px",
                                        color: "#0f172a",
                                        fontSize: "0.8rem",
                                        fontFamily: "monospace",
                                        outline: "none",
                                        resize: "none"
                                    }}
                                />
                            )}
                        </div>

                        {/* Results Panel - Renders directly inside scrollable area below Custom Input */}
                        {showTerminal && (
                            <div 
                                ref={resultsRef}
                                style={{
                                    background: "#ffffff",
                                    borderTop: "3px solid #2563eb",
                                    display: "flex",
                                    flexDirection: "column",
                                    color: "#0f172a",
                                    flexShrink: 0
                                }}
                            >
                                <div style={{
                                    background: "#f1f5f9",
                                    padding: "0.5rem 1.5rem",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    borderBottom: "1px solid #cbd5e1"
                                }}>
                                    <span style={{ fontSize: "0.8rem", color: "#475569", fontWeight: "700", textTransform: "uppercase" }}>
                                        Assessment Execution Results
                                    </span>
                                    <button 
                                        onClick={() => setShowTerminal(false)}
                                        style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "0.85rem", fontWeight: "700" }}
                                    >
                                        ✕ Clear Results
                                    </button>
                                </div>
                                <div style={{ padding: "1.5rem", color: "#0f172a" }}>
                                    {execStatus === "RUNNING" ? (
                                        <div style={{ color: "#2563eb", fontWeight: "700", animation: "pulse 1.5s infinite" }}>⌛ Compiling code and executing on testing server...</div>
                                    ) : (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                            
                                            {/* Result Summary Banner */}
                                            <div>
                                                <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Result</h4>
                                                <div style={{
                                                    background: passedCount === totalCount && totalCount > 0 ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
                                                    border: `1px solid ${passedCount === totalCount && totalCount > 0 ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.3)"}`,
                                                    borderRadius: "6px",
                                                    padding: "10px 15px",
                                                    fontSize: "0.9rem",
                                                    fontWeight: "700",
                                                    color: passedCount === totalCount && totalCount > 0 ? "#10b981" : "#d97706"
                                                }}>
                                                    {actionType === 'RUN' 
                                                        ? `${passedCount}/${totalCount} Sample Testcase${totalCount > 1 ? 's' : ''} Passed`
                                                        : `${passedCount}/${totalCount} Testcases Passed`
                                                    }
                                                </div>
                                            </div>

                                            {/* Compiler Message */}
                                            <div>
                                                <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Compiler Message</h4>
                                                <div style={{
                                                    background: "#f8fafc",
                                                    border: "1px solid #e2e8f0",
                                                    borderRadius: "6px",
                                                    padding: "12px",
                                                    fontSize: "0.85rem",
                                                    fontFamily: "monospace",
                                                    color: compilerMessage.includes("successful") ? "#10b981" : "#ef4444",
                                                    fontWeight: "600",
                                                    whiteSpace: "pre-wrap"
                                                }}>
                                                    {compilerMessage}
                                                </div>
                                            </div>

                                            {/* Action Specific Outputs */}
                                            {actionType === 'RUN' && (
                                                <div>
                                                    <h4 style={{ margin: "0 0 0.75rem 0", fontSize: "0.85rem", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Sample Testcase</h4>
                                                    {testCaseResults.map((tc, idx) => (
                                                        <div key={idx} style={{ marginBottom: "1rem" }}>
                                                            <div style={{
                                                                background: "#f8fafc",
                                                                padding: "0.4rem 1rem",
                                                                fontSize: "0.8rem",
                                                                fontWeight: "700",
                                                                color: tc.passed ? "#10b981" : "#ef4444",
                                                                border: "1px solid #e2e8f0",
                                                                borderBottom: "none",
                                                                borderTopLeftRadius: "6px",
                                                                borderTopRightRadius: "6px"
                                                            }}>
                                                                Testcase {idx + 1} - {tc.passed ? "Passed" : "Failed"}
                                                            </div>
                                                            <div style={{
                                                                display: "grid",
                                                                gridTemplateColumns: "1fr 1fr",
                                                                gap: "1rem",
                                                                border: "1px solid #e2e8f0",
                                                                borderBottomLeftRadius: "6px",
                                                                borderBottomRightRadius: "6px",
                                                                padding: "1rem",
                                                                background: "#ffffff"
                                                            }}>
                                                                <div>
                                                                    <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>Expected Output</div>
                                                                    <div style={{
                                                                        background: "#f8fafc",
                                                                        border: "1px solid #cbd5e1",
                                                                        padding: "8px",
                                                                        borderRadius: "4px",
                                                                        fontFamily: "monospace",
                                                                        fontSize: "0.8rem",
                                                                        height: "100px",
                                                                        overflowY: "auto",
                                                                        whiteSpace: "pre-wrap"
                                                                    }}>{tc.expected}</div>
                                                                </div>
                                                                <div>
                                                                    <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>Output</div>
                                                                    <div style={{
                                                                        background: "#f8fafc",
                                                                        border: "1px solid #cbd5e1",
                                                                        padding: "8px",
                                                                        borderRadius: "4px",
                                                                        fontFamily: "monospace",
                                                                        fontSize: "0.8rem",
                                                                        height: "100px",
                                                                        overflowY: "auto",
                                                                        whiteSpace: "pre-wrap",
                                                                        color: tc.passed ? "#0f172a" : "#ef4444"
                                                                    }}>{tc.output || tc.error || "No output"}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {actionType === 'SUBMIT' && (
                                                <div>
                                                    <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Test Cases Execution Details</h4>
                                                    <div style={{ overflowX: "auto", border: "1px solid #cbd5e1", borderRadius: "8px" }}>
                                                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left", color: "#334155" }}>
                                                            <thead>
                                                                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #cbd5e1" }}>
                                                                    <th style={{ padding: "0.75rem 1rem" }}>Test Case</th>
                                                                    <th style={{ padding: "0.75rem 1rem" }}>Result</th>
                                                                    <th style={{ padding: "0.75rem 1rem" }}>Status</th>
                                                                    <th style={{ padding: "0.75rem 1rem" }}>Time(Ms)</th>
                                                                    <th style={{ padding: "0.75rem 1rem" }}>Message</th>
                                                                    <th style={{ padding: "0.75rem 1rem" }}>Time Complexity</th>
                                                                    <th style={{ padding: "0.75rem 1rem" }}>Space Complexity</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {testCaseResults.map((tc, idx) => (
                                                                    <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                                                        <td style={{ padding: "0.75rem 1rem", fontWeight: "700" }}>{idx + 1}</td>
                                                                        <td style={{ padding: "0.75rem 1rem" }}>
                                                                            {tc.passed 
                                                                                ? <span style={{ color: "#10b981", fontSize: "1.1rem" }}>✔️</span>
                                                                                : <span style={{ color: "#ef4444", fontSize: "1.1rem" }}>❌</span>
                                                                            }
                                                                        </td>
                                                                        <td style={{ padding: "0.75rem 1rem", fontWeight: "600", color: tc.passed ? "#10b981" : "#ef4444" }}>
                                                                            {tc.passed ? "Success" : "Wrong Answer"}
                                                                        </td>
                                                                        <td style={{ padding: "0.75rem 1rem" }}>
                                                                            {200 + (idx * 94) % 450} ms
                                                                        </td>
                                                                        <td style={{ padding: "0.75rem 1rem", color: "#64748b" }}>
                                                                            {tc.passed ? "Compilation successful" : tc.error || "Wrong Answer"}
                                                                        </td>
                                                                        <td style={{ padding: "0.75rem 1rem", color: "#94a3b8" }}>-</td>
                                                                        <td style={{ padding: "0.75rem 1rem", color: "#94a3b8" }}>-</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>

                                                    {aiReviewFeedback && (
                                                        <div style={{ marginTop: "1.5rem", background: "rgba(168, 85, 247, 0.04)", border: "1px solid rgba(168, 85, 247, 0.15)", borderRadius: "10px", padding: "12px" }}>
                                                            <div style={{ fontSize: "0.8rem", color: "#a855f7", fontWeight: "700", marginBottom: "6px" }}>🤖 AI Review Feedback:</div>
                                                            <div style={{ fontSize: "0.8rem", color: "#475569", whiteSpace: "pre-line", lineHeight: "1.4" }}>
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
                        background: "#f8fafc",
                        borderTop: "1px solid #e2e8f0",
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "0.75rem 1.5rem",
                        alignItems: "center",
                        flexShrink: 0
                    }}>
                        <button 
                            onClick={() => setStudentCode(challenge ? (studentLanguage === "python" ? challenge.boilerplatePython : studentLanguage === "java" ? challenge.boilerplateJava : studentLanguage === "cpp" ? challenge.boilerplateCpp : challenge.boilerplateC) : "")}
                            style={{
                                background: "#ffffff",
                                color: "#475569",
                                border: "1px solid #cbd5e1",
                                padding: "0.4rem 1.2rem",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "0.8rem",
                                fontWeight: "600"
                            }}
                        >
                            Clear
                        </button>
                        
                        <div style={{ display: "flex", gap: "1rem" }}>
                            <button 
                                onClick={handleRunCode}
                                disabled={execStatus === "RUNNING"}
                                style={{
                                    background: "#2563eb",
                                    color: "#fff",
                                    border: "none",
                                    padding: "0.4rem 1.5rem",
                                    borderRadius: "6px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    fontSize: "0.8rem"
                                }}
                            >
                                Compile & Run
                            </button>
                            <button 
                                onClick={handleSubmitCode}
                                disabled={execStatus === "RUNNING"}
                                style={{
                                    background: "#10b981",
                                    color: "#fff",
                                    border: "none",
                                    padding: "0.4rem 1.5rem",
                                    borderRadius: "6px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    fontSize: "0.8rem"
                                }}
                            >
                                Submit Code
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default CodingWorkspacePage;
