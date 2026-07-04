const axios = require('axios');

const BASE_URL = 'https://nominatim.openstreetmap.org/search';

/**
 * Look up a free-text birth place (city/town) and resolve it to coordinates plus
 * district/state, using OpenStreetMap's free Nominatim geocoder. No API key
 * required, but their usage policy requires an identifying User-Agent and caps
 * us at ~1 request/second — fine for this bot's volume.
 *
 * @param {string} place - free-text place name (e.g. "Indore, Madhya Pradesh")
 * @returns {Promise<{ latitude: number, longitude: number, district: string|null, state: string|null, displayName: string } | null>}
 */
async function geocodeBirthPlace(place) {
  if (!place || !place.trim()) return null;

  const response = await axios.get(BASE_URL, {
    params: {
      q: place.trim(),
      format: 'jsonv2',
      addressdetails: 1,
      limit: 1,
    },
    headers: {
      'User-Agent': 'AstroVaidhya-WhatChat/1.0 (contact: astrovaidhya.com)',
    },
    timeout: 8000,
  });

  const result = response.data?.[0];
  if (!result) return null;

  const address = result.address || {};
  const district = address.state_district || address.county || address.district || null;
  const state = address.state || null;

  return {
    latitude: parseFloat(result.lat),
    longitude: parseFloat(result.lon),
    district,
    state,
    displayName: result.display_name,
  };
}

module.exports = { geocodeBirthPlace };
