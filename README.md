# PDF Reader - Sistema de Análisis de Documentos

Un sistema completo para la extracción y análisis de datos de documentos PDF municipales, desarrollado con React/TypeScript en el frontend y Express/Node.js en el backend.

## 🚀 Características

- **Extracción de tablas PDF**: Procesamiento completo de documentos PDF con análisis de tablas estructuradas
- **Interfaz moderna**: Frontend desarrollado con React 19.1.0 y TypeScript, estilizado con Bootstrap 5.3.7
- **Múltiples municipios**: Soporte para Sant Boi de Lluçanès, Collbató y Premià de Dalt
- **Análisis avanzado**: Cálculo automático de totales, filtrado y ordenación de datos
- **Exportación CSV**: Descarga de datos procesados con índices originales y filtrados
- **Visualización responsive**: Tabla optimizada con scroll y posicionamiento sticky

## 🛠️ Tecnologías Utilizadas

### Frontend
- React 19.1.0
- TypeScript 5.8.3
- Vite 7.0.4
- Bootstrap 5.3.7
- Bootstrap Icons

### Backend
- Node.js 20.17.0
- Express 4.19.2
- pdf-parse 1.1.1
- pdf2json para procesamiento avanzado
- TypeScript para tipado estricto

## 📋 Prerrequisitos

### Opción 1: Desarrollo Local
- **Node.js 20.17.0** (requerido)
- npm (incluido con Node.js)

### Opción 2: Docker
- **Docker** y **Docker Compose**

### Opción 3: Firebase App Hosting
- **Firebase CLI**
- **Cuenta de Google Cloud Platform**

## 🔧 Instalación

### Opción 1: Con Docker (Más Simple)

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/pedronieto84/pdf-reader.git
   cd pdf-reader
   ```

2. **Ejecutar con Docker**
   ```bash
   docker-compose up --build
   ```

### Opción 2: Instalación Local

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/pedronieto84/pdf-reader.git
   cd pdf-reader
   ```

2. **Instalar dependencias del frontend**
   ```bash
   npm install
   ```

3. **Instalar dependencias del backend**
   ```bash
   cd server
   npm install
   cd ..
   ```

## 🚀 Ejecutar el Proyecto

### Opción 1: Con Docker (Recomendado - Más Simple)

```bash
# Clonar el repositorio
git clone https://github.com/pedronieto84/pdf-reader.git
cd pdf-reader

# Ejecutar con Docker Compose
docker-compose up --build
```

Esto iniciará automáticamente:
- **Backend** en `http://localhost:3001`
- **Frontend** en `http://localhost:5173`

Para detener los servicios:
```bash
docker-compose down
```

### Opción 3: Firebase App Hosting (Producción)

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Autenticarse con Firebase
firebase login

# Desplegar a Firebase App Hosting
firebase apphosting:backends:create
```

El proyecto se optimiza automáticamente para producción:
- Frontend se construye estáticamente y se sirve desde el backend
- Backend maneja tanto API como archivos estáticos
- Se adapta automáticamente al puerto dinámico de Cloud Run

### Opción 2: Desarrollo Local

#### 1. Iniciar el servidor backend

```bash
cd server
npm run dev
```

El servidor se ejecutará en `http://localhost:3001`

#### 2. Iniciar el frontend (en una nueva terminal)

Desde el directorio raíz del proyecto:

```bash
npm run dev
```

El frontend se ejecutará en `http://localhost:5173`

## 📁 Estructura del Proyecto

```
pdf-reader/
├── src/                          # Frontend React/TypeScript
│   ├── Pages/
│   │   └── TablaCompleta.tsx    # Componente principal de tabla
│   ├── assets/
│   │   └── documentos-parseo/   # Documentos PDF para procesar
│   └── ...
├── server/                       # Backend Express/TypeScript
│   ├── src/
│   │   ├── index.ts            # Servidor principal
│   │   ├── tableParserNew.ts   # Parser de tablas PDF
│   │   └── ...
│   └── package.json
├── package.json                 # Dependencias del frontend
└── README.md
```

## 🔄 API Endpoints

### `GET /extract-full-pdf-table`

Extrae y procesa una tabla completa de un documento PDF.

**Parámetros:**
- `which`: Municipio (`sant-boi-de-llucanes`, `collbato`, `premia-de-dalt`)
- `table`: Tipo de tabla (`relacio-bens`, `LlibreA`)

**Ejemplo:**
```
GET http://localhost:3001/extract-full-pdf-table?which=sant-boi-de-llucanes&table=relacio-bens
```

## 📊 Funcionalidades de la Interfaz

- **Selector de municipio**: Cambio dinámico entre diferentes municipios
- **Filtrado de datos**: Búsqueda en tiempo real en toda la tabla
- **Ordenación**: Click en headers para ordenar columnas ascendente/descendente
- **Totales automáticos**: Cálculo dinámico de sumas para columnas numéricas
- **Índices duales**: Seguimiento de posición original y filtrada de cada fila
- **Exportación CSV**: Descarga de datos con formato CSV incluyendo metadatos

## 🐛 Solución de Problemas

### Docker
- **Puertos ocupados**: Si los puertos 3001 o 5173 están ocupados, detén otros servicios o cambia los puertos en `docker-compose.yml`
- **Permisos en Windows**: Asegúrate de que Docker Desktop esté ejecutándose
- **Rebuild necesario**: Si cambias dependencias, ejecuta `docker-compose up --build`

### Desarrollo Local
- **El servidor no inicia**: Verificar que estás usando Node.js 20.17.0
- **Error de instalación**: Ejecutar `npm install` en ambos directorios (root y server)
- **Error de CORS**: El backend está configurado con CORS habilitado para `http://localhost:5173`
- **Documentos PDF no encontrados**: Verificar que los archivos PDF están en `src/assets/documentos-parseo/{municipio}/`

## 📝 Scripts Disponibles

### Docker (Recomendado)
- `docker-compose up --build` - Construir y ejecutar todo el proyecto
- `docker-compose up` - Ejecutar proyecto (sin rebuild)
- `docker-compose down` - Detener todos los servicios
- `docker-compose logs` - Ver logs de todos los servicios

### Frontend (desde root)
- `npm run dev` - Ejecutar en modo desarrollo
- `npm run build` - Construir para producción
- `npm run preview` - Previsualizar build de producción

### Backend (desde /server)
- `npm run dev` - Ejecutar servidor en modo desarrollo con hot-reload
- `npm run build` - Compilar TypeScript
- `npm start` - Ejecutar servidor compilado

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

**Pedro Nieto** - [pedronieto84](https://github.com/pedronieto84)

---

> **Nota**: Este proyecto fue desarrollado específicamente para el análisis de documentos municipales de la Diputación de Barcelona (DIBA).
