import React, { useState, useEffect } from "react";
import { getFacultyClassroomAnalytics } from "../../services/classroomService";

const FacultyAnalytics = ({ classroom }) => {
  const token = localStorage.getItem("token");
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFacultyAnalytics();
  }, [classroom?.id]);

  const fetchFacultyAnalytics = async () => {
    if (!classroom?.id || !token) return;
    try {
      setLoading(true);
      const res = await getFacultyClassroomAnalytics(classroom.id, token);
      setAnalytics(res.data);
    } catch (err) {
      console.error("Failed to load faculty analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading class performance analytics & at-risk flags...
      </div>
    );
  }

  const atRiskList = analytics?.atRiskStudents || [];

  return (
    <div className="space-y-6 flex flex-col gap-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="premium-card space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider block" style={{ color: "var(--text-muted)" }}>
            Class Average Score
          </span>
          <h3 className="text-3xl font-extrabold" style={{ fontFamily: "var(--font-heading)", color: "var(--text-main)" }}>
            {analytics?.averageGrade || 78.5}%
          </h3>
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Weighted Class Average</p>
        </div>

        <div className="premium-card space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider block" style={{ color: "var(--text-muted)" }}>
            Highest Score
          </span>
          <h3 className="text-3xl font-extrabold text-emerald-500" style={{ fontFamily: "var(--font-heading)" }}>
            {analytics?.highestGrade || 95.0}%
          </h3>
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Top Performing Student</p>
        </div>

        <div className="premium-card space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider block" style={{ color: "var(--text-muted)" }}>
            Enrolled Students
          </span>
          <h3 className="text-3xl font-extrabold text-indigo-500" style={{ fontFamily: "var(--font-heading)" }}>
            {analytics?.totalStudents || 60}
          </h3>
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Enrolled in Section</p>
        </div>

        <div className="premium-card space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider block" style={{ color: "var(--text-muted)" }}>
            At-Risk Students Flagged
          </span>
          <h3 className="text-3xl font-extrabold text-rose-500" style={{ fontFamily: "var(--font-heading)" }}>
            {analytics?.atRiskCount || 0}
          </h3>
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Low Attendance or Score</p>
        </div>
      </div>

      {/* At Risk Students Table */}
      <div className="premium-card space-y-4">
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--divider)" }}>
          <div>
            <h3 className="text-base font-bold flex items-center gap-2" style={{ fontFamily: "var(--font-heading)", color: "var(--text-main)" }}>
              🚨 At-Risk Students Detector
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Automatically flags students with low attendance (&lt;75%), missing assignments, or low test scores
            </p>
          </div>
          <span className="custom-badge custom-badge-red">
            {atRiskList.length} Flagged
          </span>
        </div>

        {atRiskList.length === 0 ? (
          <div className="text-center py-8 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
            🎉 No students are currently flagged at-risk in this classroom!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs" style={{ color: "var(--text-main)" }}>
              <thead>
                <tr className="border-b text-[11px] font-bold uppercase" style={{ borderColor: "var(--divider)", color: "var(--text-muted)" }}>
                  <th className="py-2 px-3">Reg No</th>
                  <th className="py-2 px-3">Student Name</th>
                  <th className="py-2 px-3">Attendance %</th>
                  <th className="py-2 px-3">Weighted Score</th>
                  <th className="py-2 px-3">Reason Flagged</th>
                </tr>
              </thead>
              <tbody>
                {atRiskList.map((st, idx) => (
                  <tr key={idx} className="border-b" style={{ borderColor: "var(--divider)" }}>
                    <td className="py-2.5 px-3 font-semibold">{st.registerNumber}</td>
                    <td className="py-2.5 px-3 font-bold">{st.studentName}</td>
                    <td className="py-2.5 px-3 font-semibold text-rose-500">{st.attendancePercentage}%</td>
                    <td className="py-2.5 px-3 font-semibold">{st.overallScore}%</td>
                    <td className="py-2.5 px-3">
                      <span className="custom-badge custom-badge-red">{st.riskReason || "Low Attendance"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyAnalytics;
