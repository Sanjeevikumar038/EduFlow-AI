import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getLectureTimeline,
  createLectureHistory,
  updateLectureTopic,
  generateAILectureSummary,
} from "../services/classroomService";

const ClassroomLectureHistory = ({ classroom, userRole }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & Drawers
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Form - Create / Edit Lecture
  const [topicTitle, setTopicTitle] = useState("");
  const [topicDescription, setTopicDescription] = useState("");
  const [learningObjectives, setLearningObjectives] = useState("");
  const [lectureDate, setLectureDate] = useState(new Date().toISOString().slice(0, 10));

  // AI Gen state
  const [aiGeneratingId, setAiGeneratingId] = useState(null);

  useEffect(() => {
    fetchTimeline();
  }, [classroom?.id]);

  const fetchTimeline = async () => {
    if (!classroom?.id || !token) return;
    try {
      setLoading(true);
      const res = await getLectureTimeline(classroom.id, token);
      setLectures(res.data || []);
    } catch (err) {
      console.error("Failed to load lecture timeline:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLecture = async (e) => {
    e.preventDefault();
    if (!topicTitle.trim()) return;

    try {
      await createLectureHistory(
        classroom.id,
        {
          topicTitle,
          topicDescription,
          learningObjectives,
          lectureDate,
        },
        token
      );

      setShowCreateModal(false);
      setTopicTitle("");
      setTopicDescription("");
      setLearningObjectives("");
      fetchTimeline();
    } catch (err) {
      console.error("Failed to create lecture record:", err);
      alert("Error logging lecture session.");
    }
  };

  const handleGenerateSummary = async (lectureId) => {
    try {
      setAiGeneratingId(lectureId);
      const res = await generateAILectureSummary(lectureId, token);

      if (selectedLecture?.id === lectureId) {
        setSelectedLecture(res.data);
      }
      fetchTimeline();
      alert("AI Summary and Viva Questions generated successfully!");
    } catch (err) {
      console.error("Error generating AI summary:", err);
      alert("Failed to generate AI summary.");
    } finally {
      setAiGeneratingId(null);
    }
  };

  return (
    <div className="space-y-6 flex flex-col gap-6">
      {/* Header Bar */}
      <div className="premium-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ fontFamily: "var(--font-heading)", color: "var(--text-main)" }}>
            📜 Academic Lecture Timeline
          </h2>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Chronological academic logs of conducted lectures, attendance links, and AI lecture summaries for {classroom?.subjectName}
          </p>
        </div>

        {(userRole === "FACULTY" || userRole === "ADMIN") && (
          <button
            onClick={() => setShowCreateModal(true)}
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
            <span>Log Lecture Session</span>
          </button>
        )}
      </div>

      {/* Lecture Timeline Stream */}
      {loading ? (
        <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading lecture timeline...
        </div>
      ) : lectures.length === 0 ? (
        <div className="premium-card text-center py-16 space-y-2">
          <i className="fa-solid fa-timeline text-3xl text-indigo-500 mb-2 block" />
          <h3 className="text-base font-bold" style={{ color: "var(--text-main)" }}>No Lecture Sessions Logged Yet</h3>
          <p className="text-xs max-w-sm mx-auto" style={{ color: "var(--text-muted)" }}>
            Automated session logs will appear whenever faculty conducts attendance or records a lecture topic.
          </p>
        </div>
      ) : (
        <div className="space-y-4 flex flex-col gap-4 relative pl-4 border-l-2" style={{ borderColor: "rgba(99, 102, 241, 0.2)" }}>
          {lectures.map((lec) => (
            <div key={lec.id} className="premium-card relative space-y-3">
              {/* Node Marker */}
              <div
                className="absolute -left-[31px] top-6 w-5 h-5 rounded-full border-4 flex items-center justify-center"
                style={{ background: "#4f46e5", borderColor: "var(--bg-primary)" }}
              />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="custom-badge custom-badge-indigo">
                    📅 {lec.lectureDate}
                  </span>
                  <span className="custom-badge custom-badge-gray">
                    Session #{lec.id}
                  </span>
                </div>

                <button
                  onClick={() => handleGenerateSummary(lec.id)}
                  disabled={aiGeneratingId === lec.id}
                  className="custom-badge custom-badge-purple"
                  style={{ cursor: "pointer" }}
                >
                  {aiGeneratingId === lec.id ? "🤖 Generating AI Summary..." : "🤖 Generate AI Summary"}
                </button>
              </div>

              <div>
                <h3 className="text-base font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--text-main)" }}>
                  {lec.topicTitle || "Class Lecture Session"}
                </h3>
                {lec.topicDescription && (
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    {lec.topicDescription}
                  </p>
                )}
              </div>

              {lec.aiSummary && (
                <div className="p-3 rounded-xl text-xs space-y-1" style={{ background: "var(--box-bg)", border: "1px solid var(--box-border)" }}>
                  <span className="font-bold text-purple-500 flex items-center gap-1.5">
                    ✨ AI Academic Summary:
                  </span>
                  <p style={{ color: "var(--text-main)" }} className="leading-relaxed">
                    {lec.aiSummary}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Lecture Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="premium-card max-w-lg w-full p-6 space-y-4 shadow-2xl" style={{ background: "var(--bg-card)" }}>
            <h3 className="text-lg font-bold" style={{ color: "var(--text-main)" }}>
              Log Lecture Session
            </h3>

            <form onSubmit={handleCreateLecture} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
                  Lecture Topic / Title
                </label>
                <div className="search-container-input" style={{ maxWidth: "100%" }}>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Unit 2: Sliding Window Protocol"
                    value={topicTitle}
                    onChange={(e) => setTopicTitle(e.target.value)}
                    style={{ paddingLeft: "1rem" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
                  Lecture Date
                </label>
                <input
                  type="date"
                  required
                  value={lectureDate}
                  onChange={(e) => setLectureDate(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.8rem",
                    backgroundColor: "var(--input-bg)",
                    border: "1px solid var(--input-border)",
                    borderRadius: "10px",
                    color: "var(--text-main)",
                    fontSize: "0.85rem"
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
                  Topic Description & Covered Sub-modules
                </label>
                <textarea
                  rows={4}
                  placeholder="Summary of concepts explained in class..."
                  value={topicDescription}
                  onChange={(e) => setTopicDescription(e.target.value)}
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
                  Save Session Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassroomLectureHistory;
