import { useState } from "react";
import Navigation from "./components/Navigation";
import FilterForm from "./components/FilterForm";
import JsonViewer from "./components/JsonViewer";

function App() {
  const [jsonData, setJsonData] = useState<object | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFiltersChange = (newFilters: {
    poble: string;
    option: string;
    number: number;
  }) => {
    console.log("Filtros actualizados:", newFilters);
    // No setear loading aquí para evitar bucles
  };

  const handleDataLoad = (data: unknown) => {
    setLoading(false);
    setJsonData(data as object);
  };

  const handleLoadingStart = () => {
    setLoading(true);
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      <Navigation />

      <main className="flex-grow-1">
        <div className="container-fluid py-4">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-10 col-xl-8">
              <div className="card shadow">
                <div className="card-header bg-primary text-white">
                  <h1 className="card-title mb-0 h3">
                    PDF Reader - Configuración y Datos
                  </h1>
                </div>
                <div className="card-body">
                  <FilterForm
                    onFiltersChange={handleFiltersChange}
                    onDataLoad={handleDataLoad}
                    onLoadingStart={handleLoadingStart}
                    loading={loading}
                  />

                  <div className="mt-4">
                    <JsonViewer
                      data={jsonData}
                      title="Visualizador de Datos JSON (Datos en Bruto)"
                      loading={loading}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
