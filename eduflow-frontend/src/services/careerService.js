import axios from "axios";
import API_BASE from "./api";

const API_URL = `${API_BASE}/api/career`;

export const getCareerDashboard = (token) => {
  return axios.get(`${API_URL}/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
