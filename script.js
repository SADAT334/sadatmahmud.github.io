// Smooth scroll for nav buttons
document.querySelectorAll(".nav-link").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-target");
    const el = document.querySelector(target);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

// Home button
document.getElementById("home-btn").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Set current year in footer
document.getElementById("year").textContent = new Date().getFullYear();

// ── WEATHER ──────────────────────────────────────────────

const weatherStatusEl = document.getElementById("weather-status");

async function getWeatherData() {
  const API_KEY = "f8189dc914d6a09cee33cddb4aa2cf0c";
  const CITY = "Dortmund";
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return {
      condition: data.weather[0].main.toLowerCase(),
      description: data.weather[0].description,
      temp: Math.round(data.main.temp),
      feels: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      wind: Math.round(data.wind.speed * 3.6),
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
      now: Math.floor(Date.now() / 1000)
    };
  } catch (e) {
    return null;
  }
}

function updateWeatherCard(weather) {
  const isDay = weather.now >= weather.sunrise && weather.now < weather.sunset;

  const tempEl = document.getElementById("wc-temp");
  const condEl = document.getElementById("wc-condition");
  if (tempEl) tempEl.textContent = weather.temp + "°C";
  if (condEl) condEl.textContent = weather.description;

  const humEl  = document.getElementById("wc-humidity");
  const windEl = document.getElementById("wc-wind");
  const feelEl = document.getElementById("wc-feels");
  if (humEl)  humEl.textContent  = weather.humidity;
  if (windEl) windEl.textContent = weather.wind;
  if (feelEl) feelEl.textContent = weather.feels;

  const fmt = (unix) => {
    const d = new Date(unix * 1000);
    return d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  };
  const srEl = document.getElementById("wc-sunrise");
  const ssEl = document.getElementById("wc-sunset");
  if (srEl) srEl.textContent = fmt(weather.sunrise);
  if (ssEl) ssEl.textContent = fmt(weather.sunset);

  const total   = weather.sunset - weather.sunrise;
  const elapsed = Math.max(0, Math.min(weather.now - weather.sunrise, total));
  const pct     = isDay ? Math.round((elapsed / total) * 100) : 0;
  const fillEl  = document.getElementById("wc-fill");
  const dotEl   = document.getElementById("wc-dot");
  if (fillEl) fillEl.style.width = pct + "%";
  if (dotEl)  dotEl.style.left  = pct + "%";

  const updEl = document.getElementById("wc-updated");
  if (updEl) {
    const now = new Date();
    updEl.textContent = "Updated at " + now.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  }
}

function applyWeatherTheme(condition, isDay) {
  const themes = {
    clear_day: {
      b1: "rgba(28,69,50,0.72)",
      b2: "rgba(180,83,9,0.75)",
      b3: "rgba(22,101,52,0.55)",
      b4: "rgba(234,88,12,0.55)",
    },
    clear_night: {
      b1: "rgba(10,30,60,0.85)",
      b2: "rgba(120,53,15,0.5)",
      b3: "rgba(15,60,35,0.45)",
      b4: "rgba(150,50,10,0.35)",
    },
    clouds_day: {
      b1: "rgba(40,60,35,0.65)",
      b2: "rgba(100,80,30,0.5)",
      b3: "rgba(30,70,40,0.5)",
      b4: "rgba(120,70,20,0.4)",
    },
    clouds_night: {
      b1: "rgba(15,25,20,0.88)",
      b2: "rgba(40,30,15,0.65)",
      b3: "rgba(10,35,20,0.6)",
      b4: "rgba(60,35,10,0.4)",
    },
    rain_day: {
      b1: "rgba(10,60,55,0.8)",
      b2: "rgba(60,40,10,0.4)",
      b3: "rgba(8,70,60,0.65)",
      b4: "rgba(80,50,10,0.3)",
    },
    rain_night: {
      b1: "rgba(5,30,28,0.92)",
      b2: "rgba(30,20,5,0.5)",
      b3: "rgba(5,40,35,0.75)",
      b4: "rgba(40,25,5,0.35)",
    },
    snow_day: {
      b1: "rgba(60,80,90,0.55)",
      b2: "rgba(80,70,50,0.35)",
      b3: "rgba(50,75,70,0.45)",
      b4: "rgba(90,75,55,0.3)",
    },
    snow_night: {
      b1: "rgba(20,30,45,0.85)",
      b2: "rgba(40,35,25,0.4)",
      b3: "rgba(15,35,40,0.7)",
      b4: "rgba(45,38,25,0.3)",
    },
    thunderstorm_day: {
      b1: "rgba(8,20,12,0.95)",
      b2: "rgba(160,60,5,0.7)",
      b3: "rgba(5,18,10,0.9)",
      b4: "rgba(200,70,5,0.6)",
    },
    thunderstorm_night: {
      b1: "rgba(4,10,6,0.98)",
      b2: "rgba(120,45,5,0.65)",
      b3: "rgba(3,12,7,0.95)",
      b4: "rgba(160,55,5,0.55)",
    },
  };

  const key = condition + "_" + (isDay ? "day" : "night");
  const t = themes[key] || themes["clear_day"];

  let styleTag = document.getElementById("weather-style");
  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = "weather-style";
    document.head.appendChild(styleTag);
  }

  styleTag.textContent = `
    body::before {
      background:
        radial-gradient(ellipse 420px 420px at -5% -15%, ${t.b1} 0%, transparent 70%),
        radial-gradient(ellipse 300px 300px at 95% -5%, ${t.b2} 0%, transparent 70%),
        radial-gradient(ellipse 240px 240px at 20% 95%, ${t.b3} 0%, transparent 70%),
        radial-gradient(ellipse 180px 180px at 90% 90%, ${t.b4} 0%, transparent 70%);
      transition: background 2s ease;
    }
  `;
}

function updateWeatherText(condition, description, isDay) {
  if (!weatherStatusEl) return;
  const messages = {
    clear:        isDay ? "Bright and clear — sharp thinking weather." : "Clear night — perfect for late-night analysis.",
    clouds:       isDay ? "Overcast skies — ideal for deep focus." : "Cloudy night — quiet and thoughtful.",
    rain:         isDay ? "Rainy in Dortmund — time to dive into the data." : "Raining outside — best work happens on nights like this.",
    drizzle:      "Light drizzle — steady and focused.",
    snow:         "Snow in Dortmund — rare and calm. Good day for bold decisions.",
    thunderstorm: "Storm rolling in — high energy, high output.",
    mist:         "Misty morning — clarity comes through the data.",
    fog:          "Foggy out there — the numbers never lie though.",
  };
  weatherStatusEl.textContent = messages[condition] || `${description} in Dortmund.`;
}

function isSpecialDay() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  if (month === 1 && day === 1) return "New Year";
  if (month === 8 && day === 19) return "Your Birthday";
  return null;
}

function applySpecialDayTheme(label) {
  let styleTag = document.getElementById("weather-style");
  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = "weather-style";
    document.head.appendChild(styleTag);
  }
  styleTag.textContent = `
    body::before {
      background:
        radial-gradient(ellipse 420px 420px at -5% -15%, rgba(180,130,0,0.75) 0%, transparent 70%),
        radial-gradient(ellipse 300px 300px at 95% -5%, rgba(200,50,10,0.6) 0%, transparent 70%),
        radial-gradient(ellipse 240px 240px at 20% 95%, rgba(160,100,0,0.55) 0%, transparent 70%),
        radial-gradient(ellipse 180px 180px at 90% 90%, rgba(220,80,0,0.45) 0%, transparent 70%);
      transition: background 2s ease;
    }
  `;
  if (weatherStatusEl) weatherStatusEl.textContent = `Special day: ${label} 🎉`;
}

async function initWeatherAndTheme() {
  const special = isSpecialDay();
  if (special) {
    applySpecialDayTheme(special);
    return;
  }

  const weather = await getWeatherData();

  if (!weather) {
    const hour = new Date().getHours();
    const fallbackCondition = hour >= 7 && hour < 17 ? "clear" : hour >= 17 && hour < 21 ? "clouds" : "rain";
    const isDay = hour >= 7 && hour < 20;
    applyWeatherTheme(fallbackCondition, isDay);
    updateWeatherText(fallbackCondition, "", isDay);
    return;
  }

  const isDay = weather.now >= weather.sunrise && weather.now < weather.sunset;

  let condition = weather.condition;
  if (condition.includes("thunder"))      condition = "thunderstorm";
  else if (condition.includes("drizzle")) condition = "drizzle";
  else if (condition.includes("rain"))    condition = "rain";
  else if (condition.includes("snow"))    condition = "snow";
  else if (condition.includes("mist") || condition.includes("fog")) condition = "mist";
  else if (condition.includes("cloud"))   condition = "clouds";
  else                                    condition = "clear";

  applyWeatherTheme(condition, isDay);
  updateWeatherCard(weather);
  updateWeatherText(condition, weather.description, isDay);
}

initWeatherAndTheme();

// ── SCHEDULE BUTTON ───────────────────────────────────────

const scheduleButton = document.getElementById("schedule-button");
if (scheduleButton) {
  scheduleButton.addEventListener("click", () => {
    window.open("https://calendly.com/", "_blank");
  });
}
