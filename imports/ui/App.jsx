import { Header } from "./Header.jsx";
import { Tasks } from "./Tasks.jsx";

export const App = () => (
  <div className="page">
    <a href="#task-manager-main" className="skip-link">
      Skip to main content
    </a>
    <Header />
    <main id="task-manager-main" className="main">
      <Tasks />
    </main>
  </div>
);
