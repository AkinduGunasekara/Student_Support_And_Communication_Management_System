import axios from "axios";

const API_BASE = "http://localhost:5001/api/messages";
const AUTH_BASE = "http://localhost:5001/api/auth";

export const createMessage = async (data, token) => {
  return axios.post(API_BASE, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getMyMessages = async (token) => {
  return axios.get(`${API_BASE}/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getLecturerMessages = async (token) => {
  return axios.get(API_BASE, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getMessageById = async (id, token) => {
  return axios.get(`${API_BASE}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const answerMessage = async (id, answerData, token) => {
  return axios.patch(`${API_BASE}/${id}/answer`, answerData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateVisibility = async (id, visibilityData, token) => {
  return axios.patch(`${API_BASE}/${id}/visibility`, visibilityData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const markAsNotified = async (id, token) => {
  return axios.patch(
    `${API_BASE}/${id}/notified`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const deleteMessage = async (id, token) => {
  return axios.delete(`${API_BASE}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getPublicMessages = async (params = {}) => {
  return axios.get(`${API_BASE}/public`, { params });
};

export const getLecturersByFacultyAndCourse = async (
  faculty,
  course,
  token
) => {
  return axios.get(`${AUTH_BASE}/lecturers`, {
    params: { faculty, course },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};