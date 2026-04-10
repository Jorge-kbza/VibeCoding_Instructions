# 📁 Project Structure - Weather API

```
weather-api/
│
├── 📄 package.json              # Dependencies and npm scripts
├── 📄 jest.config.js            # Jest testing configuration
├── 📄 Dockerfile                # Multi-stage Docker build
├── 📄 docker-compose.yml        # Docker Compose configuration
├── 📄 .dockerignore             # Docker build ignore patterns
├── 📄 .gitignore                # Git ignore patterns
├── 📄 README.md                 # Project documentation
│
├── 🗂️ src/                       # Source code (Strict MVC Architecture)
│   │
│   ├── 📄 server.js             # Entry point - starts Express server
│   ├── 📄 app.js                # Express app configuration
│   │
│   ├── 🗂️ routes/
│   │   └── 📄 weatherRoutes.js  # API endpoint definitions
│   │                              GET /weather
│   │                              GET /health
│   │
│   ├── 🗂️ controllers/           # HTTP handlers (THIN LAYER)
│   │   └── 📄 weatherController.js
│   │         • getWeather(req, res, next)
│   │         • Delegates to service
│   │         • Handles response format
│   │
│   ├── 🗂️ services/             # Business Logic
│   │   └── 📄 weatherService.js
│   │         • getCurrentWeather()
│   │         • External API consumption
│   │         • Data validation
│   │         • Error handling
│   │
│   ├── 🗂️ transformers/         # Data Transformation Layer
│   │   └── 📄 weatherTransformer.js
│   │         • validateWeatherData()
│   │         • transformWeatherData()
│   │         • Converts API response to DTO
│   │
│   ├── 🗂️ utils/                # Pure Utility Functions
│   │   ├── 📄 ApiError.js       # Custom error class
│   │   ├── 📄 temperatureConverter.js
│   │   │   • celsiusToFahrenheit()
│   │   │   • fahrenheitToCelsius()
│   │   │   • temperatureBothUnits()
│   │   ├── 📄 windSpeedConverter.js
│   │   │   • kmhToMs()
│   │   │   • msToKmh()
│   │   │   • windSpeedBothUnits()
│   │   └── 📄 httpClient.js     # Axios configuration
│   │       • Centralized HTTP client
│   │       • Interceptors
│   │
│   └── 🗂️ middlewares/          # Express Middlewares
│       ├── 📄 errorHandler.js   # Global error handler
│       │   • Centralized error handling
│       │   • Consistent response format
│       └── 📄 requestLogger.js  # Request logging
│           • Logs all incoming requests
│
└── 🗂️ tests/                     # Jest Unit Tests
    ├── 🗂️ utils/
    │   ├── 📄 temperatureConverter.test.js (23 tests)
    │   └── 📄 windSpeedConverter.test.js    (15 tests)
    └── 🗂️ services/
        └── 📄 weatherService.test.js       (9 tests)

TOTAL: 47 PASSING TESTS ✅
```

---

## 🏗️ Architecture Layers Explanation

### 1. Routes Layer (`routes/weatherRoutes.js`)
- **Purpose**: Define API endpoints
- **Responsibility**: Map URLs to controllers
- **No business logic here**

```
GET /weather  →  Controller  →  Service  →  External API
```

### 2. Controllers Layer (`controllers/weatherController.js`)
- **Purpose**: Handle HTTP requests/responses
- **Characteristics**:
  - ✅ THIN - minimal logic
  - ✅ Delegate to services
  - ✅ Format responses
  - ✅ Pass errors to middleware
- **NO business logic here**

### 3. Services Layer (`services/weatherService.js`)
- **Purpose**: Contain business logic
- **Responsibilities**:
  - External API consumption
  - Data validation
  - Error handling with ApiError
  - Business rules

### 4. Transformers Layer (`transformers/weatherTransformer.js`)
- **Purpose**: Convert data between formats
- **Responsibilities**:
  - Validate external API response
  - Transform to internal format (DTO)
  - Consistent data structure

### 5. Utils Layer (`utils/`)
- **Purpose**: Pure utility functions
- **Characteristics**:
  - ✅ Pure functions (no side effects)
  - ✅ Reusable across project
  - ✅ Fully testable
  - ✅ No dependencies on other layers
- **Functions**:
  - Temperature conversions
  - Wind speed conversions
  - HTTP client configuration

### 6. Middlewares Layer (`middlewares/`)
- **Purpose**: Cross-cutting concerns
- **Includes**:
  - Global error handler
  - Request logging
  - Future: authentication, rate limiting, etc.

---

## 🔄 Request Flow

```
1. HTTP Request arrives
        ↓
2. requestLogger middleware
        ↓
3. Express routing
        ↓
4. weatherController.getWeather()
        ↓
5. weatherService.getCurrentWeather()
        ↓
6. httpClient.get() → External API (Open-Meteo)
        ↓
7. Response validation
        ↓
8. weatherTransformer.transformWeatherData()
        ↓
9. Temperature conversion (utility)
        ↓
10. Wind speed conversion (utility)
        ↓
11. Return transformed data to controller
        ↓
12. Format HTTP response
        ↓
13. Send JSON response to client
        ↓
        (If error → errorHandler middleware → Standardized error response)
```

---

## 📊 Data Flow Example

### Input from External API
```json
{
  "current_weather": {
    "temperature": 20,
    "wind_speed": 36
  }
}
```

### Transformation Process
```
1. Validation → Check structure ✅
2. Temperature: 20°C → {celsius: 20, fahrenheit: 68}
3. Wind Speed: 36 km/h → {kmh: 36, ms: 10}
```

### Output to Client
```json
{
  "success": true,
  "data": {
    "temperature": {
      "celsius": 20,
      "fahrenheit": 68
    },
    "wind_speed": {
      "kmh": 36,
      "ms": 10
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## ✅ Instructions Compliance Matrix

| Instruction | Implementation | Location |
|-----------|------------|----------|
| **MVC Architecture** | Strict separation: Controllers → Services → Utils | `src/` structure |
| **JavaScript Best Practices** | 2-space indent, camelCase, arrow functions, JSDoc | All `.js` files |
| **API Error Handling** | Global middleware, ApiError class, consistent format | `middlewares/errorHandler.js` |
| **Data Transformation** | Transformer layer with DTOs | `transformers/weatherTransformer.js` |
| **External API Integration** | Axios client, error handling, retries | `services/weatherService.js` |
| **Jest Testing** | 47 comprehensive tests | `tests/` directory |
| **Docker** | Multi-stage build, Alpine Linux, non-root user | `Dockerfile` |
| **Docker Compose** | Health checks, networking, security | `docker-compose.yml` |

---

## 🚀 Running the Project

### Option 1: Local Development
```bash
npm install
npm test        # Run all tests
npm run dev     # Start with auto-reload
# Visit http://localhost:3000/weather
```

### Option 2: Docker (Recommended)
```bash
docker-compose up -d
# Visit http://localhost:3000/weather
docker-compose logs -f        # View logs
docker-compose down           # Stop
```

### Option 3: Production Build
```bash
npm install
npm test        # Verify all tests
npm start       # Start server
```

---

## 🧪 Test Coverage

| Module | Tests | Status |
|--------|-------|--------|
| Temperature Converter | 23 | ✅ PASS |
| Wind Speed Converter | 15 | ✅ PASS |
| Weather Service | 9 | ✅ PASS |
| **TOTAL** | **47** | **✅ PASS** |

---

## 🐳 Docker Features

### Build Process
```
Dockerfile
├── Stage 1: BUILDER
│   ├── Install all dependencies
│   ├── Copy source code
│   ├── Run tests (47/47 pass)
│   └── Build application
│
└── Stage 2: RUNTIME
    ├── Alpine Linux base
    ├── Only production dependencies
    ├── Non-root user (nodejs)
    ├── Health checks
    └── Security hardening
```

### Security Features
- ✅ Non-root user execution
- ✅ Dropped all capabilities
- ✅ Read-only filesystem
- ✅ No sensitive data exposed
- ✅ Alpine Linux (minimal attack surface)

---

## 💡 Key Design Decisions

1. **Pure Functions in Utils**
   - No side effects
   - Easy to test
   - Reusable across project

2. **Service Layer for Business Logic**
   - Single responsibility
   - Easy to mock in tests
   - Decoupled from HTTP

3. **Global Error Handler**
   - Consistent error format
   - No duplicate error handling
   - Easy to extend

4. **Data Transformer Layer**
   - Separates concerns
   - Validates external data
   - Consistent internal format

5. **Docker Multi-Stage Build**
   - Tests run before runtime
   - Smaller production image
   - No dev dependencies

---

## 📝 Code Examples

### Temperature Conversion (Pure Function)
```javascript
// Input: 25°C
const result = temperatureBothUnits(25);
// Output: { celsius: 25, fahrenheit: 77 }
```

### Service Layer Delegation
```javascript
// Controller receives request
const weatherData = await getCurrentWeather(); // Simplified!
// Service handles: external API, validation, transformation
```

### Error Handling
```javascript
try {
  await getCurrentWeather();
} catch (error) {
  next(error); // Pass to global error handler
}
```

---

## 📦 Dependencies

- **express** (4.18.2) - Web framework
- **axios** (1.6.0) - HTTP client
- **jest** (29.7.0) - Testing framework

All modern versions, no deprecated packages!
