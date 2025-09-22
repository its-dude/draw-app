import { useEffect, useRef, useState } from 'react'
import './App.css'
import { Canvas } from './draw/canvas'
import axios from 'axios'
import { SECRET } from './config'
import { ShareRoomModal } from './components/ShareRoom'
import { JoinRoomModal } from './components/JoinRoom'

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedTool, setSelectedTool] = useState<'rect' | 'circle' | 'line' | 'pencil'>("rect")
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [canvas, setCanvas] = useState<Canvas | null>(null)
  const [roomId, setRoomId] = useState("")
  const [rooms, setRooms] = useState()
  const [joinRoomId, setJoinRoomId] = useState<string>("")
  const [modalType, setModalType] = useState<'join_room' | 'share_room' | null>(null);

  useEffect(() => {

    axios.get('http://localhost:3000/api/user/rooms', {
      headers: {
        Authorization: `Bearer ${SECRET}`
      }
    })
      .then((result) => {
        const rooms = result.data

        if (rooms.length === 0) {
          axios.post('http://localhost:3000/api/user/room/create', { slug: "Room1" },
            {
              headers: {
                Authorization: `Bearer ${SECRET}`
              }
            })
            .then((r) => {
              const room = r.data
              setRoomId(room.roomId)
            })
        } else {
          setRooms(rooms)
          setRoomId(rooms[0].roomId)
        }

      })

  }, [])

  useEffect(() => {
    if (!roomId) return

    const ws = new WebSocket(`ws://localhost:3000?token=${SECRET}`)

    ws.onopen = () => {
      setSocket(ws)
      const data = JSON.stringify({
        type: 'join_room',
        roomId
      }
      )
      console.log("websocket is opened")
      console.log(roomId)
      ws.send(data)
    }

    ws.onclose = () => console.log('websocket closed')
  }, [roomId])

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = window.innerWidth
      canvasRef.current.height = window.innerHeight

      const c = new Canvas(canvasRef.current)
      setCanvas(c)

      return () => {
        c.destroy()
      }

    }
  }, [canvasRef])


  useEffect(() => {
    canvas?.setTool(selectedTool)

  }, [selectedTool, canvas])

  return (
    <>
      <div >
        {modalType === 'join_room' && (<JoinRoomModal socket={socket} joinRoomId={joinRoomId} setJoinRoomId={setJoinRoomId} onClose={() => {
          setTimeout(() => {
            setSelectedTool(window.selected)
          }, 500);
          setModalType(null)
        }} />)}

        {modalType === 'share_room' && (<ShareRoomModal roomId={roomId} onClose={() => {
          setTimeout(() => {
            setSelectedTool(window.selected)
          }, 500);
          setModalType(null)
        }} />)}
      </div>

      <div className='h-screen w-screen bg-black text-white m-0 p-0'>
        <div className='header fixed w-full top-4 flex  bg-pink z-100'>
          <div className='left-[40%] w-84 mx-auto bg-white text-black flex gap-5 justify-around '>
            <button className='hover:text-gray-500' onClick={() => setSelectedTool('rect')}>rectangle</button>
            <button className='hover:text-gray-500' onClick={() => setSelectedTool('circle')}>circle</button>
            <button className='hover:text-gray-500' onClick={() => setSelectedTool('line')}>line</button>
            <button className='hover:text-gray-500' onClick={() => setSelectedTool('pencil')}>pencil</button>
          </div>
          <div className='mr-4 flex gap-4'>
            <button className='bg-purple-500 py-2 px-4 rounded-md ' onClick={() => {
              window.selected = selectedTool;
              setSelectedTool("pencil");
              setModalType('share_room')
            }}>Share Room</button>
            <button className='bg-blue-500 py-2 px-4 rounded-md' onClick={() => {
              window.selected = selectedTool;
              setSelectedTool("pencil");
              setModalType('join_room')
            }}>Join Room</button>
          </div>
        </div>
        <div></div>
        <canvas ref={canvasRef} className='' ></canvas>
      </div>

    </>
  )
}

export default App
