import type React from "react"
import { useEffect, useRef } from "react"

//@ts-ignore
export function JoinRoomModal({socket, joinRoomId, setJoinRoomId, onClose ,modalType}: {
  socket: WebSocket | null, 
  joinRoomId:string, setJoinRoomId: React.Dispatch<React.SetStateAction<string>>
  onClose: ()=>void
}){

    const joinRoomRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  function handleOutside(e: MouseEvent ) {
    if (joinRoomRef.current && !joinRoomRef.current.contains(e.target as Node)) {
      e.stopPropagation(); 
      onClose();
    }
  }

  document.getElementById('join-room')?.addEventListener("mousedown", handleOutside);

  return () => {
    document.getElementById('join-room')?.removeEventListener("mousedown", handleOutside);
  };
}, [onClose, joinRoomRef]);

    return <div id="join-room" className=' overlay fixed inset-0 bg-slate-400 flex items-center justify-center pointer-events-auto'>
            <div ref={joinRoomRef} className='w-82 h-max bg-white p-4 rounded-md flex flex-col text-start gap-2 '>
              <div>
                <label htmlFor='roomId' className='text-lg '>Enter room id to connect</label>
                <input name='roomId' type="text" placeholder='Room Id' className='border w-full block px-4 py-2 outline-0 rounded-md' onChange={(e) => setJoinRoomId(e.target.value)} />
              </div>
              <div className='mx-auto'>
                <button className='bg-purple-500 text-white px-4 py-2 rounded-md cursor-pointer' onClick={() => {
                  socket?.send(JSON.stringify({
                    type: "join_room",
                    roomId: joinRoomId
                  }))
                }}>join</button>
              </div>
            </div>
          </div>
}