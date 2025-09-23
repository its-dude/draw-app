import { Routes, Route } from "react-router-dom"
import { DrawingRoom } from "./pages/DrawingRoom"
import { Signup } from "./pages/Signup"
import { Signin } from "./pages/Signin"
import { useState } from "react"

function App() {

    const [userId, setUserId] = useState<string|null>(null)

  return (
    <Routes>
      <Route path="/room" element={<DrawingRoom userId= {userId}/>} />
      <Route path='/signup' element={<Signup setUserId={setUserId} />} />
      <Route path='/signin' element={<Signin setUserId={setUserId} />} />
    </Routes>
  )
}

export default App
