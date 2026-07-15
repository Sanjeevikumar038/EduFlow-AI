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
    <div style={{
      maxWidth: "900px",
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: "24px",
      animation: "fadeIn 0.3s ease-out"
    }}>
      {feedback.message && (
        <div style={{
          background: feedback.type === "error" ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)",
          border: `1px solid ${feedback.type === "error" ? "var(--error)" : "var(--success)"}`,
          color: feedback.type === "error" ? "var(--error)" : "var(--success)",
          borderRadius: "12px",
          padding: "16px 24px",
          fontWeight: "600",
          fontSize: "0.88rem"
        }}>
          {feedback.message}
        </div>
      )}

      {/* Leave Application Card */}
      <div className="glass-card" style={{
        padding: "24px",
        borderRadius: "16px",
        border: "1px solid var(--card-border)",
        background: "var(--bg-secondary)",
        display: "flex",
        flexDirection: "column",
        gap: "16px"
      }}>
        <h2 style={{
          margin: 0,
          fontSize: "1.25rem",
          fontWeight: "800",
          color: "var(--text-main)",
          borderBottom: "1px solid var(--card-border)",
          paddingBottom: "12px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <span><i className="fa-solid fa-file-invoice" style={{ color: "var(--primary)" }}></i></span> Apply for Leave / OD
        </h2>
        
        <form onSubmit={handleLeaveSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>
                Leave Type
              </label>
              <select 
                value={leaveForm.type} 
                onChange={(e) => handleLeaveFormChange("type", e.target.value)}
                style={{
                  width: "100%",
                  background: "var(--input-bg)",
                  border: "1px solid var(--input-border)",
                  borderRadius: "10px",
                  padding: "0.75rem 1rem",
                  color: "var(--text-main)",
                  outline: "none",
                  fontSize: "0.9rem",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
                onBlur={(e) => e.target.style.borderColor = "var(--input-border)"}
              >
                <option value="OD">On Duty (OD)</option>
                <option value="MEDICAL">Medical Leave</option>
                <option value="CASUAL">Casual Leave</option>
              </select>
            </div>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>
                From Date
              </label>
              <input 
                type="date" 
                value={leaveForm.fromDate}
                onChange={(e) => handleLeaveFormChange("fromDate", e.target.value)}
                style={{
                  width: "100%",
                  background: "var(--input-bg)",
                  border: "1px solid var(--input-border)",
                  borderRadius: "10px",
                  padding: "0.75rem 1rem",
                  color: "var(--text-main)",
                  outline: "none",
                  fontSize: "0.9rem",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
                onBlur={(e) => e.target.style.borderColor = "var(--input-border)"}
                required
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>
                To Date
              </label>
              <input 
                type="date" 
                value={leaveForm.toDate}
                onChange={(e) => handleLeaveFormChange("toDate", e.target.value)}
                style={{
                  width: "100%",
                  background: "var(--input-bg)",
                  border: "1px solid var(--input-border)",
                  borderRadius: "10px",
                  padding: "0.75rem 1rem",
                  color: "var(--text-main)",
                  outline: "none",
                  fontSize: "0.9rem",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
                onBlur={(e) => e.target.style.borderColor = "var(--input-border)"}
                required
              />
            </div>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>
              Reason
            </label>
            <textarea 
              value={leaveForm.reason}
              onChange={(e) => handleLeaveFormChange("reason", e.target.value)}
              placeholder="State your reason briefly..."
              style={{
                width: "100%",
                background: "var(--input-bg)",
                border: "1px solid var(--input-border)",
                borderRadius: "10px",
                padding: "0.75rem 1rem",
                color: "var(--text-main)",
                outline: "none",
                fontSize: "0.9rem",
                minHeight: "100px",
                resize: "vertical",
                transition: "border-color 0.2s"
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
              onBlur={(e) => e.target.style.borderColor = "var(--input-border)"}
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={leaveSubmitting}
            style={{
              padding: "0.75rem 2rem",
              background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              fontWeight: "700",
              fontSize: "0.9rem",
              cursor: "pointer",
              alignSelf: "flex-start",
              transition: "opacity 0.2s",
              opacity: leaveSubmitting ? 0.6 : 1
            }}
          >
            {leaveSubmitting ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>

      {/* History Log Card */}
      <div className="glass-card" style={{
        padding: "24px",
        borderRadius: "16px",
        border: "1px solid var(--card-border)",
        background: "var(--bg-secondary)",
        display: "flex",
        flexDirection: "column",
        gap: "16px"
      }}>
        <h2 style={{
          margin: 0,
          fontSize: "1.25rem",
          fontWeight: "800",
          color: "var(--text-main)",
          borderBottom: "1px solid var(--card-border)",
          paddingBottom: "12px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <span>⏳</span> Request History Log
        </h2>

        {leaveLoading ? (
          <div style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)" }}>
            Loading request logs...
          </div>
        ) : myLeaveRequests.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "32px",
            color: "var(--text-muted)",
            fontStyle: "italic",
            border: "1px dashed var(--card-border)",
            borderRadius: "12px"
          }}>
            No leave / OD requests recorded yet.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }} className="custom-scrollbar">
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--card-border)", color: "var(--text-muted)" }}>
                  <th style={{ padding: "12px 8px", fontWeight: "700" }}>Type</th>
                  <th style={{ padding: "12px 8px", fontWeight: "700" }}>Duration</th>
                  <th style={{ padding: "12px 8px", fontWeight: "700" }}>Reason</th>
                  <th style={{ padding: "12px 8px", fontWeight: "700" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {myLeaveRequests.map(req => {
                  let badgeBg = "rgba(245, 158, 11, 0.12)";
                  let badgeColor = "#fbbf24";
                  if (req.status === 'APPROVED') {
                    badgeBg = "rgba(16, 185, 129, 0.12)";
                    badgeColor = "#34d399";
                  } else if (req.status === 'REJECTED') {
                    badgeBg = "rgba(239, 68, 68, 0.12)";
                    badgeColor = "#f87171";
                  }

                  return (
                    <tr key={req.id} style={{ borderBottom: "1px solid var(--divider)", color: "var(--text-main)" }}>
                      <td style={{ padding: "16px 8px" }}>
                        <span style={{
                          background: "var(--nav-hover-bg)",
                          border: "1px solid var(--card-border)",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          fontSize: "0.72rem",
                          fontWeight: "800"
                        }}>
                          {req.type}
                        </span>
                      </td>
                      <td style={{ padding: "16px 8px", fontSize: "0.8rem" }}>
                        {req.fromDate} to {req.toDate}
                      </td>
                      <td style={{ padding: "16px 8px", fontSize: "0.8rem", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={req.reason}>
                        {req.reason}
                      </td>
                      <td style={{ padding: "16px 8px" }}>
                        <span style={{
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "0.72rem",
                          fontWeight: "800",
                          background: badgeBg,
                          color: badgeColor
                        }}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default LeavePage;
