interface TextElement {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontFace: number;
}

interface TableRow {
  // Columna 1: Classificació
  CLASSIFICACIÓ: string;

  // Columna 2: N.BÉ, ETIQUETA, D-ALTA
  "N. BÉ": string;
  ETIQUETA?: string;
  "D- ALTA": string;

  // Columna 3: QUANT, DESCRIPCIÓ
  QUANT: string;
  DESCRIPCIÓ: string;

  // Columna 4: C.GESTOR, C.COST, TITULAR
  "C. GESTOR"?: string;
  "C. COST"?: string;
  TITULAR?: string;

  // Columna 5: T.ADQUISICIÓ, S.PATRIMONIAL, NATURALESA, ÚS
  "T. ADQUISICIÓ": string;
  "S. PATRIMONIAL": string;
  NATURALESA: string;
  ÚS?: string;

  // Columna 6: V.B.C., F.A., F.P., V.C.
  "V.B.C.": string;
  "F.A.": string;
  "F.P.": string;
  "V.C.": string;

  // Columna 7: DOT. AMORT, V. MERCAT, V. ASSEGURAN, V.R.U.
  "DOT. AMORT"?: string;
  "V. MERCAT": string;
  "V. ASSEGURAN": string;
  "V.R.U."?: string;

  // Columna 8: DATAs
  DATA_1?: string;
  DATA_2?: string;
  DATA_3?: string;
}

interface TableData {
  headers: string[];
  rows: TableRow[];
  metadata: {
    totalRows: number;
    totalColumns: number;
    pageNumber: number;
  };
}

// Definir los grupos de columnas con sus rangos X exactos
const COLUMN_DEFINITIONS = [
  {
    name: "COL_1_CLASSIFICACIO",
    xRange: { min: 2.0, max: 8.0 },
    fields: ["CLASSIFICACIÓ"],
    expectedElements: 1,
  },
  {
    name: "COL_2_NBE_ETIQUETA_DALTA",
    xRange: { min: 6.0, max: 12.0 },
    fields: ["N. BÉ", "ETIQUETA", "D- ALTA"],
    expectedElements: 3,
  },
  {
    name: "COL_3_QUANT_DESCRIPCIO",
    xRange: { min: 9.0, max: 27.0 },
    fields: ["QUANT", "DESCRIPCIÓ"],
    expectedElements: 2,
  },
  {
    name: "COL_4_CGESTOR_CCOST_TITULAR",
    xRange: { min: 17.0, max: 28.0 },
    fields: ["C. GESTOR", "C. COST", "TITULAR"],
    expectedElements: 3,
  },
  {
    name: "COL_5_TADQ_SPATRIM_NAT_US",
    xRange: { min: 28.0, max: 37.0 },
    fields: ["T. ADQUISICIÓ", "S. PATRIMONIAL", "NATURALESA", "ÚS"],
    expectedElements: 4,
  },
  {
    name: "COL_6_VBC_FA_FP_VC",
    xRange: { min: 36.0, max: 44.0 },
    fields: ["V.B.C.", "F.A.", "F.P.", "V.C."],
    expectedElements: 4,
  },
  {
    name: "COL_7_DOT_MERCAT_ASSEGURAN_VRU",
    xRange: { min: 39.0, max: 48.0 },
    fields: ["DOT. AMORT", "V. MERCAT", "V. ASSEGURAN", "V.R.U."],
    expectedElements: 4,
  },
  {
    name: "COL_8_DATA",
    xRange: { min: 43.0, max: 50.0 },
    fields: ["DATA_1", "DATA_2", "DATA_3"],
    expectedElements: 3,
  },
];

// Tipos ENUM de validación
const TIPUS_ADQUISICIO_ENUM = [
  "COMPRA",
  "CESSIÓ GRATUÏTA DE LA PROPIETAT O DONACIÓ",
  "CESSIÓ URBANÍSTICA OBLIGATÒRIA",
  "ALTA PER OBRA EN CURS",
  "TREBALLS FETS AMB MITJANS PROPIS",
  "CESSIÓ D'ÚS TEMPORAL",
  "ADSCRIPCIÓ I ALTRES APORTACIONS DE BÉNS I DRETS DE L'ENTITAT PROPIETÀRIA",
  "INSPECCIÓ FÍSICA O INVENTARI",
  "EXPROPIACIÓ",
  "ADJUDICACIÓ EN PAGAMENT DE DEUTES O EMBARGAMENT",
  "ADJUDICACIÓ EN PAGAMENT DE DEUTES O EMBARGAMENT EXERCICI TANCAT",
  "ARRENDAMENT",
  "ALTA PER ARRENDAMENT FINANCER (LÍSING I ALTRES)",
  "COMPRA AMB PAGAMENT FRACCIONAT",
  "ALTA PER LÍSING AL VENEDOR (LEASE - BACK)",
  "ALTA PER MODIFICACIONS DE TANCAMENT",
];

const SITUACIO_PATRIMONIAL_ENUM = [
  "PROPIETAT",
  "CEDIT A FAVOR",
  "CEDIT EN CONTRA",
  "ADSCRIT A FAVOR",
  "ADSCRIT EN CONTRA",
  "ARRENDAT A FAVOR",
  "CONCESSIÓ EN CONTRA",
  "RETIRADA PERMANENT DE L'ÚS",
];

const NATURALESA_JURIDICA_ENUM = [
  "PATRIMONIAL",
  "DOMINI PÚBLIC - ÚS PÚBLIC",
  "DOMINI PÚBLIC - SERVEI PÚBLIC",
  "COMUNAL",
  "PATRIMONI PÚBLIC DEL SÒL",
];

const US_ENUM = ["ÚS COMÚ GENERAL", "ÚS COMÚ ESPECIAL", "ÚS PRIVATIU"];

export function parseTableFromPdf2Json(
  textElements: TextElement[],
  pageNumber: number = 1
): TableData {
  console.log(`\n=== PROCESANDO PÁGINA ${pageNumber} ===`);

  // 1. Encontrar todos los códigos de clasificación (6 dígitos) para identificar filas
  const classificationElements = textElements.filter((el) =>
    el.text.trim().match(/^\d{6}$/)
  );

  console.log(
    `Códigos de clasificación encontrados: ${classificationElements.length}`
  );
  classificationElements.forEach((el) => {
    console.log(`  - ${el.text} en posición Y: ${el.y}`);
  });

  if (classificationElements.length === 0) {
    console.log("No se encontraron códigos de clasificación válidos");
    return {
      headers: getAllHeaders(),
      rows: [],
      metadata: {
        totalRows: 0,
        totalColumns: getAllHeaders().length,
        pageNumber,
      },
    };
  }

  // 2. Para cada código de clasificación, definir el área de la fila
  const rows: TableRow[] = [];

  classificationElements.forEach((classElement, rowIndex) => {
    console.log(
      `\nProcesando fila ${rowIndex + 1} - Clasificación: ${classElement.text}`
    );

    // Definir el rango Y para esta fila
    const rowYStart = classElement.y;
    let rowYEnd = rowYStart + 4.0;

    // Si hay otra clasificación después, usar su Y como límite
    if (rowIndex < classificationElements.length - 1) {
      rowYEnd = Math.min(rowYEnd, classificationElements[rowIndex + 1].y - 0.1);
    }

    console.log(`  Rango Y de fila: ${rowYStart} - ${rowYEnd}`);

    // 3. Obtener todos los elementos dentro del rango Y de esta fila
    const rowElements = textElements.filter(
      (el) =>
        el.y >= rowYStart - 0.5 &&
        el.y <= rowYEnd + 0.5 &&
        el.text.trim().length > 0
    );

    console.log(`  Elementos en la fila: ${rowElements.length}`);

    // 4. Procesar cada columna individualmente
    const row = processRowByColumns(rowElements, classElement);

    rows.push(row);
    console.log(`  Fila completada:`, row);
  });

  return {
    headers: getAllHeaders(),
    rows: rows,
    metadata: {
      totalRows: rows.length,
      totalColumns: getAllHeaders().length,
      pageNumber: pageNumber,
    },
  };
}

function processRowByColumns(
  rowElements: TextElement[],
  classElement: TextElement
): TableRow {
  const row: Partial<TableRow> = {};

  // Inicializar la clasificación
  row.CLASSIFICACIÓ = classElement.text;

  // Procesar cada columna
  COLUMN_DEFINITIONS.forEach((columnDef) => {
    const columnElements = rowElements.filter(
      (el) =>
        el.x >= columnDef.xRange.min &&
        el.x <= columnDef.xRange.max &&
        el.text.trim() !== classElement.text // Excluir el elemento de clasificación ya procesado
    );

    // Ordenar elementos por posición Y (de arriba a abajo)
    columnElements.sort((a, b) => a.y - b.y);

    console.log(
      `    Columna ${columnDef.name}: ${columnElements.length} elementos`
    );
    columnElements.forEach((el) => {
      console.log(`      "${el.text}" en Y: ${el.y}`);
    });

    // Asignar elementos a campos específicos de la columna
    assignElementsToColumnFields(columnElements, columnDef, row);
  });

  // Post-procesamiento y validación
  postProcessAndValidateRow(row);

  return row as TableRow;
}

function assignElementsToColumnFields(
  elements: TextElement[],
  columnDef: any,
  row: Partial<TableRow>
): void {
  switch (columnDef.name) {
    case "COL_2_NBE_ETIQUETA_DALTA":
      // N. BÉ (número), ETIQUETA (opcional), D- ALTA (fecha)
      elements.forEach((el, index) => {
        const text = el.text.trim();
        if (text.match(/^\d{1,4}$/)) {
          row["N. BÉ"] = text;
        } else if (text.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
          row["D- ALTA"] = text;
        } else if (!row["N. BÉ"] && !row["D- ALTA"]) {
          // Probable etiqueta
          row["ETIQUETA"] = text;
        }
      });
      break;

    case "COL_3_QUANT_DESCRIPCIO":
      // QUANT (número sin decimales), DESCRIPCIÓ (texto, puede ser multilínea)
      let quantAssigned = false;
      let descripcionParts: string[] = [];

      elements.forEach((el) => {
        const text = el.text.trim();
        if (!quantAssigned && text.match(/^\d{1,2}$/)) {
          row["QUANT"] = text;
          quantAssigned = true;
        } else {
          descripcionParts.push(text);
        }
      });

      if (descripcionParts.length > 0) {
        row["DESCRIPCIÓ"] = descripcionParts.join(" ");
      }
      break;

    case "COL_4_CGESTOR_CCOST_TITULAR":
      // Todos son strings opcionales
      elements.forEach((el, index) => {
        const text = el.text.trim();
        const fields = ["C. GESTOR", "C. COST", "TITULAR"];
        if (index < fields.length && !row[fields[index] as keyof TableRow]) {
          (row as any)[fields[index]] = text;
        }
      });
      break;

    case "COL_5_TADQ_SPATRIM_NAT_US":
      // Validar contra ENUMs y asignar
      elements.forEach((el) => {
        const text = el.text.trim();

        if (isValidTipusAdquisicio(text)) {
          row["T. ADQUISICIÓ"] = text;
        } else if (isValidSituacioPatrimonial(text)) {
          row["S. PATRIMONIAL"] = text;
        } else if (isValidNaturalesaJuridica(text)) {
          row["NATURALESA"] = text;
        } else if (isValidUs(text)) {
          row["ÚS"] = text;
        } else {
          // Combinar textos fragmentados
          if (!row["T. ADQUISICIÓ"] && text.includes("INSPECCIÓ")) {
            row["T. ADQUISICIÓ"] = "INSPECCIÓ FÍSICA O INVENTARI";
          } else if (!row["NATURALESA"] && text.includes("DOMINI")) {
            if (!row["NATURALESA"]) {
              row["NATURALESA"] = text;
            } else {
              row["NATURALESA"] += " " + text;
            }
          }
        }
      });
      break;

    case "COL_6_VBC_FA_FP_VC":
      // 4 valores numéricos obligatorios
      const fields6 = ["V.B.C.", "F.A.", "F.P.", "V.C."];
      elements.forEach((el, index) => {
        const text = el.text.trim();
        if (isValidNumber(text) && index < fields6.length) {
          (row as any)[fields6[index]] = text;
        }
      });
      break;

    case "COL_7_DOT_MERCAT_ASSEGURAN_VRU":
      // DOT. AMORT (opcional), V. MERCAT (obligatorio), V. ASSEGURAN (obligatorio), V.R.U. (opcional)
      const fields7 = ["DOT. AMORT", "V. MERCAT", "V. ASSEGURAN", "V.R.U."];
      elements.forEach((el, index) => {
        const text = el.text.trim();
        if (isValidNumber(text) && index < fields7.length) {
          (row as any)[fields7[index]] = text;
        }
      });
      break;

    case "COL_8_DATA":
      // 3 fechas opcionales
      const dateFields = ["DATA_1", "DATA_2", "DATA_3"];
      elements.forEach((el, index) => {
        const text = el.text.trim();
        if (text.match(/^\d{2}\/\d{2}\/\d{4}$/) && index < dateFields.length) {
          (row as any)[dateFields[index]] = text;
        }
      });
      break;
  }
}

// Funciones de validación
function isValidTipusAdquisicio(text: string): boolean {
  return TIPUS_ADQUISICIO_ENUM.some((tipo) => text.includes(tipo));
}

function isValidSituacioPatrimonial(text: string): boolean {
  return SITUACIO_PATRIMONIAL_ENUM.includes(text);
}

function isValidNaturalesaJuridica(text: string): boolean {
  return NATURALESA_JURIDICA_ENUM.some((natura) => text.includes(natura));
}

function isValidUs(text: string): boolean {
  return US_ENUM.includes(text);
}

function isValidNumber(text: string): boolean {
  return text === "0" || !!text.match(/^[\d.,]+$/);
}

function postProcessAndValidateRow(row: Partial<TableRow>): void {
  // Limpiar descripción
  if (row["DESCRIPCIÓ"]) {
    row["DESCRIPCIÓ"] = row["DESCRIPCIÓ"].replace(/\s+/g, " ").trim();
  }

  // Combinar naturalesa fragmentada
  if (row["NATURALESA"]) {
    row["NATURALESA"] = row["NATURALESA"].replace(/\s+/g, " ").trim();
  }

  // Validar y corregir T. ADQUISICIÓ fragmentado
  if (row["T. ADQUISICIÓ"] && row["T. ADQUISICIÓ"].includes("INSPECCIÓ")) {
    row["T. ADQUISICIÓ"] = "INSPECCIÓ FÍSICA O INVENTARI";
  }
}

function getAllHeaders(): string[] {
  return [
    "CLASSIFICACIÓ",
    "N. BÉ",
    "ETIQUETA",
    "D- ALTA",
    "QUANT",
    "DESCRIPCIÓ",
    "C. GESTOR",
    "C. COST",
    "TITULAR",
    "T. ADQUISICIÓ",
    "S. PATRIMONIAL",
    "NATURALESA",
    "ÚS",
    "V.B.C.",
    "F.A.",
    "F.P.",
    "V.C.",
    "DOT. AMORT",
    "V. MERCAT",
    "V. ASSEGURAN",
    "V.R.U.",
    "DATA_1",
    "DATA_2",
    "DATA_3",
  ];
}

// Función auxiliar para combinar múltiples páginas
export function combineTablePages(pages: TableData[]): TableData {
  if (pages.length === 0) {
    return {
      headers: getAllHeaders(),
      rows: [],
      metadata: {
        totalRows: 0,
        totalColumns: getAllHeaders().length,
        pageNumber: 0,
      },
    };
  }

  const combinedRows: TableRow[] = [];
  const headers = getAllHeaders();

  pages.forEach((page) => {
    combinedRows.push(...page.rows);
  });

  return {
    headers: headers,
    rows: combinedRows,
    metadata: {
      totalRows: combinedRows.length,
      totalColumns: headers.length,
      pageNumber: pages.length,
    },
  };
}
