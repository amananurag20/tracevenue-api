const RestaurantServices = require("../models/restaurantServices.modal");

// Get all restaurant services
const getRestaurantServices = async () => {
  return await RestaurantServices.find().populate("services");
};

// Get restaurant services by restaurantId
const getRestaurantServicesByRestaurantId = async (restaurantId) => {
  return await RestaurantServices.findOne({ restaurantId }).populate(
    "services"
  );
};

// Create restaurant service entry
const createRestaurantService = async (restaurantId, serviceId) => {
  try {
    let restaurantService = await RestaurantServices.findOne({ restaurantId });

    if (restaurantService) {
      // Check if serviceId already exists
      if (restaurantService.services.includes(serviceId)) {
        return { message: "Service already imported" };
      }

      // Add service if not present
      restaurantService.services.push(serviceId);
      await restaurantService.save();
    } else {
      // If restaurant doesn't exist, create a new entry
      restaurantService = new RestaurantServices({
        restaurantId,
        services: [serviceId],
      });
      await restaurantService.save();
    }

    return restaurantService;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Delete a restaurant service entry
const deleteRestaurantService = async (restaurantId, serviceId) => {
  try {
    const updatedRestaurantService = await RestaurantServices.findOneAndUpdate(
      { restaurantId: restaurantId },
      { $pull: { services: serviceId } },
      { new: true }
    );

    if (!updatedRestaurantService) {
      return { success: false, message: "Restaurant services not found" };
    }

    return {
      success: true,
      message: "Service deleted successfully",
      data: updatedRestaurantService,
    };
  } catch (error) {
    console.error("Error deleting service:", error);
    return { success: false, message: "Error deleting service" };
  }
};

// Update restaurant service entry
const updateRestaurantService = async (id, updateData) => {
  return await RestaurantServices.findByIdAndUpdate(id, sanitizedData, {
    new: true,
  }).populate("services");
};

module.exports = {
  getRestaurantServices,
  getRestaurantServicesByRestaurantId,
  createRestaurantService,
  deleteRestaurantService,
  updateRestaurantService,
};
