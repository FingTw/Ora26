// src/components/SearchBar.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    navigate(`/search?keyword=${encodeURIComponent(keyword.trim())}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Tìm kiếm nông sản..."
        className="border rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
      >
        🔍 Tìm
      </button>
    </form>
  );
};

export default SearchBar;