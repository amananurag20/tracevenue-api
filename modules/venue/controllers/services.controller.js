const {
  createService,
  getServices,
  deleteService,
  updateService,
  getServicesById,
  getServicesToVendors,
} = require("../services/services.service");

const createServiceController = async (req, res) => {
  try {
    const data = req.body;
    const service = await createService(data);
    return res.status(201).json(service);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
const getServicesController = async (req, res) => {
  try {
    const services = await getServices();
    if (!services) {
      return res.status(404).json({ message: "No services found" });
    }
    return res.status(200).json(services);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
const getServicesByIdController = async (req, res) => {
  try {
    const services = await getServicesById(req.params.id);
    if (!services) {
      return res.status(404).json({ message: "No services found" });
    }
    return res.status(200).json(services);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
const deleteServiceController = async (req, res) => {
  try {
    const service = await deleteService(req.params.id);
    if (!services) {
      return res.status(404).json({ message: "No services found" });
    }
    return res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
const updateServiceController = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const service = await updateService(id, data);
    if (!service) {
      return res.status(404).json({ message: "No service found" });
    }
    return res.status(200).json(service);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// vendor side:
const getServicesToVendorController = async (req, res) => {
  try {
    const services = await getServicesToVendors();
    if (!services) {
      return res.status(404).json({ message: "No services found" });
    }
    return res.status(200).json(services);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createServiceController,
  getServicesController,
  getServicesByIdController,
  deleteServiceController,
  updateServiceController,
  getServicesToVendorController,
};
