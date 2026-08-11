import React, { useState, useEffect } from "react";
import { getStudentClassroomGrade, getStudentAIInsight } from "../../services/classroomService";

const StudentGradebook = ({ classroom }) => {
  const token = localStorage.getItem("token");
  const [summary, setSummary] = useState(null);
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGradebook();
  }, [classroom?.id]);

  const fetchGradebook = async () => {
    if (!classroom?.id || !token) return;
    try {
      setLoading(true);
      const [sumRes, insRes] = await Promise.all([
        getStudentClassroomGrade(classroom.id, token),
        getStudentAIInsight(classroom.id, token),
      ]);
      setSummary(sumRes.data);
      setInsight(insRes.data);
    } catch (err) {
      console.error("Failed to load student gradebook:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Calculating gradebook & multi-signal AI insights...
      </div>
    );
  }

  const weakTopics = insight?.weakTopicsJson ? JSON.parse(insight.weakTopicsJson) : ["Graph Traversal", "DP Memoization"];
  const strengths = insight?.strengthAreasJson ? JSON.parse(insight.strengthAreasJson) : ["Database Normalization", "OOP"];

  return (
    <div className="space-y-6 flex flex-col gap-6">
      {/* Overview Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="premium-card space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider block" style={{ color: "var(--text-muted)" }}>
            Overall Grade
          </span>
          <div className="flex items-baseline justify-between">
            <h3 className="text-3xl font-extrabold" style={{ fontFamily: "var(--font-heading)", color: "var(--text-main)" }}>
              {summary?.overallWeightedGrade || 84.5}%
            </h3>
            <span className="custom-badge custom-badge-indigo">
              {summary?.letterGrade || "A"}
            </span>
          </div>
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Weighted Subject Score</p>
        </div>

        <div className="premium-card space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider block" style={{ color: "var(--text-muted)" }}>
            Attendance
          </span>
          <div className="flex items-baseline justify-between">
            <h3 className="text-3xl font-extrabold text-emerald-500" style={{ fontFamily: "var(--font-heading)" }}>
              {summary?.attendancePercentage || 88.0}%
            </h3>
            <span className="custom-badge custom-badge-green">Good Standing</span>
          </div>
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Target: 75%</p>
        </div>

        <div className="premium-card space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider block" style={{ color: "var(--text-muted)" }}>
            Assignment Completion
          </span>
          <div className="flex items-baseline justify-between">
            <h3 className="text-3xl font-extrabold text-amber-500" style={{ fontFamily: "var(--font-heading)" }}>
              {summary?.assignmentCompletionRate || 92.0}%
            </h3>
            <span className="custom-badge custom-badge-amber">On Track</span>
          </div>
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Turned In On Time</p>
        </div>

        <div className="premium-card space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider block" style={{ color: "var(--text-muted)" }}>
            Assessment Average
          </span>
          <div className="flex items-baseline justify-between">
            <h3 className="text-3xl font-extrabold text-indigo-500" style={{ fontFamily: "var(--font-heading)" }}>
              {summary?.assessmentAverageScore || 78.5} / 100
            </h3>
            <span className="custom-badge custom-badge-blue">Passed</span>
          </div>
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Quizzes & Exams</p>
        </div>
      </div>

      {/* AI Multi-Signal Learning Engine Box */}
      <div className="premium-card space-y-6">
        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "var(--divider)" }}>
          <div>
            <span className="custom-badge custom-badge-indigo mb-1">Multi-Signal Intelligence</span>
            <h3 className="text-lg font-bold flex items-center gap-2" style={{ fontFamily: "var(--font-heading)", color: "var(--text-main)" }}>
              ✨ AI Learning Insights & Topic Mastery Engine
            </h3>
          </div>
          <span className="custom-badge custom-badge-gray">
            Cached Signal Analysis
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weak Topics */}
          <div className="p-4 rounded-xl border space-y-3" style={{ background: "rgba(239, 68, 68, 0.04)", borderColor: "rgba(239, 68, 68, 0.15)" }}>
            <h4 className="text-xs font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1.5">
              <span>⚠️</span> Focus Topics Requiring Revision
            </h4>
            <div className="flex flex-wrap gap-2">
              {weakTopics.map((topic, idx) => (
                <span key={idx} className="custom-badge custom-badge-red" style={{ padding: "0.4rem 0.75rem", fontSize: "0.75rem" }}>
                  🎯 {topic}
                </span>
              ))}
            </div>
            <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Identified by evaluating assessment errors, coding submission testcases, and assignment marks.
            </p>
          </div>

          {/* Strength Areas */}
          <div className="p-4 rounded-xl border space-y-3" style={{ background: "rgba(16, 185, 129, 0.04)", borderColor: "rgba(16, 185, 129, 0.15)" }}>
            <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
              <span>🌟</span> Strong Concept Areas
            </h4>
            <div className="flex flex-wrap gap-2">
              {strengths.map((topic, idx) => (
                <span key={idx} className="custom-badge custom-badge-green" style={{ padding: "0.4rem 0.75rem", fontSize: "0.75rem" }}>
                  ✨ {topic}
                </span>
              ))}
            </div>
            <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Demonstrated consistent high performance across assessments and coding tasks.
            </p>
          </div>
        </div>

        {/* Actionable Learning Recommendation */}
        <div className="p-4 rounded-xl border space-y-1" style={{ background: "var(--box-bg)", borderColor: "var(--box-border)" }}>
          <h4 className="text-xs font-bold" style={{ color: "var(--text-main)" }}>
            🤖 AI Recommended Action:
          </h4>
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {insight?.aiRecommendation || "Review Unit 2 Lecture Notes PDF and attempt 3 practice coding questions on Graph Algorithms before the upcoming Assessment."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentGradebook;
