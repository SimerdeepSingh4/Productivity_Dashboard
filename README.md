# Productivity Dashboard

A single-page productivity app built with vanilla JavaScript, HTML, and CSS. It combines task management, planning, focus sessions, ideas capture, motivational quotes, and live weather in one interface.

## Highlights

- To-Do manager with search, important filter, stats, and local persistence
- Daily planner (6:00-24:00) with quick-fill, clear, and text export
- Pomodoro timer with configurable work/break durations and cycle counter
- Idea board with search, delete, and random-pick helper
- Motivational quote widget with refresh + clipboard copy
- Live clock/date, weather details, and theme switching

## Demo Behavior

- All task, planner, idea, and theme settings are saved in `localStorage`
- Weather uses browser geolocation when allowed, then resolves city and fetches current conditions
- Feature cards open full-page panels and can be closed via button or `Esc`

## Tech Stack

- HTML5
- CSS3
- JavaScript (ES modules, no framework)

## Project Structure

```text
.
|-- index.html
|-- README.md
|-- icons8-quotes-96.png
`-- src
    |-- script.js
    |-- style.css
    |-- components
    |   |-- features.js
    |   |-- todo.js
    |   |-- planner.js
    |   |-- motivation.js
    |   |-- pomodoro.js
    |   `-- ideas.js
    `-- utils
        |-- time.js
        |-- weather.js
        `-- theme.js
```

## Getting Started

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd Productivity_Dashboard
   ```

2. Open the shown local URL in your browser.

You can also open `index.html` directly, but some browser setups are more reliable when served over `http://localhost`.

## External APIs

- Weather: WeatherAPI (`/v1/current.json`) for current weather + AQI
- Reverse geocoding: OpenStreetMap Nominatim
- Quotes: random-quotes-freeapi

## Configuration Notes

- The weather API key is currently hardcoded in `src/utils/weather.js`.
- For production use, move API keys to a backend or secure proxy.
- If geolocation is denied, weather falls back to a default city.

## Browser Compatibility

Modern Chromium, Firefox, and Safari versions are recommended (ES module support required).



## 🙋‍♂️ Author

**Simerdeep Singh Gandhi**

- Portfolio: [https://simerdeep-portfolio.vercel.app/](https://simerdeep-portfolio.vercel.app/)
- GitHub: [@SimerdeepSingh4](https://github.com/SimerdeepSingh4)
- LinkedIn: [Simerdeep Singh Gandhi](https://www.linkedin.com/in/simerdeep-singh-gandhi/)

---

## ✨ Show Your Support

Give a ⭐️ if this project helped you!
