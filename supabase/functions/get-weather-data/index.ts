import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lon, city } = await req.json();
    const apiKey = Deno.env.get('OPENWEATHER_API_KEY');

    if (!apiKey) {
      throw new Error('OPENWEATHER_API_KEY not configured');
    }

    let url: string;
    
    if (city) {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=pt_br`;
    } else if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=pt_br`;
    } else {
      throw new Error('Latitude/longitude or city name required');
    }

    console.log('Fetching weather data from OpenWeatherMap');
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenWeatherMap API error:', errorText);
      throw new Error(`OpenWeatherMap API error: ${response.status}`);
    }

    const weatherData = await response.json();
    
    // Buscar previsão de 5 dias
    let forecastUrl: string;
    if (city) {
      forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=pt_br`;
    } else {
      forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=pt_br`;
    }

    const forecastResponse = await fetch(forecastUrl);
    const forecastData = forecastResponse.ok ? await forecastResponse.json() : null;

    console.log('Weather data fetched successfully');

    return new Response(
      JSON.stringify({
        current: {
          temperature: weatherData.main.temp,
          feels_like: weatherData.main.feels_like,
          humidity: weatherData.main.humidity,
          pressure: weatherData.main.pressure,
          description: weatherData.weather[0].description,
          icon: weatherData.weather[0].icon,
          wind_speed: weatherData.wind.speed,
          wind_deg: weatherData.wind.deg,
          clouds: weatherData.clouds.all,
          visibility: weatherData.visibility,
          rain: weatherData.rain?.['1h'] || 0,
          city: weatherData.name,
          country: weatherData.sys.country,
          sunrise: weatherData.sys.sunrise,
          sunset: weatherData.sys.sunset,
        },
        forecast: forecastData ? forecastData.list.slice(0, 8).map((item: any) => ({
          dt: item.dt,
          temperature: item.main.temp,
          humidity: item.main.humidity,
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          rain: item.rain?.['3h'] || 0,
        })) : [],
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in get-weather-data function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
