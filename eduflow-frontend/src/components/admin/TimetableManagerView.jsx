import React from "react";

function TimetableManagerView({
  selectedDept,
  setSelectedDept,
  timetableMatrix,
  timetableLoading,
  savingTimetable,
  swapMode,
  setSwapMode,
  selectedSwapCell,
  setSelectedSwapCell,
  autoGenerating,
  handleAutoGenerate,
  handleSaveTimetable,
  handleRandomizeTimetable,
  handleCellChange,
  faculty,
  setTimetableMatrix,
  showFeedback
}) {

  const renderAdminCell = (day, period) => {
    const cellKey = `${day}-${period}`;
    const cell = timetableMatrix[cellKey] || { subject: "", facultyId: "" };
    const isSelected = selectedSwapCell && selectedSwapCell.day === day && selectedSwapCell.period === period;

    const cellStyle = swapMode ? {
      cursor: "pointer",
      border: isSelected ? "2px solid var(--secondary)" : "1px dashed rgba(255,255,255,0.25)",
      boxShadow: isSelected ? "0 0 10px rgba(99, 102, 241, 0.4)" : "none",
      transition: "all 0.2s"
    } : {};

    return (
      <td
        key={period}
        style={cellStyle}
        onClick={() => {
          if (swapMode) {
            if (!selectedSwapCell) {
              setSelectedSwapCell({ day, period });
            } else {
              const d1 = selectedSwapCell.day;
              const p1 = selectedSwapCell.period;
              if (d1 === day && p1 === period) {
                setSelectedSwapCell(null);
                return;
              }
              const c1 = timetableMatrix[`${d1}-${p1}`] || { subject: "", facultyId: "" };
              const c2 = timetableMatrix[`${day}-${period}`] || { subject: "", facultyId: "" };
              setTimetableMatrix(prev => ({
                ...prev,
                [`${d1}-${p1}`]: c2,
                [`${day}-${period}`]: c1
              }));
              setSelectedSwapCell(null);
              showFeedback(`Swapped slot (${d1} P${p1}) with (${day} P${period})!`);
            }
          }
        }}
      >
        <div className="admin-cell-container" style={{ pointerEvents: swapMode ? "none" : "auto" }}>
          <input
            className="admin-cell-subject"
            type="text"
            placeholder="Sub Code"
            value={cell.subject}
            onChange={(e) => handleCellChange(day, period, "subject", e.target.value)}
          />
          <select
            className="admin-cell-faculty"
            value={cell.facultyId}
            onChange={(e) => handleCellChange(day, period, "facultyId", e.target.value)}
          >
            <option value="">-- No Faculty --</option>
            {faculty.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.department || "N/A"})
              </option>
            ))}
          </select>
        </div>
      </td>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%", animation: "fadeIn 0.5s ease" }}>
      <div className="dashboard-card" style={{ background: "rgba(30, 41, 59, 0.25)", border: "1px solid var(--card-border)", borderRadius: "20px", padding: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h3 style={{ margin: 0, color: "#fff" }}><i className="fa-solid fa-calendar-days" style={{ color: "var(--primary)", marginRight: "8px" }}></i> Timetable Matrix Builder</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0.25rem 0 0 0" }}>
              Configure weekly subject schedules and allocate registered faculty members to periods.
            </p>
          </div>

          <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "600" }}>SELECT DEPARTMENT:</span>
              <select
                className="input-field"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                style={{ borderRadius: "6px", padding: "8px 12px", fontSize: "0.85rem", minWidth: "140px" }}
              >
                <option value="M.Tech CSE">M.Tech CSE</option>
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
              </select>
            </div>

            <button
              onClick={handleAutoGenerate}
              disabled={autoGenerating}
              style={{
                background: "rgba(16, 185, 129, 0.15)", border: "1px solid var(--success)", color: "#fff",
                borderRadius: "6px", padding: "10px 15px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600",
                transition: "all 0.2s", alignSelf: "flex-end", margin: 0
              }}
            >
              {autoGenerating ? "⏳ Generating..." : "🤖 Auto Generate"}
            </button>

            <button
              onClick={() => {
                setSwapMode(!swapMode);
                setSelectedSwapCell(null);
              }}
              style={{
                background: swapMode ? "var(--success)" : "rgba(31, 41, 55, 0.6)",
                border: swapMode ? "none" : "1px solid var(--card-border)", color: "#fff",
                borderRadius: "6px", padding: "10px 15px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600",
                transition: "all 0.2s", alignSelf: "flex-end", margin: 0
              }}
            >
              {swapMode ? "⛔ Stop Swapping" : "🔀 Swap Mode"}
            </button>

            <button
              onClick={handleRandomizeTimetable}
              style={{
                background: "rgba(99, 102, 241, 0.15)", border: "1px solid var(--primary)", color: "#fff",
                borderRadius: "6px", padding: "10px 15px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600",
                transition: "all 0.2s", alignSelf: "flex-end", margin: 0
              }}
            >
              🎲 Randomize Grid
            </button>

            <button
              onClick={handleSaveTimetable}
              disabled={savingTimetable || timetableLoading}
              style={{
                background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
                border: "none", color: "#fff", borderRadius: "6px", padding: "10px 20px",
                cursor: "pointer", fontSize: "0.85rem", fontWeight: "600", transition: "all 0.2s",
                alignSelf: "flex-end", boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)", margin: 0
              }}
            >
              {savingTimetable ? "Saving..." : "💾 Save Timetable"}
            </button>
          </div>
        </div>

        {swapMode && (
          <div style={{
            background: "rgba(16, 185, 129, 0.1)", border: "1px dashed var(--success)", color: "var(--success)",
            padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.85rem",
            fontWeight: "500", display: "flex", alignItems: "center", gap: "8px", animation: "fadeIn 0.3s ease"
          }}>
            ℹ️ <strong>Swap Mode Active:</strong> Click on any slot to select it, then click another slot to swap their subjects and professors.
          </div>
        )}

        {timetableLoading ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
            Loading weekly timetable matrix...
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="timetable-grid-table admin-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>P1<span className="time-sub">8:15-9:15</span></th>
                  <th>P2<span className="time-sub">9:15-10:15</span></th>
                  <th className="break-hdr">Break<span className="time-sub">10:15-10:45</span></th>
                  <th>P3<span className="time-sub">10:45-11:45</span></th>
                  <th>P4<span className="time-sub">11:45-12:45</span></th>
                  <th className="break-hdr">Lunch<span className="time-sub">12:45-1:45</span></th>
                  <th>P5<span className="time-sub">1:45-2:45</span></th>
                  <th>P6<span className="time-sub">2:45-3:45</span></th>
                </tr>
              </thead>
              <tbody>
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                  <tr key={day}>
                    <td className="day-name-cell">{day}</td>
                    {[1, 2].map(p => renderAdminCell(day, p))}
                    <td className="grid-break-cell">Short Break</td>
                    {[3, 4].map(p => renderAdminCell(day, p))}
                    <td className="grid-break-cell">Lunch Break</td>
                    {[5, 6].map(p => renderAdminCell(day, p))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .timetable-grid-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          font-size: 0.85rem;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .timetable-grid-table th {
          background: rgba(31, 41, 55, 0.6);
          color: #f1f5f9;
          font-weight: 600;
          padding: 12px 8px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          min-width: 100px;
          font-size: 0.8rem;
        }
        .timetable-grid-table td {
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 10px 6px;
          height: 75px;
          vertical-align: middle;
        }
        .time-sub {
          display: block;
          font-size: 0.65rem;
          color: #94a3b8;
          font-weight: normal;
          margin-top: 4px;
        }
        .day-name-cell {
          font-weight: 700;
          color: #f1f5f9;
          background: rgba(30, 41, 59, 0.4);
          min-width: 90px;
        }
        .grid-break-cell {
          background: rgba(31, 41, 55, 0.25);
          color: #64748b;
          font-size: 0.75rem;
          font-style: italic;
          max-width: 35px;
          writing-mode: vertical-rl;
          text-orientation: mixed;
          letter-spacing: 2px;
          font-weight: 600;
          border-left: 1px dashed rgba(255, 255, 255, 0.1);
          border-right: 1px dashed rgba(255, 255, 255, 0.1);
        }
        .break-hdr {
          background: rgba(31, 41, 55, 0.35) !important;
          min-width: 40px !important;
        }
        .admin-table td {
          background: rgba(30, 41, 59, 0.15);
        }
        .admin-cell-container {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 4px;
        }
        .admin-cell-subject {
          background: #0f172a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          border-radius: 4px;
          padding: 6px 8px;
          font-size: 0.8rem;
          outline: none;
          text-align: center;
          font-weight: 600;
          transition: border-color 0.2s;
        }
        .admin-cell-subject:focus {
          border-color: var(--primary);
        }
        .admin-cell-faculty {
          background: #0f172a;
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          border-radius: 4px;
          padding: 4px 6px;
          font-size: 0.7rem;
          outline: none;
          cursor: pointer;
          transition: border-color 0.2s;
          width: 100%;
        }
        .admin-cell-faculty:focus {
          border-color: var(--secondary);
        }
      `}</style>
    </div>
  );
}

export default TimetableManagerView;
