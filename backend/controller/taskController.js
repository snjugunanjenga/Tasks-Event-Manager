const Task = require('../models/Task');

// Get all tasks for a user
const getTasks = async (req, res) => {
    try {
        // If pagination params are present, return paginated data
        if (req.query.page || req.query.limit) {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const tasks = await Task.find({ user: req.user.id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const totalTasks = await Task.countDocuments({ user: req.user.id });
            const totalPages = Math.ceil(totalTasks / limit);

            return res.json({
                data: tasks,
                currentPage: page,
                totalPages: totalPages,
            });
        }
        
        // Otherwise, return all tasks for the dashboard
        const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(tasks);

    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Create a task
const createTask = async (req, res) => {
  const { title, description, dueDate } = req.body;
  if (!title || !dueDate) {
    return res.status(400).json({ message: 'Please provide title and due date' });
  }
  try {
    const task = new Task({ userId: req.user, title, description, dueDate });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a task
const updateTask = async (req, res) => {
  const { title, description, dueDate, completed } = req.body;
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user },
      { title, description, dueDate, completed },
      { new: true }
    );
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };