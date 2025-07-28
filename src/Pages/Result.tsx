import { useState } from 'react';

interface DetectionResult {
    method?: string;
    error?: string;
    [key: string]: any;
}

function Result(): React.JSX.Element {
    const [results, setResults] = useState<DetectionResult | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const detectLinesWithImage = async (): Promise<void> => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3001/detect-lines-image');
            const data: DetectionResult = await response.json();
            setResults(data);
        } catch (error) {
            setResults({ error: 'Error al detectar líneas con imagen' });
        }
        setLoading(false);
    };

    const detectLinesWithContent = async (): Promise<void> => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3001/detect-lines-content');
            const data: DetectionResult = await response.json();
            setResults(data);
        } catch (error) {
            setResults({ error: 'Error al detectar líneas con análisis de contenido' });
        }
        setLoading(false);
    };

    return (
        <div className="container mt-4">
            <h2>Detección de Líneas Horizontales</h2>
            <div className="row mt-4">
                <div className="col-md-6">
                    <button
                        className="btn btn-primary w-100 mb-3"
                        onClick={detectLinesWithImage}
                        disabled={loading}
                    >
                        {loading ? 'Procesando...' : 'Detectar con pdf2pic (Imagen)'}
                    </button>
                </div>
                <div className="col-md-6">
                    <button
                        className="btn btn-success w-100 mb-3"
                        onClick={detectLinesWithContent}
                        disabled={loading}
                    >
                        {loading ? 'Procesando...' : 'Detectar con Análisis de Contenido'}
                    </button>
                </div>
            </div>

            {results && (
                <div className="mt-4">
                    <div className="card">
                        <div className="card-header">
                            <h5>Resultados - Método: {results.method}</h5>
                        </div>
                        <div className="card-body">
                            <pre>{JSON.stringify(results, null, 2)}</pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Result;
