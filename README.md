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

- **Node.js 20.17.0** (requerido)
- npm (incluido con Node.js)

## 🔧 Instalación

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

### 1. Iniciar el servidor backend

```bash
cd server
npm run dev
```

El servidor se ejecutará en `http://localhost:3001`

### 2. Iniciar el frontend (en una nueva terminal)

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
│   │   ├── tableParserNew.ts   # Parser para Relació de Bienes
│   │   ├── tableParserLlibreA.ts # Parser para Llibre A
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

**Tipos de Tabla:**
- `relacio-bens`: Relació de Bienes (estructura con clasificación, quantitat, valores, etc.)
- `LlibreA`: Llibre A (estructura con inventari, secció, descripció, etc.)

**Ejemplos:**
```
# Relació de Bienes
GET http://localhost:3001/extract-full-pdf-table?which=sant-boi-de-llucanes&table=relacio-bens

# Llibre A
GET http://localhost:3001/extract-full-pdf-table?which=collbato&table=LlibreA
```

## 📊 Funcionalidades de la Interfaz

- **Selector de municipio**: Cambio dinámico entre diferentes municipios
- **Filtrado de datos**: Búsqueda en tiempo real en toda la tabla
- **Ordenación**: Click en headers para ordenar columnas ascendente/descendente
- **Totales automáticos**: Cálculo dinámico de sumas para columnas numéricas
- **Índices duales**: Seguimiento de posición original y filtrada de cada fila
- **Exportación CSV**: Descarga de datos con formato CSV incluyendo metadatos

## 🐛 Solución de Problemas

### El servidor no inicia
- Verificar que estás usando Node.js 20.17.0
- Ejecutar `npm install` en ambos directorios (root y server)

### Error de CORS
- El backend está configurado con CORS habilitado para `http://localhost:5173`

### Documentos PDF no encontrados
- Verificar que los archivos PDF están en `src/assets/documentos-parseo/{municipio}/`

## 📝 Scripts Disponibles

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
