import { Copy } from "../icons/copy"
import React, { useEffect, useRef, useState } from "react"
import { Tick } from "../icons/tick"

export function ShareRoomModal({ roomId, onClose, setModalType }: {
  roomId: string,
  setModalType: React.Dispatch<React.SetStateAction<'share_room'|'join_room'|null>>,
  onClose: () => void,
}) {

  const shareRef = useRef<HTMLDivElement>(null)
  const [isCopied, setIsCopied] = useState<boolean>(false)

  console.log(roomId)

  useEffect(() => {

    function handleOutside(e: MouseEvent) {
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

  function onClickHandler(){
    navigator.clipboard.writeText(roomId);
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
      setModalType(null)
    }, 1500);

  }

  return <div className='overlay fixed inset-0 bg-slate-400 flex items-center justify-center z-200 pointer-event-none' data-prevent-outside-click="true">
    <div ref={shareRef} className='w-92 rounded-md border-1 shadow px-4 py-2 bg-white shadow pointer-event-none '>
      <div className='flex flex-col gap-2  '>
        <div className='my-2'>
          copy room id to share with your friends
        </div>
        <div className='flex gap-2 items-center'>
          <input className='px-4 py-2 rounded border border-gray-600 outline-none ' type="text" value={roomId} disabled />

          <button className='flex' onClick={onClickHandler}  > {isCopied && <Tick/>} {!isCopied && <div className="w-20 py-2 px-1 rounded  bg-purple-400 flex gap-1"><Copy /> <span>copy</span> </div> }</button>

        </div>
      </div>
    </div>
  </div>
}