interface TextElement {
    x: number;
    y: number;
    width: number;
    height: number;
    text: string;
    fontFace: number;
}

interface LlibreARow {
    // Columna 1: ID (sin nombre)
    "ID": string;

    // Columna 2: CLASSIFICACIÓ
    "CLASSIFICACIÓ": string;

    // Columna 3: N.BÉ
    "N.BÉ": string;

    // Columna 4: Quant.
    "QUANT.": string;

    // Columna 5: Descripció
    "DESCRIPCIÓ": string;

    // Columna 6: C.Gesto
    "C.GESTO": string;

    // Columna 7: C.Cost
    "C.COST": string;

    // Columna 8: T.Adquisició
    "T.ADQUISICIÓ": string;

    // Columna 9: Cost Adqui.
    "COST ADQUI.": string;

    // Columna 10: D-Alta
    "D-ALTA": string;

    // Columna 11: Centre
    "CENTRE": string;

    // Columna 12: Ubicació
    "UBICACIÓ": string;

    // Columna 13: Planta
    "PLANTA": string;

    // Columna 14: Espai
    "ESPAI": string;

    // Columna 15: V.B.C
    "V.B.C": string;

    // Columna 16: Dot. Amort
    "DOT. AMORT": string;

    // Columna 17: F.A
    "F.A": string;

    // Columna 18: V.C.
    "V.C.": string;
}interface LlibreATableData {
    headers: string[];
    rows: LlibreARow[];
    metadata: {
        totalRows: number;
        totalColumns: number;
        pageNumber: number;
    };
}

// Definiciones de columnas para LlibreA (18 columnas)
const LLIBRE_A_COLUMN_DEFINITIONS = [
    {
        name: "COL_1_ID",
        xRange: { min: 0.5, max: 1.5 },
        fields: ["ID"],
        type: "number"
    },
    {
        name: "COL_2_CLASSIFICACIO",
        xRange: { min: 1.5, max: 3.0 },
        fields: ["CLASSIFICACIÓ"],
        type: "number", // 6 dígitos
        validation: /^\d{6}$/
    },
    {
        name: "COL_3_N_BE",
        xRange: { min: 3.0, max: 4.5 },
        fields: ["N.BÉ"],
        type: "number"
    },
    {
        name: "COL_4_5_QUANT_DESCRIPCIO",
        xRange: { min: 4.5, max: 8.0 },
        fields: ["QUANT.", "DESCRIPCIÓ"],
        type: "vertical", // Columna vertical con 2 celdas
        stackOrder: ["QUANT.", "DESCRIPCIÓ"] // QUANT arriba, DESCRIPCIÓ abajo
    },
    {
        name: "COL_6_7_CGESTO_CCOST",
        xRange: { min: 8.0, max: 9.5 },
        fields: ["C.GESTO", "C.COST"],
        type: "vertical",
        stackOrder: ["C.GESTO", "C.COST"]
    },
    {
        name: "COL_8_T_ADQUISICIO",
        xRange: { min: 9.5, max: 11.0 },
        fields: ["T.ADQUISICIÓ"],
        type: "string"
    },
    {
        name: "COL_9_10_COSTADQUI_DALTA",
        xRange: { min: 11.0, max: 13.0 },
        fields: ["COST ADQUI.", "D-ALTA"],
        type: "vertical",
        stackOrder: ["COST ADQUI.", "D-ALTA"]
    },
    {
        name: "COL_11_12_CENTRE_UBICACIO",
        xRange: { min: 13.0, max: 15.0 },
        fields: ["CENTRE", "UBICACIÓ"],
        type: "vertical",
        stackOrder: ["CENTRE", "UBICACIÓ"]
    },
    {
        name: "COL_13_14_PLANTA_ESPAI",
        xRange: { min: 15.0, max: 16.5 },
        fields: ["PLANTA", "ESPAI"],
        type: "vertical",
        stackOrder: ["PLANTA", "ESPAI"]
    },
    {
        name: "COL_15_16_VBC_DOTAMORT",
        xRange: { min: 16.5, max: 18.0 },
        fields: ["V.B.C", "DOT. AMORT"],
        type: "vertical",
        stackOrder: ["V.B.C", "DOT. AMORT"]
    },
    {
        name: "COL_17_18_FA_VC",
        xRange: { min: 18.0, max: 20.0 },
        fields: ["F.A", "V.C."],
        type: "vertical",
        stackOrder: ["F.A", "V.C."]
    }
];

export function parseTableFromPdf2JsonLlibreA(
    allTextElements: TextElement[][],
    pageNumber: number = 1
): LlibreATableData {
    console.log(`\n=== PROCESANDO DOCUMENTO LLIBRE A COMPLETO ===`);

    // Combinar todos los elementos de todas las páginas
    const textElements: TextElement[] = [];
    allTextElements.forEach((pageElements, index) => {
        console.log(`Página ${index + 1}: ${pageElements.length} elementos`);
        textElements.push(...pageElements);
    });

    console.log(`Total de elementos de texto: ${textElements.length}`);

    // DEBUG: Mostrar una muestra de elementos para entender las coordenadas
    console.log("=== MUESTRA DE ELEMENTOS PARA DEBUG ===");
    const sampleElements = textElements.slice(0, 20);
    sampleElements.forEach((el, index) => {
        console.log(`Elemento ${index}: X=${el.x}, Y=${el.y}, texto="${el.text}"`);
    });
    console.log("========================================");

    // 1. Encontrar todos los IDs de inventario (números incrementales que empiezan en 1)
    // Primero, expandir el rango para ver qué números están en diferentes posiciones X
    const allNumbers = textElements.filter((el) => {
        const text = el.text.trim();
        return /^\d+$/.test(text);
    });

    console.log(`Todos los números encontrados: ${allNumbers.length}`);
    allNumbers.slice(0, 10).forEach((el) => {
        console.log(`  - Número "${el.text}" en X: ${el.x}, Y: ${el.y}`);
    });

    const idElements = textElements.filter((el) => {
        const text = el.text.trim();
        const isNumber = /^\d+$/.test(text);
        const isInFirstColumn = el.x >= 0 && el.x <= 5; // Rango más amplio para debug
        return isNumber && isInFirstColumn;
    });

    console.log(`IDs de inventario encontrados: ${idElements.length}`);
    idElements.forEach((el) => {
        console.log(`  - ID ${el.text} en posición Y: ${el.y}, X: ${el.x}`);
    });

    if (idElements.length === 0) {
        console.log("No se encontraron IDs de inventario válidos");
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

    // 2. Ordenar IDs por posición Y (de arriba a abajo en el documento)
    idElements.sort((a, b) => a.y - b.y);

    // 3. Para cada ID, definir el área de la fila y procesar
    const rows: LlibreARow[] = [];

    idElements.forEach((idElement, rowIndex) => {
        const idValue = parseInt(idElement.text);
        console.log(`\nProcesando fila ${rowIndex + 1} - ID: ${idValue}`);

        // Definir el rango Y para esta fila (incluyendo elementos que pueden estar en páginas siguientes)
        const rowYStart = idElement.y;
        let rowYEnd = rowYStart + 6.0; // Rango más amplio para capturar elementos verticales

        // Si hay otro ID después, usar su Y como límite superior
        if (rowIndex < idElements.length - 1) {
            rowYEnd = Math.min(rowYEnd, idElements[rowIndex + 1].y - 0.1);
        }

        console.log(`  Rango Y de fila: ${rowYStart} - ${rowYEnd}`);

        // 4. Obtener todos los elementos dentro del rango Y de esta fila
        const rowElements = textElements.filter(
            (el) =>
                el.y >= rowYStart - 0.5 &&
                el.y <= rowYEnd + 0.5 &&
                el.text.trim().length > 0
        );

        console.log(`  Elementos en la fila: ${rowElements.length}`);

        // 5. Procesar la fila con el nuevo sistema de columnas
        const row = processLlibreARowByColumnsNew(rowElements, idElement);

        // 6. Filtrar filas que contengan "totales" o similares
        if (!isLlibreATotalRowNew(row)) {
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
            pageNumber: allTextElements.length,
        },
    };
}

function processLlibreARowByColumnsNew(
    rowElements: TextElement[],
    idElement: TextElement
): LlibreARow {
    const row: Partial<LlibreARow> = {};

    // Inicializar el ID
    row["ID"] = idElement.text;

    // Procesar cada columna
    LLIBRE_A_COLUMN_DEFINITIONS.forEach((columnDef) => {
        const columnElements = rowElements.filter(
            (el) =>
                el.x >= columnDef.xRange.min &&
                el.x <= columnDef.xRange.max &&
                el.text.trim() !== idElement.text // Excluir el elemento de ID ya procesado
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
        assignElementsToLlibreAColumnFieldsNew(columnElements, columnDef, row);
    });

    // Post-procesamiento y validación
    postProcessAndValidateLlibreARowNew(row);

    return row as LlibreARow;
}

function assignElementsToLlibreAColumnFieldsNew(
    elements: TextElement[],
    columnDef: any,
    row: Partial<LlibreARow>
): void {
    switch (columnDef.name) {
        case "COL_2_CLASSIFICACIO":
            // CLASSIFICACIÓ - debe ser exactamente 6 dígitos
            if (elements.length > 0) {
                const text = elements[0].text.trim();
                if (/^\d{6}$/.test(text)) {
                    row["CLASSIFICACIÓ"] = text;
                }
            }
            break;

        case "COL_3_N_BE":
            // N.BÉ - código numérico
            if (elements.length > 0) {
                const text = elements[0].text.trim();
                if (/^\d+$/.test(text)) {
                    row["N.BÉ"] = text;
                }
            }
            break;

        case "COL_4_5_QUANT_DESCRIPCIO":
            // Columna vertical: QUANT arriba, DESCRIPCIÓ abajo
            if (elements.length === 1) {
                // Solo un elemento, determinar si es QUANT o DESCRIPCIÓ
                const text = elements[0].text.trim();
                if (/^\d*\.?\d*$/.test(text) && text !== "") {
                    row["QUANT."] = text;
                } else {
                    row["DESCRIPCIÓ"] = text;
                }
            } else if (elements.length > 1) {
                // Múltiples elementos, separar por posición Y
                const upperElements = elements.filter((_, index) => index === 0);
                const lowerElements = elements.filter((_, index) => index > 0);

                if (upperElements.length > 0) {
                    const upperText = upperElements[0].text.trim();
                    if (/^\d*\.?\d*$/.test(upperText) && upperText !== "") {
                        row["QUANT."] = upperText;
                    }
                }

                if (lowerElements.length > 0) {
                    const lowerText = lowerElements.map(el => el.text.trim()).join(" ");
                    row["DESCRIPCIÓ"] = lowerText;
                }
            }
            break;

        case "COL_6_7_CGESTO_CCOST":
            // Columna vertical: C.GESTO arriba, C.COST abajo
            if (elements.length > 0) {
                const upperElement = elements[0];
                row["C.GESTO"] = upperElement.text.trim();
            }
            if (elements.length > 1) {
                const lowerElement = elements[1];
                row["C.COST"] = lowerElement.text.trim();
            }
            break;

        case "COL_8_T_ADQUISICIO":
            // T.ADQUISICIÓ - string
            if (elements.length > 0) {
                row["T.ADQUISICIÓ"] = elements.map(el => el.text.trim()).join(" ");
            }
            break;

        case "COL_9_10_COSTADQUI_DALTA":
            // Columna vertical: COST ADQUI arriba, D-ALTA abajo
            if (elements.length > 0) {
                const upperElement = elements[0];
                const upperText = upperElement.text.trim();
                // Si parece un número (con decimales), es COST ADQUI
                if (/^\d{1,3}(?:\.\d{3})*(?:,\d{2})?$/.test(upperText)) {
                    row["COST ADQUI."] = upperText;
                }
            }
            if (elements.length > 1) {
                const lowerElement = elements[1];
                const lowerText = lowerElement.text.trim();
                // Si parece una fecha DD/MM/YYYY, es D-ALTA
                if (/^\d{2}\/\d{2}\/\d{4}$/.test(lowerText)) {
                    row["D-ALTA"] = lowerText;
                }
            }
            break;

        case "COL_11_12_CENTRE_UBICACIO":
            // Columna vertical: CENTRE arriba, UBICACIÓ abajo
            if (elements.length > 0) {
                row["CENTRE"] = elements[0].text.trim();
            }
            if (elements.length > 1) {
                row["UBICACIÓ"] = elements[1].text.trim();
            }
            break;

        case "COL_13_14_PLANTA_ESPAI":
            // Columna vertical: PLANTA arriba, ESPAI abajo
            if (elements.length > 0) {
                row["PLANTA"] = elements[0].text.trim();
            }
            if (elements.length > 1) {
                row["ESPAI"] = elements[1].text.trim();
            }
            break;

        case "COL_15_16_VBC_DOTAMORT":
            // Columna vertical: V.B.C arriba, DOT. AMORT abajo
            if (elements.length > 0) {
                const upperElement = elements[0];
                row["V.B.C"] = upperElement.text.trim();
            }
            if (elements.length > 1) {
                const lowerElement = elements[1];
                row["DOT. AMORT"] = lowerElement.text.trim();
            }
            break;

        case "COL_17_18_FA_VC":
            // Columna vertical: F.A arriba, V.C. abajo
            if (elements.length > 0) {
                const upperElement = elements[0];
                row["F.A"] = upperElement.text.trim();
            }
            if (elements.length > 1) {
                const lowerElement = elements[1];
                row["V.C."] = lowerElement.text.trim();
            }
            break;

        default:
            break;
    }
}

function postProcessAndValidateLlibreARowNew(row: Partial<LlibreARow>): void {
    // Limpiar descripción
    if (row["DESCRIPCIÓ"]) {
        row["DESCRIPCIÓ"] = row["DESCRIPCIÓ"].replace(/\s+/g, " ").trim();
    }

    // Limpiar T.ADQUISICIÓ
    if (row["T.ADQUISICIÓ"]) {
        row["T.ADQUISICIÓ"] = row["T.ADQUISICIÓ"].replace(/\s+/g, " ").trim();
    }

    // Asegurar que los campos vacíos tengan valor por defecto
    const allFields: (keyof LlibreARow)[] = [
        "CLASSIFICACIÓ", "N.BÉ", "QUANT.", "DESCRIPCIÓ", "C.GESTO", "C.COST",
        "T.ADQUISICIÓ", "COST ADQUI.", "D-ALTA", "CENTRE", "UBICACIÓ",
        "PLANTA", "ESPAI", "V.B.C", "DOT. AMORT", "F.A", "V.C."
    ];

    allFields.forEach(field => {
        if (!row[field]) {
            row[field] = "-";
        }
    });
}

function isLlibreATotalRowNew(row: LlibreARow): boolean {
    // Verificar si es una fila de totales basándose en el contenido
    const checkFields = [row["DESCRIPCIÓ"], row["T.ADQUISICIÓ"], row["CENTRE"]];

    // También verificar si no tiene ID numérico válido (las filas de totales no tienen ID correlativo)
    const idIsValid = /^\d+$/.test(row["ID"]);

    const containsTotalKeywords = checkFields.some(field => {
        if (!field) return false;
        const lowerField = field.toLowerCase();
        return lowerField.includes("total") ||
            lowerField.includes("totals") ||
            lowerField.includes("totales") ||
            lowerField.includes("suma") ||
            lowerField.includes("subtotal");
    });

    return containsTotalKeywords || !idIsValid;
}

function getLlibreAHeaders(): string[] {
    return [
        "ID",
        "CLASSIFICACIÓ",
        "N.BÉ",
        "QUANT.",
        "DESCRIPCIÓ",
        "C.GESTO",
        "C.COST",
        "T.ADQUISICIÓ",
        "COST ADQUI.",
        "D-ALTA",
        "CENTRE",
        "UBICACIÓ",
        "PLANTA",
        "ESPAI",
        "V.B.C",
        "DOT. AMORT",
        "F.A",
        "V.C."
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

    // Ordenar por ID numérico para mantener el orden correcto
    combinedRows.sort((a, b) => {
        const idA = parseInt(a.ID) || 0;
        const idB = parseInt(b.ID) || 0;
        return idA - idB;
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
