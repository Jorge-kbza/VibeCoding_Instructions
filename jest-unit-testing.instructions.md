---
description: Guía de testing unitario en backend Node.js con Jest, enfocada en funciones puras y servicios
applyTo: "**/*.{test,spec}.{js,ts}"
weight: 65
---

# Testing Unitario en Backend Node.js con Jest

## Configuración Inicial

### 1. Instalación y Setup

```bash
# Instalación de dependencias
npm install --save-dev jest @types/jest @jest/globals

# Para soporte de TypeScript (opcional)
npm install --save-dev ts-jest @types/node
```

### 2. Archivo jest.config.js

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/index.js'
  ],
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  // Cobertura mínima recomendada
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
```

### 3. package.json Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand"
  }
}
```

---

## Testing de Funciones Puras

### 1. Patrón Básico de Función Pura

```javascript
// src/utils/math.js
function add(a, b) {
  return a + b;
}

function multiply(a, b) {
  return a * b;
}

module.exports = { add, multiply };
```

### 2. Tests para Funciones Puras

```javascript
// src/utils/math.test.js
const { add, multiply } = require('./math');

describe('Math Utils', () => {
  describe('add', () => {
    it('should add two positive numbers', () => {
      expect(add(2, 3)).toBe(5);
    });

    it('should add negative numbers', () => {
      expect(add(-2, -3)).toBe(-5);
    });

    it('should handle zero', () => {
      expect(add(0, 0)).toBe(0);
      expect(add(5, 0)).toBe(5);
    });

    it('should add decimal numbers', () => {
      expect(add(1.5, 2.5)).toBeCloseTo(4, 1);
    });
  });

  describe('multiply', () => {
    it('should multiply two numbers', () => {
      expect(multiply(3, 4)).toBe(12);
    });

    it('should return zero when multiplying by zero', () => {
      expect(multiply(5, 0)).toBe(0);
    });
  });
});
```

### 3. Patrones Avanzados para Funciones Puras

```javascript
// src/utils/validators.js
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function calculateTotalPrice(items, taxRate = 0.10) {
  if (!Array.isArray(items) || items.length === 0) {
    return 0;
  }
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  return subtotal + subtotal * taxRate;
}

module.exports = { isValidEmail, calculateTotalPrice };
```

```javascript
// src/utils/validators.test.js
const { isValidEmail, calculateTotalPrice } = require('./validators');

describe('Validators', () => {
  describe('isValidEmail', () => {
    // ✅ RECOMENDADO: Usar test.each para casos múltiples similares
    it.each([
      ['user@example.com', true],
      ['invalid.email', false],
      ['test@domain.co.uk', true],
      ['@example.com', false],
      ['user@', false]
    ])('should validate email %s as %s', (email, expected) => {
      expect(isValidEmail(email)).toBe(expected);
    });
  });

  describe('calculateTotalPrice', () => {
    it('should calculate price with default tax rate', () => {
      const items = [
        { price: 100 },
        { price: 50 }
      ];
      // Total: 150, con 10% tax: 165
      expect(calculateTotalPrice(items)).toBeCloseTo(165, 1);
    });

    it('should calculate price with custom tax rate', () => {
      const items = [{ price: 100 }];
      expect(calculateTotalPrice(items, 0.20)).toBeCloseTo(120, 1);
    });

    it('should return 0 for empty array', () => {
      expect(calculateTotalPrice([])).toBe(0);
    });

    it('should handle invalid input gracefully', () => {
      expect(calculateTotalPrice(null)).toBe(0);
      expect(calculateTotalPrice(undefined)).toBe(0);
    });
  });
});
```

---

## Testing de Servicios

### 1. Estructura de Servicio Simple

```javascript
// src/services/userService.js
class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async getUserById(id) {
    if (!id) {
      throw new Error('User ID is required');
    }
    
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      throw new Error(`User not found: ${id}`);
    }
    
    return this.sanitizeUser(user);
  }

  async createUser(userData) {
    this.validateUserData(userData);
    
    const newUser = await this.userRepository.create(userData);
    return this.sanitizeUser(newUser);
  }

  sanitizeUser(user) {
    return {
      id: user.id,
      email: user.email,
      name: user.name
    };
  }

  validateUserData(userData) {
    if (!userData.email || !userData.name) {
      throw new Error('Email and name are required');
    }
  }
}

module.exports = UserService;
```

### 2. Tests con Mocks de Dependencias

```javascript
// src/services/userService.test.js
const UserService = require('./userService');

describe('UserService', () => {
  let userService;
  let mockUserRepository;

  // ✅ RECOMENDADO: Setup antes de cada test
  beforeEach(() => {
    // Crear mock de la dependencia
    mockUserRepository = {
      findById: jest.fn(),
      create: jest.fn()
    };

    userService = new UserService(mockUserRepository);
  });

  // ✅ RECOMENDADO: Limpiar mocks después de cada test
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserById', () => {
    it('should return sanitized user when found', async () => {
      const mockUser = {
        id: 1,
        email: 'user@example.com',
        name: 'John Doe',
        password: 'secret' // sensible data
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await userService.getUserById(1);

      expect(result).toEqual({
        id: 1,
        email: 'user@example.com',
        name: 'John Doe'
      });
      
      // ✅ RECOMENDADO: Verificar que se llamó correctamente
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(mockUserRepository.findById).toHaveBeenCalledTimes(1);
    });

    it('should throw error when user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.getUserById(1)).rejects.toThrow(
        'User not found: 1'
      );
    });

    it('should throw error when ID is missing', async () => {
      await expect(userService.getUserById(null)).rejects.toThrow(
        'User ID is required'
      );

      // Verificar que NO llamó al repository
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database connection failed');
      mockUserRepository.findById.mockRejectedValue(error);

      await expect(userService.getUserById(1)).rejects.toThrow(
        'Database connection failed'
      );
    });
  });

  describe('createUser', () => {
    it('should create user with valid data', async () => {
      const userData = { email: 'new@example.com', name: 'Jane' };
      const createdUser = { id: 2, ...userData };

      mockUserRepository.create.mockResolvedValue(createdUser);

      const result = await userService.createUser(userData);

      expect(result.id).toBe(2);
      expect(result.email).toBe('new@example.com');
      expect(mockUserRepository.create).toHaveBeenCalledWith(userData);
    });

    it('should throw error if email is missing', async () => {
      const invalidData = { name: 'Jane' };

      await expect(userService.createUser(invalidData)).rejects.toThrow(
        'Email and name are required'
      );

      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });
});
```

### 3. Testing con Jest.spyOn()

```javascript
// src/services/emailService.js
class EmailService {
  send(to, subject, body) {
    console.log(`Sending email to ${to}`);
    // Lógica de envío
    return true;
  }

  sendBulk(recipients, template) {
    recipients.forEach(recipient => {
      this.send(recipient, template.subject, template.body);
    });
  }
}

module.exports = EmailService;
```

```javascript
// src/services/emailService.test.js
const EmailService = require('./emailService');

describe('EmailService', () => {
  let emailService;

  beforeEach(() => {
    emailService = new EmailService();
  });

  // ✅ RECOMENDADO: Usar spyOn para monitorear métodos
  it('should send bulk emails', () => {
    const sendSpy = jest.spyOn(emailService, 'send').mockReturnValue(true);

    const recipients = ['user1@test.com', 'user2@test.com'];
    const template = { subject: 'Test', body: 'Hello' };

    emailService.sendBulk(recipients, template);

    expect(sendSpy).toHaveBeenCalledTimes(2);
    expect(sendSpy).toHaveBeenNthCalledWith(
      1,
      'user1@test.com',
      'Test',
      'Hello'
    );

    sendSpy.mockRestore();
  });

  // ✅ RECOMENDADO: Usar spyOn con console
  it('should log email sends', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    emailService.send('test@example.com', 'Subject', 'Body');

    expect(consoleSpy).toHaveBeenCalledWith(
      'Sending email to test@example.com'
    );

    consoleSpy.mockRestore();
  });
});
```

---

## Patrones Avanzados de Mocking

### 1. Mocking de Módulos

```javascript
// src/services/weatherService.js
const axios = require('axios');

class WeatherService {
  async getWeather(city) {
    const response = await axios.get(
      `https://api.weather.com/forecast?city=${city}`
    );
    return response.data;
  }
}

module.exports = WeatherService;
```

```javascript
// src/services/weatherService.test.js
jest.mock('axios'); // Mockear módulo antes de importar
const axios = require('axios');
const WeatherService = require('./weatherService');

describe('WeatherService', () => {
  let weatherService;

  beforeEach(() => {
    weatherService = new WeatherService();
    jest.clearAllMocks();
  });

  it('should fetch weather data', async () => {
    const mockWeather = {
      city: 'Madrid',
      temperature: 25,
      condition: 'Sunny'
    };

    // ✅ RECOMENDADO: Configurar mock resolver
    axios.get.mockResolvedValue({ data: mockWeather });

    const result = await weatherService.getWeather('Madrid');

    expect(result).toEqual(mockWeather);
    expect(axios.get).toHaveBeenCalledWith(
      'https://api.weather.com/forecast?city=Madrid'
    );
  });

  it('should handle API errors', async () => {
    axios.get.mockRejectedValue(new Error('API Error'));

    await expect(
      weatherService.getWeather('Madrid')
    ).rejects.toThrow('API Error');
  });
});
```

### 2. Manual Mocks

```
src/
  __mocks__/
    database.js
  services/
    userService.js
    userService.test.js
```

```javascript
// src/__mocks__/database.js
const database = {
  query: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn()
};

module.exports = database;
```

```javascript
// src/services/userService.test.js
jest.mock('../database');
const database = require('../database');

describe('UserService with manual mock', () => {
  it('should execute query', () => {
    database.query.mockResolvedValue([{ id: 1, name: 'User' }]);

    // Test aquí
  });
});
```

---

## Cobertura y Análisis

### 1. Checklist de Cobertura

```javascript
// ✅ TESTS DEBEN CUBRIR:
// - Casos exitosos (happy path)
// - Casos de error
// - Valores límite (edge cases)
// - Entradas inválidas
// - Estados especiales (null, undefined, etc.)

describe('CompleteService', () => {
  it('should handle happy path', () => {
    // Caso normal
  });

  it('should throw on invalid input', () => {
    // Validación
  });

  it('should handle edge cases', () => {
    // Límites
  });

  it('should return null gracefully', () => {
    // Null/undefined
  });
});
```

### 2. Generar Reporte de Cobertura

```bash
# Generar reporte HTML
npm run test:coverage

# Ver cobertura en terminal
npm run test:coverage -- --verbose
```

---

## Mejores Prácticas

### 1. Naming Convenciones

```javascript
// ✅ CORRECTO: Describir qué hace la función
describe('OrderService', () => {
  describe('calculateDiscount', () => {
    it('should apply 10% discount for orders over $100', () => {
      // ...
    });

    it('should return zero discount for orders under $50', () => {
      // ...
    });
  });
});

// ❌ INCORRECTO: Nombres genéricos
describe('Tests', () => {
  it('works', () => {
    // ...
  });
});
```

### 2. Assertiones Claras

```javascript
// ✅ RECOMENDADO: Assertiones específicas
expect(result).toBe(5);
expect(result).toBeGreaterThan(0);
expect(result).toContain('expected');
expect(result).toHaveProperty('id');

// ❌ EVITAR: Assertiones genéricas
expect(result).toBeTruthy(); // Muy vago
```

### 3. Testing de Async/Await

```javascript
// ✅ OPCIÓN 1: Usar async/await
it('should fetch data', async () => {
  const result = await service.fetchData();
  expect(result).toBeDefined();
});

// ✅ OPCIÓN 2: Retornar Promise (Jest espera)
it('should fetch data', () => {
  return service.fetchData().then(result => {
    expect(result).toBeDefined();
  });
});

// ❌ EVITAR: No esperar Promises
it('should fetch data', () => {
  service.fetchData(); // Falta esperar
  expect(result).toBeDefined();
});
```

### 4. Organización de Tests

```javascript
// src/services/__tests__/userService.test.js
// ✅ RECOMENDADO: Organizar por funcionalidad

describe('UserService', () => {
  let service;
  let mockRepository;

  beforeAll(() => {
    // Setup que aplica a todos los tests
  });

  beforeEach(() => {
    // Setup que se repite antes de cada test
    mockRepository = {};
    service = new UserService(mockRepository);
  });

  afterEach(() => {
    // Cleanup después de cada test
    jest.clearAllMocks();
  });

  describe('getUserById', () => {
    it('...', () => {});
  });

  describe('createUser', () => {
    it('...', () => {});
  });
});
```

### 5. Evitar Anti-patrones

```javascript
// ❌ ANTI-PATRÓN: Tests que dependen del orden
describe('Bad tests', () => {
  let state = {};

  it('first test', () => {
    state.id = 1; // Polluting global state
  });

  it('second test', () => {
    expect(state.id).toBe(1); // Depends on first test
  });
});

// ✅ CORRECTO: Tests aislados
describe('Good tests', () => {
  it('test 1', () => {
    const obj = { id: 1 };
    expect(obj.id).toBe(1);
  });

  it('test 2', () => {
    const obj = { id: 2 };
    expect(obj.id).toBe(2);
  });
});
```

---

## Debugging y Troubleshooting

### 1. Ejecutar Tests Específicos

```bash
# Un test file
jest userService.test.js

# Tests que coinciden con patrón
jest --testNamePattern="getUserById"

# Tests en modo watch
jest --watch

# Tests en modo debug interactivo
npm run test:debug
```

### 2. Aumentar Timeout

```javascript
// Test individual
it('should handle slow operation', async () => {
  const result = await slowOperation();
  expect(result).toBeDefined();
}, 10000); // 10 segundos

// O globalmente en jest.config.js
module.exports = {
  testTimeout: 10000
};
```

---

## Checklist de Implementación

- [ ] **Configure Jest** en package.json y jest.config.js
- [ ] **Cree estructura** de tests (\_\_tests\_\_ o .test.js)
- [ ] **Implemente tests** de funciones puras primero
- [ ] **Configure mocks** de dependencias
- [ ] **Use spyOn()** para métodos internos
- [ ] **Agregue tests** de casos límite
- [ ] **Genere reporte** de cobertura
- [ ] **Mantenga >70%** cobertura general
- [ ] **Documente** tests complejos
- [ ] **Ejecute tests** en CI/CD pipeline

---

## Recursos Recomendados

- [Jest Documentation](https://jestjs.io/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Jest Mock Functions](https://jestjs.io/docs/mock-function-api)
- [Testing Library](https://testing-library.com/)
