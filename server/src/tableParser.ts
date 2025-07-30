interface TextElement {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontFace: number;
}

interface TableRow {
  [columnName: string]: string;
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

// Definir los grupos de columnas según la estructura proporcionada
const COLUMN_GROUPS = {
  COL_1_CLASSIFICACIO: ["CLASSIFICACIÓ"],
  COL_2_NBE_ETIQUETA_DALTA: ["N. BÉ", "ETIQUETA", "D- ALTA"],
  COL_3_QUANT_DESCRIPCIO: ["QUANT", "DESCRIPCIÓ"],
  COL_4_CGESTOR_CCOST_TITULAR: ["C. GESTOR", "C. COST", "TITULAR"],
  COL_5_TADQ_SPATRIM_NAT_ÚS: [
    "T. ADQUISICIÓ",
    "S. PATRIMONIAL",
    "NATURALESA",
    "ÚS",
  ],
  COL_6_VBC_FA_FP_VC: ["V.B.C.", "F.A.", "F.P.", "V.C."],
  COL_7_DOT_MERCAT_ASSEGURAN_VRU: [
    "DOT. AMORT",
    "V. MERCAT",
    "V. ASSEGURAN",
    "V.R.U.",
  ],
  COL_8_DATA: ["DATA"],
};

// Rangos aproximados de posición X para cada grupo de columnas
const COLUMN_X_RANGES = {
  COL_1_CLASSIFICACIO: { min: 2.0, max: 8.0 },
  COL_2_NBE_ETIQUETA_DALTA: { min: 6.0, max: 12.0 },
  COL_3_QUANT_DESCRIPCIO: { min: 9.0, max: 27.0 },
  COL_4_CGESTOR_CCOST_TITULAR: { min: 17.0, max: 28.0 },
  COL_5_TADQ_SPATRIM_NAT_ÚS: { min: 28.0, max: 37.0 },
  COL_6_VBC_FA_FP_VC: { min: 36.0, max: 44.0 },
  COL_7_DOT_MERCAT_ASSEGURAN_VRU: { min: 39.0, max: 48.0 },
  COL_8_DATA: { min: 43.0, max: 50.0 },
};

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
      headers: Object.values(COLUMN_GROUPS).flat(),
      rows: [],
      metadata: {
        totalRows: 0,
        totalColumns: Object.values(COLUMN_GROUPS).flat().length,
        pageNumber,
      },
    };
  }

  // 2. Para cada código de clasificación, definir el área de la fila
  const rows: TableRow[] = [];
  const yTolerance = 2.0; // Tolerancia más amplia para capturar elementos de la misma fila

  classificationElements.forEach((classElement, rowIndex) => {
    console.log(
      `\nProcesando fila ${rowIndex + 1} - Clasificación: ${classElement.text}`
    );

    // Definir el rango Y para esta fila
    const rowYStart = classElement.y;
    let rowYEnd = rowYStart + 4.0; // Por defecto, 4 unidades hacia abajo

    // Si hay otra clasificación después, usar su Y como límite
    if (rowIndex < classificationElements.length - 1) {
      rowYEnd = Math.min(rowYEnd, classificationElements[rowIndex + 1].y - 0.1);
    }

    console.log(`  Rango Y de fila: ${rowYStart} - ${rowYEnd}`);

    // 3. Obtener todos los elementos dentro del rango Y de esta fila
    const rowElements = textElements.filter(
      (el) =>
        el.y >= rowYStart - yTolerance &&
        el.y <= rowYEnd + yTolerance &&
        el.text.trim().length > 0
    );

    console.log(`  Elementos en la fila: ${rowElements.length}`);

    // 4. Agrupar elementos por columnas basándose en posición X
    const row: TableRow = {};

    // Inicializar la clasificación
    row["CLASSIFICACIÓ"] = classElement.text;

    // Procesar cada elemento y asignarlo a su columna correspondiente
    rowElements.forEach((element) => {
      const text = element.text.trim();
      const x = element.x;

      // Saltar el elemento de clasificación ya procesado
      if (text === classElement.text) return;

      // Determinar a qué grupo de columnas pertenece basándose en posición X
      for (const [groupKey, range] of Object.entries(COLUMN_X_RANGES)) {
        if (x >= range.min && x <= range.max) {
          const columns = COLUMN_GROUPS[groupKey as keyof typeof COLUMN_GROUPS];

          // Asignar el texto a la columna más apropiada dentro del grupo
          const assignedColumn = assignToColumnInGroup(
            text,
            columns,
            row,
            element
          );
          if (assignedColumn) {
            console.log(`    "${text}" -> ${assignedColumn} (X: ${x})`);
          }
          break;
        }
      }
    });

    // 5. Post-procesamiento para limpiar y combinar datos
    postProcessRow(row);

    rows.push(row);
    console.log(`  Fila completada:`, row);
  });

  return {
    headers: Object.values(COLUMN_GROUPS).flat(),
    rows: rows,
    metadata: {
      totalRows: rows.length,
      totalColumns: Object.values(COLUMN_GROUPS).flat().length,
      pageNumber: pageNumber,
    },
  };
}

function assignToColumnInGroup(
  text: string,
  columns: string[],
  row: TableRow,
  element: TextElement
): string | null {
  // Lógica específica para asignar texto a columnas dentro de cada grupo

  // Detectar números de bien (N. BÉ) - números enteros pequeños
  if (columns.includes("N. BÉ") && text.match(/^\d{1,4}$/)) {
    if (!row["N. BÉ"]) {
      row["N. BÉ"] = text;
      return "N. BÉ";
    }
  }

  // Detectar cantidades (QUANT) - usualmente 0 o números pequeños
  if (
    columns.includes("QUANT") &&
    text.match(/^\d{1,2}$/) &&
    element.x >= 9.0 &&
    element.x <= 11.0
  ) {
    row["QUANT"] = text;
    return "QUANT";
  }

  // Detectar valores monetarios - números con decimales y comas
  if (text.match(/^[\d.,]+$/)) {
    if (columns.includes("V.B.C.") && !row["V.B.C."]) {
      row["V.B.C."] = text;
      return "V.B.C.";
    }
    if (columns.includes("C. COST") && !row["C. COST"]) {
      row["C. COST"] = text;
      return "C. COST";
    }
    if (columns.includes("V. MERCAT") && !row["V. MERCAT"]) {
      row["V. MERCAT"] = text;
      return "V. MERCAT";
    }
    if (columns.includes("V. ASSEGURAN") && !row["V. ASSEGURAN"]) {
      row["V. ASSEGURAN"] = text;
      return "V. ASSEGURAN";
    }
    if (columns.includes("V.R.U.") && !row["V.R.U."]) {
      row["V.R.U."] = text;
      return "V.R.U.";
    }
  }

  // Detectar fechas
  if (text.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    if (columns.includes("D- ALTA")) {
      row["D- ALTA"] = text;
      return "D- ALTA";
    }
    if (columns.includes("DATA")) {
      row["DATA"] = text;
      return "DATA";
    }
  }

  // Detectar valores específicos
  if (text === "0") {
    if (columns.includes("F.A.") && !row["F.A."]) {
      row["F.A."] = text;
      return "F.A.";
    }
    if (columns.includes("F.P.") && !row["F.P."]) {
      row["F.P."] = text;
      return "F.P.";
    }
    if (columns.includes("V.C.") && !row["V.C."]) {
      row["V.C."] = text;
      return "V.C.";
    }
  }

  // Detectar tipos de adquisición
  if (columns.includes("T. ADQUISICIÓ")) {
    if (text === "COMPRA" || text.includes("INSPECCIÓ")) {
      row["T. ADQUISICIÓ"] = text;
      return "T. ADQUISICIÓ";
    }
  }

  // Detectar titular
  if (columns.includes("TITULAR") && text === "PROPIETAT") {
    row["TITULAR"] = text;
    return "TITULAR";
  }

  // Detectar naturalesa y situación patrimonial
  if (columns.includes("NATURALESA") || columns.includes("S. PATRIMONIAL")) {
    if (
      text.includes("DOMINI PÚBLIC") ||
      text === "PATRIMONIAL" ||
      text === "PÚBLIC"
    ) {
      if (columns.includes("NATURALESA")) {
        if (!row["NATURALESA"]) {
          row["NATURALESA"] = text;
        } else {
          row["NATURALESA"] += " " + text;
        }
        return "NATURALESA";
      }
      if (columns.includes("S. PATRIMONIAL")) {
        if (!row["S. PATRIMONIAL"]) {
          row["S. PATRIMONIAL"] = text;
        } else {
          row["S. PATRIMONIAL"] += " " + text;
        }
        return "S. PATRIMONIAL";
      }
    }
  }

  // Descripción - texto descriptivo
  if (columns.includes("DESCRIPCIÓ")) {
    if (!row["DESCRIPCIÓ"]) {
      row["DESCRIPCIÓ"] = text;
    } else {
      row["DESCRIPCIÓ"] += " " + text;
    }
    return "DESCRIPCIÓ";
  }

  return null;
}

function postProcessRow(row: TableRow): void {
  // Limpiar y normalizar datos de la fila

  // Limpiar espacios extra en descripción
  if (row["DESCRIPCIÓ"]) {
    row["DESCRIPCIÓ"] = row["DESCRIPCIÓ"].replace(/\s+/g, " ").trim();
  }

  // Combinar naturalesa y situación patrimonial si están fragmentadas
  if (row["NATURALESA"]) {
    row["NATURALESA"] = row["NATURALESA"].replace(/\s+/g, " ").trim();
  }

  if (row["S. PATRIMONIAL"]) {
    row["S. PATRIMONIAL"] = row["S. PATRIMONIAL"].replace(/\s+/g, " ").trim();
  }

  // Asegurar que T. ADQUISICIÓ esté completa
  if (row["T. ADQUISICIÓ"] && row["T. ADQUISICIÓ"].includes("INSPECCIÓ")) {
    row["T. ADQUISICIÓ"] = "INSPECCIÓ FÍSICA O INVENTARI";
  }
}

// Función auxiliar para combinar múltiples páginas
export function combineTablePages(pages: TableData[]): TableData {
  if (pages.length === 0) {
    return {
      headers: Object.values(COLUMN_GROUPS).flat(),
      rows: [],
      metadata: {
        totalRows: 0,
        totalColumns: Object.values(COLUMN_GROUPS).flat().length,
        pageNumber: 0,
      },
    };
  }

  const combinedRows: TableRow[] = [];
  const headers = Object.values(COLUMN_GROUPS).flat();

  pages.forEach((page) => {
    combinedRows.push(...page.rows);
  });

  return {
    headers: headers,
    rows: combinedRows,
    metadata: {
      totalRows: combinedRows.length,
      totalColumns: headers.length,
      pageNumber: pages.length, // número total de páginas
    },
  };
}
