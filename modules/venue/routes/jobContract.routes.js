const express = require("express");
const router = express.Router();
const jobContractController = require("../controllers/jobContractController");

router.post("/", jobContractController.createJobContract);
router.post("/close-job", jobContractController.closeJobContract);
router.get("/", jobContractController.getAllJobContracts);
router.get("/by-job/:jobId", jobContractController.getContractsByJobId);
router.get("/:id", jobContractController.getJobContractById);
router.put("/:id", jobContractController.updateJobContract);
router.delete("/:id", jobContractController.deleteJobContract);

module.exports = router;
