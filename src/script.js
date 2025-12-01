// ================== API KEY ==================
const api_key = "cf9de7718fa1dd6e12fb504e2d4b2958";

// ================== DOM ELEMENTS ==================
const cityInput = document.getElementById("city_input");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");

const currentWeatherCard = document.querySelector(".weather.left .card");
const fiveDaysForecastCard = document.querySelector(".day-forecast");

const aqiCard = document.querySelector(".highlights .card");
const sunriseCard = document.querySelectorAll(".highlights .card")[1];

const humidityVal = document.getElementById("humidityval");
const pressureVal = document.getElementById("pressureval");
const visibilityVal = document.getElementById("visibilityval");
const windSpeedVal = document.getElementById("windSpeesval");
const feelsVal = document.getElementById("feelsval");

const hourlyForecastCard = document.querySelector(".hourly-forecast");

const aqiList = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];

// ================== UI ERROR (NO ALERT) ==================
const errorBox = document.createElement("div");
errorBox.style.color = "red";
errorBox.style.marginTop = "10px";
document.querySelector(".weather-input").appendChild(errorBox);

function showError(msg) {
  errorBox.innerText = msg;
  setTimeout(() => (errorBox.innerText = ""), 3000);
}

// ================== WEATHER FUNCTION ==================
function getWeatherDetails(name, lat, lon, country) {
  const WEATHER_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}`;
  const FORECAST_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${api_key}`;
  const AIR_URL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${api_key}`;

  // ================== AQI FULL DATA ==================
  fetch(AIR_URL)
    .then(res => res.json())
    .then(data => {
      const aqi = data.list[0].main.aqi;
      const comp = data.list[0].components;

      aqiCard.innerHTML = `
        <div class="card-head">
          <p>Air Quality Index</p>
          <p class="air-index aqi-${aqi}">${aqiList[aqi - 1]}</p>
        </div>
        <div class="air-indices">
          <i class="fa-solid fa-wind fa-3x"></i>
          <div class="item"><p>PM2.5</p><h2>${comp.pm2_5}</h2></div>
          <div class="item"><p>PM10</p><h2>${comp.pm10}</h2></div>
          <div class="item"><p>SO2</p><h2>${comp.so2}</h2></div>
          <div class="item"><p>CO</p><h2>${comp.co}</h2></div>
          <div class="item"><p>NO</p><h2>${comp.no}</h2></div>
          <div class="item"><p>NO2</p><h2>${comp.no2}</h2></div>
          <div class="item"><p>NH3</p><h2>${comp.nh3}</h2></div>
          <div class="item"><p>O3</p><h2>${comp.o3}</h2></div>
        </div>
      `;
    });

  // ================== CURRENT WEATHER + SUN ==================
  fetch(WEATHER_URL)
    .then(res => res.json())
    .then(data => {
      const tempC = (data.main.temp - 273.15).toFixed(1);

      currentWeatherCard.querySelector("h2").innerHTML = tempC + "&deg;C";
      currentWeatherCard.querySelector(".details p:last-child").innerText =
        data.weather[0].description;

      currentWeatherCard.querySelector("img").src =
        `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

      // ✅ FOOTER FIXED
      currentWeatherCard.querySelector(".card-footer").innerHTML = `
        <p><i class="fa-light fa-calendar"></i> ${new Date().toDateString()}</p>
        <p><i class="fa-light fa-location-dot"></i> ${name}, ${country}</p>
      `;

      humidityVal.innerText = data.main.humidity + "%";
      pressureVal.innerText = data.main.pressure + " hPa";
      visibilityVal.innerText = data.visibility / 1000 + " km";
      windSpeedVal.innerText = data.wind.speed + " m/s";
      feelsVal.innerText = (data.main.feels_like - 273.15).toFixed(1) + "°C";

      if (tempC > 40) {
        showError("⚠ Extreme Heat Alert!");
      }

      // ✅ SUNRISE & SUNSET FIXED
      const sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      sunriseCard.innerHTML = `
        <div class="card-head"><p>Sunrise & Sunset</p></div>
        <div class="sunrise-sunset">
          <div class="item">
            <div class="icon"><i class="fa-solid fa-sun fa-4x"></i></div>
            <div><p>Sunrise</p><h2>${sunriseTime}</h2></div>
          </div>
          <div class="item">
            <div class="icon"><i class="fa-solid fa-sun fa-4x"></i></div>
            <div><p>Sunset</p><h2>${sunsetTime}</h2></div>
          </div>
        </div>
      `;
    });

  // ================== HOURLY + 5 DAY ==================
  fetch(FORECAST_URL)
    .then(res => res.json())
    .then(data => {
      // HOURLY
      hourlyForecastCard.innerHTML = "";
      for (let i = 0; i < 8; i++) {
        const time = new Date(data.list[i].dt_txt).getHours();
        const temp = (data.list[i].main.temp - 273.15).toFixed(1);

        hourlyForecastCard.innerHTML += `
          <div class="card">
            <p>${time}:00</p>
            <img src="https://openweathermap.org/img/wn/${data.list[i].weather[0].icon}@2x.png">
            <p>${temp}&deg;C</p>
          </div>
        `;
      }

      // 5 DAY
      fiveDaysForecastCard.innerHTML = "";
      const usedDays = [];

      data.list.forEach(item => {
        const date = new Date(item.dt_txt);

        if (!usedDays.includes(date.getDate()) && usedDays.length < 5) {
          usedDays.push(date.getDate());

          fiveDaysForecastCard.innerHTML += `
            <div class="forecast-item">
              <div class="icon-wrapper">
                <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png">
                <span>${(item.main.temp - 273.15).toFixed(1)}&deg;C</span>
              </div>
              <p>${date.toDateString()}</p>
            </div>
          `;
        }
      });
    });
}

// ================== CITY SEARCH ==================
function getCityCoordinates() {
  const cityName = cityInput.value.trim();
  if (!cityName) return showError("Enter a city name");

  const GEO_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${api_key}`;

  fetch(GEO_URL)
    .then(res => res.json())
    .then(data => {
      if (!data.length) return showError("City not found");

      const { name, lat, lon, country } = data[0];
      getWeatherDetails(name, lat, lon, country);
    });
}

// ================== CURRENT LOCATION ==================
function getUserCoordinates() {
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;

    const REVERSE_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${api_key}`;

    fetch(REVERSE_URL)
      .then(res => res.json())
      .then(data => {
        const { name, country } = data[0];
        getWeatherDetails(name, latitude, longitude, country);
      });
  });
}

// ================== EVENTS ==================
searchBtn.addEventListener("click", getCityCoordinates);
locationBtn.addEventListener("click", getUserCoordinates);

cityInput.addEventListener("keyup", e => {
  if (e.key === "Enter") getCityCoordinates();
});

window.addEventListener("load", getUserCoordinates);
