import React, { useState, useEffect } from "react";
import { submitLeaveRequest, getMyLeaveRequests } from "../../services/leaveService";

function LeavePage() {
  const token = localStorage.getItem("token");
  const [myLeaveRequests, setMyLeaveRequests] = useState([]);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ type: "OD", fromDate: "", toDate: "", reason: "" });
  const [feedback, setFeedback] = useState({ message: "", type: "" });

  const showFeedback = (message, type = "success") => {
    setFeedback({ message, type });
    setTimeout(() => {
      setFeedback({ message: "", type: "" });
    }, 4000);
  };

  const fetchMyLeaveRequests = async () => {
    if (!token) return;
    setLeaveLoading(true);
    try {
      const res = await getMyLeaveRequests(token);
      setMyLeaveRequests(res.data || []);
    } catch (err) {
      console.error("Error fetching leave requests:", err);
    } finally {
      setLeaveLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLeaveRequests();
  }, [token]);

  const handleLeaveFormChange = (field, value) => {
    setLeaveForm(prev => ({ ...prev, [field]: value }));
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    if (!leaveForm.fromDate || !leaveForm.toDate) {
      showFeedback("From date and To date are required.", "error");
      return;
    }
    if (leaveForm.fromDate > leaveForm.toDate) {
      showFeedback("From date cannot be after To date.", "error");
      return;
    }
    setLeaveSubmitting(true);
    try {
      await submitLeaveRequest({
        type: leaveForm.type,
        fromDate: leaveForm.fromDate,
        toDate: leaveForm.toDate,
        reason: leaveForm.reason
      }, token);
      showFeedback("Leave request submitted successfully!");
      setLeaveForm({ type: "OD", fromDate: "", toDate: "", reason: "" });
      fetchMyLeaveRequests();
    } catch (err) {
      showFeedback(err.response?.data || "Failed to submit leave request.", "error");
    } finally {
      setLeaveSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-4xl mx-auto">
      {feedback.message && (
        <div style={{
          background: feedback.type === "error" ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)",
          border: `1px solid ${feedback.type === "error" ? "var(--error)" : "var(--success)"}`,
          color: feedback.type === "error" ? "var(--error)" : "var(--success)",
          borderRadius: "10px", padding: "1rem", fontWeight: "500", animation: "fadeIn 0.3s ease"
        }}>
          {feedback.message}
        </div>
      )}

      <div className="glass-card p-6 rounded-2xl">
        <h2 className="text-xl font-bold text-white mb-4">Apply for Leave / OD</h2>
        <form onSubmit={handleLeaveSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="text-slate-400 text-sm font-medium">Leave Type</label>
              <select 
                value={leaveForm.type} 
                onChange={(e) => handleLeaveFormChange("type", e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-purple-500"
              >
                <option value="OD">On Duty (OD)</option>
                <option value="MEDICAL">Medical Leave</option>
                <option value="CASUAL">Casual Leave</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="text-slate-400 text-sm font-medium">From Date</label>
              <input 
                type="date" 
                value={leaveForm.fromDate}
                onChange={(e) => handleLeaveFormChange("fromDate", e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-purple-500"
                required
              />
            </div>
            <div className="form-group">
              <label className="text-slate-400 text-sm font-medium">To Date</label>
              <input 
                type="date" 
                value={leaveForm.toDate}
                onChange={(e) => handleLeaveFormChange("toDate", e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-purple-500"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="text-slate-400 text-sm font-medium">Reason</label>
            <textarea 
              value={leaveForm.reason}
              onChange={(e) => handleLeaveFormChange("reason", e.target.value)}
              placeholder="State your reason briefly..."
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-purple-500 min-h-[100px]"
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={leaveSubmitting}
            className="w-full md:w-auto px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
          >
            {leaveSubmitting ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>

      <div className="glass-card p-6 rounded-2xl">
        <h2 className="text-xl font-bold text-white mb-4">My Requests History</h2>
        {leaveLoading ? (
          <p className="text-slate-400">Loading history...</p>
        ) : myLeaveRequests.length === 0 ? (
          <p className="text-slate-400">No leave requests found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 text-sm">
                  <th className="pb-3 pr-4 font-medium">Type</th>
                  <th className="pb-3 pr-4 font-medium">Duration</th>
                  <th className="pb-3 pr-4 font-medium">Reason</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {myLeaveRequests.map(req => (
                  <tr key={req.id} className="text-slate-300">
                    <td className="py-4 pr-4"><span className="bg-slate-800 px-2 py-1 rounded text-xs font-semibold tracking-wide">{req.type}</span></td>
                    <td className="py-4 pr-4 text-sm">{req.fromDate} to {req.toDate}</td>
                    <td className="py-4 pr-4 text-sm max-w-xs truncate" title={req.reason}>{req.reason}</td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${req.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400' : req.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {req.status}
                      </span>
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
}

export default LeavePage;
