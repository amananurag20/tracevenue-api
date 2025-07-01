const Job = require("../models/jobs.model");

// Create a new catering proposal
const createJob = async (jobData) => {
  try {
    const job = new Job(jobData);
    return await job.save();
  } catch (error) {
    throw error;
  }
};

// Get all catering proposals
const getJobs = async (filters = {}) => {
  try {
    return await Job.find(filters).sort({ createdAt: -1 });
  } catch (error) {
    throw error;
  }
};

// Get a single catering proposal by ID
const getJobById = async (id) => {
  try {
    return await Job.findById(id);
  } catch (error) {
    throw error;
  }
};

// Update a catering proposal
const updateJob = async (id, updateData) => {
  try {
    return await Job.findByIdAndUpdate(id, { $set: updateData }, { new: true });
  } catch (error) {
    throw error;
  }
};

// Delete a catering proposal
const deleteJob = async (id) => {
  try {
    return await Job.findByIdAndDelete(id);
  } catch (error) {
    throw error;
  }
};

// Get jobs by user ID
const getUserJobs = async (userId) => {
  try {
    return await Job.find({ userId }).sort({ createdAt: -1 });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  getUserJobs,
};
