# 🐳 Docker y Docker Compose - Mejores Prácticas

Guía completa de mejores prácticas para escribir Dockerfiles y usar Docker Compose basada en la documentación oficial de Docker.

---

## 📋 Contenido

```
1. [Mejores Prácticas Generales](#mejores-prácticas-generales)
2. [Dockerfile - Mejores Prácticas](#dockerfile---mejores-prácticas)
3. [Docker Compose - Mejores Prácticas](#docker-compose---mejores-prácticas)
4. [Seguridad](#seguridad)
5. [Performance y Optimización](#performance-y-optimización)
6. [Troubleshooting](#troubleshooting)
```

---

## Mejores Prácticas Generales

### 1. Elegir la Imagen Base Correcta

#### ✅ RECOMENDADO
```dockerfile
# Alpine - Mínimo y ligero (~5MB)
FROM node:18-alpine

# Debian-based - Más completo
FROM node:18-bullseye-slim

# Imagen oficial - Confiable y auditada
FROM python:3.11-slim
```

#### ❌ EVITAR
```dockerfile
# Imágenes no oficiales o no verificadas
FROM randomimage:latest

# scratch (sin herramientas)
FROM scratch
```

**Por qué:**
- Las imágenes oficiales están auditadas por Docker
- Alpine es ~130MB más pequeña que versiones completas
- Usar `-slim` o `-alpine` reduce vulnerabilidades
- Reduce tiempo de descarga y construcción

### 2. Pinear Versiones de Bases

```dockerfile
# ✅ BIEN - Versión específica
FROM node:18.17.1-alpine

# ⚠️ ACEPTABLE - Tag menor
FROM node:18-alpine

# ❌ EVITAR - Siempre cambia
FROM node:latest
```

**Beneficios:**
- Reproducibilidad garantizada
- Evita cambios inesperados
- Auditoría clara de versiones
- Facilita debugging

### 3. Usar .dockerignore

```dockerignore
# Excluir archivos innecesarios
node_modules
npm-debug.log
__tests__
jest.config.js
.git
.gitignore
*.md
.env
.env.example
.DS_Store
dist
build
coverage
docs
```

**Ventajas:**
- Reduce tamaño del build context
- Acelera construcción
- Evita copiar archivos sensibles

---

## Dockerfile - Mejores Prácticas

### 1. Usar Multi-Stage Builds

#### ❌ INEFICIENTE (Una etapa)
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build
RUN npm run test

EXPOSE 3000
CMD ["npm", "start"]
```
**Problema:** La imagen final incluye todas las herramientas de build

#### ✅ EFICIENTE (Multi-stage)
```dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build
RUN npm run test

# Stage 2: Runtime (pequeño)
FROM node:18-alpine AS runtime

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["npm", "start"]
```

**Ventajas:**
- Imagen final 60-80% más pequeña
- Solo dependencias de producción
- Build más rápido
- Menor surface de ataque

### 2. Estructura Óptima del Dockerfile

```dockerfile
# Syntax version (siempre primera línea)
# syntax=docker/dockerfile:1

# FROM - Imagen base
FROM node:18-alpine

# LABEL - Metadatos
LABEL maintainer="tu@email.com"
LABEL version="1.0.0"
LABEL description="Weather API REST"

# ENV - Variables de entorno
ENV NODE_ENV=production
ENV PORT=3000

# WORKDIR - Directorio de trabajo
WORKDIR /app

# COPY primero lo que cambia menos frecuentemente
COPY package*.json ./

# RUN - Instalar dependencias
RUN npm ci --only=production

# COPY - Código de aplicación
COPY src ./src

# EXPOSE - Puerto
EXPOSE 3000

# HEALTHCHECK - Verificación de salud
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { if (res.statusCode !== 200) throw new Error(res.statusCode) })"

# CMD - Comando por defecto
CMD ["npm", "start"]
```

### 3. RUN - Mejores Prácticas

#### ❌ MENOS EFICIENTE
```dockerfile
RUN apt-get update
RUN apt-get install -y curl wget
RUN rm -rf /var/lib/apt/lists/*
```
**Problema:** Crea capas innecesarias, apt-get no se ejecuta cuando se espera

#### ✅ ÓPTIMO
```dockerfile
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    wget \
    && rm -rf /var/lib/apt/lists/*
```

**Reglas:**
- Combinar `apt-get update` y `apt-get install` en el mismo RUN
- Usar `--no-install-recommends` para reducir tamaño
- Ordenar paquetes alfabéticamente
- Limpiar cache (`rm -rf /var/lib/apt/lists/*`)

### 4. COPY vs ADD

```dockerfile
# ✅ PREFERIR - Copiar archivos simples
COPY package*.json ./
COPY src ./src

# ✅ USAR ADD cuando necesites:
# - Descargar archivos remotos
# - Extraer archivos tar automáticamente
ADD https://example.com/file.tar.gz /tmp/
ADD ./local.tar.gz /app/

# ⚠️ Si solo necesitas copiar, usa COPY
```

**Recomendación:** Prefiere COPY, es más predecible

### 5. USER - Seguridad

```dockerfile
# ❌ EVITAR - Ejecutar como root
RUN npm start

# ✅ MEJOR - Usuario no-root
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs
USER nodejs
CMD ["npm", "start"]

# ❌ EVITAR sudo
RUN sudo npm install

# ✅ ALTERNATIVA - Cambiar permisos
RUN chown -R nodejs:nodejs /app
USER nodejs
```

### 6. WORKDIR - Rutas Absolutas

```dockerfile
# ❌ EVITAR - Rutas relativas
RUN cd /app && npm install

# ✅ SIEMPRE - Rutas absolutas con WORKDIR
WORKDIR /app
COPY . .
RUN npm install
```

### 7. ENTRYPOINT vs CMD

```dockerfile
# Distintos usos:

# 1. Solo aplicación
CMD ["npm", "start"]

# 2. Aplicación con parámetros predeterminados
ENTRYPOINT ["npm"]
CMD ["start"]

# 3. Script de entrada personalizando
COPY ./docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["npm", "start"]
```

### 8. Ejemplo Completo - Dockerfile Optimizado

```dockerfile
# syntax=docker/dockerfile:1

# ========== BUILD STAGE ==========
FROM node:18-alpine AS builder

LABEL maintainer="devteam@example.com"
LABEL version="1.0.0"

WORKDIR /build

# Copiar package files
COPY package*.json ./

# Instalar dependencias de build
RUN npm ci

# Copiar fuente
COPY src ./src
COPY tsconfig.json ./

# Build
RUN npm run build

# Tests
RUN npm run test --if-present

# ========== RUNTIME STAGE ==========
FROM node:18-alpine

LABEL maintainer="devteam@example.com"
LABEL description="Production Weather API"

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar solo dependencias de prod
RUN npm ci --omit=dev && \
    npm cache clean --force

# Copiar build del stage anterior
COPY --from=builder /build/dist ./dist

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/app.js"]
```

---

## Docker Compose - Mejores Prácticas

### 1. Estructura Básica

```yaml
# Usar versión 3.9+
version: '3.9'

services:
  weather-api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: weather-api
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 5s
```

### 2. Redes Personalizadas

```yaml
version: '3.9'

services:
  api:
    image: api:latest
    networks:
      - backend

  database:
    image: postgres:15-alpine
    networks:
      - backend
      
  cache:
    image: redis:7-alpine
    networks:
      - backend

networks:
  backend:
    driver: bridge
```

**Beneficios:**
- Los servicios se descubren automáticamente por nombre
- Mayor seguridad (aislamiento de red)
- Comunicación más eficiente

### 3. Volúmenes - Tres Tipos

```yaml
version: '3.9'

services:
  api:
    image: api:latest
    volumes:
      # 1. Named volume (persistencia)
      - api-logs:/app/logs
      
      # 2. Bind mount (desarrollo)
      - ./src:/app/src
      
      # 3. Tmpfs (temporal)
      - type: tmpfs
        target: /tmp

volumes:
  api-logs:
    driver: local
```

### 4. Composición: Reutilizar Configuración

```yaml
# docker-compose.base.yml
version: '3.9'

services:
  base-service:
    image: node:18-alpine
    environment:
      NODE_ENV: production
    restart: unless-stopped

# docker-compose.yml
version: '3.9'

include:
  - docker-compose.base.yml

services:
  api:
    extends:
      service: base-service
    ports:
      - "3000:3000"
```

### 5. Variables de Entorno

```yaml
# docker-compose.yml (malas prácticas)
environment:
  - DB_PASSWORD=secret123  # ❌ NO!

# MEJOR: Usar .env
services:
  api:
    environment:
      - NODE_ENV=${NODE_ENV}
      - PORT=${PORT}
      - DB_HOST=${DB_HOST}
```

```bash
# .env (NO COMMITAR!)
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PASSWORD=securepassword
```

```bash
.env  # Agregar a .gitignore
```

### 6. Profiles - Para Diferentes Entornos

```yaml
version: '3.9'

services:
  api:
    image: api:latest
    profiles: ["prod", "dev"]
    
  debugger:
    image: debugger:latest
    profiles: ["debug"]
    
  database:
    image: postgres:15
    profiles: ["dev", "test"]
```

```bash
# Ejecutar solo producción
docker-compose --profile prod up

# Incluir debug
docker-compose --profile dev --profile debug up

# Sin profiles (servicios sin profile)
docker-compose up api
```

### 7. Ejemplo Completo - docker-compose.yml

```yaml
version: '3.9'

# Servicios para producción
services:
  weather-api:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        NODE_VERSION: 18
    container_name: weather-api
    ports:
      - "${API_PORT:-3000}:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
      API_TIMEOUT: 30000
    restart: unless-stopped
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  app-network:
    driver: bridge

# Volúmenes nombrados
volumes:
  api-logs:
```

### 8. docker-compose.dev.yml - Para Desarrollo

```yaml
version: '3.9'

services:
  weather-api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
      DEBUG: "app:*"
    volumes:
      # Hot-reload de código
      - ./src:/app/src
      - ./package.json:/app/package.json
    command: npm run dev
    stdin_open: true
    tty: true
```

---

## Seguridad

### 1. Escanear Vulnerabilidades

```bash
# Con Docker Scout
docker scout cves weather-api:latest

# Con Trivy (herramienta independiente)
trivy image weather-api:latest

# Con docker scan
docker scan weather-api:latest
```

### 2. No Incluir Secretos

```dockerfile
# ❌ NUNCA
RUN echo "PASSWORD=secret123" > /app/.env

# ❌ NUNCA en argumentos
ARG DB_PASSWORD=secret123

# ✅ MEJOR: Usar Docker secrets o variables en runtime
CMD npm start
```

### 3. Usar Docker Secrets (Swarm/Kubernetes)

```yaml
version: '3.9'

services:
  api:
    image: api:latest
    secrets:
      - db_password
    environment:
      DB_PASSWORD_FILE: /run/secrets/db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

### 4. Limitaciones de Recursos

```yaml
version: '3.9'

services:
  api:
    image: api:latest
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

---

## Performance y Optimización

### 1. Caché de Builds

```dockerfile
# Orden importa - Lo que cambia menos primero
FROM node:18-alpine

WORKDIR /app

# 1. Archivos que rara vez cambian
COPY package*.json ./
RUN npm ci --only=production

# 2. Código que cambia frecuentemente
COPY src ./src

# 3. Build/config que puede cambiar
COPY tsconfig.json .env* ./
```

### 2. Rebuild Fresco

```bash
# Obtener imágenes base actualizadas
docker build --pull -t api:latest .

# Rebuild sin cache (todas las capas nuevas)
docker build --pull --no-cache -t api:latest .

# Recomendación: hacer esto regularmente en CI/CD
```

### 3. Tamaño de Imagen

```bash
# Analizar tamaño de capas
docker history api:latest

# Tres datos principales:
# - Alpine < Debian-slim < Debian-full
# - Multi-stage reduce 50-90%
# - Limpiar caches (RUN ... && rm -rf /var/lib/apt/lists/*)
```

---

## Troubleshooting

### 1. Build Falla

```bash
# Ver logs completos
docker-compose build --no-cache --progress=plain 2>&1 | tail -100

# Inspeccionar imagen intermedia
docker run -it <imagen-intermedia> /bin/sh

# Verificar Dockerfile
docker run --rm -i hadolint/hadolint < Dockerfile
```

### 2. Container No Inicia

```bash
# Ver logs
docker logs <container-id>
docker logs -f --tail 50 <container-id>

# Ejecutar interactivo
docker run -it --entrypoint /bin/sh api:latest

# Verificar proceso
docker top <container-id>
```

### 3. Puerto en Uso

```bash
# Ver puertos en uso (Linux/Mac)
lsof -i :3000

# Ver puertos en uso (Windows)
netstat -ano | findstr :3000

# Cambiar puerto en docker-compose.yml
ports:
  - "3001:3000"  # Local:Container
```

### 4. Problemas de Permisos

```bash
# Si archivos montados no son editables
sudo chown -R $USER:$USER ./src

# O en docker-compose, usar usuario
user: "${USER_ID}:${GROUP_ID}"
```

### 5. Limpiar Todo

```bash
# Detener todos los containers
docker-compose down

# Remover imágenes
docker rmi weather-api:latest

# Limpiar volúmenes (⚠️ PÉRDIDA DE DATOS)
docker volume prune

# Limpiar todo (sistemas, imágenes no usadas, etc)
docker system prune -a
```

---

## Checklist Final

### Antes de Deployar

- [ ] Dockerfile usa archivo base versionado (no `latest`)
- [ ] Multi-stage si hay build tools
- [ ] .dockerignore excluye node_modules, .git, tests, etc.
- [ ] USER no-root
- [ ] HEALTHCHECK configurado
- [ ] ENV variables usadas en runtime (no hardcodeadas)
- [ ] Logging configurado
- [ ] Límites de recursos en compose
- [ ] docker-compose usa versión 3.9+
- [ ] Secretos NO en .env commiteado
- [ ] Escaneo de vulnerabilidades pasado
- [ ] Imagen probada localmente
- [ ] Documentación de uso actualizada

### Testing

```bash
# 1. Build
docker build -t api:test .

# 2. Escaneo
docker scout cves api:test

# 3. Ejecutar
docker run -p 3000:3000 api:test

# 4. Health check
curl http://localhost:3000/health

# 5. Con compose
docker-compose up --build
docker-compose exec api npm test
```

---

## Referencias

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Dockerfile Reference](https://docs.docker.com/reference/dockerfile/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Docker Security](https://docs.docker.com/engine/security/)
- [Docker Scout](https://docs.docker.com/scout/)

---

**última actualización:** Abril 2026

*Basado en documentación oficial de Docker y mejores prácticas de la comunidad*
