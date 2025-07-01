const {addSuggestion, fetchSuggestions, fetchSuggestionsAll} = require('../services/suggestions.service');

// Create a new suggestion
const createSuggestion = async (req, res) => {
  const { keyword} = req.body;

  if (!keyword) {
    return res.status(400).json({ error: 'Keyword are required' });
  }

  try {
    const suggestion = await addSuggestion(keyword);
    res.status(201).json({ message: 'Suggestion created successfully', suggestion });
  } catch (error) {
    console.error('Error creating suggestion:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get suggestions with debounce-friendly query
const getSuggestions = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    // Call the renamed function here
    const suggestions = await fetchSuggestions(query);
    res.status(200).json(suggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ error: error.message });
  }
};

const getSuggestionsAll = async (req, res) => {
  try {
    // Call the renamed function here
    const suggestions = await fetchSuggestionsAll();
    res.status(200).json(suggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ error: error.message });
  }
};
module.exports = {createSuggestion, getSuggestions, getSuggestionsAll}