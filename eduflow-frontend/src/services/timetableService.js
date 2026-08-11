import axios from "axios";

const API_BASE = `http://${window.location.hostname}:8080`;
const TIMETABLE_API = `${API_BASE}/api/timetable`;
const ADMIN_API = `${API_BASE}/api/admin`;

const getToken = (t) => (t && t !== "undefined" && t !== "null" ? t : localStorage.getItem("token"));
const authHeaders = (token) => {
  const t = getToken(token);
  return t ? { headers: { Authorization: `Bearer ${t}` } } : {};
};

export const getDepartmentTimetable = (department, token, semester = null) =>
  axios.get(`${TIMETABLE_API}/department?department=${encodeURIComponent(department)}${semester ? `&semester=${semester}` : ""}`, authHeaders(token));

export const getInstitutionClasses = (token, department = null, semester = null, section = null) => {
  const params = {};
  if (department && department !== "All") params.department = department;
  if (semester && semester !== 0 && semester !== "All") params.semester = semester;
  if (section && section !== "ALL" && section !== "All") params.section = section;
  return axios.get(`${TIMETABLE_API}/institution-classes`, { params, ...authHeaders(token) });
};

export const saveDepartmentTimetable = (department, entries, token, versionId = null, semester = null) =>
  axios.post(`${TIMETABLE_API}/batch`, { department, entries, versionId, semester }, authHeaders(token));

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

export const generateInstitutionalTimetable = (data, token) =>
  axios.post(`${TIMETABLE_API}/generate-institutional`, data || {}, authHeaders(token));

export const randomizeClassTimetable = (data, token) =>
  axios.post(`${TIMETABLE_API}/randomize-class`, data, authHeaders(token));

export const getTimetableVersions = (token, department) =>
  axios.get(`${ADMIN_API}/timetable-versions${department ? `?department=${encodeURIComponent(department)}` : ""}`, authHeaders(token));

export const activateTimetableVersion = (id, token) =>
  axios.post(`${ADMIN_API}/timetable-versions/activate/${id}`, {}, authHeaders(token));

const CODING_API = `${API_BASE}/api/coding`;

export const assignFreeActivityPeriod = (data, token) =>
  axios.post(`${CODING_API}/assign-activity`, data, authHeaders(token));

export const getActiveFreeActivityChallenge = (date, department, token) =>
  axios.get(`${CODING_API}/challenge?date=${date}&department=${encodeURIComponent(department)}`, authHeaders(token));

export const runFreeActivitySolution = (data, token) =>
  axios.post(`${CODING_API}/run`, data, authHeaders(token));

export const submitFreeActivitySolution = (data, token) =>
  axios.post(`${CODING_API}/submit`, data, authHeaders(token));

export const getFreeActivitySubmissions = (date, token) =>
  axios.get(`${CODING_API}/submissions?date=${date}`, authHeaders(token));

export const overrideFreeActivityAttendance = (data, token) =>
  axios.post(`${CODING_API}/override-attendance`, data, authHeaders(token));

export const getCodingHistory = (token) =>
  axios.get(`${CODING_API}/history`, authHeaders(token));

export const getCodingProblems = (token) =>
  axios.get(`${CODING_API}/problems`, authHeaders(token));
