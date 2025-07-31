import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import TablaCompleta from "./Pages/TablaCompleta";

// Componente principal con navegación por pestañas
function App(): React.JSX.Element {
    const [page, setPage] = useState<string>("TablaCompleta");

    console.log("App rendered, current page:", page); // Debug log

    return (
        <div>
            <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top border-bottom">
                <div className="container-fluid">
                    <a
                        className="navbar-brand fw-bold"
                        href="#"
                        onClick={() => setPage("TablaCompleta")}
                    >
                        PDF Reader - Tabla Completa
                    </a>
                    <ul className="navbar-nav d-flex flex-row gap-3">
                        <li className="nav-item">
                            <a
                                className={`nav-link${page === "TablaCompleta" ? " active" : ""}`}
                                href="#"
                                onClick={(e: React.MouseEvent) => {
                                    e.preventDefault();
                                    setPage("TablaCompleta");
                                }}
                            >
                                📊 Tabla Completa
                            </a>
                        </li>
                    </ul>
                </div>
            </nav>
            <div
                className="container-fluid"
                style={{
                    paddingTop: "80px",
                }}
            >
                {page === "TablaCompleta" && <TablaCompleta />}
            </div>
        </div>
    );
}

export default App;
