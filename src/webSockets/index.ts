import type { Server } from "http";
import {type WebSocket, WebSocketServer} from "ws"
import { Room } from "../models";
import jwt, { Secret } from "jsonwebtoken";
import { config } from "../config/config";

type User = {
    userId: string,
    rooms: string[],
    ws:WebSocket
}
let users: User[] = [];

function checkUser (token: string): string | null {
    const decoded = jwt.verify(token as string, config.jwt.secret as Secret);

        if ( typeof decoded == "string"){
          return null;
        }

        if ( !decoded || !decoded.userId ){
          return null          
        }

        return decoded.userId;
}

export default function initSocket(server: Server){
    const wss = new WebSocketServer({server})
    
    wss.on('connection', function connection(ws, request){
        ws.send("you are connected via websocket");
        const url = request.url;
        
        if ( !url ) {
            return ws.send("Not authorized");
        }

        const queryParams = new URLSearchParams(url.split('?')[1]);
        const token = queryParams.get("token") as string;
        const userId = checkUser(token);

        if( userId === null ) {
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
            const parsedData = JSON.parse(data.toString());

            if (parsedData.type === "join_room") {
                const user : User | undefined = users.find(u => u.ws === ws)

                if (!user) {
                    return ws.send("Not authorized")
                }

                const room = await Room.findOne({
                    roomId: parsedData.roomId
                })

                if( !room ) {
                    return ws.send("Invalid room id");
                }

                user.rooms.push(parsedData.roomId);

              return ws.send(`connected to room ${room.slug}`)
            }

            if (parsedData.type === "leave_room") {
                const user : User | undefined = users.find(u => u.ws === ws)

                if (!user) {
                    return ws.send("Not authorized")
                }

                const room = await Room.findOne({
                    roomId: parsedData.roomId
                })

                if( !room ) {
                    return ws.send("Invalid room id");
                }

                user.rooms = user?.rooms.filter(roomId => roomId === parsedData.roomId);

              return ws.send(`disconnected to room ${room.slug}`)
            }
            
            if (parsedData.type === "chat"){
                const user : User | undefined = users.find(u => u.ws === ws)

                if (!user) {
                    return ws.send("Not authorized")
                }

                const room = await Room.findOne({
                    roomId: parsedData.roomId
                })

                if( !room ) {
                    return ws.send("Invalid room id");
                }                

                users.forEach( user => {
                    if(user.rooms.includes(parsedData.roomId)) {
                        user.ws.send( JSON.stringify(parsedData.message) )
                    }
                })

            }

        })
    })
    
}