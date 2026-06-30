import axios from "axios";

const API_URL = "http://localhost:8080/api/career";

export const getCareerDashboard = (token) => {
  return axios.get(`${API_URL}/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
