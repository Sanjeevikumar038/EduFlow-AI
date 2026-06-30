import axios from "axios";

const API_BASE = `http://${window.location.hostname}:8080`;
const ADMIN_API = `${API_BASE}/api/admin`;
const TIMETABLE_API = `${API_BASE}/api/timetable`;

const authHeaders = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

// ── Subject Master ──────────────────────────────────────
export const getSubjects = (token, department) =>
  axios.get(`${ADMIN_API}/subjects${department ? `?department=${encodeURIComponent(department)}` : ""}`, authHeaders(token));

export const getActiveSubjects = (token) =>
  axios.get(`${ADMIN_API}/subjects/active`, authHeaders(token));

export const createSubject = (data, token) =>
  axios.post(`${ADMIN_API}/subjects`, data, authHeaders(token));

export const updateSubject = (id, data, token) =>
  axios.put(`${ADMIN_API}/subjects/${id}`, data, authHeaders(token));

export const deleteSubject = (id, token) =>
  axios.delete(`${ADMIN_API}/subjects/${id}`, authHeaders(token));

// ── Faculty Expertise ───────────────────────────────────
export const getAllExpertise = (token) =>
  axios.get(`${ADMIN_API}/faculty-expertise`, authHeaders(token));

export const getExpertiseByFaculty = (facultyId, token) =>
  axios.get(`${ADMIN_API}/faculty-expertise/faculty/${facultyId}`, authHeaders(token));

export const allocateExpertise = (data, token) =>
  axios.post(`${ADMIN_API}/faculty-expertise/allocate`, data, authHeaders(token));

export const removeExpertise = (id, token) =>
  axios.delete(`${ADMIN_API}/faculty-expertise/${id}`, authHeaders(token));

// ── Faculty Availability / Leaves ──────────────────────
export const getAvailability = (token, params = {}) => {
  const query = new URLSearchParams(params).toString();
  return axios.get(`${ADMIN_API}/faculty-availability${query ? `?${query}` : ""}`, authHeaders(token));
};

export const setAvailability = (data, token) =>
  axios.post(`${ADMIN_API}/faculty-availability`, data, authHeaders(token));

export const deleteAvailability = (id, token) =>
  axios.delete(`${ADMIN_API}/faculty-availability/${id}`, authHeaders(token));

// ── Faculty Workload ─────────────────────────────────────
export const getFacultyWorkload = (token) =>
  axios.get(`${ADMIN_API}/faculty-workload`, authHeaders(token));

// ── Classrooms ───────────────────────────────────────────
export const getClassrooms = (token) =>
  axios.get(`${ADMIN_API}/classrooms`, authHeaders(token));

export const createClassroom = (data, token) =>
  axios.post(`${ADMIN_API}/classrooms`, data, authHeaders(token));

export const deleteClassroom = (id, token) =>
  axios.delete(`${ADMIN_API}/classrooms/${id}`, authHeaders(token));

// ── Timetable Versions ───────────────────────────────────
export const getTimetableVersions = (token, department) =>
  axios.get(`${ADMIN_API}/timetable-versions${department ? `?department=${encodeURIComponent(department)}` : ""}`, authHeaders(token));

export const createTimetableVersion = (data, token) =>
  axios.post(`${ADMIN_API}/timetable-versions`, data, authHeaders(token));

export const activateTimetableVersion = (id, token) =>
  axios.post(`${ADMIN_API}/timetable-versions/activate/${id}`, {}, authHeaders(token));

export const deleteTimetableVersion = (id, token) =>
  axios.delete(`${ADMIN_API}/timetable-versions/${id}`, authHeaders(token));

// ── Auto-Generate ────────────────────────────────────────
export const autoGenerateTimetable = (data, token) =>
  axios.post(`${TIMETABLE_API}/auto-generate`, data, authHeaders(token));
