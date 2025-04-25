"use client"

import { useState, useEffect } from "react";
import { fetchWeatherApi } from 'openmeteo';

interface DailyWeather {
    time: Date[];
    weatherCode: number[];
}

// Add the weather code mapping
const weatherCodeDescriptions: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Drizzle: Light intensity",
  53: "Drizzle: Moderate intensity",
  55: "Drizzle: Dense intensity",
  56: "Freezing Drizzle: Light intensity",
  57: "Freezing Drizzle: Dense intensity",
  61: "Rain: Slight intensity",
  63: "Rain: Moderate intensity",
  65: "Rain: Heavy intensity",
  66: "Freezing Rain: Light intensity",
  67: "Freezing Rain: Heavy intensity",
  71: "Snow fall: Slight intensity",
  73: "Snow fall: Moderate intensity",
  75: "Snow fall: Heavy intensity",
  77: "Snow grains",
  80: "Rain showers: Slight intensity",
  81: "Rain showers: Moderate intensity",
  82: "Rain showers: Violent intensity",
  85: "Snow showers: Slight intensity",
  86: "Snow showers: Heavy intensity",
  95: "Thunderstorm: Slight or moderate",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

// Add the helper function to get the description
function getWeatherDescription(code: number): string {
    return weatherCodeDescriptions[code] || `Unknown code: ${code}`;
}

export default function Home() {
  const [dailyWeather, setDailyWeather] = useState<DailyWeather | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = {
          "latitude": 48.8534,
          "longitude": 2.3488,
          "timezone": "Europe/Berlin",
          "daily": "weather_code"
        };
        const url = "https://api.open-meteo.com/v1/forecast";
        // The fetchWeatherApi function needs to be adapted or replaced if it doesn't directly return the processed response.
        // Assuming it returns an object with a 'daily' property based on common patterns.
        // We might need to inspect the actual response structure.
        const responses = await fetchWeatherApi(url, params);
        
        // Process the response (assuming structure based on Open Meteo docs)
        // Helper function to form time ranges
        const range = (start: number, stop: number, step: number) =>
          Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

        // Process first location. Add a for-loop for multiple locations or weather models
        const response = responses[0];

        // Attributes for timezone and location
        const utcOffsetSeconds = response.utcOffsetSeconds();

        const daily = response.daily()!;

        // Note: The order of weather variables in the URL query and the indices below need to match!
        const weatherData = {
            time: range(Number(daily.time()), Number(daily.timeEnd()), daily.interval()).map(
                (t) => new Date((t + utcOffsetSeconds) * 1000)
            ),
            weatherCode: Array.from(daily.variables(0)!.valuesArray()!),
        };
        
        // Type assertion might be needed if the structure isn't guaranteed
        setDailyWeather(weatherData as DailyWeather); 
        setError(null);
      } catch (err) {
        console.error("Failed to fetch weather data:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        setDailyWeather(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-2xl font-bold">Weather Forecast for Paris</h1>
        {loading && <p>Loading weather data...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {dailyWeather && !loading && !error && (
          <ul className="list-inside list-disc text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
            {dailyWeather.time.map((date, index) => (
              <li key={date.toISOString()}>
                {date.toLocaleDateString()}: {getWeatherDescription(dailyWeather.weatherCode[index])}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
