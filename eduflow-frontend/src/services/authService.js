import axios from "axios";

const API_BASE = `http://${window.location.hostname}:8080`;
const AUTH_API = `${API_BASE}/auth`;
const ADMIN_API = `${API_BASE}/api/admin`;

const getToken = (t) => (t && t !== "undefined" && t !== "null" ? t : localStorage.getItem("token"));
const authHeaders = (token) => {
  const t = getToken(token);
  return t ? { headers: { Authorization: `Bearer ${t}` } } : {};
};

export const login = (data) => {
  return axios.post(`${AUTH_API}/login`, data);
};

export const register = (data) => {
  return axios.post(`${AUTH_API}/register`, data);
};

export const createFaculty = (data, token) => {
  return axios.post(`${ADMIN_API}/create-faculty`, data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const bulkCreateFaculty = (data, token) => {
  return axios.post(`${ADMIN_API}/bulk-create-faculty`, data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const getStudents = (token) => {
  return axios.get(`${ADMIN_API}/students`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const createStudent = (data, token) => {
  return axios.post(`${ADMIN_API}/create-student`, data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const bulkCreateStudents = (data, token) => {
  return axios.post(`${ADMIN_API}/bulk-create-students`, data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const deleteStudent = (id, token) => {
  return axios.delete(`${ADMIN_API}/students/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const getFaculty = (token) => {
  return axios.get(`${ADMIN_API}/faculty`, authHeaders(token));
};

export const deleteFaculty = (id, token) => {
  return axios.delete(`${ADMIN_API}/faculty/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const deleteAllFaculty = (token) => {
  return axios.delete(`${ADMIN_API}/faculty/all`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};



export const getStudentsPaged = (params, token) => {
  return axios.get(`${API_BASE}/api/students`, {
    params,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const getStudentProfile = (id, token) => {
  return axios.get(`${API_BASE}/api/students/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const searchStudents = (query, token) => {
  return axios.get(`${API_BASE}/api/students/search`, {
    params: { query },
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const purgeMockData = (token) => {
  return axios.post(`${ADMIN_API}/purge-mock-data`, {}, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};
