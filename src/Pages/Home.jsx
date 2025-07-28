

import { useEffect, useState } from 'react';

function Home() {
    const [pdfText, setPdfText] = useState('Cargando...');

    useEffect(() => {
        async function fetchTextFromBackend() {
            try {
                const response = await fetch('http://localhost:3001/extract-pdf');
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
        }
        fetchTextFromBackend();
    }, []);

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
            <div className="border rounded p-4 bg-light w-100" style={{ maxWidth: 700 }}>
                <h4 className="mb-3">Texto extraído del PDF:</h4>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{pdfText}</pre>
            </div>
        </div>
    );
}

export default Home;
