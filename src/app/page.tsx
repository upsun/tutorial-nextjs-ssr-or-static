"use server"

import { Suspense } from 'react';
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

async function fetchWeatherData(): Promise<DailyWeather> {
    const params = {
      "latitude": 48.8534,
      "longitude": 2.3488,
      "timezone": "Europe/Berlin",
      "daily": "weather_code"
    };
    const url = "https://api.open-meteo.com/v1/forecast";
    const responses = await fetchWeatherApi(url, params);

    const response = responses[0];

    const utcOffsetSeconds = response.utcOffsetSeconds();
    const daily = response.daily()!;
    
    // Helper function to form time ranges
    const range = (start: number, stop: number, step: number) =>
        Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

    const weatherData = {
        time: range(Number(daily.time()), Number(daily.timeEnd()), daily.interval()).map(
            (t) => new Date((t + utcOffsetSeconds) * 1000)
        ),
        weatherCode: Array.from(daily.variables(0)!.valuesArray()!),
    };

    // Add a small delay to simulate loading for demonstration
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    return weatherData as DailyWeather;
}

// Create the new async component for weather list
async function WeatherList() {
  const dailyWeather = await fetchWeatherData();

  return (
    <ul className="list-inside list-disc text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
      {dailyWeather.time.map((date, index) => (
        <li key={date.toISOString()}>
          {date.toLocaleDateString()}: {getWeatherDescription(dailyWeather.weatherCode[index])}
        </li>
      ))}
    </ul>
  );
}

// Make Home a regular component
export default async function Home() {

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-2xl font-bold">Weather Forecast for Paris</h1>
        {/* Wrap WeatherList with Suspense */}
        <Suspense fallback={<p>Loading weather data...</p>}> 
           <WeatherList />
        </Suspense>
      </main>
    </div>
  );
}
