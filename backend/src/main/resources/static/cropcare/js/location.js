/* ============================================================
   location.js — Geolocation + Reverse Geocoding + Map Preview
   Uses: Browser Geolocation API + OpenStreetMap Nominatim
   ============================================================ */

'use strict';

const LocationAPI = (() => {

  /* ── Config ── */
  const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';
  const GEO_OPTIONS   = { enableHighAccuracy: true, timeout: 14000, maximumAge: 120000 };

  /* ── Detect & reverse-geocode ── */
  async function detect(config = {}) {
    const {
      btnId,
      statusId,
      onSuccess,
      onError,
      context = 'default'
    } = config;

    if (!navigator.geolocation) {
      renderError(statusId, 'Geolocation is not supported by your browser.');
      if (onError) onError('unsupported');
      return;
    }

    setButtonLoading(btnId, true);
    clearStatus(statusId);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon, accuracy } = pos.coords;
        try {
          const loc = await reverseGeocode(lat, lon);
          loc.lat = lat;
          loc.lon = lon;
          loc.accuracy = accuracy;

          // Persist to session
          sessionStorage.setItem('cropLocation', JSON.stringify(loc));

          setButtonLoading(btnId, false);
          renderSuccess(statusId, loc);
          updateNavbar(loc.display);

          if (onSuccess) onSuccess(loc);
        } catch (err) {
          setButtonLoading(btnId, false);
          renderError(statusId, 'Failed to fetch location details. Check your internet connection.');
          if (onError) onError(err);
        }
      },
      (err) => {
        setButtonLoading(btnId, false);
        const messages = {
          1: 'Location access denied. Please allow browser location permission.',
          2: 'Position unavailable. Ensure GPS or network location is enabled.',
          3: 'Location request timed out. Try again in a moment.',
        };
        renderError(statusId, messages[err.code] || 'An unknown location error occurred.');
        if (onError) onError(err);
      },
      GEO_OPTIONS
    );
  }

  /* ── Reverse geocode via OpenStreetMap Nominatim (free, no API key) ── */
  async function reverseGeocode(lat, lon) {
    const params = new URLSearchParams({
      format: 'json', lat, lon, zoom: 14, addressdetails: 1
    });
    const res = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'CropDiseaseCommunitySystem/1.0 (educational project)'
      }
    });
    if (!res.ok) throw new Error(`Nominatim ${res.status}`);
    const data = await res.json();

    const addr = data.address || {};
    const village  = addr.village || addr.town || addr.hamlet || addr.suburb || addr.city_district || addr.city || '';
    const district = addr.county || addr.state_district || addr.district || '';
    const state    = addr.state || '';
    const country  = addr.country || '';
    const postcode = addr.postcode || '';
    const full     = data.display_name || '';
    const display  = [village, district, state].filter(Boolean).join(', ') || full.split(',').slice(0,3).join(',');

    return { village, district, state, country, postcode, display, full, raw: addr };
  }

  /* ── Silent background detect (on page load) ── */
  function silentDetect() {
    const saved = sessionStorage.getItem('cropLocation');
    if (saved) {
      const loc = JSON.parse(saved);
      updateNavbar(loc.display);
      return;
    }
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const loc = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          loc.lat = pos.coords.latitude;
          loc.lon = pos.coords.longitude;
          loc.accuracy = pos.coords.accuracy;
          sessionStorage.setItem('cropLocation', JSON.stringify(loc));
          updateNavbar(loc.display);
        } catch (_) {}
      },
      () => {},
      { timeout: 10000, maximumAge: 300000 }
    );
  }

  /* ── Fill HTML form fields with detected location ── */
  function fillFields(loc, fieldMap = {}) {
    /* fieldMap = { village: 'elementId', district: 'elementId', state: 'elementId' } */
    const defaults = { village: 'loc-village', district: 'loc-district', state: 'loc-state' };
    const map = Object.assign({}, defaults, fieldMap);
    if (loc.village  && map.village)  App.setVal(map.village,  loc.village);
    if (loc.district && map.district) App.setVal(map.district, loc.district);
    if (loc.state    && map.state)    App.setVal(map.state,    loc.state);
  }

  /* ── Show OpenStreetMap embed ── */
  function showMap(loc, mapDivId, frameName, labelId) {
    const mapDiv = document.getElementById(mapDivId);
    const frame  = document.getElementById(frameName);
    const label  = document.getElementById(labelId);
    if (!mapDiv || !frame) return;

    const { lat, lon, display } = loc;
    const delta = 0.012;

    if (label) label.textContent = display.length > 28 ? display.slice(0,26) + '…' : display;

    frame.src = `https://www.openstreetmap.org/export/embed.html?bbox=${lon-delta},${lat-delta},${lon+delta},${lat+delta}&layer=mapnik&marker=${lat},${lon}`;
    mapDiv.classList.add('visible');

    // Open-in-OSM link
    const link = document.getElementById('map-osm-link');
    if (link) link.href = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=15/${lat}/${lon}`;
  }

  /* ── Show coordinates ── */
  function showCoords(loc, elId) {
    const el = document.getElementById(elId);
    if (!el) return;
    const acc = loc.accuracy ? ` · ±${Math.round(loc.accuracy)}m accuracy` : '';
    el.textContent = `📌 ${loc.lat.toFixed(6)}, ${loc.lon.toFixed(6)}${acc}`;
    el.style.display = 'inline-block';
  }

  /* ── Update navbar location text ── */
  function updateNavbar(display) {
    document.querySelectorAll('.nav-loc-text').forEach(el => {
      const short = display && display.length > 30 ? display.slice(0, 28) + '…' : display;
      el.textContent = short || 'Location unavailable';
    });
  }

  /* ── UI helpers ── */
  function setButtonLoading(btnId, loading) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    if (loading) {
      btn.classList.add('loading');
      btn.disabled = true;
    } else {
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  }

  function renderSuccess(statusId, loc) {
    const el = document.getElementById(statusId);
    if (!el) return;
    el.innerHTML = `
      <div class="loc-pill">
        <span class="pulse-dot"></span>
        📍 <strong>${loc.display}</strong>
        ${loc.accuracy ? `<span class="acc-badge">±${Math.round(loc.accuracy)}m</span>` : ''}
      </div>`;
  }

  function renderError(statusId, message) {
    const el = document.getElementById(statusId);
    if (!el) return;
    el.innerHTML = `<div class="loc-error">⚠️ <span>${message}</span></div>`;
  }

  function clearStatus(statusId) {
    const el = document.getElementById(statusId);
    if (el) el.innerHTML = '';
  }

  /* ── Get saved location ── */
  function getSaved() {
    const s = sessionStorage.getItem('cropLocation');
    return s ? JSON.parse(s) : null;
  }

  /* Public API */
  return { detect, reverseGeocode, silentDetect, fillFields, showMap, showCoords, updateNavbar, getSaved };

})();

/* Auto silent detect on every page */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(LocationAPI.silentDetect, 800);
});
