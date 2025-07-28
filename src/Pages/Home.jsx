

import { useEffect, useState } from 'react';

function Home() {
    const [pdfText, setPdfText] = useState('Cargando...');
    const [pdfStats, setPdfStats] = useState({ numPages: 0, totalCharacters: 0 });

    useEffect(() => {
        async function fetchTextFromBackend() {
            try {
                const response = await fetch('http://localhost:3001/extract-pdf');
                if (response.ok) {
                    const data = await response.json();
                    setPdfText(data.text || 'No se pudo extraer texto.');
                    setPdfStats({
                        numPages: data.numPages || 0,
                        totalCharacters: data.totalCharacters || 0
                    });
                } else {
                    setPdfText('Error al conectar con el servidor.');
                }
            } catch (e) {
                console.error('Error al obtener el texto del PDF:', e);
                setPdfText('Error al conectar con el servidor.');
            }
        }
        fetchTextFromBackend();
    }, []);

    return (
        <div className="container mt-4">
            <div className="row">
                <div className="col-md-8">
                    <div className="border rounded p-4 bg-light">
                        <h4 className="mb-3">Texto extraído del PDF:</h4>
                        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{pdfText}</pre>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="border rounded p-4 bg-info text-white">
                        <h5 className="mb-3">Estadísticas del PDF</h5>
                        <div className="mb-2">
                            <strong>Páginas:</strong> {pdfStats.numPages}
                        </div>
                        <div>
                            <strong>Caracteres totales:</strong> {pdfStats.totalCharacters.toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
