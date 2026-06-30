import axios from "axios";

const API_BASE = `http://${window.location.hostname}:8080`;
const LEAVE_API = `${API_BASE}/api/leave`;

const authHeaders = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

// Student submits leave request
export const submitLeaveRequest = (data, token) =>
  axios.post(LEAVE_API, data, authHeaders(token));

// Student views their own requests
export const getMyLeaveRequests = (token) =>
  axios.get(`${LEAVE_API}/my`, authHeaders(token));

// Faculty views department requests (with optional status filter)
export const getDepartmentLeaveRequests = (token, status = "") => {
  const params = status ? `?status=${status}` : "";
  return axios.get(`${LEAVE_API}/department${params}`, authHeaders(token));
};

// Faculty approves a leave request
export const approveLeaveRequest = (id, token) =>
  axios.post(`${LEAVE_API}/${id}/approve`, {}, authHeaders(token));

// Faculty rejects a leave request (with optional reason)
export const rejectLeaveRequest = (id, token, rejectionReason = "") =>
  axios.post(`${LEAVE_API}/${id}/reject`, { rejectionReason }, authHeaders(token));

// Admin views all leave requests (with optional department and status filters)
export const getAllLeaveRequests = (token, department = "", status = "") => {
  const params = new URLSearchParams();
  if (department && department !== "All") params.append("department", department);
  if (status && status !== "All") params.append("status", status);
  const query = params.toString();
  return axios.get(`${LEAVE_API}/admin${query ? `?${query}` : ""}`, authHeaders(token));
};
