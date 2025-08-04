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
    const [preparing, setPreparing] = useState(false); // Nuevo estado para evitar colapso
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
            console.log('Total rows in data.table.rows:', data.table?.rows?.length);
            console.log('Total rows in metadata:', data.table?.metadata?.totalRows);
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

        // Marcar como preparando para evitar colapso visual
        setPreparing(true);

        // Resetear datos cuando cambian los parámetros
        setTableData(null);
        setError(null);
        setFilter(""); // Limpiar filtro también
        setSortConfig(null); // Resetear ordenación

        // Usar setTimeout para permitir que el estado de preparación se renderice
        const timeoutId = setTimeout(() => {
            setPreparing(false);
            try {
                fetchTableData();
            } catch (err) {
                console.error('Error in useEffect:', err);
                setError('Error initializing component');
                setPreparing(false);
            }
        }, 100); // Breve delay para evitar colapso

        // Cleanup timeout si el componente se desmonta o cambian los parámetros
        return () => {
            clearTimeout(timeoutId);
        };
    }, [selectedWhich, selectedTable]);

    // Filtrar y ordenar datos
    const processedData = useMemo(() => {
        try {
            console.log('Processing data, tableData:', tableData);

            if (!tableData?.table?.rows) {
                console.log('No table data or rows available');
                return [];
            }

            console.log('Raw table data rows length:', tableData.table.rows.length);
            console.log('Table metadata totalRows:', tableData.table.metadata?.totalRows);

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

        // Definir columnas numéricas según el tipo de tabla
        const numericColumns = selectedTable === "LlibreA"
            ? ["QUANTITAT", "PREU UNITARI", "VALOR TOTAL"]
            : ["QUANT", "V.B.C.", "F.A.", "F.P.", "V.C.", "DOT. AMORT",
                "V. MERCAT", "V. ASSEGURAN", "V.R.U."];

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

        // Agregar etiqueta para la primera columna según el tipo de tabla
        if (tableData.table.headers.length > 0) {
            const firstColumnKey = tableData.table.headers[0];
            totals[firstColumnKey] = selectedTable === "LlibreA"
                ? "🧮 TOTALES"
                : "🧮 TOTALES";
        }

        return totals;
    }, [processedData, tableData, selectedTable]);

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

    const downloadCSV = () => {
        if (!tableData?.table?.headers || processedData.length === 0) {
            alert('No hay datos disponibles para descargar');
            return;
        }

        try {
            // Crear encabezados CSV incluyendo las columnas de índices
            const headers = ['# Original', '# Filtrado', ...tableData.table.headers].join(',');

            // Crear filas CSV
            const rows = processedData.map((row, filteredIndex) => {
                // Encontrar el índice original de esta fila
                const originalIndex = tableData.table.rows.findIndex(originalRow =>
                    tableData.table.headers.every(header => originalRow[header] === row[header])
                );

                const csvRow = [
                    originalIndex + 1, // Índice original (1-based)
                    filteredIndex + 1, // Índice filtrado (1-based)
                    ...tableData.table.headers.map(header => {
                        const value = row[header] || '';
                        // Escapar comillas y envolver en comillas si contiene comas
                        const escapedValue = value.replace(/"/g, '""');
                        return value.includes(',') || value.includes('"') || value.includes('\n')
                            ? `"${escapedValue}"`
                            : escapedValue;
                    })
                ];
                return csvRow.join(',');
            });

            // Agregar fila de totales si existe
            let csvContent = headers + '\n';

            if (totalsData) {
                const totalsRow = [
                    '', // Vacío para # Original
                    '', // Vacío para # Filtrado
                    ...tableData.table.headers.map(header => {
                        const value = totalsData[header] || '';
                        const escapedValue = value.replace(/"/g, '""');
                        return value.includes(',') || value.includes('"') || value.includes('\n')
                            ? `"${escapedValue}"`
                            : escapedValue;
                    })
                ];
                csvContent += totalsRow.join(',') + '\n';
            }

            csvContent += rows.join('\n');

            // Crear y descargar archivo
            const blob = new Blob([csvContent], { type: 'text/plain;charset=utf-8' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            // Nombre del archivo con timestamp
            const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
            const fileName = `tabla_${selectedWhich}_${selectedTable}_${timestamp}.txt`;
            link.download = fileName;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            console.log(`CSV descargado: ${fileName} con ${processedData.length} filas`);
        } catch (error) {
            console.error('Error al generar CSV:', error);
            alert('Error al generar el archivo CSV');
        }
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
            padding: "20px",
            minHeight: "80vh" // Añadir altura mínima al contenedor principal
        }}>
            <div className="row" style={{ margin: 0 }}>
                <div className="col-12" style={{ padding: "0" }}>
                    <h2 className="mb-4">
                        {selectedTable === "LlibreA"
                            ? "Tabla Completa - Llibre A"
                            : "Tabla Completa - Relació de Bienes"}
                    </h2>

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
                                        <option value="sant-boi-de-llucanes">Sant Boi de Lluçanès</option>
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

                                <div className="col-md-4 d-flex align-items-end gap-2">
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

                                    <button
                                        className="btn btn-outline-primary"
                                        onClick={downloadCSV}
                                        disabled={!tableData || processedData.length === 0}
                                        title="Descargar datos actuales como CSV"
                                    >
                                        <i className="bi bi-file-earmark-spreadsheet me-1"></i>
                                        CSV
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
                    <div style={{
                        minHeight: "600px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-start"
                    }}> {/* Contenedor con altura mínima */}
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
                                                📊 {tableData.fileName || 'PDF'} - {selectedTable === "LlibreA" ? "Llibre A" : "Relació de Bienes"}
                                            </h5>
                                            <small className="text-muted">
                                                {tableData.extractionMethod || 'Extracción'} |
                                                Fuente: {tableData.source || 'N/A'} |
                                                Tipo: {selectedTable === "LlibreA" ? "Llibre A" : "Relació de Bienes"}
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
                                                    {/* Columnas de índices */}
                                                    <th
                                                        scope="col"
                                                        className="text-nowrap text-center"
                                                        style={{
                                                            minWidth: "80px",
                                                            maxWidth: "80px",
                                                            borderRight: "1px solid #495057",
                                                            backgroundColor: "#6c757d"
                                                        }}
                                                    >
                                                        # Original
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="text-nowrap text-center"
                                                        style={{
                                                            minWidth: "80px",
                                                            maxWidth: "80px",
                                                            borderRight: "1px solid #495057",
                                                            backgroundColor: "#6c757d"
                                                        }}
                                                    >
                                                        # Filtrado
                                                    </th>

                                                    {/* Headers originales */}
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
                                                        {/* Columnas de índices - vacías en totales */}
                                                        <td className="text-center" style={{
                                                            borderRight: "1px solid #2196f3",
                                                            backgroundColor: "#e3f2fd",
                                                            color: "#1976d2",
                                                            fontWeight: "600",
                                                            fontSize: "0.9em",
                                                            padding: "8px 12px"
                                                        }}>
                                                            -
                                                        </td>
                                                        <td className="text-center" style={{
                                                            borderRight: "1px solid #2196f3",
                                                            backgroundColor: "#e3f2fd",
                                                            color: "#1976d2",
                                                            fontWeight: "600",
                                                            fontSize: "0.9em",
                                                            padding: "8px 12px"
                                                        }}>
                                                            -
                                                        </td>

                                                        {/* Headers originales con totales */}
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
                                                    processedData.map((row, filteredIndex) => {
                                                        // Encontrar el índice original de esta fila
                                                        const originalIndex = tableData.table.rows.findIndex(originalRow =>
                                                            tableData.table.headers.every(header => originalRow[header] === row[header])
                                                        );

                                                        return (
                                                            <tr key={filteredIndex}>
                                                                {/* Columnas de índices */}
                                                                <td className="text-center" style={{
                                                                    borderRight: "1px solid #dee2e6",
                                                                    backgroundColor: "#f8f9fa",
                                                                    fontWeight: "500",
                                                                    fontSize: "0.9em"
                                                                }}>
                                                                    {originalIndex + 1}
                                                                </td>
                                                                <td className="text-center" style={{
                                                                    borderRight: "1px solid #dee2e6",
                                                                    backgroundColor: "#f0f8ff",
                                                                    fontWeight: "500",
                                                                    fontSize: "0.9em"
                                                                }}>
                                                                    {filteredIndex + 1}
                                                                </td>

                                                                {/* Datos originales */}
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
                                                        );
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td
                                                            colSpan={tableData.table.headers.length + 2} // +2 por las columnas de índices
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
                        ) : preparing ? (
                            <div className="card" style={{
                                backgroundColor: "#e8f5e8",
                                borderRadius: "12px",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                                border: "1px solid #4caf50",
                                height: "600px", // Altura fija en lugar de mínima
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                                <div className="card-body text-center">
                                    <div className="spinner-grow text-success mb-4" role="status" style={{ width: "3rem", height: "3rem" }}>
                                        <span className="visually-hidden">Preparando...</span>
                                    </div>
                                    <h4>🔄 Preparando datos del municipio...</h4>
                                    <p className="text-muted fs-5">
                                        Configurando parámetros para <strong>{selectedWhich}</strong><br />
                                        Iniciando carga del PDF completo...
                                    </p>
                                    <div className="progress mt-4" style={{ height: "8px", width: "300px", margin: "0 auto" }}>
                                        <div
                                            className="progress-bar bg-success progress-bar-striped progress-bar-animated"
                                            role="progressbar"
                                            style={{ width: "100%" }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ) : loading ? (
                            <div className="card" style={{
                                backgroundColor: "#fff3e0",
                                borderRadius: "12px",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                                border: "1px solid #ffcc02",
                                height: "600px", // Altura fija en lugar de mínima
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                                <div className="card-body text-center">
                                    <div className="spinner-border text-primary mb-4" role="status" style={{ width: "3rem", height: "3rem" }}>
                                        <span className="visually-hidden">Cargando...</span>
                                    </div>
                                    <h4>⚙️ Procesando PDF completo...</h4>
                                    <p className="text-muted fs-5">
                                        Extrayendo todas las páginas y construyendo tabla completa.<br />
                                        Este proceso puede tomar unos momentos para documentos grandes.
                                    </p>
                                    <div className="progress mt-4" style={{ height: "8px", width: "300px", margin: "0 auto" }}>
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
                                border: "1px solid #ffcc02",
                                height: "600px", // Altura fija en lugar de mínima
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                                <div className="card-body text-center">
                                    <h4>🚧 Selecciona un municipio para comenzar 🚧</h4>
                                    <p className="fs-5"><strong>Endpoint:</strong> /extract-full-pdf-table</p>
                                    <p className="fs-5"><strong>Parámetros:</strong> which={selectedWhich}, table={selectedTable}</p>
                                    <p className="fs-5"><strong>Estado:</strong> {error ? 'Error' : 'Esperando datos'}</p>
                                </div>
                            </div>
                        )}
                    </div> {/* Cierre del contenedor con altura mínima */}
                </div>
            </div>
        </div>
    );
};

export default TablaCompleta;
