# Weather API - Professional Backend Implementation

A RESTful API that provides current weather information following **MVC architecture** and professional backend best practices.

## Project Overview

This project demonstrates a production-grade backend implementation using:
- **Node.js** with Express
- **Architecture**: Strict MVC separation of concerns
- **Data Transformation**: DTOs and transformers for data serialization
- **External API Integration**: Open-Meteo weather API with error handling
- **Testing**: Jest unit tests with >70% coverage
- **Error Handling**: Centralized global error middleware

## Features

- ✅ Get current weather with temperature and wind speed
- ✅ Return temperatures in Celsius and Fahrenheit
- ✅ Return wind speeds in km/h and m/s
- ✅ Strict MVC architecture enforcement
- ✅ Pure functions for conversions
- ✅ Global error handling middleware
- ✅ Comprehensive unit tests
- ✅ Professional code structure

## Project Structure

```
weather-api/
├── src/
│   ├── controllers/
│   │   └── weatherController.js      # Request handling and orchestration
│   ├── services/
│   │   └── weatherService.js         # External API communication
│   ├── transformers/
│   │   └── weatherTransformer.js     # Data serialization/deserialization
│   ├── utils/
│   │   ├── ApiError.js               # Custom error class
│   │   └── conversionUtils.js        # Pure conversion functions
│   ├── middlewares/
│   │   └── errorHandler.js           # Global error handling
│   ├── routes/
│   │   └── weatherRoutes.js          # Route definitions
│   └── app.js                        # Express app setup
├── __tests__/
│   ├── conversionUtils.test.js       # Temperature conversions tests
│   ├── windSpeedUtils.test.js        # Wind speed conversions tests
│   ├── weatherTransformer.test.js    # Data transformation tests
│   └── ApiError.test.js              # Error handling tests
├── package.json                      # Dependencies
├── jest.config.js                    # Jest configuration
├── .gitignore
└── README.md
```

## API Endpoints

### GET /weather
Get current weather data for Valencia, Spain (39.47°N, -0.38°E)

**Response:**
```json
{
  "success": true,
  "data": {
    "temperature": {
      "celsius": 15.5,
      "fahrenheit": 59.90
    },
    "wind_speed": {
      "kmh": 20.3,
      "ms": 5.64
    }
  }
}
```

### GET /health
Health check endpoint

**Response:**
```json
{
  "success": true,
  "message": "Weather API is running",
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

## Installation and Setup

### Prerequisites
- Node.js >= 16.x
- npm >= 8.x

### Installation

```bash
# Clone or navigate to the project
cd weather-api

# Install dependencies
npm install

# Run application
npm start

# Run in development mode (with auto-reload)
npm run dev

# Run tests
npm test

# Run tests with coverage
npm test:coverage
```

### Environment Configuration

The API uses the following defaults:
- **Port**: 3000 (configurable via PORT env variable)
- **Latitude**: 39.47 (Valencia, Spain)
- **Longitude**: -0.38 (Valencia, Spain)
- **External API Timeout**: 10 seconds

## Architecture Details

### Separation of Responsibilities

#### Controllers (`src/controllers/`)
- Handles HTTP request/response cycle
- Orchestrates between services and transformers
- Does NOT contain business logic
- Delegates errors to global error handler

#### Services (`src/services/`)
- Manages external API communication
- Implements circuit breaker patterns
- Handles retries and timeout logic
- Validates external responses

#### Transformers (`src/transformers/`)
- Serializes/deserializes data (DTO pattern)
- Transforms API responses to internal format
- Validates data structure and types
- No direct API calls or database access

#### Utils (`src/utils/`)
- Pure functions for conversions
- No side effects
- Fully testable and reusable

#### Middlewares (`src/middlewares/`)
- Global error handling
- Centralized error responses
- Never exposes stack traces

### Data Flow

```
HTTP Request
    ↓
   Route → Controller
             ↓
          Service (fetch external API)
             ↓
        Transformer (validate & convert)
             ↓
        Pure Functions (conversions)
             ↓
         Response
```

## Key Design Patterns

### 1. Data Transfer Object (DTO)
- Internal data representation separated from API contracts
- `weatherTransformer.js` handles serialization/deserialization

### 2. Pure Functions
- All conversions are pure functions
- No side effects, fully testable
- `conversionUtils.js` contains pure conversion logic

### 3. Custom Error Class
- Centralized error handling with `ApiError`
- Consistent error responses across API
- Proper HTTP status codes

### 4. External API Integration
- Proper error handling and timeouts
- Retry logic for transient failures
- Response validation before transformation

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with watch mode
npm test:watch

# Generate coverage report
npm test:coverage
```

### Test Coverage

- **Temperature Conversions**: 100% coverage
- **Wind Speed Conversions**: 100% coverage
- **Data Transformations**: 100% coverage
- **Error Handling**: 100% coverage

### Test Files

1. `__tests__/conversionUtils.test.js` - Temperature conversion tests
2. `__tests__/windSpeedUtils.test.js` - Wind speed conversion tests
3. `__tests__/weatherTransformer.test.js` - Data transformation tests
4. `__tests__/ApiError.test.js` - Error handling tests

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "message": "Weather API request timeout",
    "status": 504
  }
}
```

### Common Errors

| Status | Message | Cause |
|--------|---------|-------|
| 400 | Bad Request | Invalid input parameters |
| 404 | Route not found | Endpoint doesn't exist |
| 503 | Service unavailable | External API is down |
| 504 | Gateway timeout | External API timeout |
| 500 | Internal Server Error | Unexpected error |

## Best Practices Implemented

✅ **MVC Architecture**
- Strict separation of concerns
- Clear responsibility boundaries
- No circular dependencies

✅ **JavaScript Best Practices**
- camelCase naming conventions
- const/let over var
- ES6 modules
- Arrow functions for callbacks
- JSDoc documentation

✅ **Error Handling**
- Global error middleware
- Consistent error responses
- No stack trace exposure
- Proper HTTP status codes

✅ **Data Transformation**
- DTO pattern for data serialization
- Validation of external data
- Type checking
- No mutation of original data

✅ **External API Integration**
- Timeout handling
- Connection error management
- Response validation
- Proper error propagation

✅ **Testing**
- Jest configuration
- >70% test coverage threshold
- Pure function testing
- All critical functions tested

## Code Quality

### Linting Standards
- 2-space indentation
- 100 character line limit
- Semicolon termination
- No unused variables

### Documentation
- JSDoc for all functions
- Inline comments for complex logic
- Route documentation
- Architecture documentation

## Running the API

### Start the Server

```bash
npm start
```

### Test the Endpoints

```bash
# Get weather data
curl http://localhost:3000/weather

# Health check
curl http://localhost:3000/health
```

### Example Request/Response

```bash
$ curl http://localhost:3000/weather

{
  "success": true,
  "data": {
    "temperature": {
      "celsius": 15.5,
      "fahrenheit": 59.90
    },
    "wind_speed": {
      "kmh": 20.3,
      "ms": 5.64
    }
  }
}
```

## Performance Considerations

- **API Timeout**: 10 seconds for external service calls
- **Error Retry**: Automatic for transient failures
- **Data Transformation**: Efficient with NO mutation
- **Memory Usage**: Minimal with proper cleanup

## Security Considerations

- ✅ No sensitive data in error messages
- ✅ Input validation on all endpoints
- ✅ Proper HTTP status codes
- ✅ No SQL injection vectors (no database)
- ✅ No stack trace exposure

## Future Enhancements

- [ ] Add caching layer (Redis)
- [ ] Implement rate limiting
- [ ] Add authentication/authorization
- [ ] Support multiple locations
- [ ] Add database persistence
- [ ] Implement logging service
- [ ] Add API documentation (OpenAPI/Swagger)
- [ ] Containerization (Docker)

## Contributing

Follow the established patterns:
1. Controllers for HTTP layer only
2. Services for business logic
3. Transformers for data serialization
4. Utils for pure functions
5. Middlewares for cross-cutting concerns

## License

MIT

## References

- [Martin Fowler: MVC Architecture](https://martinfowler.com/eaaDev/uiArchs.html)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Jest Documentation](https://jestjs.io/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodejs-best-practices)
