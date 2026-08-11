import axios from "axios";
import API_BASE from "./api";

const CLASSROOM_API = `${API_BASE}/api/classrooms`;

const authHeaders = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const getMyClassrooms = (token) =>
  axios.get(`${CLASSROOM_API}/my-classrooms`, authHeaders(token));

export const getClassroomById = (id, token) =>
  axios.get(`${CLASSROOM_API}/${id}`, authHeaders(token));

export const syncClassrooms = (token) =>
  axios.post(`${CLASSROOM_API}/sync`, {}, authHeaders(token));

export const getClassroomAnnouncements = (classroomId, token) =>
  axios.get(`${CLASSROOM_API}/${classroomId}/announcements`, authHeaders(token));

export const createAnnouncement = (classroomId, data, token) =>
  axios.post(`${CLASSROOM_API}/${classroomId}/announcements`, data, authHeaders(token));

export const updateAnnouncement = (announcementId, data, token) =>
  axios.put(`${CLASSROOM_API}/announcements/${announcementId}`, data, authHeaders(token));

export const deleteAnnouncement = (announcementId, token) =>
  axios.delete(`${CLASSROOM_API}/announcements/${announcementId}`, authHeaders(token));

export const togglePinAnnouncement = (announcementId, token) =>
  axios.post(`${CLASSROOM_API}/announcements/${announcementId}/pin`, {}, authHeaders(token));

export const addAnnouncementComment = (announcementId, commentText, token) =>
  axios.post(`${CLASSROOM_API}/announcements/${announcementId}/comments`, { commentText }, authHeaders(token));

export const getClassroomMaterials = (classroomId, token) =>
  axios.get(`${CLASSROOM_API}/${classroomId}/materials`, authHeaders(token));

export const createMaterial = (classroomId, data, token) =>
  axios.post(`${CLASSROOM_API}/${classroomId}/materials`, data, authHeaders(token));

export const deleteMaterial = (materialId, token) =>
  axios.delete(`${CLASSROOM_API}/materials/${materialId}`, authHeaders(token));

export const getClassroomAssignments = (classroomId, token) =>
  axios.get(`${CLASSROOM_API}/${classroomId}/assignments`, authHeaders(token));

export const createAssignment = (classroomId, data, token) =>
  axios.post(`${CLASSROOM_API}/${classroomId}/assignments`, data, authHeaders(token));

export const updateAssignment = (assignmentId, data, token) =>
  axios.put(`${CLASSROOM_API}/assignments/${assignmentId}`, data, authHeaders(token));

export const deleteAssignment = (assignmentId, token) =>
  axios.delete(`${CLASSROOM_API}/assignments/${assignmentId}`, authHeaders(token));

export const getAssignmentSubmissions = (assignmentId, token) =>
  axios.get(`${CLASSROOM_API}/assignments/${assignmentId}/submissions`, authHeaders(token));

export const submitAssignment = (assignmentId, data, token) =>
  axios.post(`${CLASSROOM_API}/assignments/${assignmentId}/submit`, data, authHeaders(token));

export const gradeSubmission = (submissionId, data, token) =>
  axios.post(`${CLASSROOM_API}/submissions/${submissionId}/grade`, data, authHeaders(token));

export const getMySubmissions = (token) =>
  axios.get(`${CLASSROOM_API}/my-submissions`, authHeaders(token));

export const getClassroomAssessments = (classroomId, token) =>
  axios.get(`${CLASSROOM_API}/${classroomId}/assessments`, authHeaders(token));

export const createAssessment = (classroomId, data, token) =>
  axios.post(`${CLASSROOM_API}/${classroomId}/assessments`, data, authHeaders(token));

export const deleteAssessment = (assessmentId, token) =>
  axios.delete(`${CLASSROOM_API}/assessments/${assessmentId}`, authHeaders(token));

export const startAssessmentAttempt = (assessmentId, token) =>
  axios.post(`${CLASSROOM_API}/assessments/${assessmentId}/start`, {}, authHeaders(token));

export const submitAssessmentAttempt = (attemptId, data, token) =>
  axios.post(`${CLASSROOM_API}/assessments/attempts/${attemptId}/submit`, data, authHeaders(token));

export const gradeAssessmentAttempt = (attemptId, score, feedback, token) =>
  axios.post(`${CLASSROOM_API}/assessments/attempts/${attemptId}/grade?score=${score}${feedback ? `&feedback=${encodeURIComponent(feedback)}` : ""}`, {}, authHeaders(token));

export const getAssessmentAttempts = (assessmentId, token) =>
  axios.get(`${CLASSROOM_API}/assessments/${assessmentId}/attempts`, authHeaders(token));

export const allowStudentRetake = (assessmentId, studentId, token) =>
  axios.post(`${CLASSROOM_API}/assessments/${assessmentId}/allow-retake?studentId=${studentId}`, {}, authHeaders(token));

export const previewAIQuestions = (classroomId, data, token) =>
  axios.post(`${CLASSROOM_API}/${classroomId}/ai-preview-questions`, data, authHeaders(token));

export const generateAIAssessment = (classroomId, data, token) =>
  axios.post(`${CLASSROOM_API}/${classroomId}/ai-generate-assessment`, data, authHeaders(token));

export const getLectureTimeline = (classroomId, token) =>
  axios.get(`${CLASSROOM_API}/${classroomId}/lectures`, authHeaders(token));

export const getLectureDetails = (lectureId, token) =>
  axios.get(`${CLASSROOM_API}/lectures/${lectureId}`, authHeaders(token));

export const createLectureHistory = (classroomId, data, token) =>
  axios.post(`${CLASSROOM_API}/${classroomId}/lectures`, data, authHeaders(token));

export const updateLectureTopic = (lectureId, data, token) =>
  axios.put(`${CLASSROOM_API}/lectures/${lectureId}`, data, authHeaders(token));

export const attachMaterialToLecture = (lectureId, materialId, token) =>
  axios.post(`${CLASSROOM_API}/lectures/${lectureId}/materials?materialId=${materialId}`, {}, authHeaders(token));

export const attachAssignmentToLecture = (lectureId, assignmentId, token) =>
  axios.post(`${CLASSROOM_API}/lectures/${lectureId}/assignments?assignmentId=${assignmentId}`, {}, authHeaders(token));

export const attachAssessmentToLecture = (lectureId, assessmentId, token) =>
  axios.post(`${CLASSROOM_API}/lectures/${lectureId}/assessments?assessmentId=${assessmentId}`, {}, authHeaders(token));

export const attachCodingToLecture = (lectureId, codingId, token) =>
  axios.post(`${CLASSROOM_API}/lectures/${lectureId}/coding?codingId=${codingId}`, {}, authHeaders(token));

export const generateAILectureSummary = (lectureId, token) =>
  axios.post(`${CLASSROOM_API}/lectures/${lectureId}/ai-summary`, {}, authHeaders(token));

export const getStudentGradebook = (token) =>
  axios.get(`/api/analytics/student`, authHeaders(token));

export const getStudentClassroomGrade = (classroomId, token) =>
  axios.get(`/api/analytics/student/classroom/${classroomId}`, authHeaders(token));

export const getStudentAIInsight = (classroomId, token) =>
  axios.get(`/api/analytics/student/classroom/${classroomId}/ai-insights`, authHeaders(token));

export const getFacultyClassroomAnalytics = (classroomId, token) =>
  axios.get(`/api/analytics/faculty/classroom/${classroomId}`, authHeaders(token));

export const getAdminERPAnalytics = (token) =>
  axios.get(`/api/analytics/admin`, authHeaders(token));
