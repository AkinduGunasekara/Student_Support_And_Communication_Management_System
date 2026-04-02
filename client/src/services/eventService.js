import axios from "axios";

const API = "http://localhost:5001/api/events";

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
      Authorization: `Bearer ${localStorage.getItem("ssc_token")}`, // ✅ FIXED
    },
  });

  return res.data;
};


// 🔹 GET APPROVED (PUBLIC)
export const getApprovedEvents = () => axios.get(API);

// 🔹 MY EVENTS
export const getMyEvents = () =>
  axios.get(`${API}/my-events`, authHeader());

// 🔹 ADMIN
const getToken = () => localStorage.getItem("token");

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