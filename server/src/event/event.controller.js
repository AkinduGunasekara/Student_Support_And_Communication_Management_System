import Event from "./event.model.js";

// 🔹 CREATE EVENT
export const createEvent = async (req, res) => {
  try {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const event = await Event.create({
      ...req.body,
      image: imageUrl,
      createdBy: req.user._id,
      status: "pending",
    });

    res.status(201).json(event);
  } catch (error) {
    console.error("Create event error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 🔹 PUBLIC EVENTS
export const getApprovedEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: "approved" }).sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 MY EVENTS
export const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.user._id });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 ADMIN - PENDING
export const getPendingEvents = async (req, res) => {
  const events = await Event.find({ status: "pending" });
  res.json(events);
};

// 🔹 APPROVE
export const approveEvent = async (req, res) => {
  const event = await Event.findByIdAndUpdate(
    req.params.id,
    { status: "approved", approvedBy: req.user._id },
    { new: true }
  );

  res.json(event);
};

// 🔹 REJECT
export const rejectEvent = async (req, res) => {
  const event = await Event.findByIdAndUpdate(
    req.params.id,
    {
      status: "rejected",
      rejectionReason: req.body.reason,
    },
    { new: true }
  );

  res.json(event);
};