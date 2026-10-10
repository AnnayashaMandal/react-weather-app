
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  CalendarDays,
  Cloud,
  CloudRain,
  Compass,
  Droplets,
  Eye,
  Gauge,
  MapPin,
  Moon,
  RefreshCw,
  Search,
  Sun,
  Sunrise,
  Sunset,
  Thermometer,
  Wind,
} from "lucide-react";
import "./App.css";

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const API_BASE = "https://api.openweathermap.org/data/2.5";

function getWeatherIcon(condition = "") {
  const value = condition.toLowerCase();

  if (value.includes("rain") || value.includes("drizzle")) {
    return <CloudRain size={46} />;
  }

  if (
    value.includes("clear") ||
    value.includes("sun")
  ) {
    return <Sun size={46} />;
  }

  return <Cloud size={46} />;
}

function formatTime(timestamp, offset = 0) {
  return new Date((timestamp + offset) * 1000).toLocaleTimeString(
    "en-US",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    }
  );
}

function formatDay(timestamp, offset = 0) {
  return new Date((timestamp + offset) * 1000).toLocaleDateString(
    "en-US",
    {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }
  );
}

function DetailCard({ icon, label, value, description }) {
  return (
    <div className="detail-card">
      <div className="detail-top">
        <span className="detail-icon">{icon}</span>
        <span className="detail-label">{label}</span>
      </div>
      <h3>{value}</h3>
      <p>{description}</p>
    </div>
  );
}

export default function App() {
  const [cityInput, setCityInput] = useState("Kolkata");
  const [city, setCity] = useState("Kolkata");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unit, setUnit] = useState("C");

  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("weather-theme") || "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);

    try {
      localStorage.setItem("weather-theme", theme);
    } catch {
      // The theme still works if browser storage is unavailable.
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) =>
      current === "dark" ? "light" : "dark"
    );
  };

  const loadWeather = useCallback(async (searchCity) => {
    if (!API_KEY) {
      setError(
        "API key missing. Add VITE_OPENWEATHER_API_KEY to your .env file."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const query = encodeURIComponent(searchCity.trim());

      const [weatherResponse, forecastResponse] = await Promise.all([
        fetch(
          `${API_BASE}/weather?q=${query}&appid=${API_KEY}&units=metric`
        ),
        fetch(
          `${API_BASE}/forecast?q=${query}&appid=${API_KEY}&units=metric`
        ),
      ]);

      const weatherData = await weatherResponse.json();
      const forecastData = await forecastResponse.json();

      if (!weatherResponse.ok) {
        throw new Error(
          weatherData.message || "Could not find this city."
        );
      }

      if (!forecastResponse.ok) {
        throw new Error(
          forecastData.message || "Could not load the forecast."
        );
      }

      setWeather(weatherData);
      setForecast(forecastData.list || []);
      setCity(weatherData.name);
      setCityInput(weatherData.name);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Network error. Check your internet connection."
          : err.message || "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWeather("Kolkata");
  }, [loadWeather]);

  const handleSearch = (event) => {
    event.preventDefault();

    if (!cityInput.trim()) {
      setError("Please enter a city name.");
      return;
    }

    loadWeather(cityInput);
  };

  const temperature = (value) => {
    if (value == null) return "--";
    const result = unit === "C" ? value : value * 9 / 5 + 32;
    return `${Math.round(result)}°`;
  };

  const dailyForecast = useMemo(() => {
    const groups = {};

    forecast.forEach((item) => {
      const dayKey = new Date(
        (item.dt + (weather?.timezone || 0)) * 1000
      )
        .toISOString()
        .slice(0, 10);

      if (!groups[dayKey]) {
        groups[dayKey] = {
          date: item.dt,
          temps: [],
          items: [],
        };
      }

      groups[dayKey].temps.push(item.main.temp);
      groups[dayKey].items.push(item);
    });

    return Object.values(groups).slice(0, 5).map((day) => {
      const midday =
        day.items.find((item) => {
          const hour = new Date(
            (item.dt + (weather?.timezone || 0)) * 1000
          ).getUTCHours();

          return hour >= 11 && hour <= 15;
        }) || day.items[0];

      return {
        date: day.date,
        high: Math.max(...day.temps),
        low: Math.min(...day.temps),
        condition: midday.weather[0].description,
        icon: midday.weather[0].main,
      };
    });
  }, [forecast, weather]);

  const hourlyForecast = forecast.slice(0, 8);

  const chartData = hourlyForecast.map((item) => ({
    time: formatTime(item.dt, weather?.timezone || 0),
    temperature: Math.round(
      unit === "C"
        ? item.main.temp
        : item.main.temp * 9 / 5 + 32
    ),
  }));

  const high = dailyForecast[0]?.high ?? weather?.main?.temp_max;
  const low = dailyForecast[0]?.low ?? weather?.main?.temp_min;

  const windDirection = (degrees) => {
    if (degrees == null) return "--";
    const directions = [
      "N", "NE", "E", "SE", "S", "SW", "W", "NW",
    ];
    return directions[Math.round(degrees / 45) % 8];
  };

  return (
    <div className={`weather-app ${theme}-theme`}>
      <div className="dashboard-container">
        <header className="topbar">
          <a className="brand" href="#home">
            <span className="brand-icon">
              <Cloud size={25} />
            </span>
            <span>Weatherly</span>
          </a>

          <div className="header-actions">
            <span className="live-indicator">
              <span className="live-dot" />
              Live weather
            </span>

            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              title="Switch theme"
            >
              {theme === "dark" ? (
                <Sun size={19} />
              ) : (
                <Moon size={19} />
              )}
              <span>
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </span>
            </button>
          </div>
        </header>

        <main id="home">
          <section className="welcome-section">
            <div>
              <p className="eyebrow">YOUR WEATHER COMPANION</p>
              <h1>Weather Dashboard</h1>
              <p className="welcome-text">
                Stay ahead of the weather, wherever life takes you.
              </p>
            </div>

            <form className="search-form" onSubmit={handleSearch}>
              <Search size={19} />
              <input
                value={cityInput}
                onChange={(event) => setCityInput(event.target.value)}
                placeholder="Search any city..."
                aria-label="Search city"
              />
              <button type="submit" disabled={loading}>
                Search
              </button>
            </form>
          </section>

          {error && (
            <div className="error-message" role="alert">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => loadWeather(city)}
              >
                Try again
              </button>
            </div>
          )}

          {loading && !weather && (
            <div className="loading-state">
              <span className="spinner" />
              <p>Gathering weather data...</p>
            </div>
          )}

          {weather && (
            <>
              <section className="hero-weather">
                <div className="hero-left">
                  <div className="location-line">
                    <MapPin size={17} />
                    <span>
                      {weather.name}, {weather.sys.country}
                    </span>
                  </div>

                  <p className="today-label">CURRENT WEATHER</p>

                  <div className="temperature-row">
                    <h2>{temperature(weather.main.temp)}</h2>
                    <div className="hero-weather-icon">
                      {getWeatherIcon(weather.weather[0].main)}
                    </div>
                  </div>

                  <h3 className="condition">
                    {weather.weather[0].description}
                  </h3>

                  <p className="feels-like">
                    Feels like {temperature(weather.main.feels_like)}
                  </p>

                  <div className="high-low">
                    <span>
                      <ArrowUp size={16} />
                      High {temperature(high)}
                    </span>
                    <span>
                      <ArrowDown size={16} />
                      Low {temperature(low)}
                    </span>
                  </div>
                </div>

                <div className="hero-right">
                  <div className="date-line">
                    <CalendarDays size={17} />
                    {formatDay(
                      Math.floor(Date.now() / 1000),
                      weather.timezone
                    )}
                  </div>

                  <div className="unit-control">
                    <button
                      type="button"
                      className={unit === "C" ? "active" : ""}
                      onClick={() => setUnit("C")}
                    >
                      °C
                    </button>
                    <button
                      type="button"
                      className={unit === "F" ? "active" : ""}
                      onClick={() => setUnit("F")}
                    >
                      °F
                    </button>
                  </div>

                  <div className="hero-summary">
                    <div>
                      <span>Humidity</span>
                      <strong>{weather.main.humidity}%</strong>
                    </div>
                    <div>
                      <span>Wind speed</span>
                      <strong>{weather.wind.speed} m/s</strong>
                    </div>
                    <div>
                      <span>Visibility</span>
                      <strong>
                        {weather.visibility != null
                          ? `${(weather.visibility / 1000).toFixed(1)} km`
                          : "--"}
                      </strong>
                    </div>
                  </div>

                  <button
                    className="refresh-button"
                    type="button"
                    onClick={() => loadWeather(city)}
                    disabled={loading}
                  >
                    <RefreshCw
                      size={16}
                      className={loading ? "spin-icon" : ""}
                    />
                    {loading ? "Updating..." : "Refresh weather"}
                  </button>
                </div>
              </section>

              <section className="section-block">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">AT A GLANCE</p>
                    <h2>Weather highlights</h2>
                  </div>
                  <Activity size={22} />
                </div>

                <div className="details-grid">
                  <DetailCard
                    icon={<Droplets size={21} />}
                    label="Humidity"
                    value={`${weather.main.humidity}%`}
                    description="Moisture in the air"
                  />

                  <DetailCard
                    icon={<Wind size={21} />}
                    label="Wind speed"
                    value={`${weather.wind.speed} m/s`}
                    description={`Direction ${windDirection(weather.wind.deg)}`}
                  />

                  <DetailCard
                    icon={<Gauge size={21} />}
                    label="Pressure"
                    value={`${weather.main.pressure} hPa`}
                    description="Atmospheric pressure"
                  />

                  <DetailCard
                    icon={<Eye size={21} />}
                    label="Visibility"
                    value={
                      weather.visibility != null
                        ? `${(weather.visibility / 1000).toFixed(1)} km`
                        : "--"
                    }
                    description="How far you can see"
                  />

                  <DetailCard
                    icon={<Thermometer size={21} />}
                    label="Feels like"
                    value={temperature(weather.main.feels_like)}
                    description="Perceived temperature"
                  />

                  <DetailCard
                    icon={<Cloud size={21} />}
                    label="Cloud cover"
                    value={`${weather.clouds.all}%`}
                    description="Sky covered by clouds"
                  />
                </div>
              </section>

              <section className="section-block">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">UPCOMING HOURS</p>
                    <h2>Temperature trend</h2>
                  </div>
                  <span className="section-note">
                    Next 24 hours
                  </span>
                </div>

                <div className="chart-card">
                  <div className="chart-title">
                    <div>
                      <span className="chart-dot" />
                      Temperature
                    </div>
                    <strong>{unit === "C" ? "°C" : "°F"}</strong>
                  </div>

                  {chartData.length > 0 ? (
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={chartData}
                          margin={{
                            top: 15,
                            right: 12,
                            left: -20,
                            bottom: 0,
                          }}
                        >
                          <defs>
                            <linearGradient
                              id="temperatureGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#5c8dff"
                                stopOpacity={0.4}
                              />
                              <stop
                                offset="100%"
                                stopColor="#5c8dff"
                                stopOpacity={0.02}
                              />
                            </linearGradient>
                          </defs>

                          <CartesianGrid
                            strokeDasharray="4 5"
                            vertical={false}
                            stroke="var(--border-color)"
                          />

                          <XAxis
                            dataKey="time"
                            tick={{
                              fill: "var(--text-secondary)",
                              fontSize: 11,
                            }}
                            axisLine={false}
                            tickLine={false}
                            minTickGap={20}
                          />

                          <Tooltip
                            contentStyle={{
                              background: "var(--surface)",
                              border: "1px solid var(--border-color)",
                              borderRadius: "12px",
                              color: "var(--text-primary)",
                            }}
                            formatter={(value) => [
                              `${value}°${unit}`,
                              "Temperature",
                            ]}
                          />

                          <Area
                            type="monotone"
                            dataKey="temperature"
                            stroke="#5c8dff"
                            strokeWidth={3}
                            fill="url(#temperatureGradient)"
                            dot={{
                              r: 3,
                              fill: "#5c8dff",
                              strokeWidth: 0,
                            }}
                            activeDot={{ r: 6 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="empty-state">
                      Forecast data is not available.
                    </p>
                  )}
                </div>
              </section>

              <section className="section-block">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">PLAN YOUR DAYS</p>
                    <h2>5-day forecast</h2>
                  </div>
                  <CalendarDays size={22} />
                </div>

                <div className="forecast-grid">
                  {dailyForecast.map((day, index) => (
                    <div className="forecast-card" key={day.date}>
                      <p className="forecast-day">
                        {index === 0
                          ? "Today"
                          : formatDay(day.date, weather.timezone)}
                      </p>

                      <div className="forecast-icon">
                        {getWeatherIcon(day.icon)}
                      </div>

                      <p className="forecast-condition">
                        {day.condition}
                      </p>

                      <div className="forecast-temperatures">
                        <strong>{temperature(day.high)}</strong>
                        <span>{temperature(day.low)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="section-block">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">HOUR BY HOUR</p>
                    <h2>Upcoming conditions</h2>
                  </div>
                  <Wind size={22} />
                </div>

                <div className="hourly-grid">
                  {hourlyForecast.map((hour) => (
                    <div className="hourly-card" key={hour.dt}>
                      <p>{formatTime(hour.dt, weather.timezone)}</p>
                      <div className="hourly-icon">
                        {getWeatherIcon(hour.weather[0].main)}
                      </div>
                      <strong>{temperature(hour.main.temp)}</strong>
                      <span>
                        <Droplets size={13} />
                        {Math.round(hour.pop * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="section-block">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">DAYLIGHT</p>
                    <h2>Sunrise & sunset</h2>
                  </div>
                  <Sunrise size={22} />
                </div>

                <div className="sun-grid">
                  <div className="sun-card sunrise-card">
                    <div className="sun-icon">
                      <Sunrise size={27} />
                    </div>
                    <div>
                      <span>Sunrise</span>
                      <h3>
                        {formatTime(
                          weather.sys.sunrise,
                          weather.timezone
                        )}
                      </h3>
                    </div>
                  </div>

                  <div className="sun-card sunset-card">
                    <div className="sun-icon">
                      <Sunset size={27} />
                    </div>
                    <div>
                      <span>Sunset</span>
                      <h3>
                        {formatTime(
                          weather.sys.sunset,
                          weather.timezone
                        )}
                      </h3>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
        </main>

        <footer className="footer">
          <div className="footer-brand">
            <Cloud size={19} />
            <span>Weatherly</span>
          </div>
          <p>Weather information powered by OpenWeather.</p>
          <p>Made for a brighter forecast.</p>
        </footer>
      </div>
    </div>
  );
}
