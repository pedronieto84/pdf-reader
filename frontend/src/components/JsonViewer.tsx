import { useEffect, useState } from 'react';
import { filterData } from '../utils/filterData';

interface JsonViewerProps {
  data?: object | null;
  title?: string;
}

interface ErrorData {
  error: string;
  details: string;
}

function JsonViewer({ data, title = "Datos JSON" }: JsonViewerProps) {
  const [filteredData, setFilteredData] = useState<unknown>(null);

  useEffect(() => {
    if (data) {
      // Aplicar la función de filtrado
      const processed = filterData(data);
      setFilteredData(processed);
    } else {
      setFilteredData(null);
    }
  }, [data]);

  const hasError = filteredData && typeof filteredData === 'object' && 'error' in filteredData;

  return (
    <div className="card">
      <div className="card-header bg-info text-white">
        <h5 className="card-title mb-0">{title}</h5>
      </div>
      <div className="card-body">
        {hasError ? (
          <div className="alert alert-danger" role="alert">
            <h6 className="alert-heading">
              <i className="me-2">⚠️</i>
              Error al cargar datos
            </h6>
            <p className="mb-0">
              {(filteredData as ErrorData).error}: {(filteredData as ErrorData).details}
            </p>
          </div>
        ) : filteredData ? (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="badge bg-success">
                Datos cargados correctamente
              </span>
              <small className="text-muted">
                {Array.isArray(filteredData) 
                  ? `${filteredData.length} elementos` 
                  : typeof filteredData === 'object' 
                    ? `${Object.keys(filteredData as object).length} propiedades`
                    : 'Datos disponibles'
                }
              </small>
            </div>
            <pre 
              className="bg-light p-3 rounded overflow-auto border" 
              style={{ 
                maxHeight: '500px',
                fontSize: '0.875rem',
                lineHeight: '1.4'
              }}
            >
              <code>{JSON.stringify(filteredData, null, 2)}</code>
            </pre>
          </div>
        ) : (
          <div className="text-center text-muted py-4">
            <p className="mb-0">
              <span className="h1 d-block mb-3">📄</span>
              No hay datos para mostrar
            </p>
            <small>
              Selecciona un poble y opción para cargar los datos JSON correspondientes
            </small>
          </div>
        )}
      </div>
    </div>
  );
}

export default JsonViewer;
