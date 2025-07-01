const Variant = require("../models/variant.model");
const Restaurant = require("../../../models/RestaurantModels");
const Job = require("../models/jobs.model");
const Package = require("../models/package.model");

const isJobAppliedByVenue = async (jobId, venueId) => {
  try {
    // Step 1: Get all variant_ids for the job
    const job = await Job.findById(jobId).select("variants");
    if (!job) return false;

    const variantIds = job.variants.map((variant) => variant.variant_id);

    if (variantIds.length === 0) return false;

    // Step 2: Find all packageIds for this venue
    const packages = await Package.find({ venueId }).select("_id");
    const packageIds = packages.map((pkg) => pkg._id);

    if (packageIds.length === 0) return false;

    // Step 3: Find all variants linked to those packages
    const venueVariants = await Variant.find({
      packageId: { $in: packageIds },
    }).select("_id");

    if (venueVariants.length === 0) return false;

    // Step 4: Compare variantIds with venueVariants using .equals()
    const isApplied = venueVariants.some((variant) =>
      variantIds.some((id) => id.equals(variant._id))
    );

    return isApplied;
  } catch (error) {
    console.error("Error in isJobAppliedByVenue:", error);
    return false;
  }
};

exports.isJobAppliedByVenue = isJobAppliedByVenue;
