# Weather API - Project Documentation

## Overview

Weather API is a professional Node.js REST API that consumes weather data from an external API and exposes transformed data through a clean REST endpoint.

## Architecture

The project follows a strict **MVC (Model-View-Controller)** architecture with clear separation of concerns:

```
src/
├── app.js                  # Express app configuration
├── server.js              # Server entry point
├── routes/                # API route definitions
├── controllers/           # HTTP request handlers (thin layer)
├── services/              # Business logic
├── utils/                 # Utility functions (pure functions)
├── middlewares/           # Express middlewares
└── transformers/          # Data transformation layer
```

## Key Features

- ✅ Strict MVC architecture
- ✅ RESTful API design
- ✅ Error handling with global middleware
- ✅ Data transformation layer with DTOs
- ✅ Pure utility functions for conversions
- ✅ Comprehensive Jest unit tests
- ✅ Docker and Docker Compose support
- ✅ JavaScript best practices compliance
- ✅ Non-blocking async/await patterns
- ✅ Input validation and error responses

## Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker (optional, for containerized deployment)

### Local Development

```bash
# Clone/download the project
cd weather-api

# Install dependencies
npm install

# Run tests
npm test

# Start development server
npm run dev

# Start production server
npm start
```

## API Endpoints

### GET /weather

Fetch current weather data transformed into Celsius/Fahrenheit and km/h/m/s formats.

**Response:**
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

### GET /health

Health check endpoint for monitoring.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Docker Deployment

### Build and Run with Docker Compose

```bash
# Build and start the application
docker-compose up

# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

### Build Docker Image Manually

```bash
# Build the image
docker build -t weather-api:latest .

# Run the container
docker run -p 3000:3000 weather-api:latest
```

### Docker Features

- **Multi-stage build**: Reduces final image size by separating build and runtime stages
- **Non-root user**: Runs as nodejs user for security
- **Health checks**: Automatic container health monitoring
- **Security capabilities**: Dropped all unnecessary capabilities
- **Alpine Linux**: Minimal base image (~130MB smaller)
- **No cache pollution**: Cleans npm cache during installation

## Testing

### Unit Tests

Tests cover all pure utility functions and service logic:

```bash
# Run tests
npm test

# Run tests with coverage report
npm test:coverage

# Run tests in watch mode
npm test:watch
```

### Tested Components

- ✅ Temperature conversion (Celsius ↔ Fahrenheit)
- ✅ Wind speed conversion (km/h ↔ m/s)
- ✅ Weather service API consumption
- ✅ Error handling and validation
- ✅ Data transformation

## Architecture Details

### Controllers

Controllers are **thin** - they only:
- Receive HTTP requests
- Delegate to services
- Format responses
- Pass errors through middleware

### Services

Services contain **business logic**:
- External API consumption
- Data validation
- Error handling with ApiError
- Business rules

### Utils

Utility functions are **pure functions**:
- Temperature conversion
- Wind speed conversion
- No side effects
- Fully testable

### Transformers

Transform data between formats:
- External API response → Internal format
- Validation of incoming data
- Consistent response structure

### Middlewares

Global middlewares handle:
- Request logging
- Error handling (centralized)
- Consistent error format
- HTTP status codes

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "status": 500
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

Common status codes:
- **400**: Bad Request (client error)
- **404**: Not Found
- **500**: Internal Server Error
- **502**: Bad Gateway (external API error)
- **503**: Service Unavailable
- **504**: Gateway Timeout

## Code Standards

Follows JavaScript best practices:

- **2-space indentation** for all files
- **camelCase** for variables, functions, properties
- **PascalCase** for classes
- **Semicolons** required on all statements
- **Arrow functions** for callbacks
- **const/let** (no var)
- **JSDoc comments** for public functions
- **Max 100 characters per line**
- **No console logs** in production (use logger)

## Environment Variables

Currently requires no environment variables. Optional configuration:

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (default: production in Docker)

## Deployment

### Docker Compose (Recommended)

```bash
docker-compose up -d
```

### Kubernetes

The project can be deployed to Kubernetes by converting docker-compose to Helm charts or using tools like Kompose.

### CI/CD

Tests run automatically during Docker build process in the builder stage.

## Monitoring

- **Health Endpoint**: `/health`
- **Container Health Check**: Automatic via Docker Healthcheck
- **Logs**: Access via `docker-compose logs`

## Performance

- **Response Time**: < 100ms typically (depends on external API)
- **Memory Usage**: ~50-100MB container
- **CPU Usage**: Minimal under normal load

## Security

- ✅ Non-root user in container
- ✅ No sensitive data exposed
- ✅ Input validation on all endpoints
- ✅ Error messages don't expose internals
- ✅ Dropped capability in Docker
- ✅ API timeout protection

## Troubleshooting

### Container fails to start

```bash
# Check logs
docker-compose logs weather-api

# Verify health
docker-compose ps
```

### Connection timeout to external API

The service implements timeout protection. If external API is slow:
- Timeout is set to 10 seconds
- Service returns 504 Gateway Timeout
- Check Open-Meteo API status

### Port already in use

```bash
# Change port in docker-compose.yml
# Then restart
docker-compose down
docker-compose up
```

## Future Enhancements

- [ ] Add caching layer (Redis)
- [ ] Database integration
- [ ] Authentication/Authorization
- [ ] Rate limiting
- [ ] API documentation (Swagger)
- [ ] Monitoring (Prometheus/Grafana)
- [ ] Logging service (ELK stack)
- [ ] Configuration management

## License

ISC

## Author

Weather API Development Team
