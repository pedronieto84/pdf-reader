import React, { useState, useEffect, useMemo } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";

interface TableRow {
    [key: string]: string | undefined;
}

interface TableData {
    headers: string[];
    rows: TableRow[];
    metadata: {
        totalRows: number;
        totalColumns: number;
        pageNumber: number;
    };
}

interface TableResponse {
    fileName: string;
    which: string;
    tableType: string; // Cambio: de 'page' a 'tableType'
    extractionMethod: string;
    table: TableData;
    source: string;
    totalPages?: number; // Nueva propiedad opcional
    processingTime?: string; // Nueva propiedad opcional
}

const TablaCompleta: React.FC = () => {
    const [selectedWhich, setSelectedWhich] = useState("sant-boi");
    const [selectedTable, setSelectedTable] = useState("relacio-bens"); // Nuevo estado para el tipo de tabla
    const [tableData, setTableData] = useState<TableResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState("");
    const [sortConfig, setSortConfig] = useState<{
        key: string;
        direction: "asc" | "desc";
    } | null>(null);

    // Eliminar el array de páginas ya que cargaremos todas automáticamente

    const fetchTableData = async () => {
        console.log('fetchTableData called with:', { selectedWhich, selectedTable });

        if (!selectedWhich || !selectedTable) {
            console.log('Missing parameters, aborting fetch');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const url = `http://localhost:3001/extract-full-pdf-table?which=${selectedWhich}&table=${selectedTable}`;
            console.log('Fetching from URL:', url);

            const response = await fetch(url);
            console.log('Response status:', response.status);

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data: TableResponse = await response.json();
            console.log('Data received:', data);
            setTableData(data);
        } catch (err) {
            console.error('Error in fetchTableData:', err);
            setError(err instanceof Error ? err.message : "Error desconocido");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log('useEffect triggered with:', { selectedWhich, selectedTable });
        try {
            fetchTableData();
        } catch (err) {
            console.error('Error in useEffect:', err);
            setError('Error initializing component');
        }
    }, [selectedWhich, selectedTable]);

    // Filtrar y ordenar datos
    const processedData = useMemo(() => {
        try {
            console.log('Processing data, tableData:', tableData);

            if (!tableData?.table?.rows) {
                console.log('No table data or rows available');
                return [];
            }

            let filteredRows = tableData.table.rows.filter((row) => {
                if (!filter) return true;

                return Object.values(row).some((value) =>
                    value?.toLowerCase().includes(filter.toLowerCase())
                );
            });

            // Aplicar ordenamiento
            if (sortConfig) {
                filteredRows.sort((a, b) => {
                    const aValue = a[sortConfig.key] || "";
                    const bValue = b[sortConfig.key] || "";

                    if (aValue < bValue) {
                        return sortConfig.direction === "asc" ? -1 : 1;
                    }
                    if (aValue > bValue) {
                        return sortConfig.direction === "asc" ? 1 : -1;
                    }
                    return 0;
                });
            }

            console.log('Processed rows:', filteredRows.length);
            return filteredRows;
        } catch (err) {
            console.error('Error processing data:', err);
            return [];
        }
    }, [tableData, filter, sortConfig]);

    // Calcular totales para las columnas numéricas
    const totalsData = useMemo(() => {
        if (!tableData?.table?.rows || tableData.table.rows.length === 0) {
            return null;
        }

        const numericColumns = [
            "QUANT", "V.B.C.", "F.A.", "F.P.", "V.C.", "DOT. AMORT",
            "V. MERCAT", "V. ASSEGURAN", "V.R.U."
        ];

        const totals = numericColumns.reduce((acc, column) => {
            const total = processedData.reduce((sum, row) => {
                const value = row[column];
                if (value && typeof value === 'string') {
                    // Remover separadores de miles y convertir comas por puntos
                    const cleanValue = value.replace(/\./g, '').replace(',', '.');
                    const numValue = parseFloat(cleanValue);
                    return !isNaN(numValue) ? sum + numValue : sum;
                }
                return sum;
            }, 0);

            acc[column] = total.toLocaleString('es-ES', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            return acc;
        }, {} as Record<string, string>);

        // Agregar etiqueta para la primera columna
        if (tableData.table.headers.length > 0) {
            totals[tableData.table.headers[0]] = "🧮 TOTALES";
        }

        return totals;
    }, [processedData, tableData]);

    const handleSort = (key: string) => {
        let direction: "asc" | "desc" = "asc";

        if (
            sortConfig &&
            sortConfig.key === key &&
            sortConfig.direction === "asc"
        ) {
            direction = "desc";
        }

        setSortConfig({ key, direction });
    };

    const getSortIcon = (columnKey: string) => {
        if (!sortConfig || sortConfig.key !== columnKey) {
            return <i className="bi bi-arrow-down-up text-muted ms-1"></i>;
        }

        return sortConfig.direction === "asc" ? (
            <i className="bi bi-arrow-up text-primary ms-1"></i>
        ) : (
            <i className="bi bi-arrow-down text-primary ms-1"></i>
        );
    };

    return (
        <div className="mt-4" style={{
            width: "100%",
            maxWidth: "calc(100vw - 30px)",
            overflowX: "hidden",
            boxSizing: "border-box",
            margin: "0 auto",
            paddingRight: "10px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            padding: "20px"
        }}>
            <div className="row" style={{ margin: 0 }}>
                <div className="col-12" style={{ padding: "0" }}>
                    <h2 className="mb-4">Tabla Completa de Relación de Bienes</h2>

                    {/* Selectores */}
                    <div className="card mb-4" style={{
                        backgroundColor: "#e3f2fd",
                        borderRadius: "10px",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                        border: "1px solid #bbdefb"
                    }}>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label htmlFor="which-select" className="form-label">
                                        Seleccionar municipio:
                                    </label>
                                    <select
                                        id="which-select"
                                        className="form-select"
                                        value={selectedWhich}
                                        onChange={(e) => setSelectedWhich(e.target.value)}
                                    >
                                        <option value="sant-boi">Sant Boi de Lluçanès</option>
                                        <option value="collbato">Collbató</option>
                                        <option value="premia-de-dalt">Premia de Dalt</option>
                                    </select>
                                </div>

                                <div className="col-md-4">
                                    <label htmlFor="table-select" className="form-label">
                                        Seleccionar tipo de tabla:
                                    </label>
                                    <select
                                        id="table-select"
                                        className="form-select"
                                        value={selectedTable}
                                        onChange={(e) => setSelectedTable(e.target.value)}
                                    >
                                        <option value="relacio-bens">Relación de Bienes</option>
                                        <option value="LlibreA">Llibre A</option>
                                    </select>
                                </div>

                                <div className="col-md-4 d-flex align-items-end">
                                    <button
                                        className="btn btn-success"
                                        onClick={fetchTableData}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" />
                                                Cargando todas las páginas...
                                            </>
                                        ) : (
                                            "Cargar PDF Completo"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filtro */}
                    {tableData && (
                        <div className="card mb-4" style={{
                            backgroundColor: "#f3e5f5",
                            borderRadius: "10px",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                            border: "1px solid #e1bee7"
                        }}>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <label htmlFor="filter-input" className="form-label">
                                            Filtrar tabla:
                                        </label>
                                        <input
                                            id="filter-input"
                                            type="text"
                                            className="form-control"
                                            placeholder="Buscar en toda la tabla..."
                                            value={filter}
                                            onChange={(e) => setFilter(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-6 d-flex align-items-end">
                                        <div className="text-muted">
                                            Mostrando {processedData.length} de{" "}
                                            {tableData.table.metadata.totalRows} filas
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="alert alert-danger" role="alert" style={{
                            backgroundColor: "#ffebee",
                            borderRadius: "10px",
                            boxShadow: "0 2px 8px rgba(244, 67, 54, 0.2)",
                            border: "1px solid #ffcdd2"
                        }}>
                            <strong>Error:</strong> {error}
                        </div>
                    )}

                    {/* Tabla */}
                    {tableData && tableData.table && tableData.table.headers ? (
                        <div className="card" style={{
                            width: "100%",
                            maxWidth: "100%",
                            overflow: "hidden",
                            margin: "0",
                            backgroundColor: "#fff3e0",
                            borderRadius: "12px",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                            border: "1px solid #ffcc02"
                        }}>
                            <div className="card-header" style={{
                                backgroundColor: "#ffecb3",
                                borderBottom: "1px solid #ffcc02",
                                borderRadius: "12px 12px 0 0"
                            }}>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 className="card-title mb-0">
                                            📊 {tableData.fileName || 'PDF'} - Tabla Completa
                                        </h5>
                                        <small className="text-muted">
                                            {tableData.extractionMethod || 'Extracción'} |
                                            Fuente: {tableData.source || 'N/A'}
                                        </small>
                                    </div>
                                    <div className="text-end">
                                        <div className="badge bg-primary fs-6">
                                            {tableData.totalPages || 'N/A'} páginas
                                        </div>
                                        <div className="badge bg-success fs-6 ms-2">
                                            {tableData.table.metadata?.totalRows || 0} filas
                                        </div>
                                        <div className="badge bg-info fs-6 ms-2">
                                            {tableData.table.metadata?.totalColumns || tableData.table.headers.length} columnas
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body p-0">
                                <div
                                    className="table-responsive"
                                    style={{
                                        maxHeight: "75vh", // Aumentar altura para más filas
                                        minHeight: "400px", // Altura mínima
                                        overflowY: "auto",
                                        overflowX: "auto",
                                        width: "100%",
                                        maxWidth: "100%",
                                        margin: 0,
                                        padding: 0,
                                        backgroundColor: "#ffffff",
                                        borderRadius: "0 0 12px 12px",
                                        // Mejorar el scroll en navegadores webkit
                                        scrollbarWidth: "thin",
                                        scrollbarColor: "#6c757d #e9ecef"
                                    }}
                                >
                                    <table className="table table-striped table-hover mb-0" style={{
                                        minWidth: "max-content",
                                        width: "auto",
                                        margin: 0,
                                        // Optimización para tablas grandes
                                        tableLayout: "auto"
                                    }}>
                                        <thead className="table-dark sticky-top">
                                            <tr>
                                                {tableData.table.headers.map((header) => (
                                                    <th
                                                        key={header}
                                                        scope="col"
                                                        className="text-nowrap user-select-none"
                                                        style={{
                                                            cursor: "pointer",
                                                            minWidth: "100px",
                                                            maxWidth: "200px",
                                                            borderRight: "1px solid #495057"
                                                        }}
                                                        onClick={() => handleSort(header)}
                                                    >
                                                        {header}
                                                        {getSortIcon(header)}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {/* Fila de totales */}
                                            {totalsData && (
                                                <tr style={{
                                                    backgroundColor: "#e3f2fd",
                                                    fontWeight: "bold",
                                                    borderBottom: "2px solid #2196f3",
                                                    position: "sticky",
                                                    top: "56px", // Aumentar para que no tape la primera fila
                                                    zIndex: 9 // Reducir z-index para que esté debajo del header
                                                }}>
                                                    {tableData.table.headers.map((header) => (
                                                        <td key={`total-${header}`} className="text-nowrap" style={{
                                                            maxWidth: "200px",
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                            borderRight: "1px solid #2196f3",
                                                            backgroundColor: "#e3f2fd",
                                                            color: "#1976d2",
                                                            fontWeight: "600",
                                                            fontSize: "0.9em",
                                                            padding: "8px 12px"
                                                        }}>
                                                            {totalsData[header] || "-"}
                                                        </td>
                                                    ))}
                                                </tr>
                                            )}

                                            {/* Filas de datos */}
                                            {processedData.length > 0 ? (
                                                processedData.map((row, index) => (
                                                    <tr key={index}>
                                                        {tableData.table.headers.map((header) => (
                                                            <td key={header} className="text-nowrap" style={{
                                                                maxWidth: "200px",
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis",
                                                                borderRight: "1px solid #dee2e6"
                                                            }}>
                                                                {row[header] || "-"}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan={tableData.table.headers.length}
                                                        className="text-center py-4 text-muted"
                                                        style={{ borderRight: "none" }}
                                                    >
                                                        {filter
                                                            ? "No se encontraron resultados para el filtro aplicado"
                                                            : "No hay datos disponibles"}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : loading ? (
                        <div className="card" style={{
                            backgroundColor: "#fff3e0",
                            borderRadius: "12px",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                            border: "1px solid #ffcc02"
                        }}>
                            <div className="card-body text-center">
                                <div className="spinner-border text-primary mb-3" role="status">
                                    <span className="visually-hidden">Cargando...</span>
                                </div>
                                <h5>Procesando PDF completo...</h5>
                                <p className="text-muted">
                                    Extrayendo todas las páginas y construyendo tabla completa.<br />
                                    Este proceso puede tomar unos momentos para documentos grandes.
                                </p>
                                <div className="progress" style={{ height: "4px" }}>
                                    <div
                                        className="progress-bar progress-bar-striped progress-bar-animated"
                                        role="progressbar"
                                        style={{ width: "100%" }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="card" style={{
                            backgroundColor: "#fff3e0",
                            borderRadius: "12px",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                            border: "1px solid #ffcc02"
                        }}>
                            <div className="card-body text-center">
                                <h5>🚧 Boilerplate Activo 🚧</h5>
                                <p><strong>Endpoint:</strong> /extract-full-pdf-table</p>
                                <p><strong>Parámetros:</strong> which={selectedWhich}, table={selectedTable}</p>
                                <p><strong>Estado:</strong> {error ? 'Error' : 'Esperando datos'}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TablaCompleta;
