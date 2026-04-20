export const CITY_COORDINATES = {
  Dehradun: { lat: 30.3165, lng: 78.0322 },
  Haridwar: { lat: 29.9457, lng: 78.1642 },
  Rishikesh: { lat: 30.0869, lng: 78.2676 },
  Nainital: { lat: 29.3919, lng: 79.4542 },
  Mussoorie: { lat: 30.4598, lng: 78.0644 },
  Haldwani: { lat: 29.2183, lng: 79.513 },
};

export const DEFAULT_MAP_CENTER = { lat: 30.3165, lng: 78.0322 };

export const sanitizeCoordinates = (coordinates) => {
  if (!coordinates) return null;

  const lat = Number(coordinates.lat);
  const lng = Number(coordinates.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return { lat, lng };
};

export const resolveCoordinates = (location, coordinates) => {
  return sanitizeCoordinates(coordinates) || CITY_COORDINATES[location] || null;
};

export const buildGoogleMapsUrl = ({ label, coordinates }) => {
  const safeCoordinates = sanitizeCoordinates(coordinates);

  if (safeCoordinates) {
    return `https://www.google.com/maps/search/?api=1&query=${safeCoordinates.lat},${safeCoordinates.lng}`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label || "")}`;
};
