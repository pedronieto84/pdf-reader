import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { Root, Resultado, Item } from "./interfaces.js";
import { getHorizontalLines, getPageData } from "./helpers.js";

// Para ES modules, necesitamos recrear __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Configuración de archivos JSON
const JSON_FILES_DIR = join(__dirname, "..", "archivos-json");

// Municipios y tipos de informe válidos
const VALID_MUNICIPIOS = ["collbato", "santboi", "premia"];
const VALID_INFORMES = ["a", "bens"];

// Interfaces
interface TestParams {
  poble: string;
  informe: string;
}

interface APIResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

// Middleware
app.use(cors());
app.use(express.json());

// Función para filtrar datos por página
function filterByPage(data: any, pag?: number): any {
  // Si no hay parámetro pag, devolver todos los datos
  if (!pag) {
    return data;
  }

  // Si los datos tienen la estructura esperada con resultado.items
  if (
    data.resultado &&
    data.resultado.items &&
    Array.isArray(data.resultado.items)
  ) {
    const filteredItems = data.resultado.items.filter(
      (item: Item) => item.page_number === pag
    );

    return {
      ...data,
      resultado: {
        ...data.resultado,
        processed_pages: filteredItems.length,
        items: filteredItems,
      },
      filter_info: {
        requested_page: pag,
        total_pages: data.resultado.total_pages,
        page_found: filteredItems.length > 0,
        items_in_page: filteredItems.length,
      },
    };
  }

  // Si los datos tienen una estructura diferente, intentar buscar en un array de items
  if (data.items && Array.isArray(data.items)) {
    const filteredItems = data.items.filter(
      (item: Item) => item.page_number === pag
    );

    return {
      ...data,
      items: filteredItems,
      filter_info: {
        requested_page: pag,
        page_found: filteredItems.length > 0,
        items_in_page: filteredItems.length,
      },
    };
  }

  // Si no se puede filtrar, devolver los datos originales con información
  return {
    ...data,
    filter_info: {
      requested_page: pag,
      page_found: false,
      message:
        "No se pudo filtrar por página - estructura de datos no reconocida",
    },
  };
}

// Función para leer archivo JSON
function readJSONFile(poble: string, informe: string): any {
  // Caso especial: premia-bens no existe
  if (poble === "premia" && informe === "bens") {
    console.log(
      `ℹ️  Archivo premia-bens.json no existe - devolviendo mensaje informativo`
    );
    return {
      message: "Archivo no disponible",
      info: "El archivo premia-bens.json no existe en el sistema",
      municipio: poble,
      tipo_informe: informe,
      razon: "Este municipio no tiene datos para el tipo de informe 'bens'",
      archivos_disponibles: ["premia-a.json"],
      sugerencia:
        "Prueba con ?poble=premia&informe=a para obtener datos disponibles",
    };
  }

  try {
    const fileName = `${poble}-${informe}.json`;
    const filePath = join(JSON_FILES_DIR, poble, fileName);

    console.log(`📂 Intentando leer archivo: ${filePath}`);

    const fileContent = readFileSync(filePath, "utf-8");
    const jsonData = JSON.parse(fileContent);

    console.log(`✅ Archivo leído exitosamente: ${fileName}`);
    return jsonData;
  } catch (error: any) {
    console.error(
      `❌ Error leyendo archivo ${poble}-${informe}.json:`,
      error.message
    );
    throw new Error(`No se pudo leer el archivo para ${poble}-${informe}`);
  }
}

// Endpoint raíz
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Node.js Express Server con archivos JSON",
    version: "1.0.0",
    status: "running",
    descripcion: "Servidor que lee datos de archivos JSON locales",
    endpoints: {
      "/test": "Obtener datos de PDF procesado desde archivos JSON",
      "/archivos": "Listar archivos JSON disponibles",
    },
    parametros: {
      poble: {
        descripcion: "Nombre del municipio",
        valores: VALID_MUNICIPIOS,
        requerido: true,
      },
      informe: {
        descripcion: "Tipo de informe",
        valores: VALID_INFORMES,
        requerido: true,
      },
      pag: {
        descripcion: "Número de página específica (opcional)",
        tipo: "número entero > 0",
        requerido: false,
        nota: "Si no se especifica, se devuelven todas las páginas",
      },
    },
    ejemplos: [
      "/test?poble=santboi&informe=bens",
      "/test?poble=collbato&informe=a&pag=1",
      "/test?poble=premia&informe=a&pag=3",
    ],
    municipios_disponibles: VALID_MUNICIPIOS,
    tipos_informe: VALID_INFORMES,
    timestamp: new Date().toISOString(),
  });
});

// Endpoint principal para obtener datos
app.get("/test", (req: Request, res: Response): void => {
  try {
    const { poble, informe, pag } = req.query as {
      poble?: string;
      informe?: string;
      pag?: string;
    };

    const pageNumber = pag ? parseInt(pag, 10) : undefined;

    console.log(
      `🔍 Petición recibida - poble: ${poble}, informe: ${informe}, pag: ${
        pageNumber || "todas"
      }`
    );

    // Validar parámetros requeridos
    if (!poble) {
      res.status(400).json({
        success: false,
        error: 'Parámetro "poble" es requerido',
        valid_values: VALID_MUNICIPIOS,
        received_params: req.query,
      });
      return;
    }

    if (!informe) {
      res.status(400).json({
        success: false,
        error: 'Parámetro "informe" es requerido',
        valid_values: VALID_INFORMES,
        received_params: req.query,
      });
      return;
    }

    // Validar valores
    if (!VALID_MUNICIPIOS.includes(poble)) {
      res.status(400).json({
        success: false,
        error: `Municipio "${poble}" no válido`,
        valid_values: VALID_MUNICIPIOS,
        received_value: poble,
      });
      return;
    }

    if (!VALID_INFORMES.includes(informe)) {
      res.status(400).json({
        success: false,
        error: `Informe "${informe}" no válido`,
        valid_values: VALID_INFORMES,
        received_value: informe,
      });
      return;
    }

    // Validar parámetro de página si se proporciona
    if (pag && (isNaN(pageNumber!) || pageNumber! < 1)) {
      res.status(400).json({
        success: false,
        error: `Parámetro "pag" debe ser un número entero mayor a 0`,
        received_value: pag,
      });
      return;
    }

    // Leer archivo JSON correspondiente
    const jsonData = readJSONFile(poble, informe);

    // Filtrar por página si se especifica
    const filteredData = filterByPage(jsonData, pageNumber);

    const pageData = getPageData(filteredData);
    const horizontalLines = getHorizontalLines(jsonData);
    console.log('horizontalLines', horizontalLines);
    
    // Respuesta exitosa
    res.json({
      success: true,
      message: pageNumber
        ? `Datos de la página ${pageNumber} obtenidos exitosamente desde archivo JSON`
        : "Datos obtenidos exitosamente desde archivo JSON",
      parameters: {
        poble,
        informe,
        pag: pageNumber || "todas las páginas",
      },
      file_info: {
        source: "local_json_file",
        file_name: `${poble}-${informe}.json`,
        file_path: `archivos-json/${poble}/${poble}-${informe}.json`,
      },
      data: filteredData,
      dataFiltered: pageData,
      timestamp: new Date().toISOString(),
    });

    console.log(
      `✅ Respuesta enviada exitosamente para 44 ${poble}-${informe}${
        pageNumber ? ` página ${pageNumber}` : " (todas las páginas)"
      }`
    );
  } catch (error: any) {
    console.error("❌ Error en endpoint /test:", error);

    if (error.message.includes("No se pudo leer el archivo")) {
      res.status(404).json({
        success: false,
        error: "Archivo no encontrado",
        details: error.message,
        available_files: `Verifica que existe el archivo en archivos-json/${req.query.poble}/${req.query.poble}-${req.query.informe}.json`,
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Error interno del servidor",
        details: error.message,
      });
    }
  }
});

// Endpoint para listar archivos disponibles
app.get("/archivos", (req: Request, res: Response) => {
  try {
    console.log("📋 Listando archivos disponibles...");

    const archivos: any[] = [];

    for (const municipio of VALID_MUNICIPIOS) {
      for (const informe of VALID_INFORMES) {
        const fileName = `${municipio}-${informe}.json`;

        // Caso especial para premia-bens
        if (municipio === "premia" && informe === "bens") {
          archivos.push({
            municipio,
            informe,
            fileName,
            relativePath: `archivos-json/${municipio}/${fileName}`,
            available: true,
            special_case: true,
            note: "Archivo no existe físicamente pero maneja respuesta informativa",
            url: `/test?poble=${municipio}&informe=${informe}`,
          });
          continue;
        }

        try {
          const filePath = join(JSON_FILES_DIR, municipio, fileName);

          // Intentar leer el archivo para verificar si existe
          readFileSync(filePath, "utf-8");

          archivos.push({
            municipio,
            informe,
            fileName,
            relativePath: `archivos-json/${municipio}/${fileName}`,
            available: true,
            url: `/test?poble=${municipio}&informe=${informe}`,
          });
        } catch (error) {
          archivos.push({
            municipio,
            informe,
            fileName: `${municipio}-${informe}.json`,
            relativePath: `archivos-json/${municipio}/${municipio}-${informe}.json`,
            available: false,
            error: "Archivo no encontrado",
          });
        }
      }
    }

    const archivosDisponibles = archivos.filter((a) => a.available);
    const archivosFaltantes = archivos.filter((a) => !a.available);

    res.json({
      success: true,
      message: "Lista de archivos JSON",
      json_files_directory: "archivos-json/",
      archivos: archivos,
      resumen: {
        total_esperados: archivos.length,
        disponibles: archivosDisponibles.length,
        faltantes: archivosFaltantes.length,
      },
      archivos_disponibles: archivosDisponibles,
      archivos_faltantes: archivosFaltantes,
      timestamp: new Date().toISOString(),
    });

    console.log(
      `✅ Lista generada: ${archivosDisponibles.length}/${archivos.length} archivos disponibles`
    );
  } catch (error: any) {
    console.error("❌ Error listando archivos:", error);
    res.status(500).json({
      success: false,
      error: "Error listando archivos",
      details: error.message,
    });
  }
});

// Middleware para rutas no encontradas
app.use("*", (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Endpoint no encontrado",
    available_endpoints: [
      "GET /",
      "GET /test?poble={municipio}&informe={tipo}",
      "GET /test?poble={municipio}&informe={tipo}&pag={numero}",
      "GET /archivos",
    ],
    valid_municipios: VALID_MUNICIPIOS,
    valid_informes: VALID_INFORMES,
    ejemplos: [
      "/test?poble=santboi&informe=bens",
      "/test?poble=collbato&informe=a&pag=1",
    ],
  });
});

// Middleware para manejo de errores
app.use((error: any, req: Request, res: Response, next: any) => {
  console.error("💥 Error no manejado:", error);
  res.status(500).json({
    success: false,
    error: "Error interno del servidor",
    details: error.message,
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Node.js Express Server ejecutándose en puerto ${PORT}`);
  console.log(`🔗 Servidor local: http://localhost:${PORT}`);
  console.log(`📁 Directorio JSON: ${JSON_FILES_DIR}`);
  console.log(`📚 Documentación: http://localhost:${PORT}/`);
  console.log(`📋 Lista de archivos: http://localhost:${PORT}/archivos`);

  // Verificar archivos al iniciar
  console.log("\n🔍 Verificando archivos JSON disponibles...");
  let archivosEncontrados = 0;
  let totalArchivos = 0;

  for (const municipio of VALID_MUNICIPIOS) {
    for (const informe of VALID_INFORMES) {
      totalArchivos++;

      // Caso especial para premia-bens
      if (municipio === "premia" && informe === "bens") {
        archivosEncontrados++;
        console.log(
          `  ℹ️  ${municipio}-${informe}.json (manejado - no existe pero retorna mensaje informativo)`
        );
        continue;
      }

      try {
        readJSONFile(municipio, informe);
        archivosEncontrados++;
        console.log(`  ✅ ${municipio}-${informe}.json`);
      } catch (error) {
        console.log(`  ❌ ${municipio}-${informe}.json (no encontrado)`);
      }
    }
  }

  console.log(
    `\n📊 Resumen: ${archivosEncontrados}/${totalArchivos} archivos JSON disponibles\n`
  );
});

export default app;
