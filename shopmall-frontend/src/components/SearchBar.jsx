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
        <form onSubmit={handleSearch} className="flex gap-2 bg-gray-100 rounded-xl">
            <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm kiếm nông sản..."
                className="px-4 py-2 w-64 shadow-inner "
            />
            <button
                type="submit"
                className="px-4 py-2 rounded-full hover:bg-green-500"
            >
                🔍
            </button>
        </form>
    );
};

export default SearchBar;