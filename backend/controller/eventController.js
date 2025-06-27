const Event = require('../models/Event');

// Get all events for a user
const getEvents = async (req, res) => {
    try {
        // If pagination params are present, return paginated data
        if (req.query.page || req.query.limit) {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const events = await Event.find({ user: req.user.id })
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit);
            
            const totalEvents = await Event.countDocuments({ user: req.user.id });
            const totalPages = Math.ceil(totalEvents / limit);

            return res.json({
                data: events,
                currentPage: page,
                totalPages: totalPages,
            });
        }

        // Otherwise, return all events for the dashboard
        const events = await Event.find({ user: req.user.id }).sort({ date: -1 });
        res.json(events);

    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Create an event
const createEvent = async (req, res) => {
  const { title, description, startDate, endDate, recurrence } = req.body;
  if (!title || !startDate || !endDate) {
    return res.status(400).json({ message: 'Please provide title, start date, and end date' });
  }
  try {
    const event = new Event({ userId: req.user, title, description, startDate, endDate, recurrence });
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update an event
const updateEvent = async (req, res) => {
  const { title, description, startDate, endDate, recurrence } = req.body;
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, userId: req.user },
      { title, description, startDate, endDate, recurrence },
      { new: true }
    );
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete an event
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.id, userId: req.user });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getEvents, createEvent, updateEvent, deleteEvent };