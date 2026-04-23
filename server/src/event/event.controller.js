import Event from "./event.model.js";

// 🔹 CREATE EVENT
export const createEvent = async (req, res) => {
  try {
    const imageUrl = req.file
      ? `/uploads/events/${req.file.filename}`
      : null;

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
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 MY EVENTS
export const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.user._id });
    res.json(events);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// 🔥 UPDATE EVENT (FIXED VERSION)
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // 🔒 Only creator can edit
    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // 🔒 Prevent editing approved
    if (event.status === "approved") {
      return res.status(400).json({ message: "Cannot edit approved event" });
    }

    const updateData = {
      ...req.body,
    };

    // 🔥 HANDLE IMAGE UPDATE (THIS WAS MISSING)
    if (req.file) {
      updateData.image = `/uploads/events/${req.file.filename}`;
    }

    const updated = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    console.error("Update event error:", error);
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