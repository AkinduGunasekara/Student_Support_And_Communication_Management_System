import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API = `${API_BASE_URL}/api/events`;

// 🔐 AUTH HEADER
const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("ssc_token")}`,
  },
});

// 🔥 CREATE EVENT (WITH IMAGE)
export const createEvent = async (form) => {
  const formData = new FormData();

  formData.append("title", form.title);
  formData.append("description", form.description);
  formData.append("date", form.date);
  formData.append("startTime", form.startTime);
  formData.append("endTime", form.endTime);
  formData.append("location", form.location);
  formData.append("type", form.type);

  if (form.image) {
    formData.append("image", form.image);
  }

  const res = await axios.post(API, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${localStorage.getItem("ssc_token")}`, 
    },
  });

  return res.data;
};


// 🔹 GET APPROVED (PUBLIC)
export const getApprovedEvents = async () => {
  const res = await axios.get(API);
  return res.data;
};


// 🔹 MY EVENTS
export const getMyEvents = async () => {
  const res = await axios.get(`${API}/my-events`, authHeader());
  return res.data;
};

export const updateEvent = async (id, data) => {
  const res = await axios.put(`${API}/${id}`, data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("ssc_token")}`,
    },
  });

  return res.data;
};


// 🔹 ADMIN
const getToken = () => localStorage.getItem("ssc_token");

// 🔹 GET PENDING EVENTS (ADMIN)
export const getPendingEvents = async () => {
  const res = await axios.get(`${API}/admin/pending`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return res.data;
};

// 🔹 APPROVE EVENT
export const approveEvent = async (id) => {
  const res = await axios.put(
    `${API}/admin/${id}/approve`,
    {},
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
  return res.data;
};

// 🔹 REJECT EVENT
export const rejectEvent = async (id) => {
  const res = await axios.put(
    `${API}/admin/${id}/reject`,
    { reason: "Not suitable" },
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
  return res.data;
};
