const WEATHER_URL =
    'https://api.open-meteo.com/v1/forecast?latitude=17.95&longitude=-76.72&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m&hourly=precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=America%2FJamaica';

const WEATHER_LABELS = new Map([
    [0, 'Clear'],
    [1, 'Partly cloudy'],
    [2, 'Partly cloudy'],
    [3, 'Partly cloudy'],
    [45, 'Foggy'],
    [48, 'Foggy'],
    [51, 'Drizzle'],
    [53, 'Drizzle'],
    [55, 'Drizzle'],
    [61, 'Rain'],
    [63, 'Rain'],
    [65, 'Rain'],
    [80, 'Showers'],
    [81, 'Showers'],
    [82, 'Showers'],
    [95, 'Thunderstorm'],
]);

function getConditionLabel(code) {
    return WEATHER_LABELS.get(code) || 'Current conditions';
}

function getRainChance(data) {
    const currentTime = data?.current?.time;
    const hourlyTimes = data?.hourly?.time || [];
    const hourlyChance = data?.hourly?.precipitation_probability || [];
    const dailyChance = data?.daily?.precipitation_probability_max?.[0];

    if (currentTime && hourlyTimes.length && hourlyChance.length) {
        const currentHour = `${currentTime.slice(0, 13)}:00`;
        let index = hourlyTimes.indexOf(currentHour);

        if (index === -1) {
            index = hourlyTimes.findIndex(time => time >= currentHour);
        }

        if (Number.isFinite(hourlyChance[index])) {
            return hourlyChance[index];
        }
    }

    return Number.isFinite(dailyChance) ? dailyChance : null;
}

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1800');
    res.setHeader('CDN-Cache-Control', 's-maxage=900, stale-while-revalidate=1800');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
        const response = await fetch(WEATHER_URL, {
            headers: { accept: 'application/json' },
            signal: controller.signal,
        });

        if (!response.ok) {
            throw new Error(`Open-Meteo responded with ${response.status}`);
        }

        const data = await response.json();
        const current = data?.current;

        if (!current || !Number.isFinite(current.temperature_2m)) {
            throw new Error('Open-Meteo response missing current weather');
        }

        const weatherCode = current.weather_code;

        return res.status(200).json({
            temperature: current.temperature_2m ?? null,
            feelsLike: current.apparent_temperature ?? null,
            humidity: current.relative_humidity_2m ?? null,
            windSpeed: current.wind_speed_10m ?? null,
            rain: current.rain ?? current.precipitation ?? null,
            rainChance: getRainChance(data),
            weatherCode,
            conditionLabel: getConditionLabel(weatherCode),
            updatedAt: current.time ?? new Date().toISOString(),
        });
    } catch (error) {
        console.error('Weather API error:', error.message);
        return res.status(502).json({ error: 'Weather request failed' });
    } finally {
        clearTimeout(timeout);
    }
}
