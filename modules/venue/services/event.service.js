const Events = require("../models/events.model");
const { sanitizeDataHelper } = require("../helpers/sanitizedData.helper");
const { EVENT_FIELDS } = require("../constants");
const Package = require("../models/package.model");
const mongoose = require('mongoose');

// create event:
const createEvent = async (data) => {
  const sanitizedData = sanitizeDataHelper(data, EVENT_FIELDS);
  return await Events.create(sanitizedData);
};

// get event:
const getEvent = async () => {
  return await Events.find();
};

// get event by id:
const getEventById = async (id) => {
  return await Events.findById(id);
};
// update event :
const updateEvent = async (id, updateData) => {
  const sanitizedData = sanitizeDataHelper(updateData, EVENT_FIELDS);
  return await Events.findByIdAndUpdate(id, sanitizedData, { new: true });
};

// deleted event:
const deleteEvent = async (id) => {
  return await Events.findByIdAndDelete(id);
};

// get event suggestion:
const getEventSuggestion = async (query) => {
  return await Events.find({
    $or: [
      { eventName: { $regex: query, $options: "i" } },
      { "keywords.word": { $regex: query, $options: "i" } },
    ],
  });
};

// Get cuisines and cost information by event name and location
const getCuisinesByEventName = async (searchTerm, location) => {
  try {
    // Find events that match the search term in name, keywords, or synonyms
    const events = await Events.find({
      $or: [
        { eventName: new RegExp(searchTerm, 'i') },
        { "keywords.word": new RegExp(searchTerm, 'i') },
        { "keywords.synonyms": new RegExp(searchTerm, 'i') }
      ]
    });
    
    if (!events || events.length === 0) {
      console.log("No events found matching:", searchTerm);
      return null;
    }
        
    // Get event IDs
    const eventIds = events.map(event => event._id);
    
    // Build the package query
    let packageQuery = { eventType: { $in: eventIds } };
    
    // If location is provided, filter packages by venue location
    if (location) {      
      // First, find venues in the specified location
      const venues = await mongoose.model('Venue').find({
        $or: [
          { "address.city": new RegExp(location, 'i') },
          { "address.state": new RegExp(location, 'i') },
          { "address.country": new RegExp(location, 'i') }
        ]
      }).lean();
      
      if (venues.length === 0) {
        return { cuisines: [], costRange: { min: 0, max: 0 } };
      }
      
      console.log(`Found ${venues.length} venues in location: ${location}`);
      
      // Get venue IDs
      const venueIds = venues.map(venue => venue._id);
      
      // Update package query to include venue filter
      packageQuery.venueId = { $in: venueIds };
    }
    
    // Find all packages associated with these events (and locations if specified)
    const packages = await Package.find(packageQuery);
    
    console.log(`Found ${packages.length} packages for these events`);
    
    if (packages.length === 0) {
      return { cuisines: [], costRange: { min: 0, max: 0 } };
    }
    
    // Convert variant string IDs to ObjectIds if needed
    const variantIds = packages.flatMap(pkg => {
      return pkg.variants.map(variant => {
        // Check if variant is already an ObjectId
        if (typeof variant === 'object') return variant;
        // Otherwise convert string to ObjectId
        return mongoose.Types.ObjectId(variant);
      });
    });
    
    // Find all variants
    const variants = await mongoose.model('Variant').find({
      _id: { $in: variantIds }
    }).lean();
    
    if (variants.length === 0) {
      return { cuisines: [], costRange: { min: 0, max: 0 } };
    }
    
    // Calculate min and max costs from variants
    let minCost = Number.MAX_SAFE_INTEGER;
    let maxCost = 0;
    
    variants.forEach(variant => {
      if (variant.cost) {
        minCost = Math.min(minCost, variant.cost);
        maxCost = Math.max(maxCost, variant.cost);
      }
    });
    
    // If no variants had a cost value
    if (minCost === Number.MAX_SAFE_INTEGER) {
      minCost = 0;
    }
    
    // Extract menu item IDs from variants
    const menuItemIds = variants.flatMap(variant => variant.menuItems || []);
    
    // Find all menu items with their cuisines
    const menuItems = await mongoose.model('MasterMenu').find({
      _id: { $in: menuItemIds }
    }).populate('cuisine').lean();
    
    // Extract unique cuisines
    const uniqueCuisines = {};
    menuItems.forEach(item => {
      if (item.cuisine && Array.isArray(item.cuisine)) {
        item.cuisine.forEach(c => {
          if (c && c._id) {
            uniqueCuisines[c._id.toString()] = {
              _id: c._id,
              name: c.name
            };
          }
        });
      }
    });
    
    const cuisineResult = Object.values(uniqueCuisines);
    console.log(`Found ${cuisineResult.length} unique cuisines for search term "${searchTerm}"`);
    console.log(`Cost range: $${minCost} - $${maxCost}`);
    
    return { 
      cuisines: cuisineResult,
      costRange: { min: minCost, max: maxCost }
    };
  } catch (error) {
    console.error("Error in getCuisinesByEventName service:", error);
    throw error;
  }
};

// Get all cuisines with a default cost range
const getAllCuisines = async (location) => {
  try {
    // If location is provided, find cuisines specific to that location
    if (location) {
      // Find venues in the specified location
      const venues = await mongoose.model('Venue').find({
        $or: [
          { "address.city": new RegExp(location, 'i') },
          { "address.state": new RegExp(location, 'i') },
          { "address.country": new RegExp(location, 'i') }
        ]
      }).lean();
      
      if (venues.length > 0) {
        const venueIds = venues.map(venue => venue._id);
        
        // Find packages for these venues
        const packages = await Package.find({ venueId: { $in: venueIds } });
        
        if (packages.length > 0) {
          // Follow the same logic as in getCuisinesByEventName to get cuisines
          const variantIds = packages.flatMap(pkg => {
            return pkg.variants.map(variant => {
              if (typeof variant === 'object') return variant;
              return mongoose.Types.ObjectId(variant);
            });
          });
          
          const variants = await mongoose.model('Variant').find({
            _id: { $in: variantIds }
          }).lean();
          
          // Calculate min and max costs
          let minCost = Number.MAX_SAFE_INTEGER;
          let maxCost = 0;
          
          variants.forEach(variant => {
            if (variant.cost) {
              minCost = Math.min(minCost, variant.cost);
              maxCost = Math.max(maxCost, variant.cost);
            }
          });
          
          if (minCost === Number.MAX_SAFE_INTEGER) minCost = 0;
          
          const menuItemIds = variants.flatMap(variant => variant.menuItems || []);
          
          const menuItems = await mongoose.model('MasterMenu').find({
            _id: { $in: menuItemIds }
          }).populate('cuisine').lean();
          
          const uniqueCuisines = {};
          menuItems.forEach(item => {
            if (item.cuisine && Array.isArray(item.cuisine)) {
              item.cuisine.forEach(c => {
                if (c && c._id) {
                  uniqueCuisines[c._id.toString()] = {
                    _id: c._id,
                    name: c.name
                  };
                }
              });
            }
          });
          
          const cuisineResult = Object.values(uniqueCuisines);
          
          return {
            cuisines: cuisineResult,
            costRange: { min: minCost, max: maxCost }
          };
        }
      }
      
      // If no location-specific cuisines found, fall back to all cuisines
      console.log(`No specific cuisines found for location: ${location}. Using all cuisines.`);
    }
    
    // Fetch all cuisines from the database
    const cuisines = await mongoose.model('Cuisine').find().lean();
    const cuisineResult = cuisines.map(cuisine => ({
      _id: cuisine._id,
      name: cuisine.name
    }));
    
    // Return a default cost range with all cuisines
    return { 
      cuisines: cuisineResult,
      costRange: { min: 0, max: 0 }
    };
  } catch (error) {
    console.error("Error in getAllCuisines service:", error);
    throw error;
  }
};

module.exports = {
  createEvent,
  getEvent,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventSuggestion,
  getCuisinesByEventName,
  getAllCuisines
};
