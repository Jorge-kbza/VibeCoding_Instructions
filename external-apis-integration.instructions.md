---
description: Buenas prácticas para integración con APIs externas en backend Node.js
---
# Integración con APIs Externas en Backend Node.js

## Principios Fundamentales

### 1. Elección de Librerías HTTP

**Use Axios como estándar recomendado** para la mayoría de casos:
```javascript
// ✅ RECOMENDADO: Axios (simpler API, mejor manejo de errores)
const axios = require('axios');

const response = await axios.get('https://api.example.com/data', {
  timeout: 5000,
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Alternativas según contexto:**
- **Got**: Para aplicaciones ligeras con requisitos minimalistas
- **node-fetch**: Si necesita compatibilidad con estándar Fetch API del navegador
- **HTTP nativo**: Solo para casos especiales de bajo overhead

### 2. Configuración Base de Cliente HTTP

```javascript
// src/services/httpClient.js
const axios = require('axios');

const httpClient = axios.create({
  timeout: 10000, // Timeout global
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'MyApp/1.0'
  }
});

// Interceptor para agregar autenticación
httpClient.interceptors.request.use((config) => {
  const token = process.env.API_TOKEN;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

module.exports = httpClient;
```

---

## Manejo de Errores

### 1. Estrategia de Error Handling

```javascript
// ✅ CORRECTO: Manejo específico de errores
async function fetchUserData(userId) {
  try {
    const response = await httpClient.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    // Error de respuesta HTTP (4xx, 5xx)
    if (error.response) {
      const status = error.response.status;
      
      if (status === 404) {
        throw new Error(`Usuario ${userId} no encontrado`);
      } else if (status === 401) {
        throw new Error('No autorizado - Token inválido');
      } else if (status >= 500) {
        throw new Error(`Servidor externo indisponible (${status})`);
      }
    }
    // Error de conexión
    else if (error.request && !error.response) {
      throw new Error('No hay respuesta del servidor');
    }
    // Error en configuración de la solicitud
    else {
      throw new Error(`Error en solicitud: ${error.message}`);
    }
  }
}
```

### 2. Validación de Respuestas

```javascript
// ✅ RECOMENDADO: Validar estructura de respuesta
async function fetchWeather(city) {
  try {
    const response = await httpClient.get(`/weather?city=${city}`);
    
    // Validar que la respuesta contiene los campos esperados
    if (!response.data || typeof response.data.temperature === 'undefined') {
      throw new Error('Respuesta incompleta de la API');
    }
    
    return response.data;
  } catch (error) {
    logger.error('Error fetching weather', { city, error });
    throw error;
  }
}
```

### 3. Circuit Breaker Pattern

```javascript
// src/utils/circuitBreaker.js
class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.failureCount = 0;
    this.threshold = threshold;
    this.timeout = timeout;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.nextAttempt = Date.now();
  }

  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.timeout;
    }
  }
}

module.exports = CircuitBreaker;
```

---

## Reintentos y Resiliencia

### 1. Implementar Retry Logic con Backoff Exponencial

```javascript
// src/utils/retry.js
async function retryWithBackoff(
  fn,
  maxAttempts = 3,
  initialDelay = 1000,
  backoffMultiplier = 2
) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // No reintentar si es error cliente (4xx)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error;
      }

      // Si no es el último intento, esperar y reintentar
      if (attempt < maxAttempts) {
        const delay = initialDelay * Math.pow(backoffMultiplier, attempt - 1);
        console.log(`Intento ${attempt} falló. Reintentando en ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(`Falló después de ${maxAttempts} intentos: ${lastError.message}`);
}

// Uso
const data = await retryWithBackoff(
  () => httpClient.get('/api/data'),
  3, // máximo 3 intentos
  1000 // espera inicial de 1s
);
```

### 2. Configurar Timeouts Apropiados

```javascript
// ✅ RECOMENDADO: Timeouts estratégicos según operación
const clients = {
  // API rápida: timeout corto
  paymentGateway: axios.create({ timeout: 5000 }),
  
  // API lenta: timeout mayor
  heavyProcessing: axios.create({ timeout: 30000 }),
  
  // Uploads: timeout muy largo
  fileUpload: axios.create({ timeout: 120000 })
};
```

---

## Autenticación

### 1. Gestión de Tokens

```javascript
// src/services/authManager.js
class AuthManager {
  constructor(clientId, clientSecret) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.token = null;
    this.expiresAt = null;
  }

  async getValidToken() {
    // Si token es válido, devolverlo
    if (this.token && this.expiresAt > Date.now()) {
      return this.token;
    }

    // Si no, obtener nuevo token
    const token = await this.refreshToken();
    return token;
  }

  async refreshToken() {
    try {
      const response = await axios.post('https://auth.example.com/token', {
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret
      });

      this.token = response.data.access_token;
      // Guardar expiración (restar 5 minutos como bufeer)
      this.expiresAt = Date.now() + (response.data.expires_in * 1000) - 300000;

      return this.token;
    } catch (error) {
      logger.error('Token refresh failed', { error });
      throw error;
    }
  }
}

module.exports = AuthManager;
```

### 2. API Keys Seguras

```javascript
// ✅ RECOMENDADO: Variables de entorno
// .env
EXTERNAL_API_KEY=sk_live_xxxxxxxxxxxxx
EXTERNAL_API_URL=https://api.external.com

// src/services/apiClient.js
const API_KEY = process.env.EXTERNAL_API_KEY;
const API_URL = process.env.EXTERNAL_API_URL;

if (!API_KEY || !API_URL) {
  throw new Error('API credentials not configured');
}

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'X-API-Key': API_KEY
  }
});
```

---

## Rate Limiting

### 1. Cliente con Rate Limiter

```javascript
// src/services/rateLimitedClient.js
const pLimit = require('p-limit');

class RateLimitedClient {
  constructor(requestsPerSecond = 10) {
    this.limit = pLimit(requestsPerSecond);
    this.httpClient = axios.create();
  }

  async get(url, config) {
    return this.limit(() => this.httpClient.get(url, config));
  }

  async post(url, data, config) {
    return this.limit(() => this.httpClient.post(url, data, config));
  }
}

module.exports = RateLimitedClient;
```

### 2. Respetar Rate Limit Headers

```javascript
// ✅ RECOMENDADO: Monitorear headers de rate limit
httpClient.interceptors.response.use(
  (response) => {
    const remaining = response.headers['x-ratelimit-remaining'];
    const resetTime = response.headers['x-ratelimit-reset'];

    if (remaining && parseInt(remaining) < 10) {
      logger.warn('Rate limit approaching', {
        remaining,
        resetTime
      });
    }

    return response;
  },
  (error) => {
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      logger.error('Rate limit exceeded', { retryAfter });
      // Implementar espera antes de reintentar
    }
    return Promise.reject(error);
  }
);
```

---

## Caching

### 1. Caché Simple en Memoria

```javascript
// src/services/cachedApiClient.js
const NodeCache = require('node-cache');

class CachedApiClient {
  constructor(ttl = 3600) { // Time to live en segundos
    this.cache = new NodeCache({ stdTTL: ttl });
    this.httpClient = axios.create();
  }

  async get(url, config = {}) {
    const cacheKey = `${url}:${JSON.stringify(config)}`;

    // Intentar obtener del caché
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Si no está en caché, hacer solicitud
    const response = await this.httpClient.get(url, config);

    // Guardar en caché
    this.cache.set(cacheKey, response.data);

    return response.data;
  }

  invalidate(pattern) {
    const keys = this.cache.keys();
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.cache.del(key);
      }
    });
  }
}

module.exports = CachedApiClient;
```

### 2. Caché con Redis (Para sistemas distribuidos)

```javascript
// src/services/redisCache.js
const redis = require('redis');

class RedisCache {
  constructor(redisUrl) {
    this.client = redis.createClient(redisUrl);
    this.ttl = 3600; // 1 hora
  }

  async get(key) {
    try {
      const cached = await this.client.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      logger.error('Redis get error', { key, error });
      return null;
    }
  }

  async set(key, value) {
    try {
      await this.client.setEx(key, this.ttl, JSON.stringify(value));
    } catch (error) {
      logger.error('Redis set error', { key, error });
    }
  }

  async invalidate(pattern) {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      logger.error('Redis invalidate error', { pattern, error });
    }
  }
}

module.exports = RedisCache;
```

---

## Logging y Monitoreo

### 1. Logging Estructurado

```javascript
// src/utils/logger.js
const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  }
});

module.exports = logger;
```

### 2. Middleware de Logging para HTTP

```javascript
// ✅ RECOMENDADO: Registrar todas las llamadas a APIs externas
httpClient.interceptors.request.use((config) => {
  config.metadata = { startTime: Date.now() };
  logger.info('API Request', {
    method: config.method.toUpperCase(),
    url: config.url,
    headers: sanitizeHeaders(config.headers)
  });
  return config;
});

httpClient.interceptors.response.use(
  (response) => {
    const duration = Date.now() - response.config.metadata.startTime;
    logger.info('API Response', {
      method: response.config.method.toUpperCase(),
      url: response.config.url,
      status: response.status,
      duration: `${duration}ms`
    });
    return response;
  },
  (error) => {
    const duration = Date.now() - error.config?.metadata?.startTime || 0;
    logger.error('API Error', {
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      status: error.response?.status,
      error: error.message,
      duration: `${duration}ms`
    });
    return Promise.reject(error);
  }
);

function sanitizeHeaders(headers) {
  const sanitized = { ...headers };
  if (sanitized['Authorization']) {
    sanitized['Authorization'] = 'Bearer [REDACTED]';
  }
  return sanitized;
}
```

---

## Testing

### 1. Mock de APIs Externas

```javascript
// tests/mocks/externalApi.js
const nock = require('nock');

function mockWeatherApi() {
  nock('https://api.weather.com')
    .get('/forecast?city=Madrid')
    .reply(200, {
      city: 'Madrid',
      temperature: 25,
      condition: 'Sunny'
    });
}

function mockPaymentGateway() {
  nock('https://api.payment.com')
    .post('/charge', { amount: 100 })
    .reply(400, { error: 'Invalid card' });
}

module.exports = { mockWeatherApi, mockPaymentGateway };
```

### 2. Tests de Integración

```javascript
// tests/services/externalApi.test.js
const { mockWeatherApi } = require('../mocks/externalApi');
const weatherService = require('../../src/services/weatherService');

describe('Weather Service', () => {
  beforeEach(() => {
    mockWeatherApi();
  });

  it('should fetch weather data successfully', async () => {
    const weather = await weatherService.getWeather('Madrid');
    
    expect(weather).toEqual({
      city: 'Madrid',
      temperature: 25,
      condition: 'Sunny'
    });
  });

  it('should handle API errors', async () => {
    nock('https://api.weather.com')
      .get('/forecast?city=Unknown')
      .reply(404, { error: 'City not found' });

    await expect(
      weatherService.getWeather('Unknown')
    ).rejects.toThrow('City not found');
  });
});
```

---

## Checklist de Implementación

- [ ] **Elija librería HTTP** (preferiblemente Axios)
- [ ] **Configure httpClient base** con timeouts y headers por defecto
- [ ] **Implemente manejo de errores** específico para cada tipo
- [ ] **Agregue retry logic** con backoff exponencial
- [ ] **Gestione autenticación** de forma segura (variables de entorno)
- [ ] **Implemente rate limiting** si la API lo requiere
- [ ] **Configure caching** según necesidades de datos frescos
- [ ] **Agregue logging estructurado** de todas las llamadas
- [ ] **Escriba tests** con mocks de APIs externas
- [ ] **Documente endpoints** consumidos y sus peculiaridades
- [ ] **Configure monitoreo** de latencias y errores
- [ ] **Implemente circuit breaker** para APIs críticas

---

## Recursos Recomendados

- [Documentación de Axios](https://axios-http.com/)
- [Testing con node-nock](https://github.com/nock/nock)
- [Pattern: Circuit Breaker](https://martinfowler.com/bliki/CircuitBreaker.html)
- [Best Practices HTTP Requests en Node.js](https://github.com/goldbergyoni/nodebestpractices)
