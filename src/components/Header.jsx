function Header() {
  return (
    <header className="top-header">

      <div className="brand">

        <div className="brand-icon">
          ☁️
        </div>

        <div>
          <h1>Weatherly</h1>
          <p>Live Weather Dashboard</p>
        </div>

      </div>

      <div className="live-status">
        <span className="status-dot"></span>
        Live Weather
      </div>

    </header>
  );
}

export default Header;