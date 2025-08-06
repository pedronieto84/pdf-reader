import { useMemo } from "react";
import { filterData } from "../utils/filterData";
import type { Root } from "../interfaces";

interface JsonViewerProps {
  data?: object | null;
  title?: string;
  loading?: boolean;
}

interface ErrorData {
  error: string;
  details: string;
}

function JsonViewer({
  data,
  title = "Datos JSON",
  loading = false,
}: JsonViewerProps) {
  // Usar useMemo en lugar de useEffect + useState para evitar bucles
  const filteredData = useMemo(() => {
    if (data) {
      try {
        // Verificar si los datos tienen la estructura esperada
        if (typeof data === "object" && "data" in data && "message" in data) {
          return filterData(data as Root);
        } else {
          // Si no tiene la estructura esperada, mostrar los datos tal como están
          return data;
        }
      } catch (error) {
        console.error("Error filtering data:", error);
        return { error: "Error procesando datos", details: String(error) };
      }
    }
    return null;
  }, [data]);

  const hasError =
    filteredData && typeof filteredData === "object" && "error" in filteredData;

  return (
    <div className="card">
      <div className="card-header bg-info text-white">
        <h5 className="card-title mb-0">{title}</h5>
      </div>
      <div className="card-body">
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-2 text-muted">Cargando datos...</p>
          </div>
        ) : hasError ? (
          <div className="alert alert-danger" role="alert">
            <h6 className="alert-heading">
              <i className="me-2">⚠️</i>
              Error al cargar datos
            </h6>
            <p className="mb-0">
              {(filteredData as ErrorData).error}:{" "}
              {(filteredData as ErrorData).details}
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
                  : typeof filteredData === "object"
                  ? `${Object.keys(filteredData as object).length} propiedades`
                  : "Datos disponibles"}
              </small>
            </div>
            <pre
              className="bg-light p-3 rounded overflow-auto border"
              style={{
                maxHeight: "500px",
                fontSize: "0.875rem",
                lineHeight: "1.4",
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
              Selecciona un poble y opción para cargar los datos JSON
              correspondientes
            </small>
          </div>
        )}
      </div>
    </div>
  );
}

export default JsonViewer;
