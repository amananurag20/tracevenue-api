const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../../middleware/authMiddleware");
const {
  createJobController,
  getJobsController,
  getJobByIdController,
  updateJobController,
  deleteJobController,
  getUserJobsController,
  inviteVendorController,
  updateVariantStatusController,
  getJobInvitesController,
  addVariantsToJob,
  maskAsSaved,
  inviteVendorsController,
  removeFromSaved,
  getJobsWithConversations,
  shortlistVariant,
  rejectVariant,
  getAllFilteredJobs
} = require("../controllers/jobs.controller");

// Create new catering proposal
router.post("/", createJobController);

// Get all catering proposals
router.post("/filter",  getJobsController);
//Fetch job invites
router.get("/invited-jobs/:resId", authMiddleware, getJobInvitesController);
// Get all conversations for a user's jobs
router.get(
  "/conversations/:userId",
  getJobsWithConversations
);
// Get user's proposals
router.get("/:userId/my-jobs", authMiddleware, getUserJobsController);

// Get proposal by ID
router.get("/:id", getJobByIdController);

// Update proposal
router.put("/:id", updateJobController);

// Delete proposal
router.delete("/:id", authMiddleware, deleteJobController);

// Invite vendor
router.post("/:jobId/invite-vendor", authMiddleware, inviteVendorController);
router.post("/:jobId/invite-vendors", authMiddleware, inviteVendorsController);

// Update variant status
router.patch("/:jobId/variants/:variantId", updateVariantStatusController);

// suggest multiple variants to a job
router.post("/:jobId/add-variants", authMiddleware, addVariantsToJob);

// Mask a job as saved
router.patch("/:jobId/mask-as-saved", authMiddleware, maskAsSaved);
//Remove a job from saved
router.patch("/:jobId/remove-from-saved", authMiddleware, removeFromSaved);

router.put("/:jobId/variants/:variantId/shortlist", shortlistVariant);
router.put("/:jobId/variants/:variantId/reject", rejectVariant);

// Get all filtered jobs
router.post("/filtered-jobs", getAllFilteredJobs);

module.exports = router;
