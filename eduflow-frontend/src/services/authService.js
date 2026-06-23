import axios from "axios";

const API_BASE = `http://${window.location.hostname}:8080`;
const AUTH_API = `${API_BASE}/auth`;
const ADMIN_API = `${API_BASE}/api/admin`;

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

export const deleteStudent = (id, token) => {
  return axios.delete(`${ADMIN_API}/students/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const getFaculty = (token) => {
  return axios.get(`${ADMIN_API}/faculty`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const deleteFaculty = (id, token) => {
  return axios.delete(`${ADMIN_API}/faculty/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};
