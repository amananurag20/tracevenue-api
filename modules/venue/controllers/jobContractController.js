const Restaurant = require("../../../models/RestaurantModels");
const JobContract = require("../models/jobContract.model");
const jobsModel = require("../models/jobs.model");

// Create a new job contract
exports.createJobContract = async (req, res) => {
  try {
    const { job_id, venue_id } = req.body;

    // 1. Check if any contract with the same job and venue is already approved or completed
    const existingApprovedForSameVenue = await JobContract.findOne({
      job_id,
      venue_id,
      status: "Approved",
    });

    if (existingApprovedForSameVenue) {
      return res.status(400).json({
        success: false,
        message: "An approved job contract already exists for this venue.",
      });
    }

    const existingCompletedForSameVenue = await JobContract.findOne({
      job_id,
      venue_id,
      status: "Completed",
    });

    if (existingCompletedForSameVenue) {
      return res.status(400).json({
        success: false,
        message: "A Completed job contract already exists for this venue.",
      });
    }

    // 2. Check if any contract with the same job and venue is in progress
    const existingPendingOrReview = await JobContract.findOne({
      job_id,
      venue_id,
      status: { $in: ["Pending", "Under Review"] },
    });

    if (existingPendingOrReview) {
      return res.status(400).json({
        success: false,
        message:
          "A pending or under-review job contract already exists for this venue.",
      });
    }

    // 3. Check if any contract with the job_id (across any venue) is already approved or completed
    const existingApprovedForJob = await JobContract.findOne({
      job_id,
      status: "Approved",
    });

    if (existingApprovedForJob) {
      return res.status(400).json({
        success: false,
        message: "This job is already approved for another venue.",
      });
    }
    const existingCompletedForJob = await JobContract.findOne({
      job_id,
      status: "Completed",
    });

    if (existingCompletedForJob) {
      return res.status(400).json({
        success: false,
        message: "This job is already Completed for another venue.",
      });
    }
    // If all checks pass, create the contract
    const contract = await JobContract.create(req.body);

    res.status(201).json({
      success: true,
      message: "Job contract created successfully",
      contract,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all job contracts
exports.getAllJobContracts = async (req, res) => {
  try {
    const contracts = await JobContract.find()
      .populate("variant_id")
      .populate("venue_id")
      .populate("job_id");
    res.json(contracts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single job contract by ID
exports.getJobContractById = async (req, res) => {
  try {
    const contract = await JobContract.findById(req.params.id)
      .populate("variant_id")
      .populate("venue_id")
      .populate("job_id");
    if (!contract) return res.status(404).json({ error: "Not found" });
    res.json(contract);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a job contract
exports.updateJobContract = async (req, res) => {
  try {
    // Check if contract exists
    const jobDetails = await JobContract.findById(req.params.id);
    if (!jobDetails) {
      return res.status(404).json({
        success: false,
        message: "Contract not found",
        error: "Not found",
      });
    }

    const { status: newStatus } = req.body;

    // Check if job is already approved (only if trying to approve)
    if (newStatus === "Approved") {
      const jobExist = await JobContract.findOne({
        job_id: jobDetails.job_id,
        status: "Approved",
        _id: { $ne: req.params.id }, // Exclude current contract
      });
      if (jobExist) {
        return res.status(400).json({
          success: false,
          message: "Job is already approved by another contract.",
        });
      }
    }

    // Check if job is already completed
    const jobExistCompleted = await JobContract.findOne({
      job_id: jobDetails.job_id,
      status: "Completed",
    });
    if (jobExistCompleted) {
      return res.status(400).json({
        success: false,
        message: "Job is already completed.",
      });
    }

    // Update the contract
    const contract = await JobContract.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Contract updated successfully",
      contract,
    });
  } catch (err) {
    console.error("Error updating job contract:", err);
    res.status(500).json({
      success: false, // Fixed typo: "sucess" -> "success"
      message: "Internal server error occurred.",
      error: err.message,
    });
  }
};

// Delete a job contract
exports.deleteJobContract = async (req, res) => {
  try {
    const deleted = await JobContract.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Job contract deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Get all contracts by job_id
exports.getContractsByJobId = async (req, res) => {
  try {
    const { jobId } = req.params;
    const contracts = await JobContract.find({ job_id: jobId })
      .populate("variant_id")
      .populate("venue_id")
      .populate("job_id");

    res.json(contracts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.closeJobContract = async (req, res) => {
  try {
    const { id, rating, review } = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, error: "Contract ID is required." });
    }

    const contract = await JobContract.findById(id);
    if (!contract) {
      return res
        .status(404)
        .json({ success: false, error: "Contract not found." });
    }
    if (contract.status === "Completed") {
      return res
        .status(400)
        .json({ success: false, error: "Contract already closed." });
    }

    const [venue, job] = await Promise.all([
      Restaurant.findById(contract.venue_id).lean(),
      jobsModel.findById(contract.job_id).lean(),
    ]);

    if (!venue || !job) {
      return res.status(404).json({
        success: false,
        error: !venue ? "Venue not found." : "Job not found.",
      });
    }

    // Calculate updated venue rating
    const existingTotalRating =
      venue.reviews?.reduce((acc, r) => acc + parseFloat(r?.rating || 0), 0) ||
      0;
    const existingReviewCount = venue.reviews?.length || 0;
    const updatedRating =
      (existingTotalRating + rating) / (existingReviewCount + 1);

    // Add review to venue
    await Restaurant.findByIdAndUpdate(venue._id, {
      $push: {
        reviews: {
          userId: job.userId,
          rating,
          review,
        },
      },
      $set: {
        rating: updatedRating,
      },
    });

    // Update contract
    const updatedContract = await JobContract.findByIdAndUpdate(
      id,
      {
        status: "Completed",
        rating,
        review,
      },
      { new: true }
    );

    // Update job status
    await jobsModel.findByIdAndUpdate(job._id, { status: "Closed" });

    res.status(200).json({
      success: true,
      message: "Job contract closed successfully.",
      contract: updatedContract,
    });
  } catch (err) {
    console.error("Error closing job contract:", err);
    res.status(500).json({ success: false, error: "Internal server error." });
  }
};
