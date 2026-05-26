import { useState } from "react";
import { LeagueTablePage } from "./components/pages/LeagueTablePage";
import { SimulationPage } from "./components/pages/SimulationPage";

type AppView = "table" | "simulation";

function App() {
  const [view, setView] = useState<AppView>("simulation");

  return (
    <>
      <nav className="app-nav" aria-label="Main navigation">
        <button
          type="button"
          className={`app-nav__link${view === "table" ? " app-nav__link--active" : ""}`}
          onClick={() => setView("table")}
        >
          League table
        </button>
        <button
          type="button"
          className={`app-nav__link${view === "simulation" ? " app-nav__link--active" : ""}`}
          onClick={() => setView("simulation")}
        >
          Season simulation
        </button>
      </nav>
      {view === "table" ? <LeagueTablePage /> : <SimulationPage />}
    </>
  );
}

export default App;
