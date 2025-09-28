import axios from "axios";
const API_URL = "http://localhost:5001/api";

export const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
};
export const login = async (userData) => {
  const response = await axios.post(`${API_URL}/login`, userData);
  return response.data;
};
export const logout = () => {
  localStorage.removeItem("user");
};
export const refreshToken = async (token) => {
  const response = await axios.post(`${API_URL}/refresh-token`, { token });
  return response.data;
};
export const forgotPassword = async (email) => {
  const response = await axios.post(`${API_URL}/forgot-password`, { email });
  return response.data;
};
export const resetPassword = async (data) => {
  const response = await axios.post(`${API_URL}/reset-password`, data);
  return response.data;
};
export const checkEmailExists = async (email) => {
  const res = await axios.post(`${API_URL}/check-email`, { email });
  return res.data; // { exists: true/false }
};
