import type React from "react";
import type { Ref } from "react";

export function DrawingArea({ setSelectedTool, setModalType, canvasRef, selectedTool }: {
    setSelectedTool: React.Dispatch<React.SetStateAction<'rect' | 'circle' | 'line' | 'pencil'>>,
    setModalType: React.Dispatch<React.SetStateAction<'join_room' | 'share_room' | null>>,
    canvasRef: Ref<HTMLCanvasElement> | undefined,
    selectedTool: 'rect' | 'circle' | 'line' | 'pencil'
}
) {
    return (
    
    <div className='h-screen w-screen bg-black text-white m-0 p-0'>
        <div className='header fixed w-full top-4 flex  bg-pink z-100 pointer-events-none'>
            <div className='left-[40%] w-84 mx-auto bg-white text-black flex gap-5 justify-around pointer-events-auto'>
                <button className='hover:text-gray-500' onClick={() => setSelectedTool('rect')}>rectangle</button>
                <button className='hover:text-gray-500' onClick={() => setSelectedTool('circle')}>circle</button>
                <button className='hover:text-gray-500' onClick={() => setSelectedTool('line')}>line</button>
                <button className='hover:text-gray-500' onClick={() => setSelectedTool('pencil')}>pencil</button>
            </div>
            <div className='mr-4 flex gap-4 pointer-events-none'>
                <button className='bg-purple-500 py-2 px-4 rounded-md pointer-events-auto' onClick={() => {
                    // @ts-ignore
                    window.selected = selectedTool;
                    setSelectedTool("pencil");
                    setModalType('share_room')
                }}>Share Room</button>
                <button className='bg-blue-500 py-2 px-4 rounded-md pointer-events-auto' onClick={() => {
                    // @ts-ignore
                    window.selected = selectedTool;
                    setSelectedTool("pencil");
                    setModalType('join_room')
                }}>Join Room</button>
            </div>
        </div>
        <div></div>
        <canvas ref={canvasRef} className='absolute inset-0 w-[100%] h-[100%] border' ></canvas>
    </div>)
}