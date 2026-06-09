// ============================================================================
// SECTION 1: NAVIGATION & TIME ZONE
// ============================================================================

document.querySelectorAll(".nav-link").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const target = btn.getAttribute("data-target");
    
    // Only handle if data-target exists (About, Contact) — not Projects/Blog/Gallery
    if (target) {
      e.preventDefault();
      const el = document.querySelector(target);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    // Otherwise: let default link behavior handle navigation
  });
});

document.getElementById("home-btn").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.getElementById("year").textContent = new Date().getFullYear();


// ============================================================================
// SECTION 2: WEATHER API (WeatherAPI)
// ============================================================================

const weatherStatusEl = document.getElementById("weather-status");

async function getWeatherData(query = "Dortmund") {
  const apiKey = "1894d40599bd47efb88115802260906";
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(query)}&days=1&aqi=no`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Weather API error");
    const data = await res.json();
    
    const code = data.current.condition.code;
    let type = "clear";
    
    if ([1000].includes(code)) type = "clear";
    else if ([1003, 1006, 1009].includes(code)) type = "clouds";
    else if ([1030, 1135, 1147].includes(code)) type = "mist";
    else if ([1063, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(code)) type = "rain";
    else if ([1066, 1114, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258].includes(code)) type = "snow";
    else if ([1087, 1273, 1276, 1279, 1282].includes(code)) type = "thunderstorm";

    return {
      condition: type,
      description: data.current.condition.text,
      temp: Math.round(data.current.temp_c),
      feels: Math.round(data.current.feelslike_c),
      humidity: data.current.humidity,
      wind: Math.round(data.current.wind_kph),
      sunrise: data.forecast.forecastday[0].astro.sunrise,
      sunset: data.forecast.forecastday[0].astro.sunset,
      isDay: data.current.is_day === 1,
      city: data.location.name,
      country: data.location.country
    };
  } catch (e) {
    console.error("Weather fetch failed:", e);
    return null;
  }
}


// ============================================================================
// SECTION 3: LOAD WEATHER SYSTEM
// ============================================================================

async function loadWeatherSystem(query) {
  const weather = await getWeatherData(query);
  if (!weather) return;

  const cityEl = document.getElementById("wc-city");
  if (cityEl) cityEl.textContent = `📍 ${weather.city}, ${weather.country}`;

  updateCosmicThemeColors(weather.condition, weather.isDay);
  updateWeatherCardData(weather);
  generateWeatherAtmosphereEffects(weather.condition);
  updateNarrativeMoodText(weather.condition, weather.description, weather.isDay);
}


// ============================================================================
// SECTION 4: DYNAMIC COLOR ENGINE
// ============================================================================

function updateCosmicThemeColors(condition, isDay) {
  const root = document.documentElement;
  
  const shifts = {
    clear:        { nebula: "#134e4a", auroraTop: "#0d9488", auroraBottom: "#a855f7" },
    clouds:       { nebula: "#1e1b4b", auroraTop: "#4338ca", auroraBottom: "#6366f1" },
    rain:         { nebula: "#06201b", auroraTop: "#0f766e", auroraBottom: "#475569" },
    snow:         { nebula: "#0f172a", auroraTop: "#115e59", auroraBottom: "#cbd5e1" },
    mist:         { nebula: "#020617", auroraTop: "#312e81", auroraBottom: "#1e1b4b" },
    thunderstorm: { nebula: "#172554", auroraTop: "#581c87", auroraBottom: "#b45309" }
  };

  const current = shifts[condition] || shifts.clear;
  
  root.style.setProperty("--dynamic-nebula-glow", current.nebula);
  root.style.setProperty("--dynamic-aurora-top", current.auroraTop);
  root.style.setProperty("--dynamic-aurora-bottom", current.auroraBottom);
}


// ============================================================================
// SECTION 5: WEATHER EFFECTS
// ============================================================================

function generateWeatherAtmosphereEffects(condition) {
  const fx = document.getElementById("weather-fx");
  if (!fx) return;
  fx.innerHTML = "";

  // Shooting stars always present
  const starCount = condition === "clear" ? 18 : 8;
  for (let i = 0; i < starCount; i++) {
    const star = document.createElement("div");
    star.className = "shooting-star";
    star.style.top = Math.random() * 45 + "vh";
    star.style.left = Math.random() * 85 + "vw";
    star.style.animationDelay = Math.random() * 7 + "s";
    star.style.animationDuration = 1.2 + Math.random() * 1.8 + "s";
    fx.appendChild(star);
  }

  // Weather-specific effects
  if (condition === "rain") {
    for (let i = 0; i < 45; i++) {
      const drop = document.createElement("div");
      drop.className = "cosmic-rain";
      drop.style.left = Math.random() * 100 + "vw";
      drop.style.animationDelay = Math.random() * 1.5 + "s";
      drop.style.animationDuration = 0.4 + Math.random() * 0.4 + "s";
      fx.appendChild(drop);
    }
  } else if (condition === "thunderstorm") {
    const flash = document.createElement("div");
    flash.className = "nebula-lightning";
    fx.appendChild(flash);
  } else if (condition === "snow") {
    for (let i = 0; i < 30; i++) {
      const flake = document.createElement("div");
      flake.className = "cosmic-snow";
      flake.style.left = Math.random() * 100 + "vw";
      flake.style.animationDelay = Math.random() * 3 + "s";
      flake.style.animationDuration = 3.5 + Math.random() * 3.5 + "s";
      fx.appendChild(flake);
    }
  }
}


// ============================================================================
// SECTION 6: UPDATE WEATHER CARD
// ============================================================================

function updateWeatherCardData(weather) {
  const tempEl = document.getElementById("wc-temp");
  const condEl = document.getElementById("wc-condition");
  if (tempEl) tempEl.textContent = weather.temp + "°C";
  if (condEl) condEl.textContent = weather.description;

  if (document.getElementById("wc-humidity")) document.getElementById("wc-humidity").textContent = weather.humidity;
  if (document.getElementById("wc-wind")) document.getElementById("wc-wind").textContent = weather.wind;
  if (document.getElementById("wc-feels")) document.getElementById("wc-feels").textContent = weather.feels;
  
  if (document.getElementById("wc-sunrise")) document.getElementById("wc-sunrise").textContent = weather.sunrise;
  if (document.getElementById("wc-sunset")) document.getElementById("wc-sunset").textContent = weather.sunset;

  const fillEl = document.getElementById("wc-fill");
  const dotEl = document.getElementById("wc-dot");
  if (fillEl && dotEl) {
    fillEl.style.width = weather.isDay ? "65%" : "0%";
    dotEl.style.left = weather.isDay ? "65%" : "0%";
  }

  const updEl = document.getElementById("wc-updated");
  if (updEl) {
    updEl.textContent = "Updated: " + new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  }
}

function updateNarrativeMoodText(condition, description, isDay) {
  if (!weatherStatusEl) return;
  const metrics = {
    clear: isDay ? "Sky transparent. Optimal parameters for strategic planning." : "Night cycle stabilized. Perfect for deep analysis.",
    clouds: "Interstellar cloud density high. Excellent for analytics.",
    rain: "Precipitation tracking smoothly. Systems running optimally.",
    snow: "Thermal drop registered. Crystal clear execution pipeline active.",
    mist: "Nebula dust tracking across sensors. Navigating via metrics.",
    thunderstorm: "High atmospheric energy detected. Exponential logic loops running."
  };
  weatherStatusEl.textContent = metrics[condition] || `${description}. Core systems operational.`;
}


// ============================================================================
// SECTION 7: GEOLOCATION
// ============================================================================

const locateBtn = document.getElementById("wc-locate-btn");
if (locateBtn) {
  locateBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      alert("Location tracking unavailable.");
      return;
    }
    locateBtn.textContent = "⏳ Syncing...";
    
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const queryStr = `${pos.coords.latitude},${pos.coords.longitude}`;
        await loadWeatherSystem(queryStr);
        locateBtn.textContent = "✓ Location Set";
        localStorage.setItem("cosmic-location", queryStr);
      },
      () => {
        alert("Timeout. Using Dortmund baseline.");
        locateBtn.textContent = "⊙ Standard";
      }
    );
  });
}


// ============================================================================
// SECTION 8: DAY/NIGHT BACKGROUND TRANSITION
// ============================================================================

function updateBackgroundByTime() {
  const hour = new Date().getHours();
  const root = document.documentElement;
  
  // Morning (5-11): Bright sunrise
  if (hour >= 5 && hour < 7) {
    root.style.setProperty("--bg-intensity", "0.85");
    root.style.setProperty("--bg-hue-shift", "45deg");
  }
  // Day (7-17): Peak brightness
  else if (hour >= 7 && hour < 17) {
    root.style.setProperty("--bg-intensity", "0.95");
    root.style.setProperty("--bg-hue-shift", "0deg");
  }
  // Sunset (17-19): Orange/red tones
  else if (hour >= 17 && hour < 19) {
    root.style.setProperty("--bg-intensity", "0.75");
    root.style.setProperty("--bg-hue-shift", "25deg");
  }
  // Night (19-5): Deep dark
  else {
    root.style.setProperty("--bg-intensity", "0.5");
    root.style.setProperty("--bg-hue-shift", "200deg");
  }
}


// ============================================================================
// SECTION 9: INITIALIZATION
// ============================================================================

generateWeatherAtmosphereEffects("clear");
updateBackgroundByTime();

const activeHorizon = localStorage.getItem("cosmic-location") || "Dortmund";
loadWeatherSystem(activeHorizon);

// Update background every 5 minutes
setInterval(updateBackgroundByTime, 300000);


// ============================================================================
// SECTION 10: CALENDLY INTEGRATION
// ============================================================================

const scheduleButton = document.getElementById("schedule-button");
if (scheduleButton) {
  scheduleButton.addEventListener("click", (e) => {
    e.preventDefault();
    Calendly.initPopupWidget({
      url: 'https://calendly.com/sadatmahmud334/30min'
    });
    return false;
  });
}


// ============================================================================
// SECTION 11: BENTO GRID MOUSE TRACKING
// ============================================================================

document.querySelectorAll('.bento-box').forEach((box) => {
  box.addEventListener('mousemove', (e) => {
    const rect = box.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    box.style.setProperty('--mouse-x', `${x}px`);
    box.style.setProperty('--mouse-y', `${y}px`);
  });
});