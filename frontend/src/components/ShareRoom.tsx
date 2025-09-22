import type React from "react"
import { Copy } from "../icons/copy"
import { useEffect, useRef } from "react"

export function ShareRoomModal({ roomId, onClose }: {
  roomId: string,
  onClose: () => void,
}) {
  
  const shareRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  
  function handleOutside(e: MouseEvent ) {
    e.preventDefault()
    e.stopPropagation(); 
    if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
      onClose();
    }
  }

  document.addEventListener("mousedown", handleOutside);

  return () => {
    document.removeEventListener("mousedown", handleOutside);
  };
}, [onClose, shareRef]);


  return <div className='overlay fixed inset-0 bg-slate-400 flex items-center justify-center z-200 pointer-event-none' data-prevent-outside-click="true">
    <div  ref={shareRef} className='w-92 rounded-md border-1 shadow px-4 py-2 bg-white shadow pointer-event-none '>
      <div className='flex flex-col gap-2  '>
        <div className='my-2'>
          copy room id to share with your friends
        </div>
        <div className='flex gap-2 items-center'>
          <input className='px-4 py-2 rounded border border-gray-600 outline-none ' type="text" value={roomId} disabled />
          <div className='flex'><Copy /> <span>copy</span></div>
        </div>
      </div>
    </div>
  </div>
}