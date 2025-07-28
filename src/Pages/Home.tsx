import { useEffect, useState, useCallback } from 'react';

// Tipos TypeScript
interface PDFData {
    text: string;
}

interface SanitizedObject {
    classificacio?: number;
}

interface TextSegmentObject {
    llibre: string | null;
    pag: number | null;
    text: string[];
    objectSanitized: SanitizedObject;
    items?: number;
}

function findClassificacio(array: string[]): string | null {
    const regex = /\b\d{6}\b/;
    console.log('regex', array);
    for (let i = 0; i < array.length; i++) {
        const match = array[i].match(regex);
        if (match) {
            console.log('match found:', match);
            return match[0]; // Retorna el código de 6 dígitos encontrado
        }
    }
    return null; // Si no encuentra ningún código de 6 dígitos
}

function sanitizeObject(array: string[]): SanitizedObject {
    const object: SanitizedObject = {};
    // Classificació 120103 numeric, 6 digits
    const classificacio = findClassificacio(array);
    console.log('classificacio:', classificacio);
    if (classificacio) {
        object.classificacio = parseInt(classificacio, 10);
    }
    console.log('Objeto creado:', object);
    return object; // Retorna el objeto sanitizado
}

function Home(): React.JSX.Element {
    const [pdfText, setPdfText] = useState<string>('');
    const [sanitizedText, setSanitizedText] = useState<string>('');
    const [selectedPdf, setSelectedPdf] = useState<string>('sant-boi');
    const [selectedPage, setSelectedPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);

    // Función de sanitización - aquí puedes aplicar tu lógica personalizada
    const sanitizeTextArray = useCallback((text: string): string => {
        if (!text || text === 'Cargando...' || text.includes('Error')) {
            return text;
        }

        // Convertir el texto en array de líneas
        let lines: string[] = text.split('\n');

        // AQUÍ PUEDES EMPEZAR A APLICAR TU LÓGICA DE SANITIZACIÓN
        // Ejemplo básico - puedes modificar estas reglas:

        // 1. Filtrar líneas vacías
        lines = lines.filter(line => line.trim().length > 0);

        const llibre: string | null = lines[6] || null;
        const pag: number | null = parseInt(lines[2]) || null;

        // 2. Eliminar espacios en blanco al principio y al final de cada línea
        lines = lines.map(line => line.trim());

        // 3. Quitar los elementos del array entre las posiciones 0 y 26
        if (lines.length > 27) {
            lines = lines.slice(27);
        }

        // 4. Añadir separación antes de líneas con códigos numéricos de 6 dígitos
        const linesWithSeparation: string[] = [];
        for (let i = 0; i < lines.length; i++) {
            // Verificar si la línea contiene un código numérico de exactamente 6 dígitos (sin comas ni puntos)
            const hasNumericCode = /\b\d{6}\b/.test(lines[i]);
            if (hasNumericCode && linesWithSeparation.length > 0) {
                linesWithSeparation.push(''); // Añadir elemento vacío antes del código
            }
            linesWithSeparation.push(lines[i]);
        }
        lines = linesWithSeparation;

        // 5. Cuando encuentres un elemento que contenga alguno de los 2 siguientes Strings: "TOTAL CLASSIFICACIÓ:" O "TOTAL GENERAL:", elimina todos los elementos del array
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('TOTAL CLASSIFICACIÓ:') || lines[i].includes('TOTAL GENERAL:')) {
                lines = ["Totales"]; // Cortar el array hasta el elemento anterior al encontrado
                break; // Salir del bucle una vez encontrado
            }
        }

        const object = {
            llibre,
            pag
        };

        // 6. Crear array de objetos basado en elementos vacíos como puntos de corte
        const objectsArray: TextSegmentObject[] = [];
        let lastCutIndex = 0;

        for (let i = 0; i < lines.length; i++) {
            if (lines[i] === '') {
                // Crear objeto con el texto desde el último corte hasta este punto
                const textSegment = lines.slice(lastCutIndex, i);
                const newObject: TextSegmentObject = {
                    ...object,
                    text: textSegment,
                    objectSanitized: { ...sanitizeObject(textSegment) }
                };
                objectsArray.push(newObject);
                lastCutIndex = i + 1; // Próximo segmento empieza después del elemento vacío
            }
        }

        // Añadir el último segmento (desde el último corte hasta el final)
        if (lastCutIndex < lines.length) {
            const textSegment = lines.slice(lastCutIndex);
            const newObject: TextSegmentObject = {
                ...object,
                items: lines.length,
                text: textSegment,
                objectSanitized: { ...sanitizeObject(textSegment) }
            };
            objectsArray.push(newObject);
        }

        console.log('Array de objetos con segmentos creado:', objectsArray);

        const result = lines.join('\n');
        return result;
    }, []);

    const fetchTextFromBackend = useCallback(async (which: string, page: number): Promise<void> => {
        setLoading(true);
        try {
            let url = `http://localhost:3001/extract-pdf?which=${which}`;
            if (page > 0) {
                // Formatear página con 2 dígitos (01, 02, 03, etc.)
                const formattedPage = page.toString().padStart(2, '0');
                url += `&page=${formattedPage}`;
            }

            const response = await fetch(url);
            if (response.ok) {
                const data: PDFData = await response.json();
                const extractedText = data.text || 'No se pudo extraer texto.';

                // Aplicar el mismo filtro de líneas vacías al pdfText para que coincida con sanitizedText
                let cleanedPdfText = extractedText;
                if (extractedText && !extractedText.includes('Error') && extractedText !== 'Cargando...') {
                    let lines = extractedText.split('\n');
                    lines = lines.filter(line => line.trim().length > 0);
                    lines = lines.map(line => line.trim());
                    cleanedPdfText = lines.join('\n');
                }

                setPdfText(cleanedPdfText);

                // Aplicar sanitización al texto extraído
                const sanitized = sanitizeTextArray(extractedText);
                setSanitizedText(sanitized);
            } else {
                const errorText = 'Error al conectar con el servidor.';
                setPdfText(errorText);
                setSanitizedText(errorText);
            }
        } catch (e) {
            console.error('Error al obtener el texto del PDF:', e);
            const errorText = 'Error al conectar con el servidor.';
            setPdfText(errorText);
            setSanitizedText(errorText);
        }
        setLoading(false);
    }, [sanitizeTextArray]);

    useEffect(() => {
        fetchTextFromBackend(selectedPdf, selectedPage);
    }, [selectedPdf, selectedPage, fetchTextFromBackend]);

    const handlePdfChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        setSelectedPdf(e.target.value);
    };

    const handlePageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= 1) {
            setSelectedPage(value);
        }
    };

    const incrementPage = (): void => {
        setSelectedPage(prev => prev + 1);
    };

    const decrementPage = (): void => {
        setSelectedPage(prev => Math.max(1, prev - 1));
    };

    return (
        <div style={{ width: '100vw', marginTop: '0px', padding: '0px 0px', marginLeft: '-15px', marginRight: '-15px' }}>
            {/* Formulario de selección */}
            <div className="card" style={{ margin: '0 15px', marginBottom: '15px' }}>
                <div className="card-header">
                    <h5>Selector de PDF</h5>
                </div>
                <div className="card-body">
                    <div className="row align-items-end">
                        <div className="col-6">
                            <label htmlFor="pdfSelect" className="form-label">Seleccionar PDF:</label>
                            <select
                                id="pdfSelect"
                                className="form-select"
                                value={selectedPdf}
                                onChange={handlePdfChange}
                            >
                                <option value="sant-boi">Sant Boi</option>
                                <option value="premia">Premia</option>
                            </select>
                        </div>
                        <div className="col-6">
                            <label className="form-label">Página:</label>
                            <div className="input-group" style={{ width: '100%' }}>
                                <button
                                    className="btn btn-outline-secondary"
                                    type="button"
                                    onClick={decrementPage}
                                    disabled={selectedPage <= 1 || loading}
                                    style={{ minWidth: '40px' }}
                                >
                                    ←
                                </button>
                                <input
                                    type="number"
                                    className="form-control text-center"
                                    value={selectedPage}
                                    onChange={handlePageChange}
                                    min="1"
                                    style={{ minWidth: '80px' }}
                                />
                                <button
                                    className="btn btn-outline-secondary"
                                    type="button"
                                    onClick={incrementPage}
                                    disabled={loading}
                                    style={{ minWidth: '40px' }}
                                >
                                    →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenido del PDF */}
            <div style={{
                display: 'flex',
                gap: '20px',
                margin: '0 15px',
                height: 'calc(100vh - 160px)'
            }}>
                <div style={{ flex: '1' }}>
                    <div className="border rounded p-4 bg-light" style={{ height: '100%' }}>
                        <h4 className="mb-3">Texto extraído del PDF:</h4>
                        <div style={{ height: 'calc(100% - 60px)', overflow: 'auto' }}>
                            <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>
                                {pdfText && pdfText.split('\n').map((line, index) => (
                                    <div key={index} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '2px',
                                        minHeight: '20px'
                                    }}>
                                        <span style={{
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word',
                                            flex: '1',
                                            paddingRight: '10px'
                                        }}>
                                            {line}
                                        </span>
                                        <span style={{
                                            color: '#888',
                                            fontSize: '12px',
                                            fontFamily: 'Arial, sans-serif',
                                            fontStyle: 'italic',
                                            minWidth: '30px',
                                            textAlign: 'right'
                                        }}>
                                            {index}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{ flex: '1' }}>
                    <div className="border rounded p-4 bg-light" style={{ height: '100%' }}>
                        <h4 className="mb-3">Resultado de Sanitations</h4>
                        <div style={{ height: 'calc(100% - 60px)', overflow: 'auto' }}>
                            <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>
                                {sanitizedText && sanitizedText.split('\n').map((line, index) => (
                                    <div key={index} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '2px',
                                        minHeight: '20px'
                                    }}>
                                        <span style={{
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word',
                                            flex: '1',
                                            paddingRight: '10px'
                                        }}>
                                            {line}
                                        </span>
                                        <span style={{
                                            color: '#888',
                                            fontSize: '12px',
                                            fontFamily: 'Arial, sans-serif',
                                            fontStyle: 'italic',
                                            minWidth: '30px',
                                            textAlign: 'right'
                                        }}>
                                            {index}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
