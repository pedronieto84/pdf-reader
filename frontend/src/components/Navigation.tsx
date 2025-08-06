function Navigation() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">
          📄 PDF Reader
        </a>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <a className="nav-link active" aria-current="page" href="#">
                🏠 Inicio
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                📤 Subir PDF
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                🔍 Buscar
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                ⚙️ Configuración
              </a>
            </li>
          </ul>

          <ul className="navbar-nav">
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                🖥️ Servidores
              </a>
              <ul className="dropdown-menu">
                <li>
                  <a className="dropdown-item" href="#">
                    🟦 Node.js (3002)
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    🟩 Python (8000)
                  </a>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    📡 Estado Conexión
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
