# PDF Reader FastAPI Project

Un proyecto de FastAPI para procesar documentos PDF con un endpoint de prueba.

## Instalación

1. Crear un entorno virtual (recomendado):

```bash
python -m venv venv
```

2. Activar el entorno virtual:

- En Windows:

```bash
venv\Scripts\activate
```

- En macOS/Linux:

```bash
source venv/bin/activate
```

3. Instalar las dependencias:

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

Endpoint raíz que devuelve información básica de la API.

### GET /test

Endpoint de prueba que acepta los siguientes query parameters:

- **poble** (string, requerido): Nombre del pueblo
- **informe** (string, requerido): Tipo de informe
- **pag** (integer, requerido): Número de página (debe ser >= 1)

#### Ejemplo de uso:

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
pdf-reader/
│
├── main.py              # Aplicación principal de FastAPI
├── requirements.txt     # Dependencias del proyecto
└── README.md           # Este archivo
```

## Tecnologías utilizadas

- **FastAPI**: Framework web moderno y rápido para construir APIs
- **Uvicorn**: Servidor ASGI para ejecutar aplicaciones FastAPI
- **Pydantic**: Validación de datos y serialización
