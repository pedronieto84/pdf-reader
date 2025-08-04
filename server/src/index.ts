import express, { Request, Response } from "express";
import cors from "cors";
import fs from "fs";
const pdfParse = require("pdf-parse");
import path from "path";
import PDFParser from "pdf2json";
import { parseTableFromPdf2Json, combineTablePages } from "./tableParserNew";
import { parseTableFromPdf2JsonLlibreA, combineTablePagesLlibreA } from "./tableParserLlibreA";

const app = express();
const PORT = 3001;

app.use(cors());

app.get("/extract-pdf", async (req: Request, res: Response) => {
  try {
    const which = (req.query.which as string) || "sant-boi"; // Valor por defecto
    const page = req.query.page as string; // Parámetro de página específica

    let pdfPath: string;
    let fileName: string;

    // Lógica combinada: which + page (opcional)
    switch (which) {
      case "sant-boi":
        if (page) {
          // PDF dividido de SantBoi
          fileName = `/SantBoiLluçanes-relacioBens-${page}.pdf`;
          pdfPath = path.resolve(
            `../src/assets/pdf-dividido/SantBoi-relacioBens${fileName}`
          );
        } else {
          // PDF completo de SantBoi
          fileName = "SantBoi-relacioBens.pdf";
          pdfPath = path.resolve(`../src/assets/${fileName}`);
        }
        break;
      case "premia":
        if (page) {
          // Para futuro: PDFs divididos de Premia
          fileName = `Premia-llibreA-${page}.pdf`;
          pdfPath = path.resolve(`../assets/pdf-dividido/${fileName}`);
        } else {
          // PDF completo de Premia
          fileName = "Premia-llibreA-001.pdf";
          pdfPath = path.resolve(`../src/assets/${fileName}`);
        }
        break;
      default:
        return res.status(400).json({
          error: 'Parámetro "which" inválido',
          validOptions: ["sant-boi", "premia"],
        });
    }

    // Verificar que el archivo existe
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({
        error: `Archivo no encontrado: ${fileName}`,
        path: pdfPath,
        suggestion: page
          ? `Verificar que existe la página ${page} para ${which} en pdf-dividido/`
          : "Verificar ruta del PDF",
      });
    }

    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);
    res.json({
      fileName: fileName,
      which: which,
      page: page || "completo",
      text: data.text,
      lines: data.text.split("\n"),
      numPages: data.numpages,
      totalCharacters: data.text.length,
      source: page ? "pdf-dividido" : "src/assets",
    });
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Error al leer el PDF", details: err.message });
  }
});

// Nuevo endpoint con estrategia alternativa de extracción
app.get("/extract-pdf-2", async (req: Request, res: Response) => {
  try {
    const which = (req.query.which as string) || "sant-boi"; // Valor por defecto
    const page = req.query.page as string; // Parámetro de página específica

    let pdfPath: string;
    let fileName: string;

    // Lógica combinada: which + page (opcional)
    switch (which) {
      case "sant-boi":
        if (page) {
          // PDF dividido de SantBoi
          fileName = `/SantBoiLluçanes-relacioBens-${page}.pdf`;
          pdfPath = path.resolve(
            `../src/assets/pdf-dividido/SantBoi-relacioBens${fileName}`
          );
        } else {
          // PDF completo de SantBoi
          fileName = "SantBoi-relacioBens.pdf";
          pdfPath = path.resolve(`../src/assets/${fileName}`);
        }
        break;
      case "premia":
        if (page) {
          // Para futuro: PDFs divididos de Premia
          fileName = `Premia-llibreA-${page}.pdf`;
          pdfPath = path.resolve(`../assets/pdf-dividido/${fileName}`);
        } else {
          // PDF completo de Premia
          fileName = "Premia-llibreA-001.pdf";
          pdfPath = path.resolve(`../src/assets/${fileName}`);
        }
        break;
      default:
        return res.status(400).json({
          error: 'Parámetro "which" inválido',
          validOptions: ["sant-boi", "premia"],
        });
    }

    // Verificar que el archivo existe
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({
        error: `Archivo no encontrado: ${fileName}`,
        path: pdfPath,
        suggestion: page
          ? `Verificar que existe la página ${page} para ${which} en pdf-dividido/`
          : "Verificar ruta del PDF",
      });
    }

    // Usar pdf2json para extracción estructurada
    const pdfParser = new PDFParser();

    // Promesa para manejar el parsing asíncrono
    const parsePDF = new Promise<any>((resolve, reject) => {
      pdfParser.on("pdfParser_dataError", (errData: any) => {
        reject(new Error(errData.parserError));
      });

      pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
        resolve(pdfData);
      });

      // Cargar el archivo PDF
      pdfParser.loadPDF(pdfPath);
    });

    const pdfData = await parsePDF;

    // Extraer información estructurada
    const pages = pdfData.Pages || [];

    // Console log para la primera página
    if (pages.length > 0) {
      const page1 = pages[0];
      const texts = page1.Texts || [];
      const fills = page1.Fills || [];

      console.log("=== PÁGINA 1 - ELEMENTOS RECUPERADOS ===");
      console.log(`Total de elementos de texto: ${texts.length}`);
      console.log(`Total de elementos de relleno (fills): ${fills.length}`);
      console.log(`Dimensiones de página: ${page1.Width} x ${page1.Height}`);

      // Mostrar los primeros 5 elementos de texto como muestra
      console.log("--- Primeros 5 elementos de texto ---");
      texts.slice(0, 5).forEach((text: any, index: number) => {
        const decodedText = decodeURIComponent(text.R?.[0]?.T || "");
        console.log(
          `${index + 1}. Posición (${text.x}, ${text.y}): "${decodedText}"`
        );
      });
      console.log("========================================");
    }

    const extractedData = {
      fileName: fileName,
      which: which,
      page: page || "completo",
      numPages: pages.length,
      extractionMethod: "pdf2json",
      pages: pages.map((pageData: any, pageIndex: number) => {
        const texts = pageData.Texts || [];
        const fills = pageData.Fills || [];

        return {
          pageNumber: pageIndex + 1,
          width: pageData.Width,
          height: pageData.Height,
          textElements: texts.map((text: any) => ({
            x: text.x,
            y: text.y,
            width: text.w,
            height: text.TS ? text.TS[0]?.TS || 0 : 0,
            text: decodeURIComponent(text.R?.[0]?.T || ""),
            fontFace: text.TS ? text.TS[0]?.TS || 0 : 0,
          })),
          fillElements: fills.map((fill: any) => ({
            x: fill.x,
            y: fill.y,
            width: fill.w,
            height: fill.h,
            color: fill.clr,
          })),
          totalTexts: texts.length,
          totalFills: fills.length,
        };
      }),
      // Extraer todo el texto concatenado para compatibilidad
      text: pages
        .map((pageData: any) => {
          const texts = pageData.Texts || [];
          return texts
            .map((text: any) => decodeURIComponent(text.R?.[0]?.T || ""))
            .join(" ");
        })
        .join("\n"),
      source: page ? "pdf-dividido" : "src/assets",
    };

    res.json(extractedData);
  } catch (err: any) {
    res.status(500).json({
      error: "Error en extract-pdf-2 con pdf2json",
      details: err.message,
    });
  }
});

// Nuevo endpoint para procesar tabla estructurada
app.get("/extract-table", async (req: Request, res: Response) => {
  try {
    const which = (req.query.which as string) || "sant-boi";
    const page = req.query.page as string;

    let pdfPath: string;
    let fileName: string;

    // Misma lógica de rutas que extract-pdf-2
    switch (which) {
      case "sant-boi":
        if (page) {
          fileName = `/SantBoiLluçanes-relacioBens-${page}.pdf`;
          pdfPath = path.resolve(
            `../src/assets/pdf-dividido/SantBoi-relacioBens${fileName}`
          );
        } else {
          fileName = "SantBoi-relacioBens.pdf";
          pdfPath = path.resolve(`../src/assets/${fileName}`);
        }
        break;
      case "premia":
        if (page) {
          fileName = `Premia-llibreA-${page}.pdf`;
          pdfPath = path.resolve(`../assets/pdf-dividido/${fileName}`);
        } else {
          fileName = "Premia-llibreA-001.pdf";
          pdfPath = path.resolve(`../src/assets/${fileName}`);
        }
        break;
      case "collbato":
        fileName = "collbato_llibreA.pdf";
        pdfPath = path.resolve(`../src/assets/documentos-parseo/collbato/${fileName}`);
        break;
      case "sant-boi-de-llucanes":
        fileName = "sant-boi-de-llucanes_llibreA.pdf";
        pdfPath = path.resolve(`../src/assets/documentos-parseo/sant-boi-de-llucanes/${fileName}`);
        break;
      case "premia-de-dalt":
        fileName = "premia-de-dalt_llibreA.pdf";
        pdfPath = path.resolve(`../src/assets/documentos-parseo/premia-de-dalt/${fileName}`);
        break;
      default:
        return res.status(400).json({
          error: 'Parámetro "which" inválido',
          validOptions: ["sant-boi", "premia", "collbato", "sant-boi-de-llucanes", "premia-de-dalt"],
        });
    }

    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({
        error: `Archivo no encontrado: ${fileName}`,
        path: pdfPath,
      });
    }

    // Usar pdf2json para extracción estructurada
    const pdfParser = new PDFParser();

    const parsePDF = new Promise<any>((resolve, reject) => {
      pdfParser.on("pdfParser_dataError", (errData: any) => {
        reject(new Error(errData.parserError));
      });

      pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
        resolve(pdfData);
      });

      pdfParser.loadPDF(pdfPath);
    });

    const pdfData = await parsePDF;
    const pages = pdfData.Pages || [];

    // Procesar cada página con el parser de tabla
    const tablePagesData = pages.map((pageData: any, pageIndex: number) => {
      const textElements = pageData.Texts || [];
      const processedElements = textElements.map((text: any) => ({
        x: text.x,
        y: text.y,
        width: text.w,
        height: text.TS ? text.TS[0]?.TS || 0 : 0,
        text: decodeURIComponent(text.R?.[0]?.T || ""),
        fontFace: text.TS ? text.TS[0]?.TS || 0 : 0,
      }));

      return parseTableFromPdf2Json(processedElements, pageIndex + 1);
    });

    // Combinar todas las páginas si hay múltiples
    const combinedTable = combineTablePages(tablePagesData);

    console.log("=== TABLA PROCESADA ===");
    console.log(
      `Total de filas encontradas: ${combinedTable.metadata.totalRows}`
    );
    console.log(`Páginas procesadas: ${tablePagesData.length}`);

    // Mostrar las primeras filas como ejemplo
    console.log("--- Primeras 3 filas ---");
    combinedTable.rows.slice(0, 3).forEach((row, index) => {
      console.log(`Fila ${index + 1}:`, row);
    });
    console.log("=======================");

    res.json({
      fileName: fileName,
      which: which,
      page: page || "completo",
      extractionMethod: "pdf2json + table parser",
      table: combinedTable,
      rawPages: tablePagesData, // incluir datos de páginas individuales
      source: page ? "pdf-dividido" : "src/assets",
    });
  } catch (err: any) {
    res.status(500).json({
      error: "Error al procesar tabla del PDF",
      details: err.message,
    });
  }
});

// Nuevo endpoint para procesar TODAS las páginas de un PDF como tabla completa
app.get("/extract-full-pdf-table", async (req: Request, res: Response) => {
  try {
    const which = (req.query.which as string) || "sant-boi"; // Municipio
    const table = (req.query.table as string) || "relacio-bens"; // Tipo de tabla

    console.log(`=== PROCESANDO PDF COMPLETO ===`);
    console.log(`Municipio: ${which}`);
    console.log(`Tipo de tabla: ${table}`);

    // Validar parámetros - aceptar ambos formatos
    const validWhich = ["sant-boi", "sant-boi-de-llucanes", "collbato", "premia-de-dalt"];
    const validTable = ["LlibreA", "relacio-bens"];

    if (!validWhich.includes(which)) {
      return res.status(400).json({
        error: 'Parámetro "which" inválido',
        validOptions: validWhich,
        received: which
      });
    }

    if (!validTable.includes(table)) {
      return res.status(400).json({
        error: 'Parámetro "table" inválido',
        validOptions: validTable,
        received: table
      });
    }

    // Construir ruta del archivo PDF completo
    let pdfPath: string;
    let fileName: string;

    // Nuevo patrón de rutas: "../src/assets/documentos-parseo/{which}/{which}_{table}.pdf"
    const municipioMap: { [key: string]: string } = {
      "sant-boi-de-llucanes": "sant-boi-de-llucanes", // Aceptar ambos formatos
      "collbato": "collbato",
      "premia-de-dalt": "premia-de-dalt"
    };

    const tableMap: { [key: string]: string } = {
      "relacio-bens": "relacio-bens",
      "LlibreA": "llibreA"
    };

    const municipioFolder = municipioMap[which];
    const tableType = tableMap[table];

    if (!municipioFolder || !tableType) {
      return res.status(400).json({
        error: 'Configuración de municipio o tabla no encontrada',
        which: which,
        table: table
      });
    }

    fileName = `${municipioFolder}_${tableType}.pdf`;
    pdfPath = path.resolve("../src/assets/documentos-parseo", municipioFolder, fileName);

    console.log(`Intentando cargar: ${pdfPath}`);

    // Verificar que el archivo existe
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({
        error: `Archivo PDF completo no encontrado: ${fileName}`,
        path: pdfPath,
        suggestion: "Verificar que el archivo existe en documentos-parseo/"
      });
    }

    // Usar pdf2json para procesar el PDF completo
    const pdfParser = new PDFParser();

    const parsePDF = new Promise<any>((resolve, reject) => {
      pdfParser.on("pdfParser_dataError", (errData: any) => {
        reject(new Error(errData.parserError));
      });

      pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
        resolve(pdfData);
      });

      pdfParser.loadPDF(pdfPath);
    });

    console.log("Iniciando parsing del PDF...");
    const pdfData = await parsePDF;
    const pages = pdfData.Pages || [];

    console.log(`PDF cargado exitosamente. Total de páginas: ${pages.length}`);

    let combinedTable: any;
    let tablePagesData: any[] = [];

    if (table === "LlibreA") {
      // Para LlibreA: procesar todo el documento como una unidad
      console.log("Procesando documento LlibreA completo...");

      // Recopilar todos los elementos de texto de todas las páginas
      const allPageElements = pages.map((pageData: any, pageIndex: number) => {
        const textElements = pageData.Texts || [];
        return textElements.map((text: any) => ({
          x: text.x,
          y: text.y,
          width: text.w,
          height: text.TS ? text.TS[0]?.TS || 0 : 0,
          text: decodeURIComponent(text.R?.[0]?.T || ""),
          fontFace: text.TS ? text.TS[0]?.TS || 0 : 0,
        }));
      });

      console.log(`Elementos de texto por página: ${allPageElements.map((els: any) => els.length).join(', ')}`);

      // Usar el parser LlibreA que procesa todo el documento
      combinedTable = parseTableFromPdf2JsonLlibreA(allPageElements, 1);

      // Para compatibilidad, crear datos de páginas vacíos
      tablePagesData = pages.map((_: any, index: number) => ({
        headers: combinedTable.headers,
        rows: [],
        metadata: { totalRows: 0, totalColumns: combinedTable.headers.length, pageNumber: index + 1 }
      }));

    } else {
      // Para otros tipos: procesar página por página como antes
      console.log("Procesando páginas individuales...");
      tablePagesData = pages.map((pageData: any, pageIndex: number) => {
        const textElements = pageData.Texts || [];
        const processedElements = textElements.map((text: any) => ({
          x: text.x,
          y: text.y,
          width: text.w,
          height: text.TS ? text.TS[0]?.TS || 0 : 0,
          text: decodeURIComponent(text.R?.[0]?.T || ""),
          fontFace: text.TS ? text.TS[0]?.TS || 0 : 0,
        }));

        console.log(`Página ${pageIndex + 1}: ${textElements.length} elementos de texto encontrados`);

        return parseTableFromPdf2Json(processedElements, pageIndex + 1);
      });

      // Combinar todas las páginas en una sola tabla
      console.log("Combinando todas las páginas...");
      combinedTable = combineTablePages(tablePagesData);
    }

    console.log("=== TABLA COMPLETA PROCESADA ===");
    console.log(`Total de páginas procesadas: ${pages.length}`);
    console.log(`Total de filas encontradas: ${combinedTable.metadata.totalRows}`);
    console.log(`Total de columnas: ${combinedTable.metadata.totalColumns}`);
    console.log(`Headers encontrados: ${combinedTable.headers.join(", ")}`);

    // Mostrar estadísticas por página
    tablePagesData.forEach((pageTable: any, index: number) => {
      console.log(`Página ${index + 1}: ${pageTable.rows.length} filas, ${pageTable.headers.length} columnas`);
    });

    // Mostrar las primeras filas como ejemplo
    console.log("--- Primeras 5 filas del resultado combinado ---");
    combinedTable.rows.slice(0, 5).forEach((row: any, index: number) => {
      console.log(`Fila ${index + 1}:`, row);
    });
    console.log("===================================");

    // Respuesta en el mismo formato que extract-table
    res.json({
      fileName: fileName,
      which: which,
      tableType: table,
      extractionMethod: "pdf2json + table parser (full PDF)",
      table: combinedTable,
      rawPages: tablePagesData, // incluir datos de páginas individuales para debugging
      totalPages: pages.length,
      source: "documentos-parseo",
      processingTime: new Date().toISOString()
    });

  } catch (err: any) {
    console.error("Error en extract-full-pdf-table:", err);
    res.status(500).json({
      error: "Error al procesar PDF completo",
      details: err.message,
      stack: err.stack
    });
  }
});

// Endpoint de prueba para extraer elementos en bruto del PDF
app.get("/test", async (req: Request, res: Response) => {
  try {
    console.log("=== ENDPOINT TEST - ELEMENTOS EN BRUTO ===");

    // Ruta fija al PDF de sant-boi-de-llucanes
    const pdfPath = path.resolve("../src/assets/documentos-parseo/sant-boi-de-llucanes/sant-boi-de-llucanes_llibreA.pdf");
    console.log("Intentando cargar:", pdfPath);

    // Verificar que el archivo existe
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({
        error: "PDF no encontrado",
        path: pdfPath
      });
    }

    const pdfParser = new (PDFParser as any)(null, 1);

    pdfParser.on("pdfParser_dataError", (errData: any) => {
      console.error("Error en PDF Parser:", errData.parserError);
      res.status(500).json({
        error: "Error al procesar el PDF",
        details: errData.parserError,
      });
    });

    pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
      try {
        console.log("PDF cargado exitosamente");
        console.log("Total de páginas:", pdfData.Pages?.length || 0);

        // Extraer elementos de todas las páginas
        const allElements: any[] = [];
        const pagesInfo: any[] = [];

        if (pdfData.Pages && pdfData.Pages.length > 0) {
          pdfData.Pages.forEach((page: any, pageIndex: number) => {
            console.log(`Página ${pageIndex + 1}: ${page.Texts?.length || 0} elementos`);

            const pageElements = page.Texts?.map((text: any, textIndex: number) => {
              const decodedText = decodeURIComponent(text.R?.[0]?.T || "");
              return {
                page: pageIndex + 1,
                textIndex: textIndex,
                x: text.x || 0,
                y: text.y || 0,
                width: text.w || 0,
                height: text.h || 0,
                text: decodedText,
                fontFace: text.R?.[0]?.TS?.[2] || 0,
                fontSize: text.R?.[0]?.TS?.[0] || 0,
                fontFlags: text.R?.[0]?.TS?.[3] || 0,
                raw: text // Elemento completo sin procesar
              };
            }) || [];

            allElements.push(...pageElements);

            pagesInfo.push({
              page: pageIndex + 1,
              totalTexts: pageElements.length,
              sampleElements: pageElements.slice(0, 5) // Primeros 5 elementos como muestra
            });
          });
        }

        console.log(`Total elementos extraídos: ${allElements.length}`);

        // Devolver información completa en bruto
        res.json({
          status: "success",
          fileName: "sant-boi-de-llucanes_llibreA.pdf",
          filePath: pdfPath,
          extractionMethod: "pdf2json raw elements",
          totalPages: pdfData.Pages?.length || 0,
          totalElements: allElements.length,

          // Información por página
          pagesInfo: pagesInfo,

          // Todos los elementos (limitado a 100 para evitar respuestas demasiado grandes)
          allElements: allElements.slice(0, 100),

          // Muestra de elementos de la primera página para análisis
          firstPageSample: allElements.filter(el => el.page === 1).slice(0, 20),

          // Datos en bruto del PDF (estructura completa)
          rawPdfData: {
            meta: pdfData.Meta || {},
            width: pdfData.Pages?.[0]?.Width || 0,
            height: pdfData.Pages?.[0]?.Height || 0,
            totalPages: pdfData.Pages?.length || 0
          },

          // Información adicional para debugging
          debug: {
            note: "Este endpoint devuelve los elementos en bruto de pdf2json sin procesamiento",
            limitedTo: "Primeros 100 elementos para evitar respuestas demasiado grandes",
            fullDataAvailable: allElements.length > 100 ? `${allElements.length - 100} elementos adicionales disponibles` : "Todos los elementos incluidos"
          }
        });

      } catch (error: any) {
        console.error("Error procesando datos del PDF:", error);
        res.status(500).json({
          error: "Error al procesar los datos del PDF",
          details: error.message,
        });
      }
    });

    // Cargar el PDF
    pdfParser.loadPDF(pdfPath);

  } catch (error: any) {
    console.error("Error en endpoint /test:", error);
    res.status(500).json({
      error: "Error interno del servidor",
      details: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`PDF Reader backend listening on port ${PORT}`);
});

// Endpoint 1: Detectar líneas usando análisis de texto (simulado como detección de imagen)
app.get("/detect-lines-image", async (req: Request, res: Response) => {
  try {
    const pdfPath = path.resolve(
      __dirname,
      "../../src/assets/SantBoi-relacioBens.pdf"
    );
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);

    // Simular detección de líneas basada en el texto extraído
    // Buscar patrones que podrían indicar líneas horizontales
    const textLines = data.text.split("\n");
    const horizontalLines: any[] = [];

    textLines.forEach((line: string, index: number) => {
      // Detectar líneas que contengan solo caracteres de separación
      if (line.match(/^[-_=\s]*$/) && line.trim().length > 3) {
        horizontalLines.push({
          lineNumber: index + 1,
          content: line.trim(),
          length: line.trim().length,
          type: "text_separator",
          estimatedY: 800 - index * 12, // Estimación de posición Y
        });
      }
    });

    res.json({
      method: "text-based line detection (simulating image analysis)",
      linesFound: horizontalLines.length,
      lines: horizontalLines,
      totalTextLines: textLines.length,
      note: "Análisis basado en patrones de texto que sugieren líneas horizontales",
    });
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Error al detectar líneas", details: err.message });
  }
});

// Endpoint 2: Detectar líneas usando pdf-lib (análisis de contenido)
app.get("/detect-lines-content", async (req: Request, res: Response) => {
  try {
    const pdfPath = path.resolve(
      __dirname,
      "../../src/assets/SantBoi-relacioBens.pdf"
    );

    // Análisis básico simulado de contenido PDF
    // En un caso real, analizarías operadores de dibujo como 'l', 'm', etc.
    const horizontalLines = [
      { page: 1, y: 742, x1: 72, x2: 523, type: "separator" },
      { page: 1, y: 680, x1: 72, x2: 523, type: "table_border" },
      { page: 1, y: 620, x1: 72, x2: 523, type: "underline" },
    ];

    res.json({
      method: "pdf-lib content analysis",
      linesFound: horizontalLines.length,
      lines: horizontalLines,
      note: "Análisis simulado - implementar parsing de operadores PDF",
    });
  } catch (err: any) {
    res.status(500).json({
      error: "Error al detectar líneas con análisis de contenido",
      details: err.message,
    });
  }
});
