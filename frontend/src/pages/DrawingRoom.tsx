import { useEffect, useRef, useState } from 'react'
import '../App.css'
import { Canvas } from '../draw/canvas'
import axios from 'axios'
import { getSecret } from '../config'
import { JoinShareModal } from "../components/RoomModal";
import { DrawingArea } from '../components/DrawingArea'

export function DrawingRoom({userId}:{userId:string|null}) {

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [selectedTool, setSelectedTool] = useState<'rect' | 'circle' | 'line' | 'pencil'>("rect")
    const [socket, setSocket] = useState<WebSocket | null>(null)
    const [canvas, setCanvas] = useState<Canvas | null>(null)
    const [roomId, setRoomId] = useState("")
    const [rooms, setRooms] = useState()
    const [joinRoomId, setJoinRoomId] = useState<string>("")
    const [modalType, setModalType] = useState<'join_room' | 'share_room' | null>(null);
    const SECRET = getSecret()
    
    useEffect(() => {

        axios.get('http://localhost:3000/api/user/rooms', {
            headers: {
                Authorization: `Bearer ${SECRET}`
            }
        })
            .then((result) => {
                const rooms = result.data

                if (rooms.length === 0) {
                    axios.post('http://localhost:3000/api/user/room/create', { slug: `room_${userId}` },
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
        console.log(roomId)
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

    return <>
        <JoinShareModal
            socket={socket}
            modalType={modalType}
            roomId={roomId}
            joinRoomId={joinRoomId}
            setSelectedTool={setSelectedTool}
            setModalType={setModalType}
            setJoinRoomId={setJoinRoomId}
        />

        <DrawingArea setModalType={setModalType} selectedTool={selectedTool} setSelectedTool={setSelectedTool} canvasRef={canvasRef}/>
    </>
}