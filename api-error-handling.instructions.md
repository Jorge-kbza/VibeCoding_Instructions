---
description: Buenas prácticas para manejo de errores en APIs REST con Node.js y Express
---

# API Error Handling Instructions (Node.js + Express)

## Objetivo
Definir una estrategia consistente, escalable y desacoplada para el manejo de errores en una API REST siguiendo arquitectura MVC.

---

## Principios Fundamentales

- **Centralización de errores:** Todos los errores deben ser gestionados por un middleware global.
- **Consistencia en respuestas:** Todas las respuestas de error deben seguir el mismo formato.
- **Separación de responsabilidades:** 
  - Los controladores NO deben manejar errores complejos.
  - La lógica de errores debe estar desacoplada del negocio.
- **No exponer detalles internos:** Nunca devolver stack traces o información sensible al cliente.

---

## Estructura recomendada
/middlewares
errorHandler.js

/utils
ApiError.js

---

## Formato de respuesta de error

Todas las respuestas deben seguir este formato:

```json
{
  "error": {
    "message": "Descripción clara del error",
    "status": 400
  }
}
```

Clase de Error personalizada

Crear una clase reutilizable para errores:

```javascript
class ApiError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

module.exports = ApiError;
```

---

Middleware global de errores

Debe existir un único middleware para manejar errores:

```javascript
module.exports = (err, req, res, next) => {
  const status = err.status || 500;

  res.status(status).json({
    error: {
      message: err.message || "Internal Server Error",
      status
    }
  });
};
```

---

Uso en Controladores
❌ NO hacer esto:

```javascript
try {
  // lógica
} catch (error) {
  res.status(500).json({ error: error.message });
}
```

---

✅ Hacer esto:

```javascript
const ApiError = require('../utils/ApiError');

const controller = async (req, res, next) => {
  try {
    // lógica
  } catch (error) {
    next(new ApiError("Error procesando la petición", 500));
  }
};
```

---

Manejo de errores en Servicios
Los servicios deben lanzar errores, no responder HTTP.

```javascript
if (!data) {
  throw new ApiError("No se encontraron datos", 404);
}
```

Errores comunes a contemplar
- Error al consumir API externa (ej: Open-Meteo)
- Datos inválidos o incompletos
- Timeouts
- Recursos no encontrados
- Errores internos

---

Buenas prácticas
- Usar next(error) siempre en controladores
- No duplicar lógica de manejo de errores
- Crear mensajes de error claros y útiles
- Diferenciar entre errores:
 -400 → cliente
 -404 → recurso no encontrado
 -500 → servidor

---

Qué NO hacer
❌ Manejar errores en cada controlador manualmente
❌ Enviar stack trace al cliente
❌ Mezclar lógica de negocio con manejo de errores
❌ Devolver errores inconsistentes

---
Integración con Express

Registrar el middleware SIEMPRE al final:

```javascript
app.use(errorHandler);
```

---

Resultado esperado
- Código limpio
- Controladores delgados
- Manejo de errores consistente
- Fácil mantenimiento y escalabilidad

---

Estas reglas deben aplicarse a todo el backend del proyecto.
