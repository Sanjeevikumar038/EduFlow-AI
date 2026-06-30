import React, { useState, useEffect } from "react";

const SimulationControl = ({ onChange }) => {
  const [enabled, setEnabled] = useState(false);
  const [day, setDay] = useState("Monday");
  const [time, setTime] = useState("09:00");

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  
  const timeOptions = [
    { label: "08:30 AM (Before College)", value: "08:30" },
    { label: "09:00 AM (Period 1: OS/DCN/PCD/DBMS)", value: "09:00" },
    { label: "10:00 AM (Period 2: DCN/OS/DBMS/AGAI)", value: "10:00" },
    { label: "10:40 AM (Short Break)", value: "10:40" },
    { label: "11:00 AM (Period 3: PCD/AIES/OS/SE)", value: "11:00" },
    { label: "12:00 PM (Period 4: AIES/DBMS/DCN)", value: "12:00" },
    { label: "01:00 PM (Lunch Break)", value: "13:00" },
    { label: "02:00 PM (Period 5: AGAI/PCD/AIES/DCN/OS)", value: "14:00" },
    { label: "03:00 PM (Period 6: DBMS/AGAI/PCD)", value: "15:00" },
    { label: "04:00 PM (Period 7: CC LAB/AI LAB/SE)", value: "16:00" },
    { label: "05:00 PM (Period 8: CC LAB/AI LAB/SE)", value: "17:00" },
    { label: "06:00 PM (After College / Ended)", value: "18:00" }
  ];

  useEffect(() => {
    if (enabled) {
      onChange({ simulatedDay: day, simulatedTime: time });
    } else {
      onChange(null);
    }
  }, [enabled, day, time]);

  return (
    <div className="simulation-control-card">
      <div className="sim-header">
        <div className="sim-title">
          <span className="sim-pulse"></span>
          <h4>Time-Travel Simulator</h4>
        </div>
        <label className="sim-toggle-switch">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          <span className="sim-slider"></span>
        </label>
      </div>

      {enabled && (
        <div className="sim-body">
          <div className="sim-field">
            <label>Select Day:</label>
            <select value={day} onChange={(e) => setDay(e.target.value)}>
              {days.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="sim-field">
            <label>Select Time:</label>
            <select value={time} onChange={(e) => setTime(e.target.value)}>
              {timeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <style>{`
        .simulation-control-card {
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 24px;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
          transition: all 0.3s ease;
        }
        .simulation-control-card:hover {
          border-color: rgba(99, 102, 241, 0.4);
          box-shadow: 0 8px 32px 0 rgba(99, 102, 241, 0.1);
        }
        .sim-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .sim-title {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .sim-title h4 {
          margin: 0;
          color: #f1f5f9;
          font-weight: 600;
          font-size: 0.95rem;
        }
        .sim-pulse {
          width: 8px;
          height: 8px;
          background-color: #10b981;
          border-radius: 50%;
          display: inline-block;
          box-shadow: 0 0 8px #10b981;
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(0.9); opacity: 0.6; }
          50% { transform: scale(1.1); opacity: 1; box-shadow: 0 0 12px #10b981; }
          100% { transform: scale(0.9); opacity: 0.6; }
        }
        .sim-toggle-switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 22px;
        }
        .sim-toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .sim-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #475569;
          transition: .4s;
          border-radius: 34px;
        }
        .sim-slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        input:checked + .sim-slider {
          background-color: #6366f1;
        }
        input:checked + .sim-slider:before {
          transform: translateX(22px);
        }
        .sim-body {
          display: flex;
          gap: 16px;
          margin-top: 14px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 12px;
        }
        .sim-field {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .sim-field label {
          font-size: 0.75rem;
          color: #94a3b8;
          font-weight: 500;
        }
        .sim-field select {
          background: #0f172a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #f1f5f9;
          border-radius: 6px;
          padding: 8px;
          font-size: 0.85rem;
          outline: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .sim-field select:focus {
          border-color: #6366f1;
        }
      `}</style>
    </div>
  );
};

export default SimulationControl;
