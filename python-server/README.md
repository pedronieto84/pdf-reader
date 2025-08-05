# PDF Reader FastAPI Project

Un proyecto de FastAPI para procesar documentos PDF usando PyMuPDF.

## Estructura de archivos

El proyecto espera que los documentos PDF estén organizados de la siguiente manera:

```
python-server/
├── documentos-parsear/
│   ├── collbato/
│   │   ├── collbato_a.pdf
│   │   └── collbato_bens.pdf
│   ├── santboi/
│   │   ├── santboi_a.pdf
│   │   └── santboi_bens.pdf
│   └── premia/
│       ├── premia_a.pdf
│       └── premia_bens.pdf
├── main.py
├── requirements.txt
└── README.md
```

## Instalación

1. Navegar al directorio del proyecto:

```bash
cd python-server
```

2. Crear un entorno virtual (recomendado):

```bash
python -m venv venv
```

3. Activar el entorno virtual:

- En Windows:

```bash
venv\Scripts\activate
```

- En macOS/Linux:

```bash
source venv/bin/activate
```

4. Instalar las dependencias:

```bash
pip install -r requirements.txt
```

## Ejecución

Para ejecutar el servidor de desarrollo:

```bash
python main.py
```

O usando uvicorn directamente:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

El servidor estará disponible en: http://localhost:8000

## Documentación de la API

Una vez que el servidor esté ejecutándose, puedes acceder a:

- **Documentación interactiva (Swagger UI)**: http://localhost:8000/docs
- **Documentación alternativa (ReDoc)**: http://localhost:8000/redoc
- **Esquema OpenAPI**: http://localhost:8000/openapi.json

## Endpoints

### GET /
Endpoint raíz que devuelve información básica de la API y los municipios/informes disponibles.

### GET /archivos
Lista todos los archivos PDF disponibles y faltantes en el sistema.

### GET /test
Procesa un PDF usando PyMuPDF y extrae todos sus elementos.

**Query parameters:**
- **poble** (string, requerido): Nombre del municipio (collbato, santboi, premia)
- **informe** (string, requerido): Tipo de informe (a, bens)
- **pag** (integer, opcional): Número de página específica. Si no se proporciona, procesa todo el PDF

#### Ejemplos de uso:

1. **Procesar todo el PDF:**
```
GET http://localhost:8000/test?poble=santboi&informe=a
```

2. **Procesar página específica:**
```
GET http://localhost:8000/test?poble=premia&informe=bens&pag=5
```

3. **Listar archivos disponibles:**
```
GET http://localhost:8000/archivos
```
GET http://localhost:8000/test?poble=Barcelona&informe=mensual&pag=1
```

#### Respuesta de ejemplo:

```json
{
  "message": "Parámetros recibidos correctamente",
  "data": {
    "poble": "Barcelona",
    "informe": "mensual",
    "pag": 1
  },
  "info": {
    "total_params": 3,
    "processed_at": "2025-08-05"
  }
}
```

## Estructura del proyecto

```
python-server/
│
├── main.py              # Aplicación principal de FastAPI
├── requirements.txt     # Dependencias del proyecto
└── README.md           # Este archivo
```

## Tecnologías utilizadas

- **FastAPI**: Framework web moderno y rápido para construir APIs
- **Uvicorn**: Servidor ASGI para ejecutar aplicaciones FastAPI
- **Pydantic**: Validación de datos y serialización
