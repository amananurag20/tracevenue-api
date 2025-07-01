// import services:
const {
  createEvent,
  getEvent,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventSuggestion,
  getCuisinesByEventName,
  getAllCuisines,
} = require("../services/event.service");

// event post controller:
const createEventController = async (req, res, next) => {
  try {
    //   event create service:
    const newEvent = await createEvent(req.body);
    return res.status(201).json({
      message: "Event created successfully",
      newEvent: newEvent,
    });
  } catch (err) {
    return res.status(500).json({
      messge: err.message,
    });
  }
};

// get events controller:
const getEventsController = async (req, res, next) => {
  try {
    // get event service:
    const eventData = await getEvent();
    return res.status(200).json(eventData);
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};
// get event by id:
const getEventByIdController = async (req, res, next) => {
  try {
    //   get event by id service:
    const eventData = await getEventById(req.params.id);
    if (!eventData) {
      return res.status(404).json({
        message: "Event not exist",
      });
    }
    return res.status(200).json(eventData);
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};

// update event :
const updateEventController = async (req, res, next) => {
  try {
    //   update event service
    const eventData = await updateEvent(req.params.id, req.body);
    if (!eventData) {
      return res.status(404).json({
        message: "Event not found",
      });
    }
    return res.status(200).json({
      message: "Event updated successfully",
      data: eventData,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

// ddelete event
const deleteEventController = async (req, res, next) => {
  try {
    //   delete event service:
    const eventData = await deleteEvent(req.params.id);
    if (!eventData) {
      return res.status(500).json({
        message: "Event not found",
      });
    }
    return res.status(200).json({
      message: "Event deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};

// get event suggestion controller:
const getEventSuggestionController = async (req, res, next) => {
  try {
    const query = req.query.event;
    const data = await getEventSuggestion(query);
    if (!data) {
      return res.status(404).json({
        message: "No results for your search",
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

// get cuisines and cost information by event name and location controller
const getCuisinesByEventNameController = async (req, res, next) => {
  try {
    const { eventName, location } = req.query;
    
    if (!eventName) {
      return res.status(400).json({
        message: "Search term is required",
      });
    }
    
    // First try with both event name and location
    const result = await getCuisinesByEventName(eventName, location);
    
    // If no cuisines found with location, try just by event name
    if (location && (!result || !result.cuisines || result.cuisines.length === 0)) {
      console.log(`No cuisines found for "${eventName}" in "${location}". Trying without location filter...`);
      const resultWithoutLocation = await getCuisinesByEventName(eventName, null);
      
      if (resultWithoutLocation && resultWithoutLocation.cuisines && resultWithoutLocation.cuisines.length > 0) {
        return res.status(200).json({
          success: true,
          data: resultWithoutLocation.cuisines,
          costRange: resultWithoutLocation.costRange,
          fallback: true,
          message: `No cuisines found for "${eventName}" in "${location}". Showing cuisines for "${eventName}" from all locations.`,
          location: null,
          eventMatch: true
        });
      }
    }
    
    // If no cuisines found for this event name at all, return all cuisines as last resort
    if (!result || !result.cuisines || result.cuisines.length === 0) {
      console.log(`No cuisines found for "${eventName}" anywhere. Returning all cuisines as fallback.`);
      const allCuisines = await getAllCuisines(location);
      
      return res.status(200).json({
        success: true,
        data: allCuisines.cuisines,
        costRange: allCuisines.costRange,
        fallback: true,
        message: `No cuisines found for "${eventName}". Showing all available cuisines${location ? ` in ${location}` : ''}.`,
        location: location || null,
        eventMatch: false
      });
    }
    
    // Successful result with both event name and location
    return res.status(200).json({
      success: true,
      data: result.cuisines,
      costRange: result.costRange,
      fallback: false,
      message: `Cuisines for "${eventName}" ${location ? `in ${location}` : ''} retrieved successfully`,
      location: location || null,
      eventMatch: true
    });
  } catch (err) {
    console.error("Error in getCuisinesByEventNameController:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  createEventController,
  getEventsController,
  getEventByIdController,
  updateEventController,
  deleteEventController,
  getEventSuggestionController,
  getCuisinesByEventNameController,
};
