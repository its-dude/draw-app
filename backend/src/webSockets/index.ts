import type { Server } from "http";
import { type WebSocket, WebSocketServer } from "ws"
import { Chat, Room } from "../models";
import jwt, { Secret } from "jsonwebtoken";
import { config } from "../config/config";
import { json } from "zod";
import { resourceUsage } from "process";

type User = {
    userId: string,
    rooms: string[],
    ws: WebSocket
}
let users: User[] = [];

function checkUser(token: string): string | null {
    if (!token || token === "") {
        return null
    }
    const decoded = jwt.verify(token as string, config.jwt.secret as Secret);

    if (typeof decoded == "string") {
        return null;
    }

    if (!decoded || !decoded.userId) {
        return null
    }

    return decoded.userId;
}

function parseData(data: any): any {
    if (typeof data === "string") {
        try {
            data = JSON.parse(data);
        } catch {
            return data; // not valid JSON, return as is
        }
    }

    if (typeof data === "object" && data !== null) {
        Object.keys(data).forEach(key => {
            data[key] = parseData(data[key]);
        });
    }

    return data;
}


export default function initSocket(server: Server) {
    const wss = new WebSocketServer({ server })

    wss.on('connection', function connection(ws, request) {
        const url = request.url;

        if (!url) {
            return ws.send("Not authorized");
        }

        const queryParams = new URLSearchParams(url.split('?')[1]);
        const token = queryParams.get("token");
        if (!token) {
            ws.close();
            return;
        }
        const userId = checkUser(token);

        if (userId === null) {
            ws.send("Not authorized");
            ws.close();
            return;
        }

        users.push({
            userId,
            rooms: [],
            ws
        })

        ws.on('message', async (data) => {
            const parsedData = parseData(data.toString());

            if (parsedData.type === "join_room") {
                const user: User | undefined = users.find(u => u.ws === ws)

                if (!user) {
                    return;
                }

                const room = await Room.findOne({
                    roomId: parsedData.roomId
                })

                if (!room) {
                    return;
                }

                const isAdmin = (room.admin as any) == user.userId
                user.rooms.push(parsedData.roomId);

                ws.send(JSON.stringify({
                    message: "room_joined",
                    roomId: parsedData.roomId
                }));
            }

            if (parsedData.type === "leave_room") {
                const user: User | undefined = users.find(u => u.ws === ws)

                if (!user) {
                    return ws.send(JSON.stringify({
                        message: "Not authorized"
                    }))
                }

                const room = await Room.findOne({
                    roomId: parsedData.roomId
                })

                if (!room) {
                    return ws.send(JSON.stringify({
                        message: "Invalid roomId"
                    }))
                }

                user.rooms = user?.rooms.filter(roomId => roomId !== parsedData.roomId);

            }

            if (parsedData.type === "draw") {
                const user: User | undefined = users.find(u => u.ws === ws)

                if (!user) {
                    return ws.send(JSON.stringify({
                        message: "Not authorized"
                    }))
                }

                const room = await Room.findOne({
                    roomId: parsedData.roomId
                })

                if (!room) {
                    return ws.send(JSON.stringify({
                        message: "Invalid room id"
                    }))
                }

                const message = parsedData.message

                if (message.action === "create") {
                    let chat = await Chat.create({
                        userId: user.userId,
                        roomId: room._id,
                        shape: message.shape
                    })
                    
                room.chats.push(chat.id)
                } else if(message.action === "delete") {
                  let chatToDel = await Chat.findOne({
                        "shape.id": message.shape.id
                    })

                    if(!chatToDel)return

                    await Chat.deleteOne({ _id: chatToDel!._id })

                    room.chats = room.chats.filter( chat => chat._id !== chatToDel._id)

                }

                await room.save()

                users.forEach(user => {
                    if (user.rooms.includes(parsedData.roomId) && user.ws != ws) {
                        user.ws.send(JSON.stringify({
                            type: "draw",
                            message: JSON.stringify({shape:message.shape, action: message.action})
                        }))
                    }
                })

            }

        })
    })

}