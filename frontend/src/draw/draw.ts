import axios from "axios"
import { Backend_URL } from "../config"
import { getSecret } from "../config"
import type React from "react"

type Point = {
    x: number,
    y: number,
    thickness: number
}

type Tool = 'rect' | 'circle' | 'line' | 'pencil'

type Shape = {
    type: "rect",
    x: number,
    y: number,
    width: number,
    height: number
} | {
    type: 'circle',
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    direction: boolean
} | {
    type: 'line',
    startX: number,
    startY: number,
    endX: number,
    endY: number
} | {
    type: 'pencil',
    points: Point[],
}

export class Draw {
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private existingShapes: Shape[]
    private selectedTool: Tool = 'rect'
    private roomId: string;
    private setRoomId: React.Dispatch<React.SetStateAction<string>>;
    private setModalType: React.Dispatch<React.SetStateAction<'join_room' | 'share_room' | null>>;
    private startX: number = 0
    private startY: number = 0
    private radius: number = 0
    private lastX: number = 0
    private lastY: number = 0
    private clicked: boolean = false
    private ws: WebSocket

    private pencil: {
        type: 'pencil',
        points: Point[]
    } | null = { type: 'pencil', points: [] };

    constructor(
        canvas: HTMLCanvasElement,
        roomId: string,
        setRoomId: React.Dispatch<React.SetStateAction<string>>,
        setModalType: React.Dispatch<React.SetStateAction<'join_room' | 'share_room' | null>>,
        ws: WebSocket
    ) {
        this.canvas = canvas
        this.ctx = this.canvas.getContext("2d")!
        this.existingShapes = []
        this.roomId = roomId
        this.ws = ws
        this.setRoomId = setRoomId
        this.setModalType = setModalType
        this.init()
        this.initMouseHandler()
        this.initHandler()
    }

    async init() {
        this.existingShapes = await this.getExistingShape()
        this.clearCanvas()
    }

    initHandler() {
        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data)

            if (message.type === 'draw') {
                const parsedShape = JSON.parse(message.message)
                this.existingShapes.push(parsedShape)
                this.clearCanvas()
            } else if (message.message === "room_joined") {
                this.setModalType(null)
                this.setRoomId(message.roomId)
                console.log('joined room ', message.roomId)
            }
        }
    }

    async getExistingShape() {
        const response = await axios.get(`${Backend_URL}/user/chats/${this.roomId}`, {
            headers: {
                Authorization: `Bearer ${getSecret()}`
            }
        })

        const chats = response.data.chats

        if (chats.length == 0) {
            return [];
        }
        //@ts-ignore
        const shapes = chats.map(chat => chat.shape);

        return shapes
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.fillStyle = 'rgba(0, 0, 0)'
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

        this.existingShapes.map((shape: Shape) => {
            this.ctx.strokeStyle = 'rgba(255, 255, 255)'

            if (shape.type === "rect") {

                this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);

            } else if (shape.type === 'circle') {

                this.ctx.beginPath()
                this.ctx.arc(shape.centerX, shape.centerY, shape.radius, shape.startAngle, shape.endAngle)
                this.ctx.stroke()

            } else if (shape.type === 'line') {

                this.ctx.beginPath()
                this.ctx.moveTo(shape.startX, shape.startY)
                this.ctx.lineTo(shape.endX, shape.endY)
                this.ctx.closePath()
                this.ctx.stroke()

            } else if (shape.type === 'pencil') {

                this.ctx.fillStyle = "rgba(255, 255, 255)"

                for (let i = 1; i < shape.points.length; i++) {
                    const p1 = shape.points[i - 1];
                    const p2 = shape.points[i];
                    const dx = p2.x - p1.x;
                    const dy = p2.y - p1.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const steps = Math.ceil(dist); // or some factor for spacing

                    for (let j = 0; j <= steps; j++) {
                        const x = p1.x + (dx * j / steps);
                        const y = p1.y + (dy * j / steps);
                        const thickness = p1.thickness + (p2.thickness - p1.thickness) * (j / steps);
                        this.ctx.fillRect(x, y, thickness, thickness);
                    }
                }
            }

        })
        
    }

    setTool(selectedTool: 'rect' | 'circle' | 'line' | 'pencil') {
        this.selectedTool = selectedTool;
        console.log(selectedTool)
    }

    private drawWithPencil = (e: MouseEvent) => {
        console.log('inside')
        const mouseX = e.pageX - this.canvas.offsetLeft;
        const mouseY = e.pageY - this.canvas.offsetTop;

        // find all points between        
        var x1 = mouseX,
            x2 = this.lastX,
            y1 = mouseY,
            y2 = this.lastY;


        var steep = (Math.abs(y2 - y1) > Math.abs(x2 - x1));
        // if not on x-axis swap : this is required for alogrithm later swap to original value
        if (steep) {
            var x = x1;
            x1 = y1;
            y1 = x;

            var y = y2;
            y2 = x2;
            x2 = y;
        }
        if (x1 > x2) {
            var x = x1;
            x1 = x2;
            x2 = x;

            var y = y1;
            y1 = y2;
            y2 = y;
        }

        var dx = x2 - x1,
            dy = Math.abs(y2 - y1),
            error = 0,
            de = dy / dx,
            yStep = -1,
            y = y1;

        if (y1 < y2) {
            yStep = 1;
        }

        //custom thickness based upon distance
        let lineThickness = 5 - Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)) / 10;
        if (lineThickness < 2) {
            lineThickness = 2;
        }

        for (var x = x1; x < x2; x++) {
            if (steep) {
                this.ctx.fillRect(y, x, lineThickness, lineThickness);
            } else {
                this.ctx.fillRect(x, y, lineThickness, lineThickness);
            }

            error += de;
            if (error >= 0.5) {
                y += yStep;
                error -= 1.0;
            }
        }



        this.lastX = mouseX;
        this.lastY = mouseY;

        this.pencil?.points.push({ x: this.lastX, y: this.lastY, thickness: lineThickness })

    }

    mouseDownHandler = (e: MouseEvent) => {
        console.log('inside down')
        this.clicked = true;
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.ctx.fillStyle = "#ffffff";
        // for pencil
        if (this.selectedTool == 'pencil') {
            this.lastX = e.pageX - this.canvas.offsetLeft;
            this.lastY = e.pageY - this.canvas.offsetTop;
        }
    }

    mouseUpHandler = (e: MouseEvent) => {
        console.log('inside up')
        this.clicked = false
        const width = e.clientX - this.startX
        const height = e.clientY - this.startY

        this.radius = Math.max(Math.abs(width), Math.abs(height))
        let shape: Shape | null = null;

        if (this.selectedTool == 'rect') {
            shape = {
                type: this.selectedTool,
                x: this.startX,
                y: this.startY,
                width,
                height
            }
        } else if (this.selectedTool == 'circle') {
            shape = {
                type: this.selectedTool,
                centerX: this.startX + this.radius,
                centerY: this.startY + this.radius,
                radius: this.radius,
                startAngle: 0,
                endAngle: 2 * Math.PI,
                direction: true
            }

        } else if (this.selectedTool == 'line') {
            shape = {
                type: this.selectedTool,
                startX: this.startX,
                startY: this.startY,
                endX: e.clientX,
                endY: e.clientY
            }

        } else if (this.selectedTool == 'pencil') {
            shape = this.pencil
            this.pencil = { type: 'pencil', points: [] }
        }

        this.existingShapes.push(shape!)
        //push to websocket connection
        if (this.selectedTool === 'rect' && width > 0 && height > 0) {
            this.ws.send(JSON.stringify({
                type: "draw",
                message: JSON.stringify({
                    shape
                }),
                roomId: this.roomId
            }))
        } else {
            this.ws.send(JSON.stringify({
                type: "draw",
                message: JSON.stringify({
                    shape
                }),
                roomId: this.roomId
            }))
            console.log("sent shape: ",shape)
        }

        this.clearCanvas()
    }

    mouseMoveHandler = (e: MouseEvent) => {

        if (this.clicked) {
            console.log('move tool =', this.selectedTool);
            this.ctx.strokeStyle = 'rgba(255, 255, 255)'
            this.ctx.fillStyle = 'rgb(255, 255, 255)'

            if (this.selectedTool == 'rect') {
                const width = e.clientX - this.startX;
                const height = e.clientY - this.startY;

                this.clearCanvas()
                this.ctx.strokeRect(this.startX, this.startY, width, height);

            } else if (this.selectedTool == 'circle') {

                const width = e.clientX - this.startX;
                const height = e.clientY - this.startY;
                this.radius = Math.max(Math.abs(width), Math.abs(height))
                this.clearCanvas()
                const centerX = this.startX + this.radius
                const centerY = this.startY + this.radius

                this.ctx.beginPath()
                this.ctx.arc(centerX, centerY, this.radius, 0, Math.PI * 2, true);
                this.ctx.stroke()

            } else if (this.selectedTool == 'line') {
                this.clearCanvas()
                this.ctx.beginPath()
                this.ctx.moveTo(this.startX, this.startY)
                this.ctx.lineTo(e.clientX, e.clientY)
                this.ctx.closePath()
                this.ctx.stroke()

            } else if (this.selectedTool == 'pencil') {
                this.drawWithPencil(e);
            }
        }

    }

    initMouseHandler = () => {
        this.canvas.addEventListener('mousedown', this.mouseDownHandler)

        this.canvas.addEventListener('mouseup', this.mouseUpHandler)

        this.canvas.addEventListener('mousemove', this.mouseMoveHandler)
    }

    destroy = () => {
        this.canvas.removeEventListener('mousedown', this.mouseDownHandler)

        this.canvas.removeEventListener('mouseup', this.mouseUpHandler)

        this.canvas.removeEventListener('mousemove', this.mouseMoveHandler)
    }

}