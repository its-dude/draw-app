import { useEffect, useRef, useState } from 'react'
import '../App.css'
import { Draw } from '../draw/draw'
import axios from 'axios'
import { getSecret } from '../config'
import { JoinShareModal } from "../components/RoomModal";
import { DrawingArea } from '../components/DrawingArea'

export function DrawingRoom({ userId }: { userId: string | null }) {

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [selectedTool, setSelectedTool] = useState<'rect' | 'circle' | 'line' | 'pencil' | 'eraser' | 'Text'>("rect")
    const [socket, setSocket] = useState<WebSocket | null>(null)
    const [draw, setDraw] = useState<Draw | null>(null)
    const [roomId, setRoomId] = useState<string>("")
    const [rooms, setRooms] = useState()
    const textareaRef = useRef<HTMLDivElement>(null)
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
        if (canvasRef.current && textareaRef.current && roomId && socket) {

            canvasRef.current.width = canvasRef.current.clientWidth ;
            canvasRef.current.height = canvasRef.current.clientHeight;

            const c = new Draw(canvasRef.current, roomId, setRoomId, setModalType, socket, textareaRef.current)
            setDraw(c)

            return () => {
                c.destroy()
            }

        }
    }, [roomId, canvasRef, textareaRef, joinRoomId, socket])


    useEffect(() => {
        if (selectedTool === 'eraser' && canvasRef.current) {
            canvasRef.current.style.cursor = "url(\"data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='24'%20height='24'%20viewBox='0%200%2032%2032'%3E%3Ccircle%20cx='16'%20cy='16'%20r='8'%20fill='black'%20stroke='white'%20stroke-width='2'/%3E%3C/svg%3E\") 16 16, auto";
        } else if (selectedTool !== 'eraser' && canvasRef.current) {
            canvasRef.current.style.cursor = ""
        }
        console.log("tool changed: ", selectedTool)
        draw?.setTool(selectedTool)

    }, [selectedTool, canvasRef, draw])

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

        {
            !socket && <div>connecting...</div>
        }

        {
            socket && <DrawingArea setModalType={setModalType} selectedTool={selectedTool} setSelectedTool={setSelectedTool} canvasRef={canvasRef} />
        }
        <div ref={textareaRef} className='textarea-wrapper '></div>
    </>
}