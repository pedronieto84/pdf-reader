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
    page: string;
    extractionMethod: string;
    table: TableData;
    source: string;
}

const TablaCompleta: React.FC = () => {
    const [selectedWhich, setSelectedWhich] = useState("sant-boi");
    const [selectedPage, setSelectedPage] = useState("05");
    const [tableData, setTableData] = useState<TableResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState("");
    const [sortConfig, setSortConfig] = useState<{
        key: string;
        direction: "asc" | "desc";
    } | null>(null);

    const pages = Array.from({ length: 40 }, (_, i) => {
        const pageNum = i + 1;
        return pageNum.toString().padStart(2, "0");
    });

    const fetchTableData = async () => {
        if (!selectedWhich || !selectedPage) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `http://localhost:3001/extract-table?which=${selectedWhich}&page=${selectedPage}`
            );

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data: TableResponse = await response.json();
            setTableData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error desconocido");
            console.error("Error fetching table data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTableData();
    }, [selectedWhich, selectedPage]);

    // Filtrar y ordenar datos
    const processedData = useMemo(() => {
        if (!tableData?.table.rows) return [];

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

        return filteredRows;
    }, [tableData, filter, sortConfig]);

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
                                        Seleccionar documento:
                                    </label>
                                    <select
                                        id="which-select"
                                        className="form-select"
                                        value={selectedWhich}
                                        onChange={(e) => setSelectedWhich(e.target.value)}
                                    >
                                        <option value="sant-boi">Sant Boi de Lluçanès</option>
                                        <option value="premia">Premia</option>
                                    </select>
                                </div>

                                <div className="col-md-4">
                                    <label htmlFor="page-select" className="form-label">
                                        Seleccionar página:
                                    </label>
                                    <select
                                        id="page-select"
                                        className="form-select"
                                        value={selectedPage}
                                        onChange={(e) => setSelectedPage(e.target.value)}
                                    >
                                        {pages.map((page) => (
                                            <option key={page} value={page}>
                                                Página {page}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-4 d-flex align-items-end">
                                    <button
                                        className="btn btn-primary"
                                        onClick={fetchTableData}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" />
                                                Cargando...
                                            </>
                                        ) : (
                                            "Procesar"
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
                    {tableData && (
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
                                <h5 className="card-title mb-0">
                                    {tableData.fileName} - {tableData.extractionMethod}
                                </h5>
                                <small className="text-muted">
                                    Fuente: {tableData.source} | Total columnas:{" "}
                                    {tableData.table.metadata.totalColumns}
                                </small>
                            </div>
                            <div className="card-body p-0">
                                <div
                                    className="table-responsive"
                                    style={{
                                        maxHeight: "70vh",
                                        overflowY: "auto",
                                        overflowX: "auto",
                                        width: "100%",
                                        maxWidth: "100%",
                                        margin: 0,
                                        padding: 0,
                                        backgroundColor: "#ffffff",
                                        borderRadius: "0 0 12px 12px"
                                    }}
                                >
                                    <table className="table table-striped table-hover mb-0" style={{
                                        minWidth: "max-content",
                                        width: "auto",
                                        margin: 0
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
                    )}
                </div>
            </div>
        </div>
    );
};

export default TablaCompleta;
