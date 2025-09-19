# ☀️ Weather Dashboard

A modern, production-ready React weather application featuring real-time forecasts, air quality monitoring, and interactive data visualizations.

![Weather Dashboard](https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=1200&h=400&fit=crop&crop=top)

## ✨ Features

### 🌦️ Core Weather Data
- **Real-time Weather**: Current conditions with detailed metrics
- **5-Day Forecast**: Extended weather predictions with hourly breakdowns
- **Multiple Search Options**: City name, ZIP code, or GPS coordinates
- **Geolocation Support**: "Use My Location" with browser geolocation API

### 📊 Data Visualization
- **Interactive Charts**: Temperature trends and weather condition analytics
- **Air Quality Index**: Color-coded AQI with health recommendations
- **Dynamic Backgrounds**: Weather-adaptive UI themes

### 💫 User Experience
- **Favorites System**: Save and quickly access favorite cities
- **Temperature Units**: Toggle between Celsius and Fahrenheit
- **Theme Support**: Light, dark, and system preference modes
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Offline-Ready**: PWA capabilities with local data caching

### 🎨 Modern Design
- **Glassmorphism UI**: Beautiful frosted glass effects
- **Smooth Animations**: Micro-interactions and transitions
- **Semantic Design**: Consistent color system and typography
- **Accessibility**: WCAG compliant with screen reader support

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- OpenWeatherMap API key ([Get yours free](https://openweathermap.org/api))

### Installation

```bash
# Clone the repository
git clone https://github.com/Intaza/WeatherApp.git
cd WeatherApp

# Install dependencies
npm install

# Configure API key
# Edit src/services/weatherService.ts
# Replace 'YOUR_API_KEY_HERE' with your OpenWeatherMap API key

# Start development server
npm run dev
```

### API Key Setup

1. Sign up at [OpenWeatherMap](https://openweathermap.org/api)
2. Get your free API key
3. Open `src/services/weatherService.ts`
4. Replace `YOUR_API_KEY_HERE` with your actual API key:

```typescript
const API_KEY = 'your_actual_api_key_here';
```

## 🏗️ Project Structure

```
src/
├── components/           # React components
│   ├── SearchBar.tsx    # Search and geolocation
│   ├── WeatherCard.tsx  # Current weather display
│   ├── ForecastCard.tsx # 5-day forecast
│   ├── WeatherChart.tsx # Data visualizations
│   ├── Favorites.tsx    # Saved cities
│   ├── AirQuality.tsx   # AQI display
│   └── ThemeToggle.tsx  # Theme switching
├── services/            # API services
│   └── weatherService.ts # OpenWeatherMap integration
├── types/               # TypeScript definitions
│   └── weather.ts       # Weather data interfaces
├── utils/               # Helper functions
│   └── weatherHelpers.ts # Formatting and utilities
├── hooks/               # Custom React hooks
│   └── useLocalStorage.ts # Persistent storage
└── App.tsx             # Main application
```

## 🌐 Deployment

### Vercel (Recommended)

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel:**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel --prod
   ```

3. **Environment Variables:**
   - The API key is embedded in the build (client-side)
   - For production, consider using Vercel's environment variables

### Other Platforms

- **Netlify**: Drag and drop the `dist` folder
- **GitHub Pages**: Use the `gh-pages` package
- **Railway**: Connect your GitHub repository

## 📱 Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+
- **Mobile**: iOS Safari, Chrome Mobile, Samsung Internet
- **Features**: Geolocation API, Local Storage, CSS Grid, Flexbox

## 🔧 Configuration Options

### Weather Units
```typescript
// Modify in weatherService.ts
const units = 'metric'; // 'metric', 'imperial', 'kelvin'
```

### Default Location
```typescript
// Modify in App.tsx useEffect
searchWeather('Your City', 'city');
```

### Theme Colors
```css
/* Customize in src/index.css */
:root {
  --primary: 210 80% 55%;
  --accent: 45 100% 60%;
  /* Add your custom colors */
}
```

## 🔑 API Endpoints Used

- `api.openweathermap.org/data/2.5/weather` - Current weather
- `api.openweathermap.org/data/2.5/forecast` - 5-day forecast
- `api.openweathermap.org/data/2.5/air_pollution` - Air quality
- `api.openweathermap.org/geo/1.0/direct` - Geocoding

## 🐛 Troubleshooting

### Common Issues

1. **API Key Error**: Make sure your API key is correctly set in `weatherService.ts`
2. **Location Not Found**: Check spelling or try coordinates format: `40.7128,-74.0060`
3. **Geolocation Failed**: Ensure HTTPS and location permissions are enabled
4. **Build Errors**: Run `npm install` to ensure all dependencies are installed

### Performance Tips

- API responses are cached for better performance
- Images are lazy-loaded for mobile optimization
- Charts are rendered only when visible

## 🔒 Security & Privacy

- **API Key**: Client-side exposure (normal for frontend apps)
- **User Data**: Stored locally, never transmitted
- **Location**: Used only when explicitly requested
- **No Tracking**: No analytics or third-party tracking

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 🙏 Acknowledgments

- [OpenWeatherMap](https://openweathermap.org) for weather data API
- [Recharts](https://recharts.org) for beautiful data visualizations
- [Lucide](https://lucide.dev) for icon library
- [Tailwind CSS](https://tailwindcss.com) for styling framework

---

Built with ❤️ using React, TypeScript, and modern web technologies.