import { useEffect, useState } from "react";

import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import WeatherCard from "./components/WeatherCard";
import Loading from "./components/Loading";
import ErrorMessage from "./components/ErrorMessage";

function App() {

  // =========================================
  // STATE
  // =========================================

  const [city, setCity] = useState("Kolkata");

  const [weather, setWeather] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");


  // =========================================
  // API KEY
  // =========================================

  const API_KEY =
    import.meta.env.VITE_OPENWEATHER_API_KEY;


  // =========================================
  // FETCH WEATHER DATA
  // =========================================

  const fetchWeather = async () => {

    if (!city.trim()) {
      setError("Please enter a city name.");
      return;
    }

    setLoading(true);
    setError("");

    try {

      const url =
        `https://api.openweathermap.org/data/2.5/weather?` +
        `q=${encodeURIComponent(city)}&` +
        `appid=${API_KEY}&` +
        `units=metric`;

      const response = await fetch(url);


      // =====================================
      // ERROR FROM API
      // =====================================

      if (!response.ok) {

        if (response.status === 404) {
          throw new Error(
            "City not found. Please check the city name."
          );
        }

        if (response.status === 401) {
          throw new Error(
            "Invalid API key. Please check your OpenWeather API key."
          );
        }

        throw new Error(
          "Unable to fetch weather data. Please try again."
        );
      }


      // =====================================
      // CONVERT RESPONSE TO JSON
      // =====================================

      const data = await response.json();


      // =====================================
      // UPDATE STATE
      // =====================================

      setWeather(data);

    } catch (err) {

      console.error(err);

      setWeather(null);

      setError(
        err.message ||
        "Something went wrong while fetching weather data."
      );

    } finally {

      setLoading(false);

    }
  };


  // =========================================
  // useEffect
  // =========================================

  useEffect(() => {

    fetchWeather();

  }, []);


  // =========================================
  // RETRY
  // =========================================

  const handleRetry = () => {

    fetchWeather();

  };


  return (
    <div className="app">

      {/* HEADER */}

      <Header />


      <main className="main-container">

        {/* HERO */}

        <section className="hero-section">

          <div className="hero-content">

            <span className="hero-label">
              REAL-TIME WEATHER
            </span>

            <h2>
              Weather at a glance.
            </h2>

            <p>
              Search any city and get current
              weather conditions instantly.
            </p>

          </div>

          <div className="hero-decoration">
            ☁️
          </div>

        </section>


        {/* SEARCH */}

        <section className="search-section">

          <div className="section-title">

            <span>
              WEATHER SEARCH
            </span>

            <h2>
              Find a City
            </h2>

          </div>

          <SearchBar
            city={city}
            setCity={setCity}
            onSearch={fetchWeather}
            loading={loading}
          />

        </section>


        {/* WEATHER CONTENT */}

        <section className="weather-section">

          {loading && <Loading />}

          {!loading && error && (
            <ErrorMessage
              message={error}
              onRetry={handleRetry}
            />
          )}

          {!loading && !error && weather && (
            <WeatherCard weather={weather} />
          )}

        </section>

      </main>


      {/* FOOTER */}

      <footer className="footer">

        <div>
          <strong>☁️ Weatherly</strong>

          <span>
            Weather Dashboard
          </span>
        </div>

        <p>
          Powered by OpenWeather
        </p>

      </footer>

    </div>
  );
}

export default App;