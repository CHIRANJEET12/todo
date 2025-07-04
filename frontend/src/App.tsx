import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Dashboard from "./pages/Dashboard";
import Task from "./pages/Task";
import WorkspacePage from "./pages/WorkspacePage";
import CreateWorkspace from "./pages/CreateWorkspace";
import Home from "./pages/Home.tsx";

function App() {
  const userdata = localStorage.getItem("data");
  const actualdata = userdata ? JSON.parse(userdata) : null;
  const token = actualdata?.token || null;


  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/createtask" element={token ? <Task /> : <Navigate to="/login" />} />
        <Route path="/createworkspace" element={token ? <CreateWorkspace /> : <Navigate to="/login" />} />
        <Route path="/viewworkspace/:id" element={token ? <WorkspacePage /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
