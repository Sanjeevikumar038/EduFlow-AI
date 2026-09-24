import axios from "axios";

import API_BASE from "./api";
const ADMIN_API = `${API_BASE}/api/admin`;
const TIMETABLE_API = `${API_BASE}/api/timetable`;

const getToken = (t) => (t && t !== "undefined" && t !== "null" ? t : localStorage.getItem("token"));
const authHeaders = (token) => {
  const t = getToken(token);
  return t ? { headers: { Authorization: `Bearer ${t}` } } : {};
};

// ── Subject Master ──────────────────────────────────────
export const getSubjects = (token, department) =>
  axios.get(`${ADMIN_API}/subjects${department ? `?department=${encodeURIComponent(department)}` : ""}`, authHeaders(token));

export const getActiveSubjects = (token) =>
  axios.get(`${ADMIN_API}/subjects/active`, authHeaders(token));

export const createSubject = (data, token) =>
  axios.post(`${ADMIN_API}/subjects`, data, authHeaders(token));

export const bulkCreateSubjects = (dataList, token) =>
  axios.post(`${ADMIN_API}/subjects/bulk`, dataList, authHeaders(token));

export const updateSubject = (id, data, token) =>
  axios.put(`${ADMIN_API}/subjects/${id}`, data, authHeaders(token));

export const deleteSubject = (id, token) =>
  axios.delete(`${ADMIN_API}/subjects/${id}`, authHeaders(token));

export const deleteAllSubjects = (token) =>
  axios.delete(`${ADMIN_API}/subjects/all`, authHeaders(token));

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

export const generateAiSmartWorkloadAllocation = (data, token) =>
  axios.post(`${ADMIN_API}/ai-smart-workload-allocation/generate`, data || {}, authHeaders(token));

export const approveAllocationVersion = (versionName, token) =>
  axios.post(`${ADMIN_API}/ai-smart-workload-allocation/approve/${encodeURIComponent(versionName)}`, {}, authHeaders(token));

export const getAvailableVersionNames = (token) =>
  axios.get(`${ADMIN_API}/ai-smart-workload-allocation/versions`, authHeaders(token));

export const getResultByVersionName = (versionName, token) =>
  axios.get(`${ADMIN_API}/ai-smart-workload-allocation/version/${encodeURIComponent(versionName)}`, authHeaders(token));

export const getFacultyWorkloadAllocations = (department, version, token, semester) => {
  let url = `${ADMIN_API}/faculty-workload-allocations?`;
  if (department) url += `department=${encodeURIComponent(department)}&`;
  if (version) url += `version=${encodeURIComponent(version)}&`;
  if (semester) url += `semester=${encodeURIComponent(semester)}&`;
  return axios.get(url, authHeaders(token));
};

export const clearFacultyWorkloadAllocations = (token) =>
  axios.delete(`${ADMIN_API}/faculty-workload-allocations`, authHeaders(token));

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
