import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import NewApplication from "./pages/NewApplication";
import ApplicationList from "./pages/ApplicationList";
import EditApplication from "./pages/EditApplication";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/new" element={<NewApplication />} />
        <Route path="/applications" element={<ApplicationList />} />
        <Route path="/edit/:id" element={<EditApplication />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
