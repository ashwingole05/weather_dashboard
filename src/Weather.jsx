import React, { useState, useEffect } from 'react';
import './Weather.css';

const Weather = () => {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
 
  const API_KEY = 'YOUR_API_KEY';

  useEffect(() => {
    if (!city.trim()) return;
    
    let abortController = new AbortController();
    
    const fetchWeather = async () => {
      setLoading(true);
      setError('');
      
      try {
        const response = await fetch(
          `https://api.weatherbit.io/v2.0/current?city=${encodeURIComponent(city)}&key=${API_KEY}&units=M`,
          { signal: abortController.signal }
        );
        
        if (!response.ok) {
          // More specific error handling
          if (response.status === 401) {
            throw new Error('Invalid API key');
          } else if (response.status === 404) {
            throw new Error('City not found');
          } else if (response.status === 429) {
            throw new Error('API rate limit exceeded');
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        }
        
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
          setWeatherData(data.data[0]);
        } else {
          throw new Error('No weather data available for this city');
        }
        
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to fetch weather data');
          setWeatherData(null);
          console.error('Weather fetch error:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();

    return () => {
      abortController.abort();
    };
  }, [city]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const inputCity = formData.get('cityInput');
    if (inputCity && inputCity.trim()) {
      setCity(inputCity.trim());
    }
  };

  return (
    <div className="weather-container">
      <h1>Weather Dashboard</h1>
      
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          name="cityInput"
          placeholder="Enter city name"
          className="city-input"
          required
        />
        <button type="submit" className="search-btn">
          Get Weather
        </button>
      </form>

      {loading && <div className="loading">Loading weather data...</div>}
      
      {error && <div className="error">Error: {error}</div>}
      
      {weatherData && (
        <div className="weather-card">
          <h2>{weatherData.city_name}, {weatherData.country_code}</h2>
          <div className="weather-main">
            <img 
              src={`https://www.weatherbit.io/static/img/icons/${weatherData.weather.icon}.png`}
              alt={weatherData.weather.description}
              className="weather-icon"
            />
            <div className="temperature">
              {Math.round(weatherData.temp)}°C
            </div>
          </div>
          <div className="weather-desc">
            {weatherData.weather.description}
          </div>
          <div className="weather-details">
            <div className="detail-item">
              <span>Feels like:</span>
              <span>{Math.round(weatherData.app_temp)}°C</span>
            </div>
            <div className="detail-item">
              <span>Humidity:</span>
              <span>{weatherData.rh}%</span>
            </div>
            <div className="detail-item">
              <span>Wind:</span>
              <span>{Math.round(weatherData.wind_spd)} m/s</span>
            </div>
            <div className="detail-item">
              <span>Pressure:</span>
              <span>{weatherData.pres} hPa</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Weather;