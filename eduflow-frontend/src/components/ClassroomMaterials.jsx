import React, { useState, useEffect, useRef } from "react";
import {
  getClassroomMaterials,
  createMaterial,
  deleteMaterial,
} from "../services/classroomService";

const ClassroomMaterials = ({ classroom, userRole }) => {
  const token = localStorage.getItem("token");
  const fileInputRef = useRef(null);

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedTopic, setSelectedTopic] = useState("ALL");

  // Modal & Upload State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadMethod, setUploadMethod] = useState("FILE"); // "FILE" or "LINK"
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [materialType, setMaterialType] = useState("PDF");
  const [topic, setTopic] = useState("Unit 1: Core Fundamentals");
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    fetchMaterials();
  }, [classroom?.id]);

  const fetchMaterials = async () => {
    const classId = classroom?.id;
    if (!classId || !token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await getClassroomMaterials(classId, token);
      setMaterials(res.data || []);
    } catch (err) {
      console.error("Failed to load materials:", err);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileProcess = (file) => {
    if (!file) return;
    setSelectedFile(file);
    setFileName(file.name);

    // Format size
    const sizeKB = file.size / 1024;
    const formattedSize =
      sizeKB > 1024
        ? `${(sizeKB / 1024).toFixed(1)} MB`
        : `${Math.round(sizeKB)} KB`;
    setFileSize(formattedSize);

    // Auto-detect extension
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (ext === "pdf") setMaterialType("PDF");
    else if (["ppt", "pptx"].includes(ext)) setMaterialType("PPT");
    else if (["doc", "docx"].includes(ext)) setMaterialType("DOCX");
    else if (["xls", "xlsx", "csv"].includes(ext)) setMaterialType("EXCEL");
    else if (["mp4", "mov", "webm", "avi", "mkv"].includes(ext)) setMaterialType("VIDEO");
    else if (["zip", "rar", "7z", "tar"].includes(ext)) setMaterialType("ZIP");
    else if (["txt", "md", "rtf"].includes(ext)) setMaterialType("NOTE");
    else setMaterialType("PDF");

    // Auto-fill title if empty
    if (!title.trim()) {
      const cleanName =
        file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
      setTitle(cleanName.replace(/[-_]/g, " "));
    }

    // Convert to Data URL for instant storage/download
    const reader = new FileReader();
    reader.onload = (e) => {
      setFileUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please provide a resource title.");
      return;
    }

    if (uploadMethod === "FILE" && !fileUrl) {
      alert("Please select or drop a document file to upload.");
      return;
    }

    if (uploadMethod === "LINK" && !fileUrl.trim()) {
      alert("Please provide a valid resource URL / storage link.");
      return;
    }

    try {
      setPublishing(true);
      await createMaterial(
        classroom.id,
        {
          title: title.trim(),
          description: description.trim(),
          materialType,
          topic: topic.trim() ? topic.trim() : "General Resources",
          fileUrl,
          fileName: fileName.trim() ? fileName.trim() : title.trim(),
          fileSize: fileSize.trim() ? fileSize.trim() : "1.5 MB",
        },
        token
      );

      // Reset form
      setTitle("");
      setDescription("");
      setMaterialType("PDF");
      setTopic("Unit 1: Core Fundamentals");
      setFileUrl("");
      setFileName("");
      setFileSize("");
      setSelectedFile(null);
      setShowUploadModal(false);

      fetchMaterials();
    } catch (err) {
      console.error("Failed to upload material:", err);
      alert("Error publishing material. Please try again.");
    } finally {
      setPublishing(false);
    }
  };

  const handleDeleteMaterial = async (matId) => {
    if (!window.confirm("Are you sure you want to remove this learning resource?")) return;
    try {
      await deleteMaterial(matId, token);
      fetchMaterials();
    } catch (err) {
      console.error("Failed to delete material:", err);
    }
  };

  // In-App Document Preview Modal State
  const [previewMaterial, setPreviewMaterial] = useState(null);
  const [blobUrl, setBlobUrl] = useState(null);

  const dataURLtoBlob = (dataurl) => {
    if (!dataurl || !dataurl.startsWith("data:")) return null;
    try {
      const arr = dataurl.split(",");
      const mimeMatch = arr[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : "application/pdf";
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    } catch (e) {
      console.error("Error converting Data URL to Blob:", e);
      return null;
    }
  };

  useEffect(() => {
    if (previewMaterial?.fileUrl) {
      if (previewMaterial.fileUrl.startsWith("data:")) {
        const blob = dataURLtoBlob(previewMaterial.fileUrl);
        if (blob) {
          const url = URL.createObjectURL(blob);
          setBlobUrl(url);
          return () => {
            URL.revokeObjectURL(url);
          };
        }
      } else {
        setBlobUrl(previewMaterial.fileUrl);
      }
    } else {
      setBlobUrl(null);
    }
  }, [previewMaterial]);

  const handleView = (mat) => {
    setPreviewMaterial(mat);
  };

  const handleDownload = (mat) => {
    if (!mat.fileUrl) return;
    if (mat.fileUrl.startsWith("data:")) {
      const a = document.createElement("a");
      a.href = mat.fileUrl;
      a.download = mat.fileName || `${mat.title}.${mat.materialType.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const a = document.createElement("a");
      a.href = mat.fileUrl;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.download = mat.fileName || mat.title;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const topicsList = Array.from(new Set(materials.map((m) => m.topic || "General Resources")));

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "ALL" || m.materialType === selectedType;
    const matchesTopic = selectedTopic === "ALL" || m.topic === selectedTopic;

    return matchesSearch && matchesType && matchesTopic;
  });

  const groupedMaterials = filteredMaterials.reduce((acc, item) => {
    const key = item.topic || "General Resources";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const getTypeBadge = (type) => {
    switch (type) {
      case "PDF":
        return { badgeClass: "custom-badge-red", icon: "📄", label: "PDF Document" };
      case "PPT":
        return { badgeClass: "custom-badge-amber", icon: "📊", label: "PPT Slides" };
      case "DOCX":
        return { badgeClass: "custom-badge-blue", icon: "📝", label: "Word Doc" };
      case "EXCEL":
        return { badgeClass: "custom-badge-green", icon: "📈", label: "Excel Sheet" };
      case "VIDEO":
        return { badgeClass: "custom-badge-indigo", icon: "🎥", label: "Video Lecture" };
      case "ZIP":
        return { badgeClass: "custom-badge-amber", icon: "📦", label: "ZIP Archive" };
      case "LAB_MANUAL":
        return { badgeClass: "custom-badge-green", icon: "🧪", label: "Lab Manual" };
      case "NOTE":
        return { badgeClass: "custom-badge-indigo", icon: "📜", label: "Lecture Notes" };
      case "REFERENCE_LINK":
        return { badgeClass: "custom-badge-indigo", icon: "🔗", label: "Web Link" };
      default:
        return { badgeClass: "custom-badge-gray", icon: "📁", label: type };
    }
  };

  return (
    <div className="space-y-6 flex flex-col gap-6">
      {/* Header & Action Bar */}
      <div className="premium-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ fontFamily: "var(--font-heading)", color: "var(--text-main)" }}>
            📚 Course Materials & Classwork
          </h2>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Lecture notes, lab manuals, presentation slides, documents, and reference materials for {classroom?.subjectName}
          </p>
        </div>

        {(userRole === "FACULTY" || userRole === "ADMIN") && (
          <button
            onClick={() => setShowUploadModal(true)}
            style={{
              padding: "0.6rem 1.2rem",
              background: "#10b981",
              color: "#ffffff",
              borderRadius: "10px",
              fontWeight: "600",
              fontSize: "0.85rem",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)"
            }}
          >
            <i className="fa-solid fa-cloud-arrow-up" />
            <span>Upload Resource</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="premium-card flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="search-container-input" style={{ maxWidth: "340px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search resources by title or topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="ALL">All Resource Types</option>
            <option value="PDF">PDF Documents</option>
            <option value="PPT">PPT Presentations</option>
            <option value="DOCX">Word Documents</option>
            <option value="EXCEL">Excel Spreadsheets</option>
            <option value="VIDEO">Video Lectures</option>
            <option value="ZIP">ZIP Archives</option>
            <option value="LAB_MANUAL">Lab Manuals</option>
            <option value="REFERENCE_LINK">Reference Links</option>
          </select>

          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
          >
            <option value="ALL">All Topics / Units</option>
            {topicsList.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Materials List Grouped by Topic */}
      {loading ? (
        <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading study materials...
        </div>
      ) : Object.keys(groupedMaterials).length === 0 ? (
        <div className="premium-card text-center py-16 space-y-2">
          <i className="fa-solid fa-folder-open text-3xl text-emerald-500 mb-2 block" />
          <h3 className="text-base font-bold" style={{ color: "var(--text-main)" }}>No Study Materials Found</h3>
          <p className="text-xs max-w-sm mx-auto" style={{ color: "var(--text-muted)" }}>
            No resources match your search or filter options. Click "Upload Resource" to add lecture notes, PPTs, or PDF docs.
          </p>
        </div>
      ) : (
        <div className="space-y-6 flex flex-col gap-6">
          {Object.entries(groupedMaterials).map(([topicName, items]) => (
            <div key={topicName} className="space-y-3">
              <div className="flex items-center gap-2 pb-1 border-b" style={{ borderColor: "var(--divider)" }}>
                <span className="custom-badge custom-badge-indigo" style={{ fontSize: "0.75rem" }}>
                  📁 {topicName}
                </span>
                <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                  ({items.length} {items.length === 1 ? "File" : "Files"})
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((mat) => {
                  const typeInfo = getTypeBadge(mat.materialType);
                  return (
                    <div key={mat.id} className="premium-card flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <span className={`custom-badge ${typeInfo.badgeClass}`}>
                            {typeInfo.icon} {typeInfo.label}
                          </span>
                          <span className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>
                            {mat.fileSize || "1.5 MB"}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold line-clamp-1" style={{ color: "var(--text-main)" }}>
                          {mat.title}
                        </h4>
                        {mat.description && (
                          <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--text-muted)" }}>
                            {mat.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t flex items-center justify-between text-xs" style={{ borderColor: "var(--divider)" }}>
                        <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                          By {mat.uploadedByName || "Faculty"}
                        </span>

                        <div className="flex items-center gap-2">
                          {(userRole === "FACULTY" || userRole === "ADMIN") && (
                            <button
                              onClick={() => handleDeleteMaterial(mat.id)}
                              className="custom-badge custom-badge-red"
                              style={{ cursor: "pointer" }}
                              title="Delete Material"
                            >
                              🗑️
                            </button>
                          )}

                          {/* 👁️ View Button */}
                          <button
                            onClick={() => handleView(mat)}
                            style={{
                              padding: "0.35rem 0.75rem",
                              background: "#4f46e5",
                              color: "#ffffff",
                              borderRadius: "6px",
                              fontWeight: "600",
                              fontSize: "0.75rem",
                              border: "none",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.35rem",
                              transition: "all 0.15s ease"
                            }}
                            title="View Document in Viewer"
                          >
                            <span>👁️ View</span>
                          </button>

                          {/* 📥 Download Button */}
                          <button
                            onClick={() => handleDownload(mat)}
                            style={{
                              padding: "0.35rem 0.75rem",
                              background: "var(--bg-secondary)",
                              color: "var(--text-main)",
                              borderRadius: "6px",
                              fontWeight: "600",
                              fontSize: "0.75rem",
                              border: "1px solid var(--card-border)",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.35rem",
                              transition: "all 0.15s ease"
                            }}
                            title="Download Document"
                          >
                            <span>📥 Download</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── In-App Document Viewer Modal ── */}
      {previewMaterial && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
          <div
            className="premium-card max-w-5xl w-full h-[90vh] flex flex-col p-4 sm:p-6 shadow-2xl overflow-hidden"
            style={{ background: "var(--bg-card)", border: "1px solid var(--card-border)" }}
          >
            {/* Viewer Top Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b" style={{ borderColor: "var(--divider)" }}>
              <div className="flex items-center gap-3 min-w-0">
                <span className={`custom-badge ${getTypeBadge(previewMaterial.materialType).badgeClass}`}>
                  {getTypeBadge(previewMaterial.materialType).icon} {getTypeBadge(previewMaterial.materialType).label}
                </span>
                <div>
                  <h3 className="text-base font-bold truncate max-w-md" style={{ color: "var(--text-main)" }}>
                    {previewMaterial.title}
                  </h3>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {previewMaterial.topic || "General"} • {previewMaterial.fileSize || "Document"} • By {previewMaterial.uploadedByName || "Instructor"}
                  </p>
                </div>
              </div>

              {/* Viewer Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(previewMaterial)}
                  style={{
                    padding: "0.45rem 0.9rem",
                    background: "#10b981",
                    color: "#ffffff",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "0.78rem",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem"
                  }}
                >
                  <span>📥 Download File</span>
                </button>

                <button
                  onClick={() => {
                    const targetUrl = blobUrl || previewMaterial.fileUrl;
                    window.open(targetUrl, "_blank", "noopener,noreferrer");
                  }}
                  style={{
                    padding: "0.45rem 0.9rem",
                    background: "var(--bg-secondary)",
                    color: "var(--text-main)",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "0.78rem",
                    border: "1px solid var(--card-border)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem"
                  }}
                >
                  <span>↗ New Tab</span>
                </button>

                <button
                  onClick={() => setPreviewMaterial(null)}
                  style={{
                    padding: "0.45rem 0.75rem",
                    background: "transparent",
                    color: "var(--text-muted)",
                    borderRadius: "8px",
                    fontWeight: "700",
                    fontSize: "1.1rem",
                    border: "1px solid var(--card-border)",
                    cursor: "pointer"
                  }}
                  title="Close Viewer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Viewer Content Frame */}
            <div className="flex-1 w-full mt-4 overflow-hidden rounded-xl bg-black/5 dark:bg-black/40 flex items-center justify-center">
              {previewMaterial.materialType === "PDF" ? (
                <object
                  data={blobUrl || previewMaterial.fileUrl}
                  type="application/pdf"
                  className="w-full h-full rounded-xl"
                  style={{ minHeight: "65vh" }}
                >
                  <iframe
                    src={blobUrl || previewMaterial.fileUrl}
                    title={previewMaterial.title}
                    className="w-full h-full rounded-xl border-0"
                  />
                </object>
              ) : previewMaterial.materialType === "VIDEO" ? (
                <video controls autoPlay className="w-full max-h-full rounded-xl">
                  <source src={previewMaterial.fileUrl} />
                  Your browser does not support video playback.
                </video>
              ) : previewMaterial.fileUrl?.startsWith("http") ? (
                <iframe
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(previewMaterial.fileUrl)}&embedded=true`}
                  title={previewMaterial.title}
                  className="w-full h-full rounded-xl border-0"
                />
              ) : (
                <div className="text-center p-8 max-w-md space-y-4">
                  <div className="w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-3xl mx-auto">
                    {getTypeBadge(previewMaterial.materialType).icon}
                  </div>
                  <div>
                    <h4 className="text-base font-bold" style={{ color: "var(--text-main)" }}>
                      {previewMaterial.fileName || previewMaterial.title}
                    </h4>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                      {previewMaterial.description || "This presentation/document is stored securely and ready to view or download."}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => handleDownload(previewMaterial)}
                      style={{
                        padding: "0.6rem 1.25rem",
                        background: "#4f46e5",
                        color: "#ffffff",
                        borderRadius: "8px",
                        fontWeight: "600",
                        fontSize: "0.85rem",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem"
                      }}
                    >
                      <span>📥 Download & Open File</span>
                    </button>
                    <button
                      onClick={() => window.open(previewMaterial.fileUrl, "_blank")}
                      style={{
                        padding: "0.6rem 1.25rem",
                        background: "var(--bg-secondary)",
                        color: "var(--text-main)",
                        borderRadius: "8px",
                        fontWeight: "600",
                        fontSize: "0.85rem",
                        border: "1px solid var(--card-border)",
                        cursor: "pointer"
                      }}
                    >
                      ↗ Open Raw File
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal for Uploading Material */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="premium-card max-w-xl w-full p-6 space-y-4 shadow-2xl" style={{ background: "var(--bg-card)" }}>
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--divider)" }}>
              <div>
                <h3 className="text-lg font-bold" style={{ color: "var(--text-main)" }}>
                  Upload Learning Resource
                </h3>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Upload PDF, PPT, Word docs, lab manuals, or share external cloud links.
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  fontSize: "1.25rem",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            {/* Mode Switcher: Direct File vs External Link */}
            <div className="flex items-center gap-2 p-1 rounded-xl" style={{ background: "var(--bg-secondary)", border: "1px solid var(--card-border)" }}>
              <button
                type="button"
                onClick={() => setUploadMethod("FILE")}
                style={{
                  flex: 1,
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  fontWeight: "700",
                  border: "none",
                  cursor: "pointer",
                  background: uploadMethod === "FILE" ? "#4f46e5" : "transparent",
                  color: uploadMethod === "FILE" ? "#ffffff" : "var(--text-muted)",
                  transition: "all 0.2s ease"
                }}
              >
                📁 Upload Document (PDF / PPT / Word)
              </button>
              <button
                type="button"
                onClick={() => setUploadMethod("LINK")}
                style={{
                  flex: 1,
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  fontWeight: "700",
                  border: "none",
                  cursor: "pointer",
                  background: uploadMethod === "LINK" ? "#4f46e5" : "transparent",
                  color: uploadMethod === "LINK" ? "#ffffff" : "var(--text-muted)",
                  transition: "all 0.2s ease"
                }}
              >
                🔗 Cloud / Web Link
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* Direct File Dropzone */}
              {uploadMethod === "FILE" ? (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
                    Select Document File
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.csv,.txt,.mp4,.zip"
                    onChange={(e) => handleFileProcess(e.target.files[0])}
                    style={{ display: "none" }}
                  />

                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: `2px dashed ${dragActive ? "#4f46e5" : selectedFile ? "#10b981" : "var(--card-border)"}`,
                      borderRadius: "14px",
                      padding: "1.75rem 1rem",
                      textAlign: "center",
                      background: dragActive ? "rgba(79, 70, 229, 0.08)" : selectedFile ? "rgba(16, 185, 129, 0.05)" : "var(--bg-secondary)",
                      cursor: "pointer",
                      transition: "all 0.2s ease-in-out",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                    }}
                  >
                    {selectedFile ? (
                      <>
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-2xl">
                          {materialType === "PDF" ? "📄" : materialType === "PPT" ? "📊" : materialType === "DOCX" ? "📝" : "📁"}
                        </div>
                        <div className="text-sm font-bold truncate max-w-sm" style={{ color: "var(--text-main)" }}>
                          {selectedFile.name}
                        </div>
                        <div className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                          {fileSize} • Click or drop a different file to replace
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-2xl">
                          <i className="fa-solid fa-cloud-arrow-up" />
                        </div>
                        <div className="text-sm font-bold" style={{ color: "var(--text-main)" }}>
                          Click to browse or drag & drop files here
                        </div>
                        <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                          Supports PDF, PPT, PPTX, Word (DOC/DOCX), Excel, TXT, Videos & ZIP (up to 50MB)
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
                    Resource URL / Storage Link
                  </label>
                  <div className="search-container-input" style={{ maxWidth: "100%" }}>
                    <input
                      type="url"
                      required={uploadMethod === "LINK"}
                      placeholder="https://drive.google.com/... or cloud link"
                      value={fileUrl}
                      onChange={(e) => setFileUrl(e.target.value)}
                      style={{ paddingLeft: "1rem" }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
                  Resource Title
                </label>
                <div className="search-container-input" style={{ maxWidth: "100%" }}>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Unit 1 Lecture Notes PDF"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ paddingLeft: "1rem" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
                    Material Type
                  </label>
                  <select
                    value={materialType}
                    onChange={(e) => setMaterialType(e.target.value)}
                    style={{ width: "100%" }}
                  >
                    <option value="PDF">PDF Document (📄)</option>
                    <option value="PPT">PPT Presentation (📊)</option>
                    <option value="DOCX">Word Document (📝)</option>
                    <option value="EXCEL">Excel Spreadsheet (📈)</option>
                    <option value="VIDEO">Video Lecture (🎥)</option>
                    <option value="ZIP">ZIP Archive (📦)</option>
                    <option value="LAB_MANUAL">Lab Manual (🧪)</option>
                    <option value="NOTE">Lecture Notes (📜)</option>
                    <option value="REFERENCE_LINK">Reference Link (🔗)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
                    Topic / Unit
                  </label>
                  <div className="search-container-input" style={{ maxWidth: "100%" }}>
                    <input
                      type="text"
                      placeholder="Unit 1: Fundamentals"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      style={{ paddingLeft: "1rem" }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
                  Description / Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional notes or study guidelines for students..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                  onClick={() => setShowUploadModal(false)}
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
                  disabled={publishing}
                  style={{
                    padding: "0.5rem 1.25rem",
                    background: "#10b981",
                    color: "#ffffff",
                    borderRadius: "8px",
                    border: "none",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem"
                  }}
                >
                  {publishing && <i className="fa-solid fa-circle-notch fa-spin" />}
                  <span>{publishing ? "Publishing..." : "Publish Material"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassroomMaterials;
