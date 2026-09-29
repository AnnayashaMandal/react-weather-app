function WeatherDetails({ weather }) {

  const formatTime = (timestamp) => {

    return new Date(
      timestamp * 1000
    ).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });

  };

  return (
    <div className="weather-details">

      {/* Humidity */}

      <div className="detail-card">

        <div className="detail-icon humidity-icon">
          💧
        </div>

        <div>
          <span>Humidity</span>

          <strong>
            {weather.main.humidity}%
          </strong>
        </div>

      </div>


      {/* Wind */}

      <div className="detail-card">

        <div className="detail-icon wind-icon">
          💨
        </div>

        <div>
          <span>Wind Speed</span>

          <strong>
            {weather.wind.speed} m/s
          </strong>
        </div>

      </div>


      {/* Sunrise */}

      <div className="detail-card">

        <div className="detail-icon sunrise-icon">
          🌅
        </div>

        <div>
          <span>Sunrise</span>

          <strong>
            {formatTime(weather.sys.sunrise)}
          </strong>
        </div>

      </div>


      {/* Sunset */}

      <div className="detail-card">

        <div className="detail-icon sunset-icon">
          🌇
        </div>

        <div>
          <span>Sunset</span>

          <strong>
            {formatTime(weather.sys.sunset)}
          </strong>
        </div>

      </div>

    </div>
  );
}

export default WeatherDetails;