import React, { useState, useEffect, useRef } from "react";
import {
  getClassroomAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getAssignmentSubmissions,
  submitAssignment,
  gradeSubmission,
} from "../services/classroomService";

const ClassroomAssignments = ({ classroom, userRole }) => {
  const token = localStorage.getItem("token");
  const attachFileInputRef = useRef(null);
  const subFileInputRef = useRef(null);

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // Form State
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [attachMethod, setAttachMethod] = useState("FILE"); // "FILE" or "LINK"
  const [attachFile, setAttachFile] = useState(null);
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [dueDateStr, setDueDateStr] = useState("");
  const [maxMarks, setMaxMarks] = useState(100);
  const [allowLateSubmission, setAllowLateSubmission] = useState(true);

  // Student Submission Form
  const [subMethod, setSubMethod] = useState("FILE"); // "FILE" or "LINK"
  const [subFile, setSubFile] = useState(null);
  const [subUrl, setSubUrl] = useState("");
  const [subFileName, setSubFileName] = useState("");
  const [subText, setSubText] = useState("");

  // Submissions List
  const [submissionsList, setSubmissionsList] = useState([]);
  const [gradingSubId, setGradingSubId] = useState(null);
  const [marksInput, setMarksInput] = useState("");
  const [feedbackInput, setFeedbackInput] = useState("");

  useEffect(() => {
    fetchAssignments();
  }, [classroom?.id]);

  const fetchAssignments = async () => {
    const classId = classroom?.id;
    if (!classId || !token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await getClassroomAssignments(classId, token);
      setAssignments(res.data || []);
    } catch (err) {
      console.error("Failed to load assignments:", err);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditId(null);
    setTitle("");
    setInstructions("");
    setAttachmentUrl("");
    setAttachmentName("");
    const d = new Date();
    d.setDate(d.getDate() + 7);
    setDueDateStr(d.toISOString().slice(0, 16));
    setMaxMarks(100);
    setAllowLateSubmission(true);
    setShowCreateModal(true);
  };

  const handleOpenEdit = (a) => {
    setEditId(a.id);
    setTitle(a.title);
    setInstructions(a.instructions || "");
    setAttachmentUrl(a.attachmentUrl || "");
    setAttachmentName(a.attachmentName || "");
    setDueDateStr(a.dueDate ? a.dueDate.slice(0, 16) : "");
    setMaxMarks(a.maxMarks || 100);
    setAllowLateSubmission(a.allowLateSubmission);
    setShowCreateModal(true);
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !dueDateStr) return;

    try {
      const payload = {
        title,
        instructions,
        attachmentUrl,
        attachmentName: attachmentName.trim() ? attachmentName : "Reference File",
        dueDate: dueDateStr,
        maxMarks: Number(maxMarks),
        allowLateSubmission,
      };

      if (editId) {
        await updateAssignment(editId, payload, token);
      } else {
        await createAssignment(classroom.id, payload, token);
      }

      setShowCreateModal(false);
      fetchAssignments();
    } catch (err) {
      console.error("Failed to save assignment:", err);
      alert("Error saving assignment.");
    }
  };

  const handleDeleteAssignment = async (assignId) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) return;
    try {
      await deleteAssignment(assignId, token);
      fetchAssignments();
    } catch (err) {
      console.error("Failed to delete assignment:", err);
    }
  };

  const handleDownloadAttachment = (assign) => {
    if (!assign.attachmentUrl) return;
    if (assign.attachmentUrl.startsWith("data:")) {
      const a = document.createElement("a");
      a.href = assign.attachmentUrl;
      a.download = assign.attachmentName || `${assign.title}_attachment`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      window.open(assign.attachmentUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleOpenSubmit = (a) => {
    setSelectedAssignment(a);
    const existing = a.mySubmission;
    setSubUrl(existing?.submissionUrl || "");
    setSubFileName(existing?.submissionFileName || "");
    setSubText(existing?.submissionText || "");
    setShowSubmitModal(true);
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAssignment || (!subUrl.trim() && !subText.trim())) {
      alert("Please provide a file URL or text response.");
      return;
    }

    try {
      await submitAssignment(
        selectedAssignment.id,
        {
          submissionUrl: subUrl,
          submissionFileName: subFileName.trim() ? subFileName : "Submission File",
          submissionText: subText,
        },
        token
      );

      setShowSubmitModal(false);
      fetchAssignments();
    } catch (err) {
      console.error("Failed to submit assignment:", err);
      alert(err.response?.data?.message || "Error submitting assignment.");
    }
  };

  const handleOpenSubmissions = async (a) => {
    setSelectedAssignment(a);
    try {
      const res = await getAssignmentSubmissions(a.id, token);
      setSubmissionsList(res.data || []);
      setShowSubmissionsModal(true);
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
    }
  };

  const handleSaveGrade = async (subId) => {
    if (!marksInput) return;
    try {
      await gradeSubmission(
        subId,
        {
          marksObtained: Number(marksInput),
          feedbackComment: feedbackInput,
        },
        token
      );
      setGradingSubId(null);
      setMarksInput("");
      setFeedbackInput("");
      const res = await getAssignmentSubmissions(selectedAssignment.id, token);
      setSubmissionsList(res.data || []);
      fetchAssignments();
    } catch (err) {
      console.error("Failed to grade submission:", err);
      alert("Error grading submission.");
    }
  };

  const getStatusBadge = (assignment) => {
    const sub = assignment.mySubmission;
    if (sub) {
      if (sub.status === "GRADED") {
        return (
          <span className="custom-badge custom-badge-indigo">
            ⭐ Graded: {sub.marksObtained} / {assignment.maxMarks}
          </span>
        );
      }
      if (sub.status === "LATE") {
        return (
          <span className="custom-badge custom-badge-amber">
            ⚠️ Turned In (Late)
          </span>
        );
      }
      return (
        <span className="custom-badge custom-badge-green">
          ✅ Turned In
        </span>
      );
    }

    const isPastDue = assignment.dueDate && new Date() > new Date(assignment.dueDate);
    if (isPastDue) {
      return (
        <span className="custom-badge custom-badge-red">
          ❌ Missing / Past Due
        </span>
      );
    }

    return (
      <span className="custom-badge custom-badge-blue">
        📌 Assigned
      </span>
    );
  };

  return (
    <div className="space-y-6 flex flex-col gap-6">
      {/* Header Bar */}
      <div className="premium-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ fontFamily: "var(--font-heading)", color: "var(--text-main)" }}>
            📝 Course Assignments
          </h2>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Track deadlines, submit coursework, and view faculty marks & feedback for {classroom?.subjectName}
          </p>
        </div>

        {(userRole === "FACULTY" || userRole === "ADMIN") && (
          <button
            onClick={handleOpenCreate}
            style={{
              padding: "0.6rem 1.2rem",
              background: "#4f46e5",
              color: "#ffffff",
              borderRadius: "10px",
              fontWeight: "600",
              fontSize: "0.85rem",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)"
            }}
          >
            <i className="fa-solid fa-plus" />
            <span>Create Assignment</span>
          </button>
        )}
      </div>

      {/* Assignment List */}
      {loading ? (
        <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading course assignments...
        </div>
      ) : assignments.length === 0 ? (
        <div className="premium-card text-center py-16 space-y-2">
          <i className="fa-solid fa-clipboard-list text-3xl text-indigo-500 mb-2 block" />
          <h3 className="text-base font-bold" style={{ color: "var(--text-main)" }}>No Assignments Published</h3>
          <p className="text-xs max-w-sm mx-auto" style={{ color: "var(--text-muted)" }}>
            Faculty members will publish coursework, lab reports, and term projects here.
          </p>
        </div>
      ) : (
        <div className="space-y-4 flex flex-col gap-4">
          {assignments.map((assign) => (
            <div key={assign.id} className="premium-card flex flex-col md:flex-row justify-between gap-6">
              {/* Left Side: Details */}
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {getStatusBadge(assign)}
                  <span className="custom-badge custom-badge-gray">
                    Max Marks: {assign.maxMarks}
                  </span>
                  {assign.dueDate && (
                    <span className="custom-badge custom-badge-amber">
                      📅 Due: {new Date(assign.dueDate).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--text-main)" }}>
                  {assign.title}
                </h3>

                {assign.instructions && (
                  <p className="text-xs whitespace-pre-line leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    {assign.instructions}
                  </p>
                )}

                {assign.attachmentUrl && (
                  <div className="pt-2">
                    <button
                      onClick={() => handleDownloadAttachment(assign)}
                      className="custom-badge custom-badge-blue"
                      style={{ border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                    >
                      📎 {assign.attachmentName || "Attachment Resource"} ↗
                    </button>
                  </div>
                )}
              </div>

              {/* Right Side: Actions */}
              <div className="flex flex-col justify-between items-end gap-3 min-w-[180px]">
                {(userRole === "FACULTY" || userRole === "ADMIN") ? (
                  <div className="space-y-2 w-full text-right">
                    <button
                      onClick={() => handleOpenSubmissions(assign)}
                      style={{
                        width: "100%",
                        padding: "0.5rem 1rem",
                        background: "#4f46e5",
                        color: "#ffffff",
                        borderRadius: "8px",
                        fontWeight: "600",
                        fontSize: "0.8rem",
                        border: "none",
                        cursor: "pointer"
                      }}
                    >
                      View Submissions ({assign.submissionCount || 0})
                    </button>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(assign)}
                        className="custom-badge custom-badge-indigo"
                        style={{ cursor: "pointer" }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAssignment(assign.id)}
                        className="custom-badge custom-badge-red"
                        style={{ cursor: "pointer" }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full text-right space-y-2">
                    <button
                      onClick={() => handleOpenSubmit(assign)}
                      style={{
                        width: "100%",
                        padding: "0.55rem 1.25rem",
                        background: assign.mySubmission ? "#10b981" : "#4f46e5",
                        color: "#ffffff",
                        borderRadius: "8px",
                        fontWeight: "600",
                        fontSize: "0.85rem",
                        border: "none",
                        cursor: "pointer"
                      }}
                    >
                      {assign.mySubmission ? "Edit / Re-submit Deliverable" : "Turn In Deliverable →"}
                    </button>

                    {assign.mySubmission?.feedbackComment && (
                      <div className="p-2.5 rounded-lg text-[11px] text-left space-y-1" style={{ background: "var(--box-bg)", border: "1px solid var(--box-border)" }}>
                        <span className="font-bold text-amber-500">Faculty Feedback:</span>
                        <p style={{ color: "var(--text-main)" }}>{assign.mySubmission.feedbackComment}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create / Edit Assignment */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="premium-card max-w-lg w-full p-6 space-y-4 shadow-2xl" style={{ background: "var(--bg-card)" }}>
            <h3 className="text-lg font-bold" style={{ color: "var(--text-main)" }}>
              {editId ? "Edit Assignment" : "Publish New Assignment"}
            </h3>

            <form onSubmit={handleCreateOrUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
                  Assignment Title
                </label>
                <div className="search-container-input" style={{ maxWidth: "100%" }}>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lab Report 1: Socket Programming"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ paddingLeft: "1rem" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
                  Detailed Instructions
                </label>
                <textarea
                  rows={4}
                  placeholder="Instructions for students..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    backgroundColor: "var(--input-bg)",
                    border: "1px solid var(--input-border)",
                    borderRadius: "10px",
                    color: "var(--text-main)",
                    fontSize: "0.85rem",
                    outline: "none"
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
                    Due Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={dueDateStr}
                    onChange={(e) => setDueDateStr(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.6rem 0.8rem",
                      backgroundColor: "var(--input-bg)",
                      border: "1px solid var(--input-border)",
                      borderRadius: "10px",
                      color: "var(--text-main)",
                      fontSize: "0.85rem",
                      outline: "none"
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
                    Maximum Marks
                  </label>
                  <div className="search-container-input" style={{ maxWidth: "100%" }}>
                    <input
                      type="number"
                      required
                      min={1}
                      value={maxMarks}
                      onChange={(e) => setMaxMarks(e.target.value)}
                      style={{ paddingLeft: "1rem" }}
                    />
                  </div>
                </div>
              </div>

              {/* Mode Switcher for Attachment */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  Assignment Question Paper / Brief Attachment (Optional)
                </label>
                <div className="flex items-center gap-2 p-1 rounded-xl" style={{ background: "var(--bg-secondary)", border: "1px solid var(--card-border)" }}>
                  <button
                    type="button"
                    onClick={() => setAttachMethod("FILE")}
                    style={{
                      flex: 1,
                      padding: "0.4rem 0.8rem",
                      borderRadius: "6px",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      border: "none",
                      cursor: "pointer",
                      background: attachMethod === "FILE" ? "#4f46e5" : "transparent",
                      color: attachMethod === "FILE" ? "#ffffff" : "var(--text-muted)",
                    }}
                  >
                    📁 Upload Document (PDF / Word)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttachMethod("LINK")}
                    style={{
                      flex: 1,
                      padding: "0.4rem 0.8rem",
                      borderRadius: "6px",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      border: "none",
                      cursor: "pointer",
                      background: attachMethod === "LINK" ? "#4f46e5" : "transparent",
                      color: attachMethod === "LINK" ? "#ffffff" : "var(--text-muted)",
                    }}
                  >
                    🔗 Cloud Link
                  </button>
                </div>

                {attachMethod === "FILE" ? (
                  <div>
                    <input
                      ref={attachFileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.txt"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setAttachFile(file);
                          setAttachmentName(file.name);
                          const reader = new FileReader();
                          reader.onload = (ev) => setAttachmentUrl(ev.target.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{ display: "none" }}
                    />
                    <div
                      onClick={() => attachFileInputRef.current?.click()}
                      style={{
                        border: "2px dashed var(--card-border)",
                        borderRadius: "10px",
                        padding: "1rem",
                        textAlign: "center",
                        background: "var(--bg-secondary)",
                        cursor: "pointer",
                      }}
                    >
                      {attachFile ? (
                        <div className="text-xs font-bold text-emerald-400">
                          📄 {attachFile.name} (Click to change)
                        </div>
                      ) : (
                        <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                          📁 Click to upload PDF, Word Doc, or ZIP attachment
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="search-container-input" style={{ maxWidth: "100%" }}>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/..."
                      value={attachmentUrl}
                      onChange={(e) => setAttachmentUrl(e.target.value)}
                      style={{ paddingLeft: "1rem" }}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t" style={{ borderColor: "var(--divider)" }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: "0.5rem 1rem",
                    background: "transparent",
                    color: "var(--text-muted)",
                    borderRadius: "8px",
                    border: "1px solid var(--card-border)",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "0.5rem 1.25rem",
                    background: "#4f46e5",
                    color: "#ffffff",
                    borderRadius: "8px",
                    border: "none",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  {editId ? "Save Changes" : "Publish Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Student Turn-in Deliverable */}
      {showSubmitModal && selectedAssignment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="premium-card max-w-lg w-full p-6 space-y-4 shadow-2xl" style={{ background: "var(--bg-card)" }}>
            <h3 className="text-lg font-bold" style={{ color: "var(--text-main)" }}>
              Turn In: {selectedAssignment.title}
            </h3>

            {/* Mode Switcher for Student Submission */}
            <div className="flex items-center gap-2 p-1 rounded-xl" style={{ background: "var(--bg-secondary)", border: "1px solid var(--card-border)" }}>
              <button
                type="button"
                onClick={() => setSubMethod("FILE")}
                style={{
                  flex: 1,
                  padding: "0.4rem 0.8rem",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  border: "none",
                  cursor: "pointer",
                  background: subMethod === "FILE" ? "#10b981" : "transparent",
                  color: subMethod === "FILE" ? "#ffffff" : "var(--text-muted)",
                }}
              >
                📁 Upload Deliverable File
              </button>
              <button
                type="button"
                onClick={() => setSubMethod("LINK")}
                style={{
                  flex: 1,
                  padding: "0.4rem 0.8rem",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  border: "none",
                  cursor: "pointer",
                  background: subMethod === "LINK" ? "#10b981" : "transparent",
                  color: subMethod === "LINK" ? "#ffffff" : "var(--text-muted)",
                }}
              >
                🔗 Cloud / Git Link
              </button>
            </div>

            <form onSubmit={handleStudentSubmit} className="space-y-4">
              {subMethod === "FILE" ? (
                <div>
                  <input
                    ref={subFileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.txt,.ipynb,.java,.py,.cpp"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setSubFile(file);
                        setSubFileName(file.name);
                        const reader = new FileReader();
                        reader.onload = (ev) => setSubUrl(ev.target.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{ display: "none" }}
                  />
                  <div
                    onClick={() => subFileInputRef.current?.click()}
                    style={{
                      border: "2px dashed var(--card-border)",
                      borderRadius: "10px",
                      padding: "1.25rem",
                      textAlign: "center",
                      background: "var(--bg-secondary)",
                      cursor: "pointer",
                    }}
                  >
                    {subFile ? (
                      <div className="text-xs font-bold text-emerald-400">
                        📄 {subFile.name} (Click to change)
                      </div>
                    ) : (
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                        📁 Click to choose PDF, Word, ZIP, or Code file to submit
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
                    Submission File / Drive URL
                  </label>
                  <div className="search-container-input" style={{ maxWidth: "100%" }}>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/file/d/..."
                      value={subUrl}
                      onChange={(e) => setSubUrl(e.target.value)}
                      style={{ paddingLeft: "1rem" }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
                  Text Response / Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Type your submission text or comments for faculty..."
                  value={subText}
                  onChange={(e) => setSubText(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    backgroundColor: "var(--input-bg)",
                    border: "1px solid var(--input-border)",
                    borderRadius: "10px",
                    color: "var(--text-main)",
                    fontSize: "0.85rem",
                    outline: "none"
                  }}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t" style={{ borderColor: "var(--divider)" }}>
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  style={{
                    padding: "0.5rem 1rem",
                    background: "transparent",
                    color: "var(--text-muted)",
                    borderRadius: "8px",
                    border: "1px solid var(--card-border)",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "0.5rem 1.25rem",
                    background: "#10b981",
                    color: "#ffffff",
                    borderRadius: "8px",
                    border: "none",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  Submit Deliverable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Faculty Submissions & Grading Roster */}
      {showSubmissionsModal && selectedAssignment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="premium-card max-w-3xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col" style={{ background: "var(--bg-card)" }}>
            <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: "var(--divider)" }}>
              <div>
                <h3 className="text-lg font-bold" style={{ color: "var(--text-main)" }}>
                  Submissions Roster: {selectedAssignment.title}
                </h3>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Max Marks: {selectedAssignment.maxMarks} · Total Submissions: {submissionsList.length}
                </p>
              </div>
              <button
                onClick={() => setShowSubmissionsModal(false)}
                className="custom-badge custom-badge-gray"
                style={{ cursor: "pointer" }}
              >
                ✕ Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
              {submissionsList.length === 0 ? (
                <p className="text-center py-10 text-xs" style={{ color: "var(--text-muted)" }}>
                  No student submissions received yet.
                </p>
              ) : (
                submissionsList.map((sub) => (
                  <div key={sub.id} className="p-4 rounded-xl space-y-2 border" style={{ background: "var(--box-bg)", borderColor: "var(--box-border)" }}>
                    <div className="flex justify-between items-center">
                      <div>
                        <strong className="text-sm font-bold block" style={{ color: "var(--text-main)" }}>
                          {sub.studentName} ({sub.registerNumber})
                        </strong>
                        <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                          Submitted: {new Date(sub.submittedAt).toLocaleString()}
                        </span>
                      </div>
                      <span className={`custom-badge ${sub.status === "GRADED" ? "custom-badge-purple" : sub.status === "LATE" ? "custom-badge-amber" : "custom-badge-green"}`}>
                        {sub.status} {sub.status === "GRADED" && `(${sub.marksObtained}/${selectedAssignment.maxMarks})`}
                      </span>
                    </div>

                    {sub.submissionUrl && (
                      <p className="text-xs">
                        <a href={sub.submissionUrl} target="_blank" rel="noopener noreferrer" className="custom-badge custom-badge-blue" style={{ textDecoration: "none" }}>
                          📎 View File Submission ↗
                        </a>
                      </p>
                    )}

                    {sub.submissionText && (
                      <p className="text-xs p-2 rounded-lg" style={{ background: "var(--input-bg)", color: "var(--text-main)" }}>
                        {sub.submissionText}
                      </p>
                    )}

                    {/* Inline Grading Form */}
                    {gradingSubId === sub.id ? (
                      <div className="pt-2 border-t space-y-2" style={{ borderColor: "var(--divider)" }}>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="Marks"
                            max={selectedAssignment.maxMarks}
                            value={marksInput}
                            onChange={(e) => setMarksInput(e.target.value)}
                            style={{ width: "100px", padding: "0.4rem 0.6rem", fontSize: "0.8rem", borderRadius: "6px", backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--text-main)" }}
                          />
                          <input
                            type="text"
                            placeholder="Feedback comments..."
                            value={feedbackInput}
                            onChange={(e) => setFeedbackInput(e.target.value)}
                            style={{ flex: 1, padding: "0.4rem 0.6rem", fontSize: "0.8rem", borderRadius: "6px", backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--text-main)" }}
                          />
                          <button
                            onClick={() => handleSaveGrade(sub.id)}
                            style={{ padding: "0.4rem 0.8rem", background: "#10b981", color: "#fff", borderRadius: "6px", border: "none", fontSize: "0.8rem", fontWeight: "600" }}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-1 flex justify-end">
                        <button
                          onClick={() => {
                            setGradingSubId(sub.id);
                            setMarksInput(sub.marksObtained !== null ? sub.marksObtained : "");
                            setFeedbackInput(sub.feedbackComment || "");
                          }}
                          className="custom-badge custom-badge-indigo"
                          style={{ cursor: "pointer" }}
                        >
                          ✏️ {sub.status === "GRADED" ? "Edit Grade" : "Grade Submission"}
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassroomAssignments;
