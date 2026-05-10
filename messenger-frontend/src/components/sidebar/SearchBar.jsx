import React, { useState, useEffect } from 'react';
import { Search, UserPlus } from 'lucide-react';
import { apiFetch } from '../../utils/apiClient';

const SearchBar = ({ query, setQuery, onStartChat }) => {
    const [results, setResults] = useState([]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim().length > 1) {
                try {
                    const data = await apiFetch(`/api/users/search?username=${query}`);
                    setResults(data);
                } catch (e) { console.error(e); }
            } else {
                setResults([]);
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [query]);

    return (
        <div className="search-section">
            <div className="search-input-container">
                <Search size={18} className="search-icon" />
                <input 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Поиск людей..." 
                />
            </div>
            
            {query && (
                <div className="search-results-dropdown">
                    {results.length > 0 ? results.map(user => (
                        <div key={user.id} className="search-result-item" onClick={() => onStartChat(user.id)}>
                            <div className="avatar-small">{user.username[0]}</div>
                            <div className="search-result-info">
                                <strong>{user.name} {user.surname}</strong>
                                <span>@{user.username}</span>
                            </div>
                            <UserPlus size={18} className="add-icon" />
                        </div>
                    )) : <div className="search-empty">Никто не найден</div>}
                </div>
            )}
        </div>
    );
};

export default SearchBar;