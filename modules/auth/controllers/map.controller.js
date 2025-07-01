const axios = require("axios");

const getGoogleLocation = async (req, res) => {
  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ error: "Address is required" });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    if (data.status !== "OK" || !data.results.length) {
      return res.status(404).json({ error: "No results found" });
    }

    // Helper to extract structured data from a result
    const extractComponents = (result) => {
      const location = result.geometry.location;
      const components = {
        city: "",
        district: "",
        state: "",
        zip: "",
        country: "",
      };

      result.address_components.forEach((component) => {
        if (component.types.includes("locality")) {
          components.city = component.long_name;
        }
        if (component.types.includes("administrative_area_level_2")) {
          components.district = component.long_name;
        }
        if (component.types.includes("administrative_area_level_1")) {
          components.state = component.long_name;
        }
        if (component.types.includes("postal_code")) {
          components.zip = component.long_name;
        }
        if (component.types.includes("country")) {
          components.country = component.long_name;
        }
      });

      return {
        formattedAddress: result.formatted_address,
        coordinates: location,
        ...components,
      };
    };

    // Extract all suggestions, including primary
    const suggestions = data.results.map(extractComponents);

    // Return first as main, rest as full suggestion list (including main)
    return res.json({
      ...suggestions[0], // primary
      suggestions,       // full list including primary
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.getGoogleLocation = getGoogleLocation;
