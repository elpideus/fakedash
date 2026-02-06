import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/Login.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";

function App() {
    return (
        <Routes> { /* Using React Router for proper pagination */ }
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={<DashboardPage />} />
        </Routes>
    );
}

export default App;