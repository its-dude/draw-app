import { useEffect, useRef, useState} from 'react'
import './App.css'
import { initDraw } from './draw'

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [shapeType, setShapeType] = useState<'rect' | 'circle' | 'line' | 'pencil'>('rect')

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvasRef.current.getContext('2d')

      if (ctx) {
        initDraw({ctx, canvas})
      }

    }
  }, [canvasRef])

  useEffect(()=>{
    //@ts-ignore
    window.shapeType = shapeType
  }, [shapeType])

  return (
    <>
      <div className='h-screen w-screen bg-black text-white'>
        <div className='absolute top-0 left-[40%] w-84 mx-auto bg-white text-black flex gap-5 justify-around'>
          <button className='hover:text-gray-500' onClick={()=>setShapeType('rect')}>rectangle</button>
          <button className='hover:text-gray-500' onClick={()=>setShapeType('circle')}>circle</button>
          <button className='hover:text-gray-500' onClick={()=>setShapeType('line')}>line</button>
          <button className='hover:text-gray-500' onClick={()=>setShapeType('pencil')}>pencil</button>
        </div>
        <canvas ref={canvasRef} width={"1026"} height={"500"} className='border rounded' ></canvas>
      </div>
    </>
  )
}

export default App
