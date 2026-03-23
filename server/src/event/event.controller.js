import Event from "./event.model.js";


// 🔹 CREATE EVENT
export const createEvent = async (req, res) => {
  try {
    if (
      req.user.role === "student" &&
      !req.user.canCreateEvents
    ) {
      return res.status(403).json({
        message: "Not allowed to create events",
      });
    }

    const event = await Event.create({
      ...req.body,
      createdBy: req.user._id,
      status: "pending",
    });

    res.status(201).json(event);
  } catch (error) {
    console.error("Create event error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// 🔹 GET APPROVED EVENTS (STUDENTS)
export const getApprovedEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: "approved" })
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    console.error("Get events error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// 🔹 GET SINGLE EVENT
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    console.error("Get event error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// 🔹 ADMIN: GET PENDING EVENTS
export const getPendingEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: "pending" });

    res.json(events);
  } catch (error) {
    console.error("Pending events error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// 🔹 ADMIN: APPROVE EVENT
export const approveEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      {
        status: "approved",
        approvedBy: req.user._id,
      },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    console.error("Approve error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// 🔹 ADMIN: REJECT EVENT
export const rejectEvent = async (req, res) => {
  try {
    const { reason } = req.body;

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      {
        status: "rejected",
        rejectionReason: reason,
      },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    console.error("Reject error:", error);
    res.status(500).json({ message: "Server error" });
  }
};