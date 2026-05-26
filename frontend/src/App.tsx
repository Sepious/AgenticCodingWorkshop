import { useState } from "react";
import { SeasonDataProvider } from "./context/SeasonDataContext";
import { LeagueTablePage } from "./components/pages/LeagueTablePage";
import { SimulationPage } from "./components/pages/SimulationPage";
import { SeasonGate } from "./components/templates/SeasonGate";

type AppView = "table" | "simulation";

function App() {
  const [view, setView] = useState<AppView>("simulation");

  return (
    <SeasonDataProvider>
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
      <SeasonGate>
        {view === "table" ? <LeagueTablePage /> : <SimulationPage />}
      </SeasonGate>
    </SeasonDataProvider>
  );
}

export default App;
