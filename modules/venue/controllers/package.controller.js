const { default: mongoose } = require("mongoose");
const {
  createPackage,
  isPackageExist,
  getPackage,
  getPackageById,
  updatePackage,
  deletePackage,
  getPackageBySearch,
} = require("../services/package.service");
const Package = require("../models/package.model");
const Variant = require("../models/variant.model");
// create package:
const createPackageController = async (req, res, next) => {
  try {
    const { venueId, name } = req.body;
    const packetExist = await isPackageExist(venueId, name);
    if (!packetExist) {
      //   package create service
      const data = await createPackage(req.body);
      return res.status(201).json({
        message: "Package created successfully",
        success: true,
        package: data[0],
      });
    } else
      return res.status(200).json({
        message: "Package already exist",
        success: false,
      });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

// get package
const getPackageController = async (req, res, next) => {
  try {
    const { venueId } = req.query;
    //   package get service
    const packageData = await getPackage({ venueId });
    res.status(200).json(packageData);
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};
// get package by id
const getPackageByIdController = async (req, res, next) => {
  try {
    //   get by id service:
    const packageData = await getPackageById(req.params.id);
    if (!packageData) {
      return res.status(404).json({
        message: "Package not found",
      });
    }
    await res.status(200).json(packageData);
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

// update package:
const updatePackageController = async (req, res, next) => {
  try {
    //   update package service:
    const packageData = await updatePackage(req.params.id, req.body);
    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }
    res.status(200).json({
      message: "Package updated successfully",
      success: true,
      data: packageData,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

// delete package:
const deletePackageController = async (req, res, next) => {
  const session = await mongoose.startSession(); // Start transaction session
  session.startTransaction();

  try {
    const packageId = req.params.id;

    // Check if package exists
    const packageData = await Package.findById(packageId).session(session);
    if (!packageData) {
      await session.abortTransaction(); // Rollback transaction if package not found
      session.endSession();
      return res.status(404).json({ message: "Package not found" });
    }

    // Delete all variants associated with the package
    await Variant.deleteMany({ packageId }).session(session);

    // Delete the package itself
    await Package.findByIdAndDelete(packageId).session(session);

    // Commit transaction if everything succeeds
    await session.commitTransaction();
    session.endSession();

    return res.json({
      message: "Package and associated variants deleted successfully",
    });
  } catch (err) {
    await session.abortTransaction(); // Rollback transaction on error
    session.endSession();
    return res.status(500).json({ message: err.message });
  }
};

// getPackageBySearchController:
const getPackageBySearchController = async (req, res, next) => {
  try {
    const { name, cuisine, maxPersons } = req.query;
    if (!(name || cuisine || maxPersons)) {
      return res.status(404).json({
        message: "search querry is required",
      });
    }
    const filter = {};

    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }
    if (cuisine) {
      filter.cuisine = { $elemMatch: { $regex: cuisine, $options: "i" } };
    }
    if (maxPersons) {
      filter.maxPersons = { $gte: Number(maxPersons) };
    }

    const data = await getPackageBySearch(filter);

    if (!data) {
      return res.status(500).json({
        message: "Package not found",
      });
    }
    return res.status(200).json(data);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: err.message,
    });
  }
};

// fetch packages name and there variants by venue id
const fetchPackageVariants = async (req, res) => {
  try {
    const { venueId, jobId } = req.query;
    const packageData = await Package.find({ venueId });

    const structuredData = await Promise.all(
      packageData.map(async (item) => {
        const allVariant = await Variant.find({ packageId: item._id });
        const minPersons = allVariant
          .map((variant) => variant.minPersons)
          .reduce((a, b) => Math.min(a, b), Infinity);
        const maxPersons = allVariant
          .map((variant) => variant.maxPersons)
          .reduce((a, b) => Math.max(a, b), -Infinity);
        const minVariantCost = allVariant
          .map((variant) => variant.cost)
          .reduce((a, b) => Math.min(a, b), Infinity);
        const maxVariantCost = allVariant
          .map((variant) => variant.cost)
          .reduce((a, b) => Math.max(a, b), -Infinity);
        return {
          package: item,
          persons: { min: minPersons, max: maxPersons },
          variantCost: {
            min: minVariantCost,
            max: maxVariantCost,
          },
          variants: allVariant,
        };
      })
    );

    return res.status(200).json(structuredData);
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  createPackageController,
  getPackageController,
  getPackageByIdController,
  updatePackageController,
  deletePackageController,
  getPackageBySearchController,
  fetchPackageVariants,
};
