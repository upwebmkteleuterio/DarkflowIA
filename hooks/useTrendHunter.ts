
import { useState, useCallback, useEffect } from 'react';
import { searchTrends } from '../services/geminiService';
import { Trend } from '../types';

const TRENDS_CACHE_KEY = 'darkflow_trends_cache';

export const useTrendHunter = () => {
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('');
  const [country, setCountry] = useState('Brasil');
  const [trends, setTrends] = useState<Trend[]>(() => {
    const saved = localStorage.getItem(TRENDS_CACHE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    localStorage.setItem(TRENDS_CACHE_KEY, JSON.stringify(trends));
  }, [trends]);

  const countries = [
    'Brasil', 'EUA', 'Reino Unido', 'Canadá', 'Japão', 'Alemanha', 
    'Espanha', 'França', 'México', 'Argentina', 'Portugal'
  ];

  const handleSearch = async () => {
    if (!theme) return;
    setLoading(true);
    try {
      const results = await searchTrends(theme, country);
      setTrends(results);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const clearTrends = useCallback(() => {
    setTrends([]);
    localStorage.removeItem(TRENDS_CACHE_KEY);
  }, []);

  return {
    loading,
    theme,
    setTheme,
    country,
    setCountry,
    trends,
    handleSearch,
    clearTrends,
    countries,
    showSuggestions,
    setShowSuggestions
  };
};
