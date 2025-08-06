import { useState } from "react";

interface FilterFormProps {
  onFiltersChange?: (filters: {
    poble: string;
    option: string;
    number: number;
  }) => void;
  onDataLoad?: (data: unknown) => void;
  onLoadingStart?: () => void;
  loading?: boolean;
}

function FilterForm({
  onFiltersChange,
  onDataLoad,
  onLoadingStart,
  loading = false,
}: FilterFormProps) {
  const [poble, setPobre] = useState("santboi");
  const [option, setOption] = useState("a");
  const [number, setNumber] = useState(1);

  const handlePobleChange = async (value: string) => {
    setPobre(value);
    const newFilters = { poble: value, option, number };

    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }

    // Solo cargar cuando el usuario explícitamente interactúa
    // No cargamos automáticamente para evitar bucles
  };

  const handleOptionChange = async (value: string) => {
    setOption(value);
    const newFilters = { poble, option: value, number };

    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }

    // Solo cargar cuando el usuario explícitamente interactúa
    // No cargamos automáticamente para evitar bucles
  };

  const handleNumberChange = (value: number) => {
    setNumber(value);
    const newFilters = { poble, option, number: value };

    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const handleLoadData = async () => {
    const currentFilters = { poble, option, number };

    if (onLoadingStart) {
      onLoadingStart();
    }

    if (onFiltersChange) {
      onFiltersChange(currentFilters);
    }

    if (onDataLoad) {
      try {
        const { loadJsonData } = await import("../utils/jsonService");
        const data = await loadJsonData(currentFilters);
        onDataLoad(data);
      } catch (error) {
        console.error("Error loading data:", error);
        onDataLoad({ error: "Error cargando datos", details: String(error) });
      }
    }
  };

  return (
    <div className="alert alert-success" role="alert">
      {loading && (
        <div className="d-flex align-items-center mb-3">
          <div className="spinner-border spinner-border-sm me-2" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <span>Cargando datos...</span>
        </div>
      )}

      <div className="row g-3">
        <div className="col-md-3">
          <label htmlFor="poble-select" className="form-label fw-bold">
            Poble
          </label>
          <select
            id="poble-select"
            className="form-select"
            value={poble}
            onChange={(e) => handlePobleChange(e.target.value)}
            disabled={loading}
          >
            <option value="santboi">santboi</option>
            <option value="premia">premia</option>
            <option value="collbato">collbato</option>
          </select>
        </div>

        <div className="col-md-3">
          <label htmlFor="option-select" className="form-label fw-bold">
            Opción
          </label>
          <select
            id="option-select"
            className="form-select"
            value={option}
            onChange={(e) => handleOptionChange(e.target.value)}
            disabled={loading}
          >
            <option value="a">a</option>
            <option value="bens">bens</option>
          </select>
        </div>

        <div className="col-md-3">
          <label htmlFor="number-input" className="form-label fw-bold">
            Número
          </label>
          <input
            id="number-input"
            type="number"
            className="form-control"
            value={number}
            min="1"
            max="100"
            onChange={(e) => handleNumberChange(parseInt(e.target.value) || 1)}
            disabled={loading}
          />
        </div>

        <div className="col-md-3">
          <label className="form-label fw-bold">&nbsp;</label>
          <button
            className="btn btn-primary d-block w-100"
            onClick={handleLoadData}
            disabled={loading}
          >
            {loading ? "Cargando..." : "Cargar Datos"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default FilterForm;
