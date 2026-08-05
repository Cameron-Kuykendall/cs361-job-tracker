const express = require("express");
const axios = require("./node_modules/axios/index.d.cts");
const cors = require("cors");

const app = express();
const PORT = 3020;

app.use(express.json());
// Allow cross-origin requests from the frontend during development
app.use(cors());

app.post("/lookup", async (req, res) => {
  const { query, type } = req.body;

  // Log each incoming request for visibility
  console.log(`[Lookup] Incoming request: ${req.method} ${req.path} - body: ${JSON.stringify(req.body)}`);

  if (!query || typeof query !== "string" || query.trim() === "") {
    return res.status(400).json({
      status: "failure",
      message: "A non-empty query is required.",
    });
  }

  if (type && !["company", "venue"].includes(type)) {
    return res.status(400).json({
      status: "failure",
      message: "Type must be either 'company' or 'venue'.",
    });
  }

  try {
    const searchQuery = query.trim();

    const response = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        q: searchQuery,
        format: "json",
        addressdetails: 1,
        limit: 5,
      },
      headers: {
        "User-Agent": "CS361-Company-Venue-Lookup/1.0",
      },
      timeout: 10000,
    });

    if (!response.data || response.data.length === 0) {
      return res.status(404).json({
        status: "failure",
        message: "No matching company or venue was found.",
      });
    }

    const results = response.data.map((place) => {
      const latitude = Number(place.lat);
      const longitude = Number(place.lon);
      const address = place.address || {};

      return {
        name: place.name || address.company || address.amenity || address.building || query,
        display_name: place.display_name,
        latitude,
        longitude,
        category: place.category || null,
        location_type: place.type || null,
        city: address.city || address.town || address.village || null,
        state: address.state || null,
        country: address.country || null,
        postcode: address.postcode || null,
        map_url: `https://www.google.com/maps?q=${latitude},${longitude}`,
      };
    });

    console.log(`[Lookup] Returning ${results.length} results for query="${query.trim()}"`);

    return res.json({
      status: "success",
      query: query.trim(),
      type: type || null,
      results,
    });
  } catch (error) {
    console.error("Lookup error:", error && error.message ? error.message : error);

    return res.status(500).json({
      status: "failure",
      message: "The lookup service could not complete the request.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Company/Venue Lookup Microservice listening on port ${PORT}.`);
});
