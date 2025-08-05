from fastapi import FastAPI, Query
from typing import Optional
import uvicorn

# Crear la instancia de FastAPI
app = FastAPI(
    title="PDF Reader API",
    description="API para procesar documentos PDF",
    version="1.0.0"
)

@app.get("/")
async def root():
    """
    Endpoint raíz que devuelve información básica de la API
    """
    return {
        "message": "PDF Reader API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/test")
async def test_endpoint(
    poble: str = Query(..., description="Nombre del pueblo"),
    informe: str = Query(..., description="Tipo de informe"),
    pag: int = Query(..., description="Número de página", ge=1)
):
    """
    Endpoint de prueba que recibe parámetros de consulta
    
    Args:
        poble (str): Nombre del pueblo
        informe (str): Tipo de informe
        pag (int): Número de página (debe ser >= 1)
    
    Returns:
        dict: Diccionario con los parámetros recibidos y información adicional
    """
    return {
        "message": "Parámetros recibidos correctamente",
        "data": {
            "poble": poble,
            "informe": informe,
            "pag": pag
        },
        "info": {
            "total_params": 3,
            "processed_at": "2025-08-05"
        }
    }

# Configuración para ejecutar el servidor
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
