import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Wind } from 'lucide-react';

export const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Jakarta coordinates
    const fetchWeather = async () => {
      try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-6.2146&longitude=106.8451&current=temperature_2m,weather_code&timezone=Asia%2FJakarta');
        const data = await response.json();
        setWeather(data.current);
      } catch (error) {
        console.error("Weather fetch failed", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, []);

  const getWeatherIcon = (code: number) => {
    if (code <= 1) return <Sun className="h-8 w-8 text-amber-500" />;
    if (code <= 3) return <Cloud className="h-8 w-8 text-slate-500" />;
    return <CloudRain className="h-8 w-8 text-blue-500" />;
  };

  if (loading) return <div className="bento-card p-6 h-full flex items-center justify-center text-xs text-slate-400">Loading cuaca...</div>;

  return (
    <div className="bento-card p-6 h-full flex flex-col justify-between">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Cuaca Jakarta</h4>
        {weather ? (
            <div className="flex items-center justify-between mt-2">
                <div className="flex flex-col">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{weather.temperature_2m}°C</span>
                    <span className="text-[10px] text-slate-500">Jakarta Pusat</span>
                </div>
                {getWeatherIcon(weather.weather_code)}
            </div>
        ) : (
            <span className="text-xs text-red-500">Gagal memuat cuaca</span>
        )}
    </div>
  );
};
