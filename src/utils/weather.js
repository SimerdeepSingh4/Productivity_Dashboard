export default async function getWeather() {
    const apiKey = 'e14e105c8eb24b31b0a155937260201';
    const temp = document.querySelector('.temp');
    const condition = document.querySelector('.condition');
    const location = document.querySelector('.location');
    const icon = document.querySelector('.icon');
    const humidity = document.querySelector('.humidity');
    const wind = document.querySelector('.wind');
    const feelLike = document.querySelector('.feelLike');
    const pm2 = document.querySelector('.pm2');
    const uv = document.querySelector('.uv');

    if (!temp || !condition || !location || !icon || !humidity || !wind || !feelLike || !pm2 || !uv) {
        return;
    }

    function applyFallbackWeather() {
        location.textContent = 'Location unavailable';
        temp.textContent = '--°C';
        condition.textContent = 'Weather unavailable';
        icon.src = '';
        icon.alt = 'Weather unavailable';
        humidity.textContent = 'Humidity: --';
        wind.textContent = 'Wind: -- km/h';
        feelLike.textContent = 'Feels Like: --°C';
        pm2.textContent = '--';
        uv.textContent = '--';
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

        location.textContent = `${data.location.name}, ${data.location.region}`;
        temp.textContent = `${Math.floor(data.current.temp_c)}°C`;
        condition.textContent = data.current.condition.text;
        icon.src = iconUrl;
        icon.alt = data.current.condition.text;
        humidity.textContent = `Humidity: ${Math.floor(data.current.humidity)}`;
        wind.textContent = `Wind: ${Math.floor(data.current.wind_kph)} km/h`;
        feelLike.textContent = `Feels Like: ${Math.floor(data.current.feelslike_c)}°C`;
        pm2.textContent = `${Math.floor(data.current.air_quality.pm2_5)}`;
        uv.textContent = `${data.current.uv}`;
    }

    if (!navigator.geolocation) {
        try {
            await updateWeather('New Delhi');
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

                const geoRes = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
                );
                if (!geoRes.ok) throw new Error('Location lookup failed');
                const geoData = await geoRes.json();

                const city =
                    geoData.address?.city ||
                    geoData.address?.town ||
                    geoData.address?.county ||
                    'New Delhi';

                await updateWeather(city);
            } catch (error) {
                try {
                    await updateWeather('New Delhi');
                } catch (fallbackError) {
                    applyFallbackWeather();
                }
            }
        },
        async () => {
            try {
                await updateWeather('New Delhi');
            } catch (error) {
                applyFallbackWeather();
            }
        },
        { timeout: 8000 }
    );
}
