// const Venue = require("../models/venue.model");
const Restaurant = require("../../../models/RestaurantModels"); // Changed to Restaurant model
// const sanitizeDataHelper = require('../helpers/sanitizedData.helper');
const { sanitizeDataHelper } = require("../helpers/sanitizedData.helper");
const { VENUE_FIELDS } = require("../constants"); // VENUE_FIELDS might not apply directly to RestaurantModel or need adjustment
const { RESTAURANT_FIELDS_FOR_ONBOARDING } = require("../constants"); // Assuming you'll define this for relevant fields

const createVenue = async (venueData) => {

  return await Restaurant.create(venueData);
};

const isVenueExist = async (phoneNumber) => { 
  return await Restaurant.findOne({ 
    phoneNumber: phoneNumber, 
  });
};

const getVenues = async () => {
  return await Restaurant.find(); 
};

const getVenueById = async (id) => {
  // Similar to getVenues, this might need to fetch from Restaurant collection
  return await Restaurant.findById(id).populate("packageId");
};

const updateVenue = async (id, updateData) => {
  // Similar to create, if this is meant to update Restaurant data, model and fields need change
  const sanitizedData = sanitizeDataHelper(updateData, VENUE_FIELDS); // VENUE_FIELDS would need to change
  return await Restaurant.findByIdAndUpdate(id, sanitizedData, { new: true });
};

const deleteVenue = async (id) => {
  return await Restaurant.findByIdAndDelete(id);
};

module.exports = {
  createVenue,
  getVenues,
  getVenueById,
  updateVenue,
  deleteVenue,
  isVenueExist,
};
