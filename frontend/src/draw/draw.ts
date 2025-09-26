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
    private viewportTransform = {
        x: 0,
        y: 0,
        scale: 1
    }

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
        // Save current transform
        this.ctx.save();

        // Reset transform to identity
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Clear the full canvas in screen coords
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.fillStyle = 'rgba(0, 0, 0)'
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.restore()

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

    private drawWithPencil = (x:number, y:number) => {
        console.log('inside')
        const mouseX = x
        const mouseY = y

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

    private updatePanning = (e: WheelEvent) => {

        this.viewportTransform.x -= e.deltaX
        this.viewportTransform.y -= e.deltaY
        if (e.deltaX > 0) console.log("scrooled right")
        console.log("scrolled left", e.deltaX)

    }

    private render = () => {
        // New code 👇
        this.ctx.setTransform(1, 0, 0, 1, 0, 0)
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.setTransform(
            this.viewportTransform.scale,
            0,
            0,
            this.viewportTransform.scale,
            this.viewportTransform.x,
            this.viewportTransform.y
        )
        this.clearCanvas()
    }

    private updateZooming = (e: WheelEvent) => {
        const oldx = this.viewportTransform.x
        const oldy = this.viewportTransform.y
        const oldScale = this.viewportTransform.scale

        const localx = e.clientX
        const localy = e.clientY

        let newScale = oldScale + e.deltaY * -0.01;
        newScale = Math.min(Math.max(newScale, 0.1), 10);

        const newx = localx - (localx - oldx) * (newScale / oldScale)
        const newy = localy - (localy - oldy) * (newScale / oldScale)

        this.viewportTransform.x = newx
        this.viewportTransform.y = newy
        this.viewportTransform.scale = newScale
    }

    mouseDownHandler = (e: MouseEvent) => {
        console.log('inside down ', e.clientX, e.clientY)
        console.log('inside down global-', e.clientX - this.viewportTransform.x, e.clientY - this.viewportTransform.y)
        this.clicked = true;
        this.startX = (e.clientX - this.viewportTransform.x) / this.viewportTransform.scale
        this.startY = (e.clientY - this.viewportTransform.y) / this.viewportTransform.scale
        this.ctx.fillStyle = "#ffffff"
        this.lastX = (e.clientX - this.viewportTransform.x) / this.viewportTransform.scale
        this.lastY = (e.clientY - this.viewportTransform.y) / this.viewportTransform.scale


        this.canvas.addEventListener('mousemove', this.mouseMoveHandler)
    }

    mouseUpHandler = (e: MouseEvent) => {
        console.log('inside up')

        this.canvas.removeEventListener('mousemove', this.mouseMoveHandler);

        this.clicked = false
        const x = (e.clientX - this.viewportTransform.x) / this.viewportTransform.scale
        const y = (e.clientY - this.viewportTransform.y) / this.viewportTransform.scale
        const width = x - this.startX
        const height = y - this.startY

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
                endX: x,
                endY: y
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
            console.log("sent shape: ", shape)
        }

        this.clearCanvas()
    }

    mouseMoveHandler = (e: MouseEvent) => {

        if (this.clicked) {
            console.log('move tool =', this.selectedTool)
            this.ctx.strokeStyle = 'rgba(255, 255, 255)'
            this.ctx.fillStyle = 'rgb(255, 255, 255)'

            const x = (e.clientX - this.viewportTransform.x) / this.viewportTransform.scale
            const y = (e.clientY - this.viewportTransform.y) / this.viewportTransform.scale
            const width = x - this.startX;
            const height = y - this.startY;

            if (this.selectedTool == 'rect') {

                this.clearCanvas()
                this.ctx.strokeRect(this.startX, this.startY, width, height);

            } else if (this.selectedTool == 'circle') {

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
                this.ctx.lineTo(x, y)
                this.ctx.closePath()
                this.ctx.stroke()

            } else if (this.selectedTool == 'pencil') {
                this.drawWithPencil(x,y);
            }
        }

    }

    mouseWheelHandler = (e: WheelEvent) => {
        if (e.deltaX !== 0) {
            e.preventDefault()
        }

        if (e.ctrlKey) {
            e.preventDefault()
            this.updateZooming(e)
            this.render()
        } else {

            console.log("mousewheel: ", e.clientX, e.clientY)
            this.updatePanning(e);
            this.render();
        }
    }

    initMouseHandler = () => {
        this.canvas.addEventListener('mousedown', this.mouseDownHandler)

        this.canvas.addEventListener('mouseup', this.mouseUpHandler)

        this.canvas.addEventListener('wheel', this.mouseWheelHandler, { passive: false })
    }

    destroy = () => {
        this.canvas.removeEventListener('mousedown', this.mouseDownHandler)

        this.canvas.removeEventListener('mouseup', this.mouseUpHandler)

        this.canvas.removeEventListener('wheel', this.mouseWheelHandler)
    }

}