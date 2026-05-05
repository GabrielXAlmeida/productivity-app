import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import WeeklyPlanner from "./pages/WeeklyPlanner";

function PrivateRoute({children}) {
  const token = localStorage.getItem("token")
  return token ? children : <Navifate to="/login" />
}

export default function App(){
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/planner"
        element={
          <PrivateRoute>
            <WeeklyPlanner/>
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login"/>} />
    </Routes>
    </BrowserRouter>
  )
}