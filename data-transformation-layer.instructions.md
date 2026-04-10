---
description: Guía para diseñar e implementar una capa de transformación de datos en backend con patrones profesionales
applyTo: "**/*.{js,ts}"
weight: 70
---

# Capa de Transformación de Datos en Backend

## Conceptos Fundamentales

### 1. ¿Qué es una Capa de Transformación?

Una capa de transformación es responsable de convertir datos entre diferentes formatos:
- **Modelo de Base de Datos** → **Modelo de Entidad Interna** → **DTO (Data Transfer Object)**
- Serialización/Deserialización
- Validación de esquema
- Enriquecimiento y normalización de datos

```
┌─────────────────────────────────────────────────────┐
│                    Client/API                       │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────▼────────────┐
        │   TRANSFORMATION LAYER  │  ◄─── Encoders/Decoders
        │   - Serialization       │      DTOs
        │   - Validation          │      Mappers
        │   - Transformation      │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │   SERVICE LAYER         │
        │   - Business Logic      │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │   DATABASE LAYER        │
        │   - Models              │
        └─────────────────────────┘
```

### 2. Responsabilidades Clave

```javascript
// ✅ LA CAPA DE TRANSFORMACIÓN DEBE:
// - Convertir datos entre formatos
// - Validar estructura de datos
// - Sanitizar información sensible
// - Enriquecer datos con metadatos
// - Manejar errores de transformación

// ✅ LA CAPA DE TRANSFORMACIÓN NO DEBE:
// - Contener lógica de negocio
// - Acceder directamente a la base de datos
// - Tomar decisiones sobre el flujo de datos
```

---

## Patrones de Implementación

### 1. Data Transfer Objects (DTOs)

```javascript
// src/dto/UserDTO.js
class UserDTO {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.name = data.name;
    this.createdAt = data.createdAt;
    // NO incluir datos sensibles como password
  }

  static fromEntity(userEntity) {
    return new UserDTO({
      id: userEntity.id,
      email: userEntity.email,
      name: userEntity.name,
      createdAt: userEntity.createdAt
    });
  }

  static fromEntities(users) {
    return users.map(user => UserDTO.fromEntity(user));
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      createdAt: this.createdAt
    };
  }
}

module.exports = UserDTO;
```

### 2. Mappers (Transformadores)

```javascript
// src/mappers/userMapper.js
class UserMapper {
  // ✅ RECOMENDADO: Transformar de Entity → DTO
  static toPersistence(user) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.passwordHash,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  // ✅ RECOMENDADO: Transformar de DTO → Entity
  static toDomain(raw) {
    return {
      id: raw.id,
      email: raw.email,
      name: raw.name,
      passwordHash: raw.password,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt
    };
  }

  // ✅ RECOMENDADO: Transformar Entity → Response DTO
  static toDTO(user) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
      // NO incluir passwordHash
    };
  }

  // ✅ RECOMENDADO: Lote de transformaciones
  static toDTOs(users) {
    return users.map(user => this.toDTO(user));
  }
}

module.exports = UserMapper;
```

### 3. Validadores de Esquema

```javascript
// src/validators/userValidator.js
const Joi = require('joi');

class UserValidator {
  // ✅ RECOMENDADO: Definir esquemas centralmente
  static createUserSchema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Email debe ser válido',
        'any.required': 'Email es requerido'
      }),
    name: Joi.string()
      .min(2)
      .max(100)
      .required(),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[A-Za-z])(?=.*\d)/)
      .required()
      .messages({
        'string.pattern.base': 'Password debe contener letras y números'
      })
  });

  static updateUserSchema = Joi.object({
    email: Joi.string().email(),
    name: Joi.string().min(2).max(100),
    currentPassword: Joi.string().when('newPassword', {
      is: Joi.exist(),
      then: Joi.required()
    })
  }).min(1);

  static validate(data, schema) {
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.reduce((acc, detail) => {
        acc[detail.path[0]] = detail.message;
        return acc;
      }, {});
      throw new ValidationError(errors);
    }

    return value;
  }

  static validateCreate(data) {
    return this.validate(data, this.createUserSchema);
  }

  static validateUpdate(data) {
    return this.validate(data, this.updateUserSchema);
  }
}

module.exports = UserValidator;
```

---

## Flujos de Transformación

### 1. Entrada de Datos (Request → Internal)

```javascript
// src/transformers/requestTransformer.js
class RequestTransformer {
  // ✅ RECOMENDADO: Pipeline de validación y transformación
  static async transformCreateUserRequest(body) {
    // Paso 1: Validar estructura
    const validated = UserValidator.validateCreate(body);

    // Paso 2: Normalizar datos
    const normalized = {
      ...validated,
      email: validated.email.toLowerCase().trim(),
      name: validated.name.trim()
    };

    // Paso 3: Sanitizar (si es necesario)
    const sanitized = this.sanitizeInput(normalized);

    // Paso 4: Enriquecer con metadatos
    const enriched = {
      ...sanitized,
      createdAt: new Date(),
      createdBy: 'system'
    };

    return enriched;
  }

  static sanitizeInput(data) {
    // Remover caracteres especiales peligrosos
    return {
      ...data,
      name: this.escapeHTML(data.name)
    };
  }

  static escapeHTML(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}

module.exports = RequestTransformer;
```

### 2. Salida de Datos (Internal → Response)

```javascript
// src/transformers/responseTransformer.js
class ResponseTransformer {
  // ✅ RECOMENDADO: Transformar a formato de respuesta
  static toSuccessResponse(data, meta = {}) {
    return {
      success: true,
      data: this.transformData(data),
      meta: {
        timestamp: new Date().toISOString(),
        ...meta
      }
    };
  }

  static toErrorResponse(error, statusCode = 500) {
    return {
      success: false,
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message,
        details: error.details || null
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    };
  }

  static transformData(data) {
    if (Array.isArray(data)) {
      return data.map(item => UserMapper.toDTO(item));
    }
    return UserMapper.toDTO(data);
  }

  static toPaginatedResponse(items, total, page, limit) {
    return {
      success: true,
      data: items.map(item => UserMapper.toDTO(item)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    };
  }
}

module.exports = ResponseTransformer;
```

### 3. Transformación Entre Capas

```javascript
// src/services/userService.js
class UserService {
  constructor(userRepository, userValidator, requestTransformer) {
    this.userRepository = userRepository;
    this.userValidator = userValidator;
    this.requestTransformer = requestTransformer;
  }

  async createUser(requestData) {
    // Paso 1: Transformar entrada
    const transformedData = await this.requestTransformer
      .transformCreateUserRequest(requestData);

    // Paso 2: Lógica de negocio
    const newUser = await this.userRepository.create(transformedData);

    // Paso 3: Transformar salida
    return UserMapper.toDTO(newUser);
  }

  async getUserById(id) {
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      throw new Error('User not found');
    }

    return UserMapper.toDTO(user);
  }

  async listUsers(page = 1, limit = 10) {
    const { items, total } = await this.userRepository.list(page, limit);
    
    return {
      items: UserMapper.toDTOs(items),
      total,
      page,
      limit
    };
  }
}

module.exports = UserService;
```

---

## Gestión de Casos Especiales

### 1. Datos Sensibles

```javascript
// src/transformers/sensitiveDataTransformer.js
class SensitiveDataTransformer {
  // ✅ RECOMENDADO: Validar acceso basado en rol
  static toDTO(user, authRole = 'user') {
    const dto = {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    };

    // Solo admin puede ver información interna
    if (authRole === 'admin') {
      dto.lastLogin = user.lastLogin;
      dto.status = user.status;
    }

    return dto;
  }

  // ✅ RECOMENDADO: Enmascara información sensible en logs
  static redactForLogging(user) {
    return {
      ...user,
      email: this.maskEmail(user.email),
      password: '[REDACTED]'
    };
  }

  static maskEmail(email) {
    const [name, domain] = email.split('@');
    const masked = name.substring(0, 2) + '*'.repeat(name.length - 2);
    return `${masked}@${domain}`;
  }
}

module.exports = SensitiveDataTransformer;
```

### 2. Transformación Condicional

```javascript
// src/transformers/conditionalTransformer.js
class ConditionalTransformer {
  // ✅ RECOMENDADO: Transformación basada en contexto
  static transformUser(user, context = {}) {
    const { includeDetails = false, format = 'json' } = context;

    let transformed = this.baseTransform(user);

    if (includeDetails) {
      transformed = this.addDetails(transformed, user);
    }

    if (format === 'csv') {
      transformed = this.toCsv(transformed);
    }

    return transformed;
  }

  static baseTransform(user) {
    return {
      id: user.id,
      email: user.email,
      name: user.name
    };
  }

  static addDetails(base, user) {
    return {
      ...base,
      phone: user.phone,
      address: user.address,
      preferences: user.preferences
    };
  }

  static toCsv(obj) {
    return Object.values(obj).join(',');
  }
}

module.exports = ConditionalTransformer;
```

### 3. Transformación de Colecciones

```javascript
// src/transformers/collectionTransformer.js
class CollectionTransformer {
  // ✅ RECOMENDADO: Batch transformations eficientes
  static transformBatch(items, transformer, batchSize = 100) {
    const results = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const transformed = batch.map(item => transformer(item));
      results.push(...transformed);
    }
    
    return results;
  }

  // ✅ RECOMENDADO: Streaming para datos grandes
  *transformStream(items, transformer) {
    for (const item of items) {
      yield transformer(item);
    }
  }

  // ✅ RECOMENDADO: Agrupar transformados
  static groupTransformed(items, groupByField) {
    return items.reduce((acc, item) => {
      const key = item[groupByField];
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }
}

module.exports = CollectionTransformer;
```

---

## Integración con Express

### 1. Middleware de Transformación

```javascript
// src/middleware/transformationMiddleware.js
const ResponseTransformer = require('../transformers/responseTransformer');

const transformRequest = (schema) => {
  return async (req, res, next) => {
    try {
      const validated = await schema.validateAsync(req.body);
      req.transformedBody = validated;
      next();
    } catch (error) {
      res.status(400).json(
        ResponseTransformer.toErrorResponse(error, 400)
      );
    }
  };
};

const transformResponse = (req, res, next) => {
  // Override res.json para transformar automáticamente
  const originalJson = res.json.bind(res);
  
  res.json = function(data) {
    if (data.success === false) {
      return originalJson(data);
    }
    
    const transformed = ResponseTransformer.toSuccessResponse(data);
    return originalJson(transformed);
  };
  
  next();
};

module.exports = { transformRequest, transformResponse };
```

### 2. Controllers con Transformación

```javascript
// src/controllers/userController.js
class UserController {
  constructor(userService, responseTransformer) {
    this.userService = userService;
    this.responseTransformer = responseTransformer;
  }

  async createUser(req, res, next) {
    try {
      const user = await this.userService.createUser(req.transformedBody);
      
      res.status(201).json(
        this.responseTransformer.toSuccessResponse(user, {
          message: 'User created successfully'
        })
      );
    } catch (error) {
      next(error);
    }
  }

  async getUser(req, res, next) {
    try {
      const user = await this.userService.getUserById(req.params.id);
      
      res.json(
        this.responseTransformer.toSuccessResponse(user)
      );
    } catch (error) {
      next(error);
    }
  }

  async listUsers(req, res, next) {
    try {
      const page = parseInt(req.query.page || 1);
      const limit = parseInt(req.query.limit || 10);
      
      const result = await this.userService.listUsers(page, limit);
      
      res.json(
        this.responseTransformer.toPaginatedResponse(
          result.items,
          result.total,
          page,
          limit
        )
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
```

---

## Testing de Transformadores

```javascript
// src/transformers/__tests__/userMapper.test.js
const UserMapper = require('../userMapper');

describe('UserMapper', () => {
  describe('toDTO', () => {
    it('should exclude sensitive data', () => {
      const user = {
        id: 1,
        email: 'user@example.com',
        name: 'John Doe',
        passwordHash: 'hashed_password'
      };

      const dto = UserMapper.toDTO(user);

      expect(dto).toEqual({
        id: 1,
        email: 'user@example.com',
        name: 'John Doe'
      });
      expect(dto).not.toHaveProperty('passwordHash');
    });

    it('should handle null values gracefully', () => {
      const user = {
        id: 1,
        email: 'user@example.com',
        name: null
      };

      const dto = UserMapper.toDTO(user);
      expect(dto.name).toBeNull();
    });
  });

  describe('toDTOs', () => {
    it('should transform multiple users', () => {
      const users = [
        { id: 1, email: 'user1@example.com', name: 'User 1', passwordHash: 'hash1' },
        { id: 2, email: 'user2@example.com', name: 'User 2', passwordHash: 'hash2' }
      ];

      const dtos = UserMapper.toDTOs(users);

      expect(dtos).toHaveLength(2);
      expect(dtos[0]).not.toHaveProperty('passwordHash');
    });
  });
});
```

---

## Checklist de Implementación

- [ ] **Definir DTOs** para cada entidad principal
- [ ] **Crear Mappers** entity ↔ DTO
- [ ] **Implementar Validadores** de entrada
- [ ] **Crear Transformadores** request/response
- [ ] **Manejar datos sensibles** correctamente
- [ ] **Implementar manejo de errores** en transformación
- [ ] **Agregar logging** de transformaciones
- [ ] **Crear tests** unitarios de mappers
- [ ] **Documentar esquemas** de entrada/salida
- [ ] **Implementar versionado** de DTOs si es necesario

---

## Mejores Prácticas

### 1. Separación de Responsabilidades

```javascript
// ✅ CORRECTO: Cada transformador con responsabilidad clara
- UserMapper: Entity ↔ DTO
- UserValidator: Validación de esquema
- RequestTransformer: Request → Internal
- ResponseTransformer: Internal → Response

// ❌ INCORRECTO: Lógica mezclada en un solo clase
class UserTransformer {
  // Valida, transforma, serializa, deserializa...
}
```

### 2. Immutabilidad

```javascript
// ✅ RECOMENDADO: No mutar datos originales
static toDTO(user) {
  return {
    ...user,
    password: undefined
  };
}

// ❌ EVITAR: Mutar objeto original
static toDTO(user) {
  delete user.password;
  return user;
}
```

### 3. Manejo de Errores

```javascript
// ✅ RECOMENDADO: Errores descriptivos
class TransformationError extends Error {
  constructor(message, field, value) {
    super(message);
    this.field = field;
    this.value = value;
  }
}

// Uso
if (!email.includes('@')) {
  throw new TransformationError(
    'Invalid email format',
    'email',
    email
  );
}
```

---

## Recursos Recomendados

- [Martin Fowler - Data Transfer Object](https://martinfowler.com/eaaCatalog/dataTransferObject.html)
- [SOLID Principles - Single Responsibility](https://en.wikipedia.org/wiki/Single-responsibility_principle)
- [Data Mapping Patterns](https://martinfowler.com/bliki/MapperPattern.html)
- [Request/Response Transformation Best Practices](https://restfulapi.net/resource-naming)
