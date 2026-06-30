import axios from "axios";

const API_BASE = `http://${window.location.hostname}:8080`;
const TIMETABLE_API = `${API_BASE}/api/timetable`;
const ADMIN_API = `${API_BASE}/api/admin`;

const authHeaders = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const getDepartmentTimetable = (department, token) =>
  axios.get(`${TIMETABLE_API}/department/${encodeURIComponent(department)}`, authHeaders(token));

export const saveDepartmentTimetable = (department, entries, token, versionId = null) =>
  axios.post(`${TIMETABLE_API}/batch`, { department, entries, versionId }, authHeaders(token));

export const getStudentTimetable = (token) =>
  axios.get(`${TIMETABLE_API}/student`, authHeaders(token));

export const getFacultyTimetable = (token) =>
  axios.get(`${TIMETABLE_API}/faculty`, authHeaders(token));

export const getCurrentClassStatus = (simParams, token) => {
  const params = {};
  if (simParams?.simulatedDay) params.simulatedDay = simParams.simulatedDay;
  if (simParams?.simulatedTime) params.simulatedTime = simParams.simulatedTime;
  if (simParams?.department) params.department = simParams.department;
  return axios.get(`${TIMETABLE_API}/current`, { params, ...authHeaders(token) });
};

export const getSuggestedSubject = (simParams, token) => {
  const params = {};
  if (simParams?.simulatedDay) params.simulatedDay = simParams.simulatedDay;
  if (simParams?.simulatedTime) params.simulatedTime = simParams.simulatedTime;
  return axios.get(`${TIMETABLE_API}/suggest-subject`, { params, ...authHeaders(token) });
};

export const autoGenerateTimetable = (data, token) =>
  axios.post(`${TIMETABLE_API}/auto-generate`, data, authHeaders(token));

export const getTimetableVersions = (token, department) =>
  axios.get(`${ADMIN_API}/timetable-versions${department ? `?department=${encodeURIComponent(department)}` : ""}`, authHeaders(token));

export const activateTimetableVersion = (id, token) =>
  axios.post(`${ADMIN_API}/timetable-versions/activate/${id}`, {}, authHeaders(token));
