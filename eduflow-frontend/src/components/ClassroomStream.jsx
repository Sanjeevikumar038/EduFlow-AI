import React, { useState, useEffect } from "react";
import {
  getClassroomAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  togglePinAnnouncement,
  addAnnouncementComment,
} from "../services/classroomService";

const ClassroomStream = ({ classroom, userRole }) => {
  const token = localStorage.getItem("token");
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);

  const [commentInputs, setCommentInputs] = useState({});

  useEffect(() => {
    fetchAnnouncements();
  }, [classroom?.id]);

  const fetchAnnouncements = async () => {
    const classId = classroom?.id;
    if (!classId || !token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await getClassroomAnnouncements(classId, token);
      setAnnouncements(res.data || []);
    } catch (err) {
      console.error("Failed to load announcements:", err);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      if (editId) {
        await updateAnnouncement(editId, { title, content, isPinned }, token);
      } else {
        await createAnnouncement(classroom.id, { title, content, isPinned }, token);
      }
      setTitle("");
      setContent("");
      setIsPinned(false);
      setEditId(null);
      setShowPostModal(false);
      fetchAnnouncements();
    } catch (err) {
      console.error("Failed to post announcement:", err);
      alert("Error saving announcement. Please try again.");
    }
  };

  const handleEdit = (ann) => {
    setEditId(ann.id);
    setTitle(ann.title);
    setContent(ann.content);
    setIsPinned(ann.isPinned);
    setShowPostModal(true);
  };

  const handleDelete = async (annId) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await deleteAnnouncement(annId, token);
      fetchAnnouncements();
    } catch (err) {
      console.error("Failed to delete announcement:", err);
    }
  };

  const handleTogglePin = async (annId) => {
    try {
      await togglePinAnnouncement(annId, token);
      fetchAnnouncements();
    } catch (err) {
      console.error("Failed to pin announcement:", err);
    }
  };

  const handleAddComment = async (annId) => {
    const commentText = commentInputs[annId];
    if (!commentText || !commentText.trim()) return;

    try {
      await addAnnouncementComment(annId, commentText, token);
      setCommentInputs({ ...commentInputs, [annId]: "" });
      fetchAnnouncements();
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  return (
    <div className="space-y-6 flex flex-col gap-6">
      {/* Stream Banner Header */}
      <div className="premium-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ fontFamily: "var(--font-heading)", color: "var(--text-main)" }}>
            📢 Course Stream
          </h2>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Announcements, course updates, and discussion threads for {classroom?.subjectName}
          </p>
        </div>

        {(userRole === "FACULTY" || userRole === "ADMIN") && (
          <button
            onClick={() => {
              setEditId(null);
              setTitle("");
              setContent("");
              setIsPinned(false);
              setShowPostModal(true);
            }}
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
            <span>New Announcement</span>
          </button>
        )}
      </div>

      {/* Announcements Feed */}
      {loading ? (
        <div className="text-center py-12" style={{ color: "var(--text-muted)" }}>
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading course stream feed...
        </div>
      ) : announcements.length === 0 ? (
        <div className="premium-card text-center py-12 space-y-2">
          <i className="fa-solid fa-bullhorn text-3xl text-indigo-500 mb-2 block" />
          <h3 className="text-base font-bold" style={{ color: "var(--text-main)" }}>No Announcements Posted Yet</h3>
          <p className="text-xs max-w-sm mx-auto" style={{ color: "var(--text-muted)" }}>
            Faculty members will publish course updates, syllabus guidelines, and exam schedules here.
          </p>
        </div>
      ) : (
        <div className="space-y-4 flex flex-col gap-4">
          {announcements.map((ann) => (
            <div key={ann.id} className="premium-card space-y-4">
              {/* Post Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="icon-tile icon-tile-indigo font-bold text-base">
                    {ann.authorName ? ann.authorName.charAt(0).toUpperCase() : "A"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm" style={{ color: "var(--text-main)" }}>{ann.authorName}</h4>
                      <span className="custom-badge custom-badge-indigo">{ann.authorRole}</span>
                      {ann.isPinned && (
                        <span className="custom-badge custom-badge-amber">📌 Pinned</span>
                      )}
                    </div>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {new Date(ann.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Pin / Edit / Delete for Author or Faculty */}
                {(userRole === "FACULTY" || userRole === "ADMIN" || ann.authorId === Number(localStorage.getItem("userId"))) && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleTogglePin(ann.id)}
                      title={ann.isPinned ? "Unpin Post" : "Pin Post"}
                      className={ann.isPinned ? "custom-badge custom-badge-amber" : "custom-badge custom-badge-gray"}
                      style={{ cursor: "pointer", padding: "0.3rem 0.6rem" }}
                    >
                      📌
                    </button>
                    <button
                      onClick={() => handleEdit(ann)}
                      className="custom-badge custom-badge-indigo"
                      style={{ cursor: "pointer", padding: "0.3rem 0.6rem" }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(ann.id)}
                      className="custom-badge custom-badge-red"
                      style={{ cursor: "pointer", padding: "0.3rem 0.6rem" }}
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>

              {/* Title & Body */}
              <div>
                <h3 className="text-base font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--text-main)" }}>
                  {ann.title}
                </h3>
                <p className="text-xs mt-2 whitespace-pre-line leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {ann.content}
                </p>
              </div>

              {/* Comments Section */}
              <div className="pt-4 border-t space-y-3" style={{ borderColor: "var(--divider)" }}>
                <h5 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  Comments ({ann.comments?.length || 0})
                </h5>

                {/* Comment Input */}
                <div className="flex items-center gap-2">
                  <div className="search-container-input flex-1" style={{ maxWidth: "100%" }}>
                    <input
                      type="text"
                      placeholder="Add a class comment..."
                      value={commentInputs[ann.id] || ""}
                      onChange={(e) =>
                        setCommentInputs({ ...commentInputs, [ann.id]: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddComment(ann.id);
                      }}
                      style={{ height: "38px", fontSize: "0.8rem", paddingLeft: "1rem" }}
                    />
                  </div>
                  <button
                    onClick={() => handleAddComment(ann.id)}
                    style={{
                      padding: "0.45rem 1rem",
                      background: "#4f46e5",
                      color: "#ffffff",
                      borderRadius: "8px",
                      border: "none",
                      fontWeight: "600",
                      fontSize: "0.85rem",
                      cursor: "pointer"
                    }}
                  >
                    Send
                  </button>
                </div>

                {/* Comments List */}
                <div className="space-y-2">
                  {ann.comments?.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-3 rounded-xl text-xs space-y-1"
                      style={{ background: "var(--box-bg)", border: "1px solid var(--box-border)" }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold" style={{ color: "var(--text-main)" }}>{comment.authorName}</span>
                        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                          {new Date(comment.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p style={{ color: "var(--text-muted)" }}>{comment.commentText}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Creating / Editing Announcement */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="premium-card max-w-lg w-full p-6 space-y-4 shadow-2xl" style={{ background: "var(--bg-card)" }}>
            <h3 className="text-lg font-bold" style={{ color: "var(--text-main)" }}>
              {editId ? "Edit Announcement" : "Create New Announcement"}
            </h3>

            <form onSubmit={handleCreateOrUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
                  Announcement Title
                </label>
                <div className="search-container-input" style={{ maxWidth: "100%" }}>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Midterm Syllabus & Lab Project Deadline"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ paddingLeft: "1rem" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
                  Detailed Message
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Type your announcements, links, or instructions..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
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

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  style={{ width: "16px", height: "16px", accentColor: "#4f46e5" }}
                />
                <label htmlFor="pinCheck" className="text-xs font-semibold" style={{ color: "var(--text-main)" }}>
                  Pin announcement to the top of class feed
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t" style={{ borderColor: "var(--divider)" }}>
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
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
                  {editId ? "Save Changes" : "Publish Announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassroomStream;
