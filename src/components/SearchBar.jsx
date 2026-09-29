function SearchBar({
  city,
  setCity,
  onSearch,
  loading
}) {

  const handleSubmit = (event) => {
    event.preventDefault();

    if (city.trim()) {
      onSearch();
    }
  };

  return (
    <form
      className="search-form"
      onSubmit={handleSubmit}
    >

      <div className="search-input-wrapper">

        <span className="search-icon">
          🔍
        </span>

        <input
          type="text"
          placeholder="Search for a city..."
          value={city}
          onChange={(event) =>
            setCity(event.target.value)
          }
        />

      </div>

      <button
        type="submit"
        disabled={loading}
      >
        {loading ? "Searching..." : "Search"}
      </button>

    </form>
  );
}

export default SearchBar;