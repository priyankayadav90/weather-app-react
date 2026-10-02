import { useState } from "react";
import "./App.css";

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Search weather by city
  const searchWeather = async () => {
    if (!city.trim()) {
      setError("Please enter a city name.");
      return;
    }

    setLoading(true);
    setError("");
    setWeather(null);
    setForecast([]);

    try {
      // Current weather
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );

      if (!weatherResponse.ok) {
        throw new Error("City not found");
      }

      const weatherData = await weatherResponse.json();

      // 5-day forecast
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
      );

      if (!forecastResponse.ok) {
        throw new Error("Forecast unavailable");
      }

      const forecastData = await forecastResponse.json();

      // Get one forecast for each day
      const dailyForecast = forecastData.list.filter((item) =>
        item.dt_txt.includes("12:00:00")
      );

      setWeather(weatherData);
      setForecast(dailyForecast.slice(0, 5));
    } catch (err) {
      setError("City not found. Please enter a valid city.");
    } finally {
      setLoading(false);
    }
  };

  // Get weather using current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    setError("");
    setWeather(null);
    setForecast([]);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Current weather using coordinates
          const weatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
          );

          if (!weatherResponse.ok) {
            throw new Error("Weather unavailable");
          }

          const weatherData = await weatherResponse.json();

          // Forecast using coordinates
          const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
          );

          if (!forecastResponse.ok) {
            throw new Error("Forecast unavailable");
          }

          const forecastData = await forecastResponse.json();

          const dailyForecast = forecastData.list.filter((item) =>
            item.dt_txt.includes("12:00:00")
          );

          setWeather(weatherData);
          setForecast(dailyForecast.slice(0, 5));

          // Show current city in input
          setCity(weatherData.name);
        } catch (err) {
          setError("Unable to get weather information.");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLoading(false);
        setError("Please allow location access in your browser.");
      }
    );
  };

  return (
    <div className="app">
      <div className="weather-card">
        <h1>🌤️ Weather App</h1>

        <p className="subtitle">
          Check current weather of any city
        </p>

        {/* Search Box */}
        <div className="search-box">
          <input
            type="text"
            placeholder="Enter city name..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                searchWeather();
              }
            }}
          />

          <button onClick={searchWeather}>
            Search
          </button>
        </div>

        {/* Current Location */}
        <button
          className="location-btn"
          onClick={getCurrentLocation}
        >
          📍 Use My Location
        </button>

        {/* Loading */}
        {loading && (
          <p className="message">
            Loading weather...
          </p>
        )}

        {/* Error */}
        {error && (
          <p className="error">
            {error}
          </p>
        )}

        {/* Current Weather */}
        {weather && !loading && (
          <>
            <div className="current-weather">

              <h2>
                {weather.name}, {weather.sys.country}
              </h2>

              <div className="temperature">
                {Math.round(weather.main.temp)}°C
              </div>

              <p className="condition">
                {weather.weather[0].main}
              </p>

              <div className="weather-details">

                <div className="detail">
                  <span>💧</span>
                  <p>Humidity</p>
                  <strong>
                    {weather.main.humidity}%
                  </strong>
                </div>

                <div className="detail">
                  <span>💨</span>
                  <p>Wind Speed</p>
                  <strong>
                    {weather.wind.speed} m/s
                  </strong>
                </div>

                <div className="detail">
                  <span>🌡️</span>
                  <p>Feels Like</p>
                  <strong>
                    {Math.round(weather.main.feels_like)}°C
                  </strong>
                </div>

                <div className="detail">
                  <span>🔽</span>
                  <p>Pressure</p>
                  <strong>
                    {weather.main.pressure} hPa
                  </strong>
                </div>

              </div>
            </div>

            {/* 5-Day Forecast */}
            {forecast.length > 0 && (
              <div className="forecast">

                <h2>5-Day Forecast</h2>

                <div className="forecast-container">

                  {forecast.map((day, index) => (
                    <div className="forecast-card" key={index}>

                      <p>
                        {new Date(
                          day.dt * 1000
                        ).toLocaleDateString("en-US", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </p>

                      <img
                        src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                        alt={day.weather[0].description}
                      />

                      <h3>
                        {Math.round(day.main.temp)}°C
                      </h3>

                      <p>
                        {day.weather[0].main}
                      </p>

                    </div>
                  ))}

                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}

export default App;