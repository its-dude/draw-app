import { Routes, Route } from "react-router-dom"
import { DrawingRoom } from "./pages/DrawingRoom"

function App() {

  return (
    <Routes>
      <Route path="/room" element={<DrawingRoom/>} ></Route>
    </Routes>
  )
}

export default App
