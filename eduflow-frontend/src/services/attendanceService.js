import axios from "axios";

const ATTENDANCE_API = "http://localhost:8080/api/attendance";

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



