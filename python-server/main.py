from fastapi import FastAPI, Query, HTTPException
from typing import Optional, List, Dict, Any
import uvicorn
import fitz  # PyMuPDF
import os
from pathlib import Path
from datetime import datetime

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
    Extrae items del PDF usando PyMuPDF, incluyendo líneas horizontales gráficas
    
    Args:
        pdf_path: Ruta al archivo PDF
        page_num: Número de página específica (opcional)
    
    Returns:
        Diccionario con los items extraídos incluyendo líneas horizontales
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
        all_horizontal_lines = []  # Para recopilar líneas de todas las páginas procesadas
        
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
            
            # Extraer líneas horizontales gráficas
            horizontal_lines = []
            paths = page.get_drawings()
            
            for path_idx, path in enumerate(paths):
                # Analizar cada elemento del path
                for item in path["items"]:
                    # Buscar líneas (comando "l" = line to)
                    if item[0] == "l":  # Comando de línea
                        start_point = item[1]  # Punto inicial [x, y]
                        end_point = item[2]    # Punto final [x, y]
                        
                        # Calcular si es una línea horizontal (diferencia mínima en Y)
                        y_diff = abs(end_point[1] - start_point[1])
                        x_diff = abs(end_point[0] - start_point[0])
                        
                        # Considerar horizontal si la diferencia en Y es muy pequeña
                        # y la longitud en X es significativa
                        if y_diff <= 2 and x_diff >= 10:  # Tolerancia de 2 píxeles en Y, mínimo 10 en X
                            y_position = (start_point[1] + end_point[1]) / 2
                            horizontal_lines.append(y_position)
                    
                    # También buscar rectángulos que puedan ser líneas horizontales gruesas
                    elif item[0] == "re":  # Comando de rectángulo
                        rect = item[1]  # [x, y, width, height]
                        x, y, width, height = rect
                        
                        # Si el rectángulo es muy delgado en altura pero largo en anchura
                        # puede ser una línea horizontal gruesa
                        if height <= 5 and width >= 10:  # Altura máxima 5px, anchura mínima 10px
                            y_position = y + height/2
                            horizontal_lines.append(y_position)
            
            # Ordenar líneas por posición Y y eliminar duplicados cercanos
            horizontal_lines.sort()
            unique_lines = []
            tolerance = 3  # Tolerancia para considerar líneas duplicadas
            
            for y_pos in horizontal_lines:
                if not unique_lines or all(abs(y_pos - existing) > tolerance for existing in unique_lines):
                    unique_lines.append(round(y_pos, 2))
            
            # Agregar líneas de esta página a la colección global (con referencia de página)
            for y_pos in unique_lines:
                all_horizontal_lines.append({
                    "page": page_idx + 1,
                    "y_position": y_pos
                })
            
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
        
        # Preparar líneas horizontales para nivel superior
        if page_num is not None:
            # Si es una página específica, usar la estructura simple
            page_lines = [line["y_position"] for line in all_horizontal_lines if line["page"] == page_num]
            horizontal_lines_summary = {
                "number": len(page_lines),
                "yPositions": page_lines
            }
        else:
            # Si son todas las páginas, estructurar como array de objetos por página
            horizontal_lines_summary = []
            
            # Agrupar líneas por página
            pages_dict = {}
            for line in all_horizontal_lines:
                page_num_key = line["page"]
                if page_num_key not in pages_dict:
                    pages_dict[page_num_key] = []
                pages_dict[page_num_key].append(line["y_position"])
            
            # Crear array de objetos con pageNumber y horizontal_lines
            for page_number in sorted(pages_dict.keys()):
                y_positions = pages_dict[page_number]
                horizontal_lines_summary.append({
                    "pageNumber": page_number,
                    "horizontal_lines": {
                        "number": len(y_positions),
                        "yPositions": y_positions
                    }
                })
        
        return {
            "total_pages": total_pages,
            "horizontal_lines": horizontal_lines_summary,
            "processed_pages": len(pages_to_process),
            "items": items
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error procesando PDF: {str(e)}")

def extract_lines_from_page(pdf_path: Path, page_num: int) -> Dict[str, Any]:
    """
    Extrae las líneas gráficas horizontales (elementos dibujados) de una página específica del PDF
    
    Args:
        pdf_path: Ruta al archivo PDF
        page_num: Número de página específica (requerido)
    
    Returns:
        Diccionario con las líneas gráficas horizontales extraídas de la página
    """
    try:
        doc = fitz.open(pdf_path)
        total_pages = len(doc)
        
        # Validar que la página existe
        if page_num < 1 or page_num > total_pages:
            raise HTTPException(
                status_code=400, 
                detail=f"Página {page_num} no válida. El documento tiene {total_pages} páginas"
            )
        
        page_idx = page_num - 1  # PyMuPDF usa índices base 0
        page = doc[page_idx]
        
        # Extraer elementos gráficos (líneas dibujadas)
        horizontal_lines = []
        
        # Obtener paths (elementos gráficos) de la página
        paths = page.get_drawings()
        
        for path_idx, path in enumerate(paths):
            # Analizar cada elemento del path
            for item in path["items"]:
                # Buscar líneas (comando "l" = line to)
                if item[0] == "l":  # Comando de línea
                    start_point = item[1]  # Punto inicial [x, y]
                    end_point = item[2]    # Punto final [x, y]
                    
                    # Calcular si es una línea horizontal (diferencia mínima en Y)
                    y_diff = abs(end_point[1] - start_point[1])
                    x_diff = abs(end_point[0] - start_point[0])
                    
                    # Considerar horizontal si la diferencia en Y es muy pequeña
                    # y la longitud en X es significativa
                    if y_diff <= 2 and x_diff >= 10:  # Tolerancia de 2 píxeles en Y, mínimo 10 en X
                        line_info = {
                            "line_number": len(horizontal_lines) + 1,
                            "start_point": start_point,
                            "end_point": end_point,
                            "y_position": (start_point[1] + end_point[1]) / 2,  # Y promedio
                            "x_start": min(start_point[0], end_point[0]),
                            "x_end": max(start_point[0], end_point[0]),
                            "length": x_diff,
                            "thickness": path.get("width", 1.0),  # Grosor de la línea con valor por defecto
                            "color": path.get("color", None),   # Color si está disponible
                            "stroke": path.get("stroke", None), # Información de trazo
                            "bbox": [
                                min(start_point[0], end_point[0]),  # x0
                                min(start_point[1], end_point[1]),  # y0
                                max(start_point[0], end_point[0]),  # x1
                                max(start_point[1], end_point[1])   # y1
                            ]
                        }
                        horizontal_lines.append(line_info)
                
                # También buscar rectángulos que puedan ser líneas horizontales gruesas
                elif item[0] == "re":  # Comando de rectángulo
                    rect = item[1]  # [x, y, width, height]
                    x, y, width, height = rect
                    
                    # Si el rectángulo es muy delgado en altura pero largo en anchura
                    # puede ser una línea horizontal gruesa
                    if height <= 5 and width >= 10:  # Altura máxima 5px, anchura mínima 10px
                        line_info = {
                            "line_number": len(horizontal_lines) + 1,
                            "start_point": [x, y + height/2],
                            "end_point": [x + width, y + height/2],
                            "y_position": y + height/2,
                            "x_start": x,
                            "x_end": x + width,
                            "length": width,
                            "thickness": float(height),  # Asegurar que sea float
                            "type": "thick_rectangle",
                            "color": path.get("fill", path.get("color", None)),
                            "bbox": [x, y, x + width, y + height]
                        }
                        horizontal_lines.append(line_info)
        
        # Ordenar líneas por posición Y (de arriba hacia abajo)
        horizontal_lines.sort(key=lambda x: x["y_position"])
        
        # Renumerar después del ordenamiento
        for idx, line in enumerate(horizontal_lines):
            line["line_number"] = idx + 1
        
        # Información adicional sobre las líneas
        page_rect = page.rect
        
        doc.close()
        
        return {
            "page_number": page_num,
            "total_pages": total_pages,
            "extraction_mode": "horizontal_graphic_lines",
            "page_dimensions": {
                "width": page_rect.width,
                "height": page_rect.height
            },
            "lines_found": len(horizontal_lines),
            "horizontal_lines": horizontal_lines,
            "summary": {
                "total_lines": len(horizontal_lines),
                "average_length": sum(line["length"] for line in horizontal_lines) / len(horizontal_lines) if horizontal_lines else 0,
                "average_thickness": sum(line["thickness"] for line in horizontal_lines if line["thickness"] is not None) / len([line for line in horizontal_lines if line["thickness"] is not None]) if any(line["thickness"] is not None for line in horizontal_lines) else 0,
                "min_y_position": min(line["y_position"] for line in horizontal_lines) if horizontal_lines else 0,
                "max_y_position": max(line["y_position"] for line in horizontal_lines) if horizontal_lines else 0
            }
        }
        
    except HTTPException:
        # Re-lanzar HTTPExceptions tal como están
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extrayendo líneas gráficas del PDF: {str(e)}")

@app.get("/")
async def root():
    """
    Endpoint raíz que devuelve información básica de la API
    """
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"🐍 [{timestamp}] PETICIÓN RECIBIDA en endpoint raíz (/)")
    print(f"🐍 [{timestamp}] Procesando solicitud de información básica de la API")
    
    response = {
        "message": "PDF Reader API con PyMuPDF",
        "version": "1.0.0",
        "status": "running",
        "municipios_disponibles": VALID_MUNICIPIOS,
        "tipos_informe": VALID_INFORMES,
        "timestamp": timestamp
    }
    
    print(f"🐍 [{timestamp}] RESPUESTA ENVIADA desde endpoint raíz")
    return response

@app.get("/test")
async def test_endpoint(
    poble: str = Query(..., description="Nombre del pueblo (collbato, santboi, premia)"),
    informe: str = Query(..., description="Tipo de informe (a, bens)"),
    pag: Optional[int] = Query(None, description="Número de página específica (opcional)", ge=1)
):
    """
    Endpoint que procesa un PDF usando PyMuPDF incluyendo líneas horizontales
    
    Args:
        poble (str): Nombre del pueblo (collbato, santboi, premia)
        informe (str): Tipo de informe (a, bens)
        pag (int, optional): Número de página específica. Si no se proporciona, procesa todo el PDF
    
    Returns:
        dict: Items extraídos del PDF con PyMuPDF incluyendo líneas horizontales en cada página
    """
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"🐍 [{timestamp}] PETICIÓN RECIBIDA en endpoint /test")
    print(f"🐍 [{timestamp}] Parámetros recibidos: poble='{poble}', informe='{informe}', pag={pag}")
    
    try:
        # Validar municipio
        if poble not in VALID_MUNICIPIOS:
            print(f"🐍 [{timestamp}] ERROR: Municipio '{poble}' no válido")
            raise HTTPException(
                status_code=400, 
                detail=f"Municipio '{poble}' no válido. Opciones disponibles: {VALID_MUNICIPIOS}"
            )
        
        # Validar informe
        if informe not in VALID_INFORMES:
            print(f"🐍 [{timestamp}] ERROR: Informe '{informe}' no válido")
            raise HTTPException(
                status_code=400, 
                detail=f"Informe '{informe}' no válido. Opciones disponibles: {VALID_INFORMES}"
            )
        
        # Buscar el archivo PDF
        print(f"🐍 [{timestamp}] Buscando archivo PDF para {poble}_{informe}.pdf")
        pdf_path = find_pdf_file(poble, informe)
        if not pdf_path:
            print(f"🐍 [{timestamp}] ERROR: Archivo PDF no encontrado")
            raise HTTPException(
                status_code=404, 
                detail=f"Archivo PDF no encontrado para municipio '{poble}' e informe '{informe}'"
            )
        
        print(f"🐍 [{timestamp}] Archivo PDF encontrado: {pdf_path}")
        
        # Extraer items del PDF incluyendo líneas horizontales
        print(f"🐍 [{timestamp}] Procesando PDF con PyMuPDF (incluyendo líneas horizontales)...")
        pdf_items = extract_pdf_items(pdf_path, pag)
        
        response = {
            "message": "PDF procesado exitosamente con PyMuPDF",
            "parameters": {
                "poble": poble,
                "informe": informe,
                "pag": pag
            },
            "pdf_info": {
                "file_path": str(pdf_path),
                "file_name": pdf_path.name,
                "extraction_mode": "full_content_with_horizontal_lines"
            },
            "data": pdf_items,
            "timestamp": timestamp
        }
        
        print(f"🐍 [{timestamp}] RESPUESTA ENVIADA desde endpoint /test - contenido completo con líneas horizontales procesado")
        return response
        
    except HTTPException:
        # Re-lanzar HTTPExceptions tal como están
        raise
    except Exception as e:
        print(f"🐍 [{timestamp}] ERROR INESPERADO: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

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
