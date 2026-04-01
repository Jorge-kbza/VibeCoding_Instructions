# Instrucciones de Arquitectura MVC para Backend (Actualizado 2026)

## Principios Fundamentales
- **Separación de responsabilidades:** Divide la aplicación en tres componentes principales: Modelo, Vista y Controlador.
- **Dominio independiente:** El Modelo debe contener la lógica de negocio y los datos, sin referencias a la Vista ni al Controlador.
- **Presentación desacoplada:** La Vista solo muestra datos y nunca contiene lógica de negocio.
- **Control centralizado:** El Controlador gestiona la entrada del usuario, coordina el Modelo y la Vista, y contiene la lógica de flujo de la aplicación.

## Estructura Recomendada

```
/backend
  /models      # Lógica de negocio y acceso a datos
  /views       # Plantillas, serializadores o respuestas (no lógica de negocio)
  /controllers # Lógica de flujo, validaciones, orquestación
  /routes      # Definición de rutas y mapeo a controladores
  /services    # (Opcional) Lógica de dominio reutilizable
  /middlewares # (Opcional) Validaciones, autenticación, logging
```

## Qué DEBE tener una arquitectura MVC moderna
- **Modelos:**
  - Representan entidades y lógica de negocio.
  - Encapsulan validaciones de datos y reglas de negocio.
  - No contienen lógica de presentación ni acceso directo a la Vista.
- **Vistas:**
  - Renderizan datos recibidos del Modelo (o serializadores en APIs).
  - No contienen lógica de negocio ni manipulan datos directamente.
- **Controladores:**
  - Reciben y procesan la entrada del usuario (peticiones HTTP, eventos).
  - Llaman a los Modelos para manipular datos y a las Vistas para mostrar resultados.
  - No contienen lógica de negocio compleja (delegar a Modelos o Servicios).
- **Rutas:**
  - Definen los endpoints y asignan controladores.
- **Servicios (opcional):**
  - Encapsulan lógica de dominio reutilizable o integración con otros sistemas.
- **Middlewares (opcional):**
  - Validación, autenticación, logging, etc.

## Qué NO DEBE tener
- **Lógica de negocio en la Vista o en las Rutas.**
- **Acceso directo a la base de datos desde la Vista o el Controlador.**
- **Dependencias circulares entre Modelo, Vista y Controlador.**
- **Validaciones complejas en la Vista o en el Controlador (deben estar en el Modelo o Servicios).**
- **Código duplicado entre controladores o modelos.**
- **Acoplamiento entre la Vista y el Modelo (la Vista nunca debe modificar el Modelo directamente).**
- **Lógica de presentación en el Modelo.**

## Buenas Prácticas
- **Modelos:**
  - Mantenerlos independientes de la infraestructura (no dependientes de frameworks).
  - Incluir validaciones y reglas de negocio.
  - Usar ORM/ODM solo como capa de persistencia, no como lógica de negocio.
- **Vistas:**
  - Usar plantillas, serializadores o formatos de respuesta claros.
  - No acceder a la base de datos ni modificar datos.
- **Controladores:**
  - Ser delgados: delegar lógica compleja a Modelos o Servicios.
  - Manejar errores y validaciones de entrada.
- **Servicios:**
  - Encapsular lógica reutilizable o integración externa.
- **Middlewares:**
  - Usar para lógica transversal (autenticación, logging, etc.).
- **Rutas:**
  - Mantener simples, solo mapeo de endpoints a controladores.
- **Pruebas:**
  - Pruebas unitarias para Modelos y Servicios.
  - Pruebas de integración para Controladores y Rutas.
- **Documentación:**
  - Documentar endpoints, modelos y reglas de negocio.

## Ejemplo de Flujo
1. El usuario realiza una petición HTTP (View).
2. La ruta asigna la petición al controlador correspondiente.
3. El controlador valida la entrada y llama al Modelo o Servicio.
4. El Modelo manipula los datos y devuelve el resultado.
5. El controlador pasa el resultado a la Vista para renderizar la respuesta.

## Errores comunes a evitar
- Lógica de negocio en controladores o vistas.
- Modelos que dependen de la infraestructura o frameworks.
- Controladores que acceden directamente a la base de datos.
- Vistas que modifican el estado del Modelo.
- Falta de pruebas unitarias en Modelos y Servicios.
- No documentar la arquitectura ni los endpoints.

## Recursos recomendados
- [Martin Fowler: GUI Architectures & MVC](https://martinfowler.com/eaaDev/uiArchs.html)
- [MDN: MVC](https://developer.mozilla.org/en-US/docs/Glossary/MVC)
- [GeeksforGeeks: MVC Design Pattern](https://www.geeksforgeeks.org/mvc-design-pattern/)

---

**Esta instrucción debe aplicarse a todo el backend del proyecto.**

> Si tienes dudas sobre cómo estructurar un caso concreto, consulta estos principios y evita mezclar responsabilidades entre capas.
