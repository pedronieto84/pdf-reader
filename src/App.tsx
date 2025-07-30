import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import Home from "./Pages/Home";
import Result from "./Pages/Result.tsx";
import Tabla from "./Pages/Tabla";

function App(): React.JSX.Element {
  const [page, setPage] = useState<string>("Home");

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top border-bottom">
        <div className="container-fluid">
          <a
            className="navbar-brand fw-bold"
            href="#"
            onClick={() => setPage("Home")}
          >
            PDF Reader
          </a>
          <ul className="navbar-nav d-flex flex-row gap-3">
            <li className="nav-item">
              <a
                className={`nav-link${page === "Home" ? " active" : ""}`}
                href="#"
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  setPage("Home");
                }}
              >
                Home
              </a>
            </li>
            <li className="nav-item">
              <a
                className={`nav-link${page === "Result" ? " active" : ""}`}
                href="#"
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  setPage("Result");
                }}
              >
                Result
              </a>
            </li>
            <li className="nav-item">
              <a
                className={`nav-link${page === "Tabla" ? " active" : ""}`}
                href="#"
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  setPage("Tabla");
                }}
              >
                Tabla
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
        {page === "Home" && <Home />}
        {page === "Tabla" && <Tabla />}
        {page === "Result" && <Result />}
      </div>
    </div>
  );
}

export default App;
