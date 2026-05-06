import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL;

const API_URL = `${API_BASE_URL}/api/feedback`;

export const getMyFeedback = async (token) => {
  return axios.get(`${API_URL}/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const submitFeedback = async (feedbackData, token) => {
  return axios.post(API_URL, feedbackData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
