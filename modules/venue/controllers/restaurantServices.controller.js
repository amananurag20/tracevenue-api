const {
  createRestaurantService,
  getRestaurantServices,
  getRestaurantServicesByRestaurantId,
  deleteRestaurantService,
  updateRestaurantService,
} = require("../services/restaurantServices.service");

// Create a restaurant service entry
const createRestaurantServiceController = async (req, res) => {
  try {
    const { restaurantId, serviceId } = req.body;

    if (!restaurantId || !serviceId) {
      return res
        .status(400)
        .json({ message: "restaurantId and serviceId are required" });
    }

    const result = await createRestaurantService(restaurantId, serviceId);

    if (result.message === "Service already imported") {
      return res.status(409).json({ message: "Service already imported" });
    }

    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get all restaurant services
const getRestaurantServicesController = async (req, res) => {
  try {
    const services = await getRestaurantServices();
    if (!services || services.length === 0) {
      return res.status(404).json({ message: "No services found" });
    }
    return res.status(200).json(services);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get restaurant services by restaurantId
const getRestaurantServicesByRestaurantIdController = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: "restaurantId is required" });
    }
    const services = await getRestaurantServicesByRestaurantId(req.params.id);
    if (!services) {
      return res
        .status(404)
        .json({ message: "No services found for this restaurant" });
    }
    return res.status(200).json(services);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Delete a restaurant service entry
const deleteRestaurantServiceController = async (req, res) => {
  try {
    const service = await deleteRestaurantService(
      req.params.id,
      req.query.serviceId
    );
    if (!service) {
      return res.status(404).json({ message: "No service found" });
    }
    return res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Update a restaurant service entry
const updateRestaurantServiceController = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const service = await updateRestaurantService(id, data);
    if (!service) {
      return res.status(404).json({ message: "No service found" });
    }
    return res.status(200).json(service);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createRestaurantServiceController,
  getRestaurantServicesController,
  getRestaurantServicesByRestaurantIdController,
  deleteRestaurantServiceController,
  updateRestaurantServiceController,
};
