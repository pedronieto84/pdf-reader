

import { useEffect, useState } from 'react';

function Home() {
    const [pdfText, setPdfText] = useState('Cargando...');
    const [selectedPdf, setSelectedPdf] = useState('sant-boi');
    const [selectedPage, setSelectedPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const fetchTextFromBackend = async (which, page) => {
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
                setPdfText(data.text || 'No se pudo extraer texto.');
            } else {
                setPdfText('Error al conectar con el servidor.');
            }
        } catch (e) {
            console.error('Error al obtener el texto del PDF:', e);
            setPdfText('Error al conectar con el servidor.');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTextFromBackend(selectedPdf, selectedPage);
    }, [selectedPdf, selectedPage]);

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
        <div style={{ width: '100vw', marginTop: '5px', padding: '0 15px', marginLeft: '-15px', marginRight: '-15px' }}>
            {/* Formulario de selección */}
            <div className="card mb-4" style={{ margin: '0 15px' }}>
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
                    {loading && (
                        <div className="mt-3">
                            <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                            Cargando...
                        </div>
                    )}
                </div>
            </div>

            {/* Contenido del PDF */}
            <div style={{ display: 'flex', gap: '20px', margin: '0 15px' }}>
                <div style={{ flex: '2' }}>
                    <div className="border rounded p-4 bg-light">
                        <h4 className="mb-3">Texto extraído del PDF:</h4>
                        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{pdfText}</pre>
                    </div>
                </div>
                <div style={{ flex: '1' }}>
                    <div className="border rounded p-4 bg-success text-white">
                        <h5 className="mb-3">Resultado de Sanitations</h5>
                        <div className="mb-2">
                            <strong>Estado:</strong> Pendiente de implementar
                        </div>
                        <div className="mb-2">
                            <strong>Líneas procesadas:</strong> 0
                        </div>
                        <div className="mb-2">
                            <strong>Líneas sanitizadas:</strong> 0
                        </div>
                        <div>
                            <strong>Tiempo de procesado:</strong> -- ms
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
