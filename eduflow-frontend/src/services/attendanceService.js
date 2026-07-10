import axios from "axios";

const API_BASE = `http://${window.location.hostname}:8080`;
const ATTENDANCE_API = `${API_BASE}/api/attendance`;

export const startSession = (data, token) => {
  return axios.post(`${ATTENDANCE_API}/session/start`, data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const endSession = (sessionId, token) => {
  return axios.post(`${ATTENDANCE_API}/session/end/${sessionId}`, {}, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const getActiveSession = (token) => {
  return axios.get(`${ATTENDANCE_API}/session/active`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const markAttendance = (data, token) => {
  return axios.post(`${ATTENDANCE_API}/mark`, data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const getSessionRecords = (sessionId, token) => {
  return axios.get(`${ATTENDANCE_API}/session/${sessionId}/records`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const getAllSessions = (token) => {
  return axios.get(`${ATTENDANCE_API}/sessions`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const getSessionReport = (sessionId, token) => {
  return axios.get(`${ATTENDANCE_API}/session/${sessionId}/report`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const getStudentAnalytics = (token) => {
  return axios.get(`${ATTENDANCE_API}/analytics/student`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const getFacultyAnalytics = (token) => {
  return axios.get(`${ATTENDANCE_API}/analytics/faculty`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const getAdminAnalytics = (token) => {
  return axios.get(`${ATTENDANCE_API}/analytics/admin`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

// ── Export: CSV download ─────────────────────────────────────────────────────
export const exportSessionCsv = (sessionId, token) => {
  return axios.get(`${ATTENDANCE_API}/session/${sessionId}/export/csv`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: "blob"
  });
};

// ── Export: PDF structured data ──────────────────────────────────────────────
export const exportSessionPdfData = (sessionId, token) => {
  return axios.get(`${ATTENDANCE_API}/session/${sessionId}/export/pdf-data`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// ── Low Attendance Students ──────────────────────────────────────────────────
export const getLowAttendanceStudents = (token) => {
  return axios.get(`${ATTENDANCE_API}/analytics/low-attendance`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const getSessionStudents = (sessionId, token) => {
  return axios.get(`${ATTENDANCE_API}/session/${sessionId}/students`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const markManualAttendance = (sessionId, studentId, status, token) => {
  return axios.post(`${ATTENDANCE_API}/session/${sessionId}/manual`, { studentId, status }, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const closeSession = (sessionId, token) => {
  return axios.post(`${ATTENDANCE_API}/session/${sessionId}/close`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const getMySubjects = (token) => {
  return axios.get(`${ATTENDANCE_API}/my-subjects`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const saveBulkAttendance = (sessionId, requests, token) => {
  return axios.post(`${ATTENDANCE_API}/session/${sessionId}/bulk-manual`, requests, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const saveManualAttendanceSession = (data, token) => {
  return axios.post(`${ATTENDANCE_API}/session/save-manual`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
