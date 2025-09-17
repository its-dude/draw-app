import { useEffect, useRef, useState} from 'react'
import './App.css'
import { Canvas } from './draw/canvas'  

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedTool, setSelectedTool] = useState<'rect' | 'circle' | 'line' | 'pencil'>('rect')
  const [canvas, setCanvas] = useState<Canvas| null>(null)

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = window.innerWidth
      canvasRef.current.height = window.innerHeight

      const c = new Canvas(canvasRef.current)
      setCanvas(c)

      return ()=> {
        c.destroy()
      }

    }
  }, [canvasRef])

  useEffect(()=>{
    canvas?.setTool(selectedTool)
  }, [selectedTool, canvas])

  return (
    <>
      <div className='h-screen w-screen bg-black text-white m-0 p-0'>
        <div className='absolute top-0 left-[40%] w-84 mx-auto bg-white text-black flex gap-5 justify-around'>
          <button className='hover:text-gray-500' onClick={()=>setSelectedTool('rect')}>rectangle</button>
          <button className='hover:text-gray-500' onClick={()=>setSelectedTool('circle')}>circle</button>
          <button className='hover:text-gray-500' onClick={()=>setSelectedTool('line')}>line</button>
          <button className='hover:text-gray-500' onClick={()=>setSelectedTool('pencil')}>pencil</button>
        </div>
        <canvas ref={canvasRef}  className='border rounded block' ></canvas>
      </div>
    </>
  )
}

export default App
