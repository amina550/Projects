/**
 * =====================================================
 * WEATHER APP — JAVASCRIPT
 * Author: WeatherNow
 *
 * APIs used (no API key required):
 *  - Open-Meteo Geocoding API  → city name → lat/lon
 *  - Open-Meteo Forecast API   → weather data by coords
 *
 * Flow:
 *  1. User submits city name
 *  2. Geocoding API resolves city → latitude / longitude
 *  3. Forecast API returns current + hourly + daily data
 *  4. UI is updated; errors are shown inline
 * =====================================================
 */

'use strict';

/* ── 1. Constants & Configuration ─────────────────── */

/** Base URL for the Open-Meteo geocoding API */
const GEO_API   = 'https://geocoding-api.open-meteo.com/v1/search';

/** Base URL for the Open-Meteo forecast API */
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';

/**
 * WMO Weather Interpretation Codes → { label, emoji }
 * Reference: https://open-meteo.com/en/docs#weathervariables
 */
const WMO_CODES = {
  0:  { label: 'Clear Sky',            emoji: '☀️'  },
  1:  { label: 'Mainly Clear',         emoji: '🌤️'  },
  2:  { label: 'Partly Cloudy',        emoji: '⛅'  },
  3:  { label: 'Overcast',             emoji: '☁️'  },
  45: { label: 'Foggy',                emoji: '🌫️'  },
  48: { label: 'Icy Fog',              emoji: '🌫️'  },
  51: { label: 'Light Drizzle',        emoji: '🌦️'  },
  53: { label: 'Moderate Drizzle',     emoji: '🌦️'  },
  55: { label: 'Dense Drizzle',        emoji: '🌧️'  },
  61: { label: 'Slight Rain',          emoji: '🌧️'  },
  63: { label: 'Moderate Rain',        emoji: '🌧️'  },
  65: { label: 'Heavy Rain',           emoji: '🌧️'  },
  66: { label: 'Light Freezing Rain',  emoji: '🌨️'  },
  67: { label: 'Heavy Freezing Rain',  emoji: '🌨️'  },
  71: { label: 'Slight Snowfall',      emoji: '❄️'  },
  73: { label: 'Moderate Snowfall',    emoji: '❄️'  },
  75: { label: 'Heavy Snowfall',       emoji: '❄️'  },
  77: { label: 'Snow Grains',          emoji: '🌨️'  },
  80: { label: 'Slight Rain Showers',  emoji: '🌦️'  },
  81: { label: 'Moderate Rain Showers',emoji: '🌦️'  },
  82: { label: 'Violent Rain Showers', emoji: '⛈️'  },
  85: { label: 'Slight Snow Showers',  emoji: '🌨️'  },
  86: { label: 'Heavy Snow Showers',   emoji: '🌨️'  },
  95: { label: 'Thunderstorm',         emoji: '⛈️'  },
  96: { label: 'Thunderstorm + Hail',  emoji: '⛈️'  },
  99: { label: 'Heavy Thunderstorm + Hail', emoji: '⛈️' },
};

/** Short day-of-week labels */
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];


/* ── 2. DOM Element References ─────────────────────── */
const searchForm    = document.getElementById('searchForm');
const cityInput     = document.getElementById('cityInput');
const searchBtn     = searchForm.querySelector('.search-form__btn');
const statusMessage = document.getElementById('statusMessage');
const skeletonCard  = document.getElementById('skeletonCard');
const weatherCard   = document.getElementById('weatherCard');
const btnCelsius    = document.getElementById('btnCelsius');
const btnFahrenheit = document.getElementById('btnFahrenheit');

// Weather card display fields
const wCity        = document.getElementById('wCity');
const wDate        = document.getElementById('wDate');
const wIconWrap    = document.getElementById('wIconWrap');
const wDescription = document.getElementById('wDescription');
const wTemp        = document.getElementById('wTemp');
const wHumidity    = document.getElementById('wHumidity');
const wWind        = document.getElementById('wWind');
const wVisibility  = document.getElementById('wVisibility');
const wFeelsLike   = document.getElementById('wFeelsLike');
const forecastList = document.getElementById('forecastList');


/* ── 3. App State ──────────────────────────────────── */
/**
 * Holds the last fetched weather data so we can re-render
 * without a new network request when the user toggles units.
 */
const state = {
  /** @type {'C'|'F'} */
  unit: 'C',

  /** Cached weather payload from the last successful fetch */
  currentWeather: null,
};


/* ── 4. Utility Functions ──────────────────────────── */

/**
 * Convert Celsius to Fahrenheit.
 * @param {number} c - Temperature in Celsius
 * @returns {number}
 */
const toF = (c) => Math.round(c * 9 / 5 + 32);

/**
 * Format a temperature number with its unit symbol.
 * @param {number} celsius
 * @param {'C'|'F'} unit
 * @returns {string}  e.g. "21°C" or "70°F"
 */
const formatTemp = (celsius, unit) =>
  unit === 'C' ? `${Math.round(celsius)}°C` : `${toF(celsius)}°F`;

/**
 * Look up a WMO weather code and return its label + emoji.
 * Falls back to a safe default if code is unrecognised.
 * @param {number} code
 * @returns {{ label: string, emoji: string }}
 */
const decodeWMO = (code) =>
  WMO_CODES[code] ?? { label: 'Unknown', emoji: '🌡️' };

/**
 * Format today's date in a human-readable way.
 * @returns {string}  e.g. "Friday, October 3, 2025"
 */
const formatDate = () =>
  new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

/**
 * Build a URLSearchParams string from a plain object.
 * @param {Record<string, string|number>} params
 * @returns {string}
 */
const buildQuery = (params) => new URLSearchParams(params).toString();

/**
 * Clamp and format visibility in km.
 * @param {number} meters
 * @returns {string}
 */
const formatVisibility = (meters) => {
  const km = Math.min(meters / 1000, 99);
  return `${km.toFixed(1)} km`;
};


/* ── 5. UI Helper Functions ────────────────────────── */

/**
 * Show or hide an element using the `hidden` attribute.
 * @param {HTMLElement} el
 * @param {boolean} visible
 */
const setVisible = (el, visible) => {
  el.hidden = !visible;
};

/**
 * Render a status / error message in the UI.
 * @param {string} text   - Human-readable message
 * @param {'error'|'info'} type
 * @param {string} [icon] - Optional emoji prefix
 */
const showStatus = (text, type = 'error', icon = '') => {
  // Remove previous type modifier classes
  statusMessage.classList.remove('status-message--error', 'status-message--info');
  statusMessage.classList.add(`status-message--${type}`);

  statusMessage.querySelector('.status-message__icon').textContent = icon;
  statusMessage.querySelector('.status-message__text').textContent = text;

  // Restart the animation so it always plays when content changes
  statusMessage.style.animation = 'none';
  // Force reflow
  void statusMessage.offsetHeight;
  statusMessage.style.animation = '';

  setVisible(statusMessage, true);
};

/** Hide the status message. */
const hideStatus = () => setVisible(statusMessage, false);

/**
 * Put the search button into a loading/idle state.
 * @param {boolean} loading
 */
const setLoading = (loading) => {
  searchBtn.setAttribute('aria-busy', loading ? 'true' : 'false');
  searchBtn.disabled = loading;
  cityInput.disabled = loading;
};

/**
 * Activate a unit toggle button and update aria-pressed states.
 * @param {'C'|'F'} unit
 */
const activateUnit = (unit) => {
  const isCelsius = unit === 'C';
  btnCelsius.classList.toggle('unit-toggle__btn--active', isCelsius);
  btnFahrenheit.classList.toggle('unit-toggle__btn--active', !isCelsius);
  btnCelsius.setAttribute('aria-pressed', String(isCelsius));
  btnFahrenheit.setAttribute('aria-pressed', String(!isCelsius));
};


/* ── 6. Network Functions ──────────────────────────── */

/**
 * Fetch geo-coordinates for a city name using the
 * Open-Meteo Geocoding API.
 *
 * @param {string} cityName
 * @returns {Promise<{ name: string, latitude: number, longitude: number, country: string }>}
 * @throws {Error} If city is not found or network fails
 */
async function fetchCoordinates(cityName) {
  const url = `${GEO_API}?${buildQuery({ name: cityName, count: 1, language: 'en', format: 'json' })}`;

  const response = await fetch(url);

  // Network-level error (non-2xx)
  if (!response.ok) {
    throw new Error(`Geocoding service error (HTTP ${response.status}). Please try again later.`);
  }

  const data = await response.json();

  // No results → city not found
  if (!data.results || data.results.length === 0) {
    throw new Error(`City "${cityName}" not found. Please check your spelling and try again.`);
  }

  const { name, latitude, longitude, country } = data.results[0];
  return { name, latitude, longitude, country };
}

/**
 * Fetch current & daily weather from Open-Meteo using coords.
 *
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<object>} Raw Open-Meteo response
 * @throws {Error} If the forecast service returns an error
 */
async function fetchWeatherData(latitude, longitude) {
  const params = buildQuery({
    latitude,
    longitude,
    current: [
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'wind_speed_10m',
      'weather_code',
      'visibility',
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
    ].join(','),
    timezone: 'auto',
    forecast_days: 5,
  });

  const url = `${WEATHER_API}?${params}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Weather service error (HTTP ${response.status}). Please try again later.`);
  }

  return response.json();
}


/* ── 7. Render Functions ───────────────────────────── */

/**
 * Render the main weather card from cached state data.
 * Called on initial load AND when unit is toggled.
 */
function renderWeather() {
  const { data, location } = state.currentWeather;
  const { current, daily } = data;
  const { unit } = state;

  const wmo = decodeWMO(current.weather_code);

  // Location & date
  wCity.textContent = `${location.name}, ${location.country}`;
  wDate.textContent = formatDate();

  // Icon & description
  wIconWrap.textContent = wmo.emoji;
  wDescription.textContent = wmo.label;

  // Temperature
  wTemp.textContent = formatTemp(current.temperature_2m, unit);

  // Stats
  wHumidity.textContent   = `${current.relative_humidity_2m}%`;
  wWind.textContent       = `${Math.round(current.wind_speed_10m)} km/h`;
  wVisibility.textContent = formatVisibility(current.visibility);
  wFeelsLike.textContent  = formatTemp(current.apparent_temperature, unit);

  // Forecast strip
  renderForecast(daily, unit);
}

/**
 * Render the 5-day forecast strip.
 * @param {object} daily  - Open-Meteo `daily` object
 * @param {'C'|'F'} unit
 */
function renderForecast(daily, unit) {
  forecastList.innerHTML = '';

  daily.time.forEach((isoDate, idx) => {
    const date = new Date(`${isoDate}T00:00:00`); // local parse
    const dayLabel = idx === 0 ? 'Today' : DAYS[date.getDay()];
    const wmo = decodeWMO(daily.weather_code[idx]);
    const high = formatTemp(daily.temperature_2m_max[idx], unit);
    const low  = formatTemp(daily.temperature_2m_min[idx], unit);

    const card = document.createElement('div');
    card.className = 'forecast-day';
    card.setAttribute('role', 'listitem');
    card.setAttribute('aria-label', `${dayLabel}: ${wmo.label}, high ${high}, low ${low}`);
    card.innerHTML = `
      <span class="forecast-day__label">${dayLabel}</span>
      <span class="forecast-day__icon">${wmo.emoji}</span>
      <span class="forecast-day__high">${high}</span>
      <span class="forecast-day__low">${low}</span>
    `;
    forecastList.appendChild(card);
  });
}


/* ── 8. Main Search Handler ────────────────────────── */

/**
 * Orchestrates the full search flow:
 *  validate → show skeleton → fetch → render → handle errors.
 *
 * @param {string} rawInput - Raw city name from the input field
 */
async function handleSearch(rawInput) {
  // --- Validation ---
  const cityName = rawInput.trim();

  if (!cityName) {
    showStatus('Please enter a city name to search.', 'error', '✏️');
    cityInput.focus();
    return;
  }

  // --- Reset UI ---
  hideStatus();
  setVisible(weatherCard,  false);
  setVisible(skeletonCard, true);
  setLoading(true);

  try {
    // Step 1: Resolve city name → coordinates
    const location = await fetchCoordinates(cityName);

    // Step 2: Fetch weather for those coordinates
    const weatherData = await fetchWeatherData(location.latitude, location.longitude);

    // Step 3: Cache data in state
    state.currentWeather = { data: weatherData, location };

    // Step 4: Render
    renderWeather();

    // Step 5: Show the card
    setVisible(skeletonCard, false);
    setVisible(weatherCard,  true);

  } catch (error) {
    // Hide the skeleton; keep the card hidden
    setVisible(skeletonCard, false);

    // Distinguish between "city not found" and network/server errors
    const isUserError = error.message.includes('not found');
    showStatus(error.message, 'error', isUserError ? '🔍' : '⚠️');

    // Log for debugging (safe – no sensitive data)
    console.error('[WeatherNow] Fetch error:', error);

  } finally {
    // Always re-enable the UI
    setLoading(false);
  }
}


/* ── 9. Event Listeners ────────────────────────────── */

/**
 * Search form submission (button click OR Enter key)
 */
searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  handleSearch(cityInput.value);
});

/**
 * Temperature unit toggle
 */
[btnCelsius, btnFahrenheit].forEach((btn) => {
  btn.addEventListener('click', () => {
    const selectedUnit = btn.dataset.unit;

    // No-op if same unit is already active
    if (selectedUnit === state.unit) return;

    state.unit = selectedUnit;
    activateUnit(selectedUnit);

    // Re-render with new unit (no network request needed)
    if (state.currentWeather) {
      renderWeather();
    }
  });
});

/**
 * Clear error on new input so stale messages don't confuse users
 */
cityInput.addEventListener('input', () => {
  if (!statusMessage.hidden) hideStatus();
});

/**
 * Keyboard shortcut: press "/" to focus the search input
 * (handy for power users)
 */
document.addEventListener('keydown', (event) => {
  if (event.key === '/' && document.activeElement !== cityInput) {
    event.preventDefault();
    cityInput.focus();
    cityInput.select();
  }
});


/* ── 10. Initialisation ────────────────────────────── */

/**
 * On first load, try to get the user's location via the
 * Geolocation API for an instant weather reading.
 * Silently fails if permission is denied.
 */
function initGeolocation() {
  if (!('geolocation' in navigator)) return;

  navigator.geolocation.getCurrentPosition(
    async ({ coords }) => {
      setVisible(skeletonCard, true);
      setLoading(true);

      try {
        // Reverse-geocode: get city name from coords using Open-Meteo
        // Open-Meteo doesn't have a reverse-geocoder, so we fetch weather
        // directly and supply "Your Location" as the city label.
        const weatherData = await fetchWeatherData(coords.latitude, coords.longitude);

        state.currentWeather = {
          data: weatherData,
          location: { name: 'Your Location', country: '' },
        };

        renderWeather();
        setVisible(skeletonCard, false);
        setVisible(weatherCard,  true);
      } catch (err) {
        // Silently fail geolocation weather fetch
        setVisible(skeletonCard, false);
        console.warn('[WeatherNow] Geolocation weather failed:', err);
      } finally {
        setLoading(false);
      }
    },
    // Permission denied or unavailable → do nothing
    () => {},
    { timeout: 5000 }
  );
}

// Kick off geolocation on page load
initGeolocation();
