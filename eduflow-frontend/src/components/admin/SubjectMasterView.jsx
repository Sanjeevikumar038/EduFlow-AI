import React, { useState } from "react";
import { createPortal } from "react-dom";
import { bulkCreateSubjects, createSubject } from "../../services/subjectService";

const loadXLSX = () => {
  return new Promise((resolve, reject) => {
    if (window.XLSX) return resolve(window.XLSX);
    const script = document.createElement("script");
    script.src = "https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js";
    script.onload = () => resolve(window.XLSX);
    script.onerror = (e) => reject(new Error("Failed to load Excel parsing engine script"));
    document.head.appendChild(script);
  });
};

function SubjectMasterView({
  subjects,
  subjectFilter,
  setSubjectFilter,
  setShowAddSubjectModal,
  handleDeleteSubject,
  handleDeleteAllSubjects,
  getSubjectFaculty,
  token,
  loadSubjects,
  showFeedback,
  ALL_DEPTS
}) {
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [importDept, setImportDept] = useState("CSE");
  const [academicYear] = useState("2024-25");
  const [rawText, setRawText] = useState("");
  const [parsedPreview, setParsedPreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("All");

  // Multi-sheet Excel states
  const [workbookSheets, setWorkbookSheets] = useState([]);
  const [selectedSheetMode, setSelectedSheetMode] = useState("ALL");
  const [excelWorkbook, setExcelWorkbook] = useState(null);

  const deptsList = Array.isArray(ALL_DEPTS) 
    ? ALL_DEPTS.filter(x => x !== "All") 
    : ["M.Tech CSE", "CSE", "IT", "ECE", "EEE", "Mechanical", "Mechatronics", "AI & Data Science", "CSBS", "Civil", "MBA"];

  // Helper to map sheet names to department names
  const mapSheetNameToDept = (sheetName) => {
    if (!sheetName) return "CSE";
    const s = sheetName.trim();
    const lower = s.toLowerCase();

    if (lower.includes("mtech") || lower.includes("m.tech")) return "M.Tech CSE";
    if (lower === "cse" || lower.includes("computer science")) return "CSE";
    if (lower === "it" || lower.includes("information tech")) return "IT";
    if (lower === "ece" || lower.includes("electronics")) return "ECE";
    if (lower === "eee" || lower.includes("electrical")) return "EEE";
    if (lower === "mech" || lower.includes("mechanical")) return "Mechanical";
    if (lower === "mct" || lower.includes("mechatronics")) return "Mechatronics";
    if (lower.includes("aids") || lower.includes("ai & ds") || lower.includes("data science")) return "AI & Data Science";
    if (lower.includes("csbs") || lower.includes("business")) return "CSBS";
    if (lower.includes("civil")) return "Civil";
    if (lower.includes("mba")) return "MBA";
    if (lower.includes("csd")) return "CSD";
    if (lower.includes("csy")) return "CSY";

    return s;
  };

  // Helper to parse matrix of rows into subject items
  const parseMatrixToSubjects = (matrix, targetDept, ay) => {
    if (!matrix || matrix.length === 0) return [];
    let headerIndex = -1;
    let headers = [];

    for (let i = 0; i < matrix.length; i++) {
      const row = matrix[i].map(c => String(c || "").trim().replace(/^["']|["']$/g, ""));
      const joined = row.join(" ").toLowerCase();
      if (joined.includes("code") || joined.includes("subject") || joined.includes("course") || joined.includes("semester") || joined.includes("year")) {
        headerIndex = i;
        headers = row.map(h => h.toLowerCase());
        break;
      }
    }

    const dataRows = headerIndex >= 0 ? matrix.slice(headerIndex + 1) : matrix;
    const items = [];

    const getCol = (row, fieldNames, defaultIndex) => {
      if (headerIndex >= 0) {
        for (const fname of fieldNames) {
          const idx = headers.findIndex(h => h.includes(fname));
          if (idx !== -1 && row[idx] !== undefined) return String(row[idx]).trim();
        }
      }
      return row[defaultIndex] !== undefined ? String(row[defaultIndex]).trim() : "";
    };

    const seenExactKeys = new Set();

    for (const rawRow of dataRows) {
      const row = rawRow.map(c => String(c || "").trim().replace(/^["']|["']$/g, ""));
      if (row.length < 2) continue;

      let yearVal = getCol(row, ["year"], 0);
      let semVal = getCol(row, ["semester", "sem"], 1);
      let codeVal = getCol(row, ["course code", "subject code", "code"], 2);
      let nameVal = getCol(row, ["subject name", "course name", "name", "subject"], 3);
      let typeVal = getCol(row, ["course type", "type", "category"], 4);
      let credVal = getCol(row, ["credits", "credit"], 5);
      let deptVal = getCol(row, ["department", "dept", "program", "branch"], -1);

      if (!codeVal && row.length >= 3) {
        codeVal = row[0];
        nameVal = row[1];
        credVal = row[2];
      }

      if (!codeVal || codeVal.toLowerCase() === "course code" || codeVal.toLowerCase() === "code") continue;
      if (!nameVal || !nameVal.trim()) nameVal = "Course " + codeVal.toUpperCase();

      // Smart Roman numeral & digit semester parsing (e.g. "Semester I" -> 1, "Semester II" -> 2)
      let sem = parseInt(semVal, 10);
      if (isNaN(sem) || sem <= 0) {
        const sUpper = String(semVal || "").toUpperCase();
        if (sUpper.includes("VIII") || sUpper.includes("8")) sem = 8;
        else if (sUpper.includes("VII") || sUpper.includes("7")) sem = 7;
        else if (sUpper.includes("VI") || sUpper.includes("6")) sem = 6;
        else if (sUpper.includes("IV") || sUpper.includes("4")) sem = 4;
        else if (sUpper.includes("V") || sUpper.includes("5")) sem = 5;
        else if (sUpper.includes("III") || sUpper.includes("3")) sem = 3;
        else if (sUpper.includes("II") || sUpper.includes("2")) sem = 2;
        else if (sUpper.includes("IX") || sUpper.includes("9")) sem = 9;
        else if (sUpper.includes("X") || sUpper.includes("10")) sem = 10;
        else if (sUpper.includes("I") || sUpper.includes("1")) sem = 1;
        else {
          let yr = parseInt(yearVal, 10);
          if (!isNaN(yr)) sem = (yr - 1) * 2 + 1;
          else sem = 1;
        }
      }

      let credits = parseInt(credVal, 10);
      if (isNaN(credits) || credits <= 0) credits = 3;

      // Strict category parsing matching Java enum constants
      let category = "THEORY";
      if (typeVal) {
        let t = typeVal.toUpperCase();
        if (t.includes("LAB") || t.includes("PRACTICAL")) category = "LAB";
        else if (t.includes("ELECTIVE")) category = "ELECTIVE";
        else if (t.includes("PROJECT")) category = "PROJECT";
        else category = "THEORY";
      } else if (nameVal.toLowerCase().includes("lab") || nameVal.toLowerCase().includes("practical")) {
        category = "LAB";
      } else if (nameVal.toLowerCase().includes("project")) {
        category = "PROJECT";
      }

      const sCode = codeVal.toUpperCase();
      let sDept = targetDept;
      if (deptVal && deptVal.trim().length > 0) {
        const mapped = mapSheetNameToDept(deptVal);
        if (mapped) sDept = mapped;
      }
      const sAy = ay || "2024-25";

      // Only skip true duplicate rows within the same import file where every imported column is identical
      const exactKey = `${sCode}|${nameVal}|${sDept}|${sem}|${sAy}|${credits}|${category}`.toLowerCase();
      if (seenExactKeys.has(exactKey)) {
        continue;
      }
      seenExactKeys.add(exactKey);

      items.push({
        subjectCode: sCode,
        subjectName: nameVal,
        department: sDept,
        semester: sem,
        academicYear: sAy,
        credits: credits,
        weeklyHours: category === "LAB" ? 4 : credits,
        subjectCategory: category
      });
    }

    return items;
  };

  const parseSubjectDataFromText = (text, targetDept, ay) => {
    if (!text || !text.trim()) return [];
    const lines = text.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
    const matrix = lines.map(l => l.split(/[\t,;]/));
    return parseMatrixToSubjects(matrix, targetDept, ay);
  };

  const handleTextChange = (e) => {
    const text = e.target.value;
    setRawText(text);
    setExcelWorkbook(null);
    setWorkbookSheets([]);
    const parsed = parseSubjectDataFromText(text, importDept, academicYear);
    setParsedPreview(parsed);
  };

  const parseWorkbookSheet = (wb, sheetName, targetDeptOverride, ay, XLSX) => {
    const sheet = wb.Sheets[sheetName];
    if (!sheet) return [];
    const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    const dept = targetDeptOverride || mapSheetNameToDept(sheetName);
    return parseMatrixToSubjects(matrix, dept, ay);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");

    if (isExcel) {
      try {
        const XLSX = await loadXLSX();
        const reader = new FileReader();
        reader.onload = (evt) => {
          const data = new Uint8Array(evt.target.result);
          const wb = XLSX.read(data, { type: "array" });
          setExcelWorkbook(wb);
          setWorkbookSheets(wb.SheetNames);
          setSelectedSheetMode("ALL");

          let allItems = [];
          if (wb.SheetNames.length > 1) {
            for (const sName of wb.SheetNames) {
              const sheetItems = parseWorkbookSheet(wb, sName, null, academicYear, XLSX);
              allItems.push(...sheetItems);
            }
          } else {
            allItems = parseWorkbookSheet(wb, wb.SheetNames[0], null, academicYear, XLSX);
          }
          setParsedPreview(allItems);
        };
        reader.readAsArrayBuffer(file);
      } catch (err) {
        if (showFeedback) showFeedback("Failed to parse Excel file. Please try CSV format.", "error");
      }
    } else {
      setExcelWorkbook(null);
      setWorkbookSheets([]);
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target.result;
        setRawText(text);
        const parsed = parseSubjectDataFromText(text, importDept, academicYear);
        setParsedPreview(parsed);
      };
      reader.readAsText(file);
    }
  };

  const handleSheetModeChange = async (mode) => {
    setSelectedSheetMode(mode);
    if (!excelWorkbook) return;
    const XLSX = await loadXLSX();

    if (mode === "ALL") {
      let allItems = [];
      for (const sName of excelWorkbook.SheetNames) {
        const sheetItems = parseWorkbookSheet(excelWorkbook, sName, null, academicYear, XLSX);
        allItems.push(...sheetItems);
      }
      setParsedPreview(allItems);
    } else {
      const sheetItems = parseWorkbookSheet(excelWorkbook, mode, null, academicYear, XLSX);
      setParsedPreview(sheetItems);
    }
  };

  const handleConfirmImport = async () => {
    if (parsedPreview.length === 0) {
      if (showFeedback) showFeedback("No valid subjects found to import!", "error");
      return;
    }

    setImporting(true);
    let totalCreated = 0;
    let totalSkipped = 0;

    try {
      const batchSize = 50;
      for (let i = 0; i < parsedPreview.length; i += batchSize) {
        const batch = parsedPreview.slice(i, i + batchSize);
        try {
          const res = await bulkCreateSubjects(batch, token);
          if (res.data) {
            totalCreated += res.data.created || 0;
            totalSkipped += res.data.skipped || 0;
          }
        } catch (batchErr) {
          for (const item of batch) {
            try {
              await createSubject(item, token);
              totalCreated++;
            } catch (singleErr) {
              totalSkipped++;
            }
          }
        }
      }

      if (showFeedback) {
        showFeedback(`Successfully imported all ${totalCreated} subjects into their respective departments! 🎉`);
      }
      setShowBulkModal(false);
      setRawText("");
      setParsedPreview([]);
      setExcelWorkbook(null);
      setWorkbookSheets([]);
      if (loadSubjects) loadSubjects();
    } catch (err) {
      console.error("Bulk import error details:", err);
      if (showFeedback) showFeedback("Import completed with some errors", "warning");
    } finally {
      setImporting(false);
    }
  };

  const filteredSubjectsList = subjects.filter(s => {
    const matchesSearch = !subjectFilter || s.subjectCode?.toLowerCase().includes(subjectFilter.toLowerCase()) || s.subjectName?.toLowerCase().includes(subjectFilter.toLowerCase()) || s.department?.toLowerCase().includes(subjectFilter.toLowerCase());
    const matchesDept = selectedDeptFilter === "All" || s.department === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="dashboard-card" style={{ background: "rgba(30, 41, 59, 0.2)", display: "flex", flexDirection: "column", gap: "1.5rem", animation: "fadeIn 0.5s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <h3 style={{ margin: 0 }}>📚 Subject Master ({filteredSubjectsList.length})</h3>
          <select
            className="input-field"
            value={selectedDeptFilter}
            onChange={e => setSelectedDeptFilter(e.target.value)}
            style={{ height: "36px", fontSize: "0.85rem", background: "#1e293b", color: "#818cf8", cursor: "pointer", fontWeight: "600", borderColor: "rgba(99,102,241,0.3)" }}
          >
            <option value="All">🏢 All Departments ({subjects.length})</option>
            {deptsList.map(dept => {
              const count = subjects.filter(s => s.department === dept).length;
              return <option key={dept} value={dept}>{dept} ({count})</option>;
            })}
          </select>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          <input 
            className="input-field" 
            placeholder="Search subjects..." 
            value={subjectFilter} 
            onChange={e => setSubjectFilter(e.target.value)} 
            style={{ maxWidth: "220px", height: "36px", fontSize: "0.85rem" }} 
          />
          {handleDeleteAllSubjects && subjects.length > 0 && (
            <button
              onClick={handleDeleteAllSubjects}
              style={{
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                color: "#f87171", borderRadius: "8px", padding: "0.5rem 1rem",
                fontWeight: "600", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
              }}
            >
              <span>🗑️</span> Clear All Subjects
            </button>
          )}
          <button
            onClick={() => setShowBulkModal(true)}
            style={{
              background: "rgba(99, 102, 241, 0.15)",
              border: "1px solid rgba(99, 102, 241, 0.4)",
              color: "#818cf8", borderRadius: "8px", padding: "0.5rem 1rem",
              fontWeight: "600", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
            }}
          >
            <span>📥</span> Import Excel / CSV
          </button>
          <button
            onClick={() => setShowAddSubjectModal(true)}
            style={{
              background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
              border: "none", color: "#fff", borderRadius: "8px", padding: "0.5rem 1.25rem",
              fontWeight: "600", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
            }}
          >
            <span>+</span> Add Subject
          </button>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
          <thead>
            <tr style={{ color: "var(--text-muted)", borderBottom: "2px solid var(--card-border)" }}>
              <th style={{ padding: "0.75rem 1rem" }}>Code</th>
              <th style={{ padding: "0.75rem 1rem" }}>Subject Name</th>
              <th style={{ padding: "0.75rem 1rem" }}>Department</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "center" }}>Sem</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "center" }}>Credits</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "center" }}>Hrs/Wk</th>
              <th style={{ padding: "0.75rem 1rem" }}>Category</th>
              <th style={{ padding: "0.75rem 1rem" }}>Primary Faculty</th>
              <th style={{ padding: "0.75rem 1rem" }}>Status</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubjectsList.map(s => (
              <tr key={s.id} style={{ borderBottom: "1px solid var(--card-border)", opacity: s.active ? 1 : 0.5 }}>
                <td style={{ padding: "0.75rem 1rem", fontWeight: 600, color: "var(--primary)" }}>{s.subjectCode}</td>
                <td style={{ padding: "0.75rem 1rem", fontWeight: "600" }}>{s.subjectName}</td>
                <td style={{ padding: "0.75rem 1rem", color: "#818cf8", fontWeight: "600" }}>{s.department}</td>
                <td style={{ padding: "0.75rem 1rem", textAlign: "center", color: "var(--text-muted)" }}>{s.semester}</td>
                <td style={{ padding: "0.75rem 1rem", textAlign: "center", color: "var(--text-muted)" }}>{s.credits}</td>
                <td style={{ padding: "0.75rem 1rem", textAlign: "center", color: "var(--text-muted)" }}>{s.weeklyHours}</td>
                <td style={{ padding: "0.75rem 1rem" }}>
                  <span style={{ 
                    background: s.subjectCategory === "LAB" ? "rgba(99,102,241,0.15)" : "rgba(16,185,129,0.15)", 
                    color: s.subjectCategory === "LAB" ? "#818cf8" : "#34d399", 
                    borderRadius: "4px", padding: "2px 8px", fontSize: "0.75rem", fontWeight: 600 
                  }}>
                    {s.subjectCategory}
                  </span>
                </td>
                <td style={{ padding: "0.75rem 1rem", fontWeight: "600" }}>{getSubjectFaculty ? getSubjectFaculty(s.id) : "Not Assigned"}</td>
                <td style={{ padding: "0.75rem 1rem" }}>
                  <span style={{ color: s.active ? "var(--success)" : "var(--error)", fontWeight: 600, fontSize: "0.75rem" }}>
                    {s.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                  <button onClick={() => handleDeleteSubject(s.id)} style={{ background: "transparent", border: "1px solid var(--error)", color: "var(--error)", borderRadius: "4px", padding: "4px 10px", cursor: "pointer", fontSize: "0.75rem" }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredSubjectsList.length === 0 && (
              <tr>
                <td colSpan="10" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                  No subjects match current filter. Click <strong>"📥 Import Excel / CSV"</strong> or <strong>"+ Add Subject"</strong> to populate.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Bulk Import Subjects Modal */}
      {showBulkModal && createPortal(
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(15, 23, 42, 0.75)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 999999,
          padding: "1.5rem",
          boxSizing: "border-box"
        }}>
          <div className="glass-card" style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
            borderRadius: "20px",
            padding: "2rem",
            width: "100%",
            maxWidth: "860px",
            maxHeight: "90vh",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 30px rgba(99, 102, 241, 0.2)",
            color: "var(--text-main)",
            animation: "fadeIn 0.25s ease"
          }}>
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--card-border)", paddingBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  background: "rgba(99, 102, 241, 0.12)",
                  border: "1px solid rgba(99, 102, 241, 0.3)",
                  borderRadius: "12px",
                  width: "44px",
                  height: "44px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.25rem",
                  color: "var(--primary)"
                }}>
                  📥
                </div>
                <div>
                  <h3 style={{ margin: 0, color: "var(--text-main)", fontSize: "1.25rem", fontWeight: "700" }}>
                    Bulk Import Curriculum (Excel / CSV)
                  </h3>
                  <p style={{ margin: "3px 0 0 0", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                    Import official subject master entries across departments & semesters
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBulkModal(false)}
                style={{
                  background: "var(--input-bg)",
                  border: "1px solid var(--card-border)",
                  color: "var(--text-muted)",
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  fontSize: "1.1rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease"
                }}
              >
                ✕
              </button>
            </div>

            {/* Supported Header Format Banner */}
            <div style={{
              background: "rgba(99, 102, 241, 0.08)",
              border: "1px solid rgba(99, 102, 241, 0.25)",
              borderRadius: "14px",
              padding: "1rem"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--primary)", fontSize: "0.85rem", fontWeight: "700", marginBottom: "8px" }}>
                <span>📋</span> Recommended Excel Header Columns:
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                {["Year", "Semester", "Course Code", "Subject Name", "Course Type", "Credits"].map((col, idx) => (
                  <React.Fragment key={col}>
                    <span style={{
                      background: "var(--input-bg)",
                      border: "1px solid var(--card-border)",
                      color: "var(--text-main)",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "0.78rem",
                      fontFamily: "monospace",
                      fontWeight: "600"
                    }}>
                      {col}
                    </span>
                    {idx < 5 && <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>|</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Upload File Box */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{
                background: "var(--input-bg)",
                border: "2px dashed var(--input-border)",
                borderRadius: "14px",
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.85rem",
                textAlign: "center"
              }}>
                <div style={{ fontSize: "2.2rem" }}>📁</div>
                <div>
                  <div style={{ fontSize: "0.92rem", fontWeight: "700", color: "var(--text-main)" }}>
                    Upload Excel (.xlsx, .xls) or CSV File
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "3px" }}>
                    Multi-sheet Excel files automatically map sheets to respective departments
                  </div>
                </div>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv, .tsv, .txt"
                  onChange={handleFileUpload}
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--primary)",
                    cursor: "pointer",
                    background: "var(--bg-primary)",
                    padding: "8px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--card-border)"
                  }}
                />
              </div>

              {/* Department Target Override for Single Files */}
              {(!workbookSheets || workbookSheets.length <= 1) && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  background: "var(--input-bg)",
                  padding: "0.85rem 1.1rem",
                  borderRadius: "12px",
                  border: "1px solid var(--card-border)"
                }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-main)" }}>
                    🏢 Target Department for Single File:
                  </label>
                  <select
                    className="input-field"
                    value={importDept}
                    onChange={(e) => {
                      setImportDept(e.target.value);
                      if (rawText) {
                        const parsed = parseSubjectDataFromText(rawText, e.target.value, academicYear);
                        setParsedPreview(parsed);
                      }
                    }}
                    style={{
                      height: "36px",
                      fontSize: "0.85rem",
                      background: "var(--bg-primary)",
                      color: "var(--primary)",
                      borderColor: "var(--input-border)",
                      fontWeight: "600"
                    }}
                  >
                    {deptsList.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Multi-Sheet Selector Controls */}
              {workbookSheets.length > 0 && (
                <div style={{
                  background: "rgba(16, 185, 129, 0.08)",
                  border: "1px solid rgba(16, 185, 129, 0.25)",
                  borderRadius: "14px",
                  padding: "1.1rem"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "8px" }}>
                    <span style={{ fontWeight: "700", color: "var(--success)", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span>📊</span> Detected {workbookSheets.length} Department Sheets:
                    </span>
                    <select
                      className="input-field"
                      value={selectedSheetMode}
                      onChange={(e) => handleSheetModeChange(e.target.value)}
                      style={{
                        height: "34px",
                        fontSize: "0.82rem",
                        maxWidth: "280px",
                        background: "var(--bg-primary)",
                        color: "var(--success)",
                        borderColor: "rgba(16, 185, 129, 0.4)",
                        fontWeight: "600"
                      }}
                    >
                      <option value="ALL">✨ Import All {workbookSheets.length} Sheets at once</option>
                      {workbookSheets.map(s => (
                        <option key={s} value={s}>📄 Sheet: {s} ({mapSheetNameToDept(s)})</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    <button
                      onClick={() => handleSheetModeChange("ALL")}
                      style={{
                        background: selectedSheetMode === "ALL" ? "var(--success)" : "var(--input-bg)",
                        border: `1px solid ${selectedSheetMode === "ALL" ? "var(--success)" : "var(--card-border)"}`,
                        color: selectedSheetMode === "ALL" ? "#fff" : "var(--success)",
                        padding: "5px 14px", borderRadius: "20px", fontSize: "0.78rem", fontWeight: "600", cursor: "pointer"
                      }}
                    >
                      ✨ All Sheets
                    </button>
                    {workbookSheets.map(s => (
                      <button
                        key={s}
                        onClick={() => handleSheetModeChange(s)}
                        style={{
                          background: selectedSheetMode === s ? "var(--success)" : "var(--input-bg)",
                          border: `1px solid ${selectedSheetMode === s ? "var(--success)" : "var(--card-border)"}`,
                          color: selectedSheetMode === s ? "#fff" : "var(--success)",
                          padding: "5px 14px", borderRadius: "20px", fontSize: "0.78rem", fontWeight: "600", cursor: "pointer"
                        }}
                      >
                        📄 {s} ({mapSheetNameToDept(s)})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Paste Raw Text Box */}
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-main)", marginBottom: "0.5rem" }}>
                  📝 OR Paste Excel / CSV Text directly below:
                </label>
                <textarea
                  className="input-field custom-scrollbar"
                  rows="3"
                  placeholder="Paste rows here... e.g.:&#10;Year&#9;Semester&#9;Course Code&#9;Subject Name&#9;Course Type&#9;Credits&#10;2&#9;3&#9;23CS301&#9;Data Structures & Algorithms&#9;THEORY&#9;4"
                  value={rawText}
                  onChange={handleTextChange}
                  style={{
                    width: "100%",
                    fontFamily: "monospace",
                    fontSize: "0.82rem",
                    background: "var(--bg-primary)",
                    color: "var(--text-main)",
                    borderColor: "var(--input-border)",
                    borderRadius: "10px",
                    padding: "0.85rem",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>

            {/* Live Parsed Preview Table */}
            {parsedPreview.length > 0 && (
              <div style={{ background: "var(--input-bg)", border: "1px solid var(--card-border)", borderRadius: "14px", padding: "1.1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
                  <h4 style={{ margin: 0, color: "var(--primary)", fontSize: "0.92rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                    🔍 Live Preview Parsed Curriculum ({parsedPreview.length} subjects found)
                  </h4>
                  <span style={{ fontSize: "0.78rem", background: "rgba(16,185,129,0.15)", color: "var(--success)", padding: "3px 12px", borderRadius: "12px", fontWeight: "700" }}>
                    ✓ Ready for Import
                  </span>
                </div>
                <div style={{ maxHeight: "220px", overflowY: "auto", borderRadius: "10px", border: "1px solid var(--card-border)" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", textAlign: "left" }}>
                    <thead style={{ background: "var(--bg-primary)", position: "sticky", top: 0, zIndex: 1 }}>
                      <tr style={{ color: "var(--text-muted)", borderBottom: "1px solid var(--card-border)" }}>
                        <th style={{ padding: "10px 14px" }}>Code</th>
                        <th style={{ padding: "10px 14px" }}>Subject Name</th>
                        <th style={{ padding: "10px 14px" }}>Department</th>
                        <th style={{ padding: "10px 14px", textAlign: "center" }}>Sem</th>
                        <th style={{ padding: "10px 14px", textAlign: "center" }}>Credits</th>
                        <th style={{ padding: "10px 14px" }}>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedPreview.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid var(--card-border)", background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                          <td style={{ padding: "8px 14px", fontWeight: "700", color: "var(--primary)" }}>{item.subjectCode}</td>
                          <td style={{ padding: "8px 14px", fontWeight: "600", color: "var(--text-main)" }}>{item.subjectName}</td>
                          <td style={{ padding: "8px 14px", color: "var(--success)", fontWeight: "600" }}>{item.department}</td>
                          <td style={{ padding: "8px 14px", textAlign: "center", color: "var(--text-muted)" }}>{item.semester}</td>
                          <td style={{ padding: "8px 14px", textAlign: "center", color: "var(--text-muted)" }}>{item.credits}</td>
                          <td style={{ padding: "8px 14px" }}>
                            <span style={{
                              background: item.subjectCategory === "LAB" ? "rgba(99,102,241,0.18)" : "rgba(16,185,129,0.18)",
                              color: item.subjectCategory === "LAB" ? "var(--primary)" : "var(--success)",
                              padding: "3px 8px", borderRadius: "4px", fontSize: "0.72rem", fontWeight: "700"
                            }}>
                              {item.subjectCategory}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Action Footer Buttons */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.85rem", borderTop: "1px solid var(--card-border)", paddingTop: "1.1rem" }}>
              <button
                onClick={() => setShowBulkModal(false)}
                style={{
                  background: "transparent",
                  border: "1px solid var(--card-border)",
                  color: "var(--text-muted)",
                  borderRadius: "10px",
                  padding: "0.65rem 1.4rem",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "0.85rem"
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={parsedPreview.length === 0 || importing}
                style={{
                  background: parsedPreview.length > 0 ? "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)" : "var(--input-bg)",
                  border: "none",
                  color: "#fff",
                  borderRadius: "10px",
                  padding: "0.65rem 1.6rem",
                  fontWeight: "700",
                  fontSize: "0.85rem",
                  cursor: parsedPreview.length > 0 && !importing ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  opacity: importing ? 0.7 : 1,
                  boxShadow: parsedPreview.length > 0 ? "0 4px 16px rgba(99, 102, 241, 0.35)" : "none"
                }}
              >
                {importing ? "Importing Subjects..." : `🚀 Import ${parsedPreview.length} Subjects`}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default SubjectMasterView;
