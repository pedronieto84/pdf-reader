interface TextElement {
    x: number;
    y: number;
    width: number;
    height: number;
    text: string;
    fontFace: number;
}

interface LlibreARow {
    // Columna 1: N. INVENTARI
    "N. INVENTARI": string;

    // Columna 2: SECCIÓ / SUBSECCIÓ
    "SECCIÓ": string;
    "SUBSECCIÓ": string;

    // Columna 3: DESCRIPCIÓ DEL BÉ
    "DESCRIPCIÓ DEL BÉ": string;

    // Columna 4: QUANTITAT
    "QUANTITAT": string;

    // Columna 5: PREU UNITARI
    "PREU UNITARI": string;

    // Columna 6: VALOR TOTAL
    "VALOR TOTAL": string;

    // Columna 7: OBSERVACIONS
    "OBSERVACIONS": string;
}

interface LlibreATableData {
    headers: string[];
    rows: LlibreARow[];
    metadata: {
        totalRows: number;
        totalColumns: number;
        pageNumber: number;
    };
}

// Definiciones de columnas para LlibreA
const LLIBRE_A_COLUMN_DEFINITIONS = [
    {
        name: "COL_1_N_INVENTARI",
        xRange: { min: 1, max: 3.5 },
        fields: ["N. INVENTARI"]
    },
    {
        name: "COL_2_SECCIO_SUBSECCIO",
        xRange: { min: 3.5, max: 6.5 },
        fields: ["SECCIÓ", "SUBSECCIÓ"]
    },
    {
        name: "COL_3_DESCRIPCIO",
        xRange: { min: 6.5, max: 11 },
        fields: ["DESCRIPCIÓ DEL BÉ"]
    },
    {
        name: "COL_4_QUANTITAT",
        xRange: { min: 11, max: 12.5 },
        fields: ["QUANTITAT"]
    },
    {
        name: "COL_5_PREU_UNITARI",
        xRange: { min: 12.5, max: 14.5 },
        fields: ["PREU UNITARI"]
    },
    {
        name: "COL_6_VALOR_TOTAL",
        xRange: { min: 14.5, max: 16.5 },
        fields: ["VALOR TOTAL"]
    },
    {
        name: "COL_7_OBSERVACIONS",
        xRange: { min: 16.5, max: 20 },
        fields: ["OBSERVACIONS"]
    }
];

export function parseTableFromPdf2JsonLlibreA(
    textElements: TextElement[],
    pageNumber: number = 1
): LlibreATableData {
    console.log(`\n=== PROCESANDO PÁGINA LLIBRE A ${pageNumber} ===`);

    // 1. Encontrar todos los números de inventario para identificar filas
    const inventoryElements = textElements.filter((el) =>
        el.text.trim().match(/^\d{1,4}$/) && el.x >= 1 && el.x <= 3.5
    );

    console.log(
        `Números de inventario encontrados: ${inventoryElements.length}`
    );
    inventoryElements.forEach((el) => {
        console.log(`  - ${el.text} en posición Y: ${el.y}`);
    });

    if (inventoryElements.length === 0) {
        console.log("No se encontraron números de inventario válidos");
        return {
            headers: getLlibreAHeaders(),
            rows: [],
            metadata: {
                totalRows: 0,
                totalColumns: getLlibreAHeaders().length,
                pageNumber,
            },
        };
    }

    // 2. Para cada número de inventario, definir el área de la fila
    const rows: LlibreARow[] = [];

    inventoryElements.forEach((inventoryElement, rowIndex) => {
        console.log(
            `\nProcesando fila ${rowIndex + 1} - Inventario: ${inventoryElement.text}`
        );

        // Definir el rango Y para esta fila
        const rowYStart = inventoryElement.y;
        let rowYEnd = rowYStart + 4.0;

        // Si hay otro inventario después, usar su Y como límite
        if (rowIndex < inventoryElements.length - 1) {
            rowYEnd = Math.min(rowYEnd, inventoryElements[rowIndex + 1].y - 0.1);
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
        const row = processLlibreARowByColumns(rowElements, inventoryElement);

        // 5. Filtrar filas que contengan "totales" o similares
        if (!isLlibreATotalRow(row)) {
            rows.push(row);
            console.log(`  Fila completada:`, row);
        } else {
            console.log(`  Fila de totales omitida:`, row);
        }
    });

    return {
        headers: getLlibreAHeaders(),
        rows: rows,
        metadata: {
            totalRows: rows.length,
            totalColumns: getLlibreAHeaders().length,
            pageNumber: pageNumber,
        },
    };
}

function processLlibreARowByColumns(
    rowElements: TextElement[],
    inventoryElement: TextElement
): LlibreARow {
    const row: Partial<LlibreARow> = {};

    // Inicializar el número de inventario
    row["N. INVENTARI"] = inventoryElement.text;

    // Procesar cada columna
    LLIBRE_A_COLUMN_DEFINITIONS.forEach((columnDef) => {
        const columnElements = rowElements.filter(
            (el) =>
                el.x >= columnDef.xRange.min &&
                el.x <= columnDef.xRange.max &&
                el.text.trim() !== inventoryElement.text // Excluir el elemento de inventario ya procesado
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
        assignElementsToLlibreAColumnFields(columnElements, columnDef, row);
    });

    // Post-procesamiento y validación
    postProcessAndValidateLlibreARow(row);

    return row as LlibreARow;
}

function assignElementsToLlibreAColumnFields(
    elements: TextElement[],
    columnDef: any,
    row: Partial<LlibreARow>
): void {
    switch (columnDef.name) {
        case "COL_2_SECCIO_SUBSECCIO":
            // SECCIÓ y SUBSECCIÓ
            elements.forEach((el, index) => {
                const text = el.text.trim();
                if (index === 0) {
                    row["SECCIÓ"] = text;
                } else if (index === 1) {
                    row["SUBSECCIÓ"] = text;
                } else {
                    // Si hay más elementos, concatenar a subsección
                    row["SUBSECCIÓ"] = (row["SUBSECCIÓ"] || "") + " " + text;
                }
            });
            break;

        case "COL_3_DESCRIPCIO":
            // DESCRIPCIÓ DEL BÉ (puede ser multilínea)
            const descripcio = elements.map(el => el.text.trim()).join(" ");
            row["DESCRIPCIÓ DEL BÉ"] = descripcio;
            break;

        case "COL_4_QUANTITAT":
            // QUANTITAT (número)
            if (elements.length > 0) {
                row["QUANTITAT"] = elements[0].text.trim();
            }
            break;

        case "COL_5_PREU_UNITARI":
            // PREU UNITARI (valor monetario)
            if (elements.length > 0) {
                row["PREU UNITARI"] = elements[0].text.trim();
            }
            break;

        case "COL_6_VALOR_TOTAL":
            // VALOR TOTAL (valor monetario)
            if (elements.length > 0) {
                row["VALOR TOTAL"] = elements[0].text.trim();
            }
            break;

        case "COL_7_OBSERVACIONS":
            // OBSERVACIONS (texto libre)
            const observacions = elements.map(el => el.text.trim()).join(" ");
            row["OBSERVACIONS"] = observacions;
            break;

        default:
            break;
    }
}

function postProcessAndValidateLlibreARow(row: Partial<LlibreARow>): void {
    // Limpiar descripción
    if (row["DESCRIPCIÓ DEL BÉ"]) {
        row["DESCRIPCIÓ DEL BÉ"] = row["DESCRIPCIÓ DEL BÉ"].replace(/\s+/g, " ").trim();
    }

    // Limpiar observaciones
    if (row["OBSERVACIONS"]) {
        row["OBSERVACIONS"] = row["OBSERVACIONS"].replace(/\s+/g, " ").trim();
    }

    // Asegurar que los campos vacíos tengan valor por defecto
    const defaultFields = ["SECCIÓ", "SUBSECCIÓ", "DESCRIPCIÓ DEL BÉ", "QUANTITAT", "PREU UNITARI", "VALOR TOTAL", "OBSERVACIONS"];
    defaultFields.forEach(field => {
        if (!row[field as keyof LlibreARow]) {
            row[field as keyof LlibreARow] = "-" as any;
        }
    });
}

function isLlibreATotalRow(row: LlibreARow): boolean {
    // Verificar si es una fila de totales basándose en el contenido
    const checkFields = [row["DESCRIPCIÓ DEL BÉ"], row["SECCIÓ"], row["SUBSECCIÓ"]];

    return checkFields.some(field => {
        if (!field) return false;
        const lowerField = field.toLowerCase();
        return lowerField.includes("total") ||
            lowerField.includes("suma") ||
            lowerField.includes("subtotal");
    });
}

function getLlibreAHeaders(): string[] {
    return [
        "N. INVENTARI",
        "SECCIÓ",
        "SUBSECCIÓ",
        "DESCRIPCIÓ DEL BÉ",
        "QUANTITAT",
        "PREU UNITARI",
        "VALOR TOTAL",
        "OBSERVACIONS"
    ];
}

export function combineTablePagesLlibreA(pages: LlibreATableData[]): LlibreATableData {
    if (pages.length === 0) {
        return {
            headers: getLlibreAHeaders(),
            rows: [],
            metadata: {
                totalRows: 0,
                totalColumns: getLlibreAHeaders().length,
                pageNumber: 0,
            },
        };
    }

    const combinedRows: LlibreARow[] = [];
    const headers = getLlibreAHeaders();

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
