import WeatherDetails from "./WeatherDetails";

function WeatherCard({ weather }) {

  const iconUrl =
    `https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`;

  const description =
    weather.weather[0].description;

  const formattedDescription =
    description.charAt(0).toUpperCase() +
    description.slice(1);

  return (
    <section className="weather-card">

      {/* Location */}

      <div className="location-section">

        <div>

          <span className="country-code">
            {weather.sys.country}
          </span>

          <h2>
            {weather.name}
          </h2>

        </div>

        <div className="location-pin">
          📍
        </div>

      </div>


      {/* Main Weather */}

      <div className="main-weather">

        <div className="weather-icon-wrapper">

          <img
            src={iconUrl}
            alt={formattedDescription}
          />

        </div>

        <div className="temperature-section">

          <div className="temperature">
            {Math.round(weather.main.temp)}
            <span>°C</span>
          </div>

          <p>
            {formattedDescription}
          </p>

          <small>
            Feels like{" "}
            {Math.round(weather.main.feels_like)}°C
          </small>

        </div>

      </div>


      {/* Details */}

      <WeatherDetails weather={weather} />

    </section>
  );
}

export default WeatherCard;