export default async function getWeather() {
    const apiKey = 'e14e105c8eb24b31b0a155937260201';
    
    // Minimalist selectors
    const tempElement = document.querySelector('.weather-temp');
    const locationElement = document.querySelector('.weather-location');
    const iconElement = document.querySelector('.weather-icon');

    if (!tempElement || !locationElement || !iconElement) return;

    function applyFallbackWeather() {
        locationElement.textContent = 'Location unavailable';
        tempElement.textContent = '--°C';
        iconElement.style.display = 'none';
        iconElement.alt = 'Weather unavailable';
    }

    async function fetchWeatherByCity(city) {
        const response = await fetch(
            `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(city)}&aqi=yes`
        );
        if (!response.ok) throw new Error('Weather API failed');
        return response.json();
    }

    async function updateWeather(city) {
        const data = await fetchWeatherByCity(city);
        const iconUrl = String(data.current.condition.icon || '').startsWith('//')
            ? `https:${data.current.condition.icon}`
            : data.current.condition.icon;

        locationElement.textContent = data.location.name;
        tempElement.textContent = `${Math.floor(data.current.temp_c)}°C`;
        iconElement.src = iconUrl;
        iconElement.alt = data.current.condition.text;
        iconElement.style.display = 'block';

        // Update Detailed Overlay
        const feels = document.querySelector('#weather-feels');
        const humidity = document.querySelector('#weather-humidity');
        const wind = document.querySelector('#weather-wind');
        const uv = document.querySelector('#weather-uv');
        const aqi = document.querySelector('#weather-aqi');

        if (feels) feels.textContent = `${Math.floor(data.current.feelslike_c)}°C`;
        if (humidity) humidity.textContent = `${data.current.humidity}%`;
        if (wind) wind.textContent = `${data.current.wind_kph} km/h`;
        if (uv) uv.textContent = data.current.uv;
        if (aqi && data.current.air_quality) {
            aqi.textContent = Math.round(data.current.air_quality.pm2_5);
        }
    }

    // Setup Click Listener for Overlay
    const weatherWidget = document.querySelector('.weather-info');
    const weatherOverlay = document.querySelector('#tool-weather');
    const closeBtn = weatherOverlay?.querySelector('.btn-close');

    if (weatherWidget && weatherOverlay) {
        weatherWidget.style.cursor = 'pointer';
        weatherWidget.addEventListener('click', () => {
            weatherOverlay.style.display = 'grid';
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            weatherOverlay.style.display = 'none';
        });
    }

    if (!navigator.geolocation) {
        try {
            await updateWeather('New York');
        } catch (error) {
            applyFallbackWeather();
        }
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                await updateWeather(`${lat},${lon}`);
            } catch (error) {
                try {
                    await updateWeather('New York');
                } catch (fallbackError) {
                    applyFallbackWeather();
                }
            }
        },
        async () => {
            try {
                await updateWeather('New York');
            } catch (error) {
                applyFallbackWeather();
            }
        }
    );
}
