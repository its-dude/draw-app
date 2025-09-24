import type React from "react";
import { JoinRoomModal } from "./JoinRoom";
import { ShareRoomModal } from "./ShareRoom";

export function JoinShareModal({ modalType, socket, joinRoomId, roomId, setJoinRoomId, setSelectedTool, setModalType }: {
    modalType: 'join_room' | 'share_room' | null,
    joinRoomId: string,
    roomId: string
    setJoinRoomId: React.Dispatch<React.SetStateAction<string>>,
    setSelectedTool: React.Dispatch<React.SetStateAction<'rect' | 'circle' | 'line' | 'pencil'>>,
    setModalType: React.Dispatch<React.SetStateAction<'join_room' | 'share_room' | null>>,
    socket: WebSocket | null
}) {

    return <div>
        {modalType === 'join_room' && (<JoinRoomModal socket={socket} roomId={roomId} joinRoomId={joinRoomId} setJoinRoomId={setJoinRoomId} onClose={() => {
            setTimeout(() => {
                // @ts-ignore
                setSelectedTool(window.selected)
            }, 500);
            setModalType(null)
        }} />)}

        {/*   @ts-ignore */}

        {modalType === 'share_room' && (<ShareRoomModal roomId={roomId} setModalType={setModalType} onClose={() => {
            setTimeout(() => {
                // @ts-ignore
                setSelectedTool(window.selected)
            }, 500);
            setModalType(null)
        }} />)}
    </div>
}