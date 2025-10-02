import type React from "react";
import type { Ref } from "react";
import { Rectangle } from "../icons/rectangle";
import { Circle } from "../icons/Circle";
import { Line } from "../icons/Line";
import { Pencil } from "../icons/Pencil";
import { Eraser } from "../icons/Eraser";
import { Text } from "../icons/Text";

export function DrawingArea({ setSelectedTool, setModalType, canvasRef, selectedTool }: {
    setSelectedTool: React.Dispatch<React.SetStateAction<'rect' | 'circle' | 'line' | 'pencil'| 'eraser'|"Text">>,
    setModalType: React.Dispatch<React.SetStateAction<'join_room' | 'share_room' | null>>,
    canvasRef: Ref<HTMLCanvasElement> | undefined,
    selectedTool: 'rect' | 'circle' | 'line' | 'pencil'|'eraser'|'Text'
}
) {
    return (
    
    <div className='h-screen w-screen bg-black text-white m-0 p-0'>
        <div className='header fixed w-full top-4 flex z-100 pointer-events-none'>
            <div className='left-[40%] w-84 mx-auto bg-[#222] text-white flex  justify-around pointer-events-auto rounded-md p-1'>
                <button className={`hover:bg-purple-300 p-1 rounded-md ${selectedTool=='rect'?   "bg-purple-300": ""}`} onClick={() => setSelectedTool('rect')}><Rectangle/></button>
                <button className={`hover:bg-purple-300 p-1 rounded-md ${selectedTool=='circle'? "bg-purple-300": ""}`} onClick={() => setSelectedTool('circle')}><Circle/> </button>
                <button className={`hover:bg-purple-300 p-1 rounded-md ${selectedTool=='line'?   "bg-purple-300": ""}`} onClick={() => setSelectedTool('line')}><Line/> </button>
                <button className={`hover:bg-purple-300 p-1 rounded-md ${selectedTool=='pencil'? "bg-purple-300": ""}`} onClick={() => setSelectedTool('pencil')}><Pencil/></button>
                <button className={`hover:bg-purple-300 p-1 rounded-md ${selectedTool=='Text'? "bg-purple-300": ""}`} onClick={() => setSelectedTool('Text')} ><Text/></button>
                <button className={`hover:bg-purple-300 p-1 rounded-md ${selectedTool=='eraser'? "bg-purple-300": ""}`} onClick={() => setSelectedTool('eraser')} ><Eraser/></button>
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