const Suggestion = require("../models/suggestions.model");

// Add a new suggestion
const addSuggestion = async (keyword) => {
  try {
    const suggestion = new Suggestion({ keyword });
    return await suggestion.save();
  } catch (error) {
    throw new Error(`Failed to add suggestion: ${error.message}`);
  }
};

// Fetch suggestions by query (renamed to fetchSuggestions)
const fetchSuggestions = async (query) => {
  try {
    function escapeRegex(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // Escape special characters
    }

    const safeQuery = escapeRegex(query);

    return await Suggestion.find({
      keyword: { $regex: safeQuery, $options: "i" },
    }).limit(10);
  } catch (error) {
    throw new Error(`Failed to fetch suggestions: ${error.message}`);
  }
};
const fetchSuggestionsAll = async () => {
  try {
    return await Suggestion.find();
  } catch (error) {
    throw new Error(`Failed to fetch suggestions: ${error.message}`);
  }
};

module.exports = { addSuggestion, fetchSuggestions, fetchSuggestionsAll };
