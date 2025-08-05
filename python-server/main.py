from fastapi import FastAPI, Query, HTTPException
from typing import Optional, List, Dict, Any
import uvicorn
import fitz  # PyMuPDF
import os
from pathlib import Path

# Crear la instancia de FastAPI
app = FastAPI(
    title="PDF Reader API",
    description="API para procesar documentos PDF con PyMuPDF",
    version="1.0.0"
)

# Configuración de directorios
DOCUMENTS_DIR = Path(__file__).parent / "documentos-parsear"
VALID_MUNICIPIOS = ["collbato", "santboi", "premia"]
VALID_INFORMES = ["a", "bens"]

def find_pdf_file(municipio: str, informe: str) -> Optional[Path]:
    """
    Busca el archivo PDF correspondiente al municipio e informe especificados
    """
    municipio_dir = DOCUMENTS_DIR / municipio
    if not municipio_dir.exists():
        return None
    
    # Buscar archivo con el patrón {municipio}_{informe}.pdf
    pdf_name = f"{municipio}_{informe}.pdf"
    pdf_path = municipio_dir / pdf_name
    
    if pdf_path.exists():
        return pdf_path
    
    return None

def extract_pdf_items(pdf_path: Path, page_num: Optional[int] = None) -> Dict[str, Any]:
    """
    Extrae items del PDF usando PyMuPDF
    
    Args:
        pdf_path: Ruta al archivo PDF
        page_num: Número de página específica (opcional)
    
    Returns:
        Diccionario con los items extraídos
    """
    try:
        doc = fitz.open(pdf_path)
        total_pages = len(doc)
        items = []
        
        # Determinar qué páginas procesar
        if page_num is not None:
            if page_num < 1 or page_num > total_pages:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Página {page_num} no válida. El documento tiene {total_pages} páginas"
                )
            pages_to_process = [page_num - 1]  # PyMuPDF usa índices base 0
        else:
            pages_to_process = range(total_pages)
        
        # Extraer items de las páginas especificadas
        for page_idx in pages_to_process:
            page = doc[page_idx]
            
            # Extraer texto
            text = page.get_text()
            
            # Extraer texto con posicionamiento
            text_dict = page.get_text("dict")
            
            # Extraer imágenes
            images = page.get_images()
            
            # Extraer enlaces
            links = page.get_links()
            
            page_items = {
                "page_number": page_idx + 1,
                "text": text,
                "text_blocks": [],
                "images": [],
                "links": []
            }
            
            # Procesar bloques de texto con coordenadas
            for block in text_dict["blocks"]:
                if "lines" in block:  # Es un bloque de texto
                    for line in block["lines"]:
                        for span in line["spans"]:
                            page_items["text_blocks"].append({
                                "text": span["text"],
                                "bbox": span["bbox"],  # [x0, y0, x1, y1]
                                "font": span["font"],
                                "size": span["size"],
                                "flags": span["flags"]
                            })
            
            # Procesar imágenes
            for img_index, img in enumerate(images):
                page_items["images"].append({
                    "index": img_index,
                    "xref": img[0],
                    "smask": img[1],
                    "width": img[2],
                    "height": img[3],
                    "bpc": img[4],
                    "colorspace": img[5],
                    "alt": img[6],
                    "name": img[7],
                    "filter": img[8]
                })
            
            # Procesar enlaces
            for link in links:
                page_items["links"].append({
                    "kind": link["kind"],
                    "from": link["from"],
                    "uri": link.get("uri", ""),
                    "page": link.get("page", "")
                })
            
            items.append(page_items)
        
        doc.close()
        
        return {
            "total_pages": total_pages,
            "processed_pages": len(pages_to_process),
            "items": items
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error procesando PDF: {str(e)}")

@app.get("/")
async def root():
    """
    Endpoint raíz que devuelve información básica de la API
    """
    return {
        "message": "PDF Reader API con PyMuPDF",
        "version": "1.0.0",
        "status": "running",
        "municipios_disponibles": VALID_MUNICIPIOS,
        "tipos_informe": VALID_INFORMES
    }

@app.get("/test")
async def test_endpoint(
    poble: str = Query(..., description="Nombre del pueblo (collbato, santboi, premia)"),
    informe: str = Query(..., description="Tipo de informe (a, bens)"),
    pag: Optional[int] = Query(None, description="Número de página específica (opcional)", ge=1)
):
    """
    Endpoint que procesa un PDF usando PyMuPDF
    
    Args:
        poble (str): Nombre del pueblo (collbato, santboi, premia)
        informe (str): Tipo de informe (a, bens)
        pag (int, optional): Número de página específica. Si no se proporciona, procesa todo el PDF
    
    Returns:
        dict: Items extraídos del PDF con PyMuPDF
    """
    
    # Validar municipio
    if poble not in VALID_MUNICIPIOS:
        raise HTTPException(
            status_code=400, 
            detail=f"Municipio '{poble}' no válido. Opciones disponibles: {VALID_MUNICIPIOS}"
        )
    
    # Validar informe
    if informe not in VALID_INFORMES:
        raise HTTPException(
            status_code=400, 
            detail=f"Informe '{informe}' no válido. Opciones disponibles: {VALID_INFORMES}"
        )
    
    # Buscar el archivo PDF
    pdf_path = find_pdf_file(poble, informe)
    if not pdf_path:
        raise HTTPException(
            status_code=404, 
            detail=f"No se encontró el archivo PDF para {poble}_{informe}.pdf"
        )
    
    # Extraer items del PDF
    pdf_items = extract_pdf_items(pdf_path, pag)
    
    return {
        "message": "PDF procesado correctamente",
        "parametros": {
            "poble": poble,
            "informe": informe,
            "pag": pag
        },
        "archivo": {
            "nombre": pdf_path.name,
            "ruta": str(pdf_path.relative_to(DOCUMENTS_DIR))
        },
        "resultado": pdf_items
    }

@app.get("/archivos")
async def list_available_files():
    """
    Lista todos los archivos PDF disponibles en el sistema
    """
    archivos_disponibles = []
    
    for municipio in VALID_MUNICIPIOS:
        municipio_dir = DOCUMENTS_DIR / municipio
        if municipio_dir.exists():
            for informe in VALID_INFORMES:
                pdf_path = find_pdf_file(municipio, informe)
                if pdf_path:
                    archivos_disponibles.append({
                        "municipio": municipio,
                        "informe": informe,
                        "archivo": pdf_path.name,
                        "ruta": str(pdf_path.relative_to(DOCUMENTS_DIR)),
                        "existe": True
                    })
                else:
                    archivos_disponibles.append({
                        "municipio": municipio,
                        "informe": informe,
                        "archivo": f"{municipio}_{informe}.pdf",
                        "ruta": f"{municipio}/{municipio}_{informe}.pdf",
                        "existe": False
                    })
    
    return {
        "archivos_disponibles": archivos_disponibles,
        "total_archivos": len([a for a in archivos_disponibles if a["existe"]]),
        "archivos_faltantes": len([a for a in archivos_disponibles if not a["existe"]])
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
