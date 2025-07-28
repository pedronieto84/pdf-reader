

import { useEffect, useState, useCallback } from 'react';

function Home() {
    const [pdfText, setPdfText] = useState('');
    const [sanitizedText, setSanitizedText] = useState('');
    const [selectedPdf, setSelectedPdf] = useState('sant-boi');
    const [selectedPage, setSelectedPage] = useState(1);
    const [loading, setLoading] = useState(false);

    // Función de sanitización - aquí puedes aplicar tu lógica personalizada
    const sanitizeTextArray = useCallback((text) => {
        console.log('Función sanitizeTextArray ejecutada con texto:', text ? text.substring(0, 50) + '...' : 'texto vacío');

        if (!text || text === 'Cargando...' || text.includes('Error')) {
            console.log('Retornando texto sin procesar');
            return text;
        }

        // Convertir el texto en array de líneas
        let lines = text.split('\n');
        console.log('Líneas originales:', lines.length);

        // AQUÍ PUEDES EMPEZAR A APLICAR TU LÓGICA DE SANITIZACIÓN
        // Ejemplo básico - puedes modificar estas reglas:

        // 1. Filtrar líneas vacías
        lines = lines.filter(line => line.trim().length > 0);
        console.log('Después de filtrar vacías:', lines.length);

        // 2. Eliminar espacios en blanco al principio y al final de cada línea
        lines = lines.map(line => line.trim());
        console.log('Después de trim:', lines.length);

        // 3. Quitar los elementos del array entre las posiciones 0 y 26
        if (lines.length > 27) {
            lines = lines.slice(27);
            console.log('Después de quitar elementos entre 0 y 26:', lines.length);
        }

        // 4. Añadir separación antes de líneas con códigos numéricos de 6 dígitos
        const linesWithSeparation = [];
        for (let i = 0; i < lines.length; i++) {
            // Verificar si la línea contiene un código numérico de exactamente 6 dígitos (sin comas ni puntos)
            const hasNumericCode = /\b\d{6}\b/.test(lines[i]);
            if (hasNumericCode && linesWithSeparation.length > 0) {
                linesWithSeparation.push(''); // Añadir elemento vacío antes del código
            }
            linesWithSeparation.push(lines[i]);
        }
        lines = linesWithSeparation;
        console.log('Después de añadir separación antes de códigos de 6 dígitos:', lines.length);

        // TODO: Agregar más reglas de sanitización aquí

        const result = lines.join('\n');
        console.log('Resultado final:', result.substring(0, 100) + '...');
        return result;
    }, []);

    const fetchTextFromBackend = useCallback(async (which, page) => {
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
                const data = await response.json();
                const extractedText = data.text || 'No se pudo extraer texto.';
                console.log('Texto extraído:', extractedText.substring(0, 100) + '...');

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
                console.log('Texto sanitizado:', sanitized.substring(0, 100) + '...');
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

    const handlePdfChange = (e) => {
        setSelectedPdf(e.target.value);
    };

    const handlePageChange = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= 1) {
            setSelectedPage(value);
        }
    };

    const incrementPage = () => {
        setSelectedPage(prev => prev + 1);
    };

    const decrementPage = () => {
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
