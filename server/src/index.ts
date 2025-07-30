import express, { Request, Response } from "express";
import cors from "cors";
import fs from "fs";
const pdfParse = require("pdf-parse");
import path from "path";
import PDFParser from "pdf2json";
import { parseTableFromPdf2Json, combineTablePages } from "./tableParserNew";

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
      default:
        return res.status(400).json({
          error: 'Parámetro "which" inválido',
          validOptions: ["sant-boi", "premia"],
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
