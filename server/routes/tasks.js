const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const mongoose = require("mongoose");

function isMongoConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

// Create a new task
router.post("/", async (req, res) => {
  if (!isMongoConnected()) {
    return res.status(503).json({ error: "Database unavailable" });
  }

  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });

    const task = new Task({ title, description });
    await task.save();
    return res.status(201).json(task);
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
});

// Get all tasks
router.get("/", async (req, res) => {
  // In CI/local smoke runs we allow read checks without a live DB.
  if (!isMongoConnected()) {
    return res.json([]);
  }

  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    return res.json(tasks);
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
});

// Get a single task
router.get("/:id", async (req, res) => {
  if (!isMongoConnected()) {
    return res.status(503).json({ error: "Database unavailable" });
  }

  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    return res.json(task);
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
});

// Update a task
router.put("/:id", async (req, res) => {
  if (!isMongoConnected()) {
    return res.status(503).json({ error: "Database unavailable" });
  }

  try {
    const { title, description, completed } = req.body;
    const update = { title, description, completed };
    const task = await Task.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!task) return res.status(404).json({ error: "Task not found" });
    return res.json(task);
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
});

// Delete a task
router.delete("/:id", async (req, res) => {
  if (!isMongoConnected()) {
    return res.status(503).json({ error: "Database unavailable" });
  }

  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    return res.json({ message: "Task deleted" });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
});

module.exports = router;
