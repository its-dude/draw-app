import axios from "axios"
import { Backend_URL } from "../config"
import { getSecret } from "../config"
import type React from "react"
import { nanoid } from "nanoid"

type Point = {
    x: number,
    y: number,
    thickness: number
}

type Tool = 'rect' | 'circle' | 'line' | 'pencil' | 'eraser' | 'Text'

type BaseShape = {
    id: string;   // common for all shapes
};

type Rect = BaseShape & {
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
};

type Circle = BaseShape & {
    type: "circle";
    centerX: number;
    centerY: number;
    radius: number;
    startAngle: number;
    endAngle: number;
    direction: boolean;
};

type Line = BaseShape & {
    type: "line";
    startX: number;
    startY: number;
    endX: number;
    endY: number;
};

type Pencil = BaseShape & {
    type: "pencil";
    points: Point[];
};

type Text = BaseShape & {
    type: 'text',
    id: string,
    lines: { text: string, x: number, y: number }[]
}

type Shape = Rect | Circle | Line | Pencil | Text;

export class Draw {
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private selectedTool: Tool = 'rect'
    private roomId: string;
    private setRoomId: React.Dispatch<React.SetStateAction<string>>;
    private setModalType: React.Dispatch<React.SetStateAction<'join_room' | 'share_room' | null>>
    private textareaParent: HTMLDivElement
    private isTyping: boolean = false
    private textStartX: number = 0
    private textStartY: number = 0
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
    private serverShapes: Shape[]
    private undo: Shape[] = []
    private redo: Shape[] = []

    private pencil: Pencil = { type: 'pencil', points: [], id: this.getId() };

    constructor(
        canvas: HTMLCanvasElement,
        roomId: string,
        setRoomId: React.Dispatch<React.SetStateAction<string>>,
        setModalType: React.Dispatch<React.SetStateAction<'join_room' | 'share_room' | null>>,
        ws: WebSocket,
        textareaParent: HTMLDivElement
    ) {
        this.canvas = canvas
        this.ctx = this.canvas.getContext("2d")!
        this.serverShapes = []
        this.roomId = roomId
        this.ws = ws
        this.textareaParent = textareaParent
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.87)"; // same perceived brightness
        this.ctx.font = '24px sans-serif'
        this.ctx.textBaseline = 'top'
        this.setRoomId = setRoomId
        this.setModalType = setModalType
        this.init()
        this.initMouseHandler()
        this.initHandler()
    }

    async init() {
        this.serverShapes = await this.getExistingShape()
        console.log(this.serverShapes)
        this.clearCanvasAndDraw()
    }

    initHandler() {
        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data)

            if (message.type === 'draw') {
                const parsedShape = JSON.parse(message.message)

                if (parsedShape.action === 'create') {
                    this.serverShapes.push(parsedShape.shape)
                } else if (parsedShape.action === 'delete') {
                    this.serverShapes = this.serverShapes.filter(shape => shape.id !== parsedShape.shape.id)
                }
                this.clearCanvasAndDraw()
            } else if (message.message === "room_joined") {
                this.setModalType(null)
                this.setRoomId(message.roomId)

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

    draw() {

        this.serverShapes.map((shape: Shape) => {
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
            } else if (shape.type === 'text') {

                shape.lines.forEach(line => {
                    this.ctx.fillText(line.text, line.x, line.y)
                })
            }

        })

        this.undo.map((shape: Shape) => {
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
            } else if (shape.type === 'text') {

                shape.lines.forEach(line => {
                    this.ctx.fillText(line.text, line.x, line.y)
                })
            }

        })
    }

    clearCanvasAndDraw() {
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
        this.draw()

    }

    setTool(selectedTool: 'rect' | 'circle' | 'line' | 'pencil' | 'eraser' | 'Text') {
        this.selectedTool = selectedTool;
    }

    private drawWithPencil = (x: number, y: number) => {
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
    }

    private render = () => {
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
        this.clearCanvasAndDraw()
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

    private getId() {
        return nanoid(7);
    }

    private getCanvasCoordinate(clientX: number, clientY: number) {
        return {
            x: (clientX - this.viewportTransform.x) / this.viewportTransform.scale,
            y: (clientY - this.viewportTransform.y) / this.viewportTransform.scale
        }
    }

    private eraseFirstShape(
        shapes: typeof this.serverShapes,
        eraserX: number,
        eraserY: number
    ): { remainingShapes: typeof shapes, deletedShape: typeof shapes[0] | null } {
        let deletedShape: typeof shapes[0] | null = null;

        const remainingShapes = shapes.filter(shape => {
            if (deletedShape) return true; // already deleted one, keep the rest

            let hit = false;

            if (shape.type === 'rect') {
                hit = (
                    eraserX >= Math.min(shape.x, shape.x + shape.width) &&
                    eraserX <= Math.max(shape.x, shape.x + shape.width) &&
                    eraserY >= Math.min(shape.y, shape.y + shape.height) &&
                    eraserY <= Math.max(shape.y, shape.y + shape.height)
                );
            } else if (shape.type === 'line') {
                hit = this.eraseLine(eraserX, eraserY, shape.startX, shape.startY, shape.endX, shape.endY);
            } else if (shape.type === 'circle') {
                hit = this.eraseCircle(eraserX, eraserY, shape.centerX, shape.centerY, shape.radius);
            } else if (shape.type === 'pencil') {
                hit = this.erasePencil(eraserX, eraserY, shape.points);
            }

            if (hit) deletedShape = shape; // first shape to erase
            return !hit;
        });

        return { remainingShapes, deletedShape };
    }


    private erase(e: MouseEvent) {
        const coordinates = this.getCanvasCoordinate(e.clientX, e.clientY);
        const eraserX = coordinates.x;
        const eraserY = coordinates.y;

        const serverResult = this.eraseFirstShape(this.serverShapes, eraserX, eraserY);
        this.serverShapes = serverResult.remainingShapes;
        if (serverResult.deletedShape) {
            this.sendMessage('delete', serverResult.deletedShape);
            return; // stop after deleting one shape
        }

        const undoResult = this.eraseFirstShape(this.undo, eraserX, eraserY);
        this.undo = undoResult.remainingShapes;
        if (undoResult.deletedShape) {
            this.sendMessage('delete', undoResult.deletedShape);
        }
    }


    private eraseLine(ex: number, ey: number, x1: number, y1: number, x2: number, y2: number) {
        const dx = x2 - x1;
        const dy = y2 - y1;

        if (dx === 0 && dy === 0) {
            // line is just a point
            return Math.hypot(ex - x1, ey - y1) <= 8;
        }

        let t = ((ex - x1) * dx + (ey - y1) * dy) / (dx * dx + dy * dy);
        t = Math.max(0, Math.min(1, t));

        const cx = x1 + t * dx;
        const cy = y1 + t * dy;

        const dist = Math.hypot(ex - cx, ey - cy);

        return dist <= 8; // true = erase
    }

    private eraseCircle(ex: number, ey: number, cx: number, cy: number, radius: number) {
        const dist = Math.sqrt((ex - cx) * (ex - cx) + (ey - cy) * (ey - cy))
        return Math.abs(dist - radius) <= 4
    }

    private pointToSegmentDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
        const dx = x2 - x1;
        const dy = y2 - y1;

        if (dx === 0 && dy === 0) {
            // segment is a point
            return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
        }

        // Projection factor t of point on segment
        let t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy);
        t = Math.max(0, Math.min(1, t)); // clamp to segment

        const closestX = x1 + t * dx;
        const closestY = y1 + t * dy;

        return Math.sqrt((px - closestX) ** 2 + (py - closestY) ** 2);
    }

    private erasePencil(ex: number, ey: number, points: { x: number, y: number, thickness: number }[], eraserRadius: number = 8): boolean {
        for (let i = 0; i < points.length - 1; i++) {
            const d = this.pointToSegmentDistance(ex, ey, points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
            if (d <= eraserRadius + points[i].thickness / 2) {
                return true; // eraser touched stroke
            }
        }
        return false;
    }


    private sendMessage(action: string, shape: Shape) {

        this.ws.send(JSON.stringify({
            type: "draw",
            message: JSON.stringify({
                action,
                shape
            }),
            roomId: this.roomId,
        }))

    }

    private isValidShape(shape: Shape): boolean {
        if (shape.type === 'rect' && shape.width === 0 && shape.height === 0) {
            return false
        } else if (shape.type === 'circle' && shape.radius === 0) {
            return false
        } else if (shape.type === 'pencil' && shape.points.length === 0) {
            return false
        } else if (shape.type === 'line' && shape.startX === shape.endX && shape.startY === shape.endY) {
            return false
        }
        return true
    }

    mouseDownHandler = (e: MouseEvent) => {
        this.clicked = true;
        this.startX = (e.clientX - this.viewportTransform.x) / this.viewportTransform.scale
        this.startY = (e.clientY - this.viewportTransform.y) / this.viewportTransform.scale
        this.ctx.fillStyle = "#ffffff"
        this.lastX = (e.clientX - this.viewportTransform.x) / this.viewportTransform.scale
        this.lastY = (e.clientY - this.viewportTransform.y) / this.viewportTransform.scale

        if (!this.isTyping && this.selectedTool == 'Text') {
            const textarea = document.createElement("textarea")
            textarea.style.position = "absolute"
            textarea.style.top = `${e.clientY}px`
            textarea.style.left = `${e.clientX}px`
            textarea.style.width = "100px"
            textarea.style.height = "50px"
            textarea.style.border = "none";
            textarea.style.resize = "none"
            textarea.style.outline = "none";
            textarea.style.color = "rgba(255, 255, 255, 0.87)"
            textarea.style.fontSize = "24px"

            this.textareaParent.appendChild(textarea)

            this.isTyping = true
            this.textStartX = this.startX
            this.textStartY = this.startY

            setTimeout(() => {
                textarea.focus();
                textarea.addEventListener("input", () => {
                    textarea.style.width = "auto";
                    textarea.style.width = textarea.scrollWidth + "2px";
                    textarea.style.height = "auto";
                    textarea.style.height = textarea.scrollHeight + "2px";
                });
            }, 0);
        } else if (this.isTyping && this.selectedTool == 'Text' && this.textareaParent.childElementCount !== 0 && e.target !== this.textareaParent.firstChild) {

            this.isTyping = false
            let textarea = this.textareaParent.firstElementChild
            let text = (textarea as HTMLTextAreaElement)?.value

            this.textareaParent.innerHTML = ""

            const lines = text.split("\n")
            const fontSize = 24;
            if (lines.every(line => line.trim() === "")) return;

            const shape: Text = {
                type: "text",
                lines: [],
                id: this.getId()
            };


            lines.forEach((text, index) => {
                const x = this.textStartX
                const y = this.textStartY + (index * fontSize)
                alert(`${fontSize} : ${y} ${lines.length}`)
                if (text !== "") {
                    //@ts-ignore
                    shape.lines.push({
                        text: text,
                        x,
                        y
                    })

                    this.ctx.fillText(
                        text,
                        x,
                        y);
                }

            });

            this.sendMessage('create', shape)
            this.undo.push(shape)
            this.redo = []
        }

        this.canvas.addEventListener('mousemove', this.mouseMoveHandler)
    }

    mouseUpHandler = (e: MouseEvent) => {

        this.canvas.removeEventListener('mousemove', this.mouseMoveHandler);

        this.clicked = false
        const x = (e.clientX - this.viewportTransform.x) / this.viewportTransform.scale
        const y = (e.clientY - this.viewportTransform.y) / this.viewportTransform.scale
        const width = x - this.startX
        const height = y - this.startY

        this.radius = Math.max(Math.abs(width), Math.abs(height))
        let shape: Shape | null = null;
        let id = this.getId()

        if (this.selectedTool == 'rect') {
            shape = {
                type: this.selectedTool,
                x: this.startX,
                y: this.startY,
                width,
                height,
                id
            }
        } else if (this.selectedTool == 'circle') {
            shape = {
                type: this.selectedTool,
                centerX: this.startX + this.radius,
                centerY: this.startY + this.radius,
                radius: this.radius,
                startAngle: 0,
                endAngle: 2 * Math.PI,
                direction: true,
                id
            }

        } else if (this.selectedTool == 'line') {
            shape = {
                type: this.selectedTool,
                startX: this.startX,
                startY: this.startY,
                endX: x,
                endY: y,
                id
            }

        } else if (this.selectedTool == 'pencil') {
            shape = this.pencil
            this.pencil = { type: 'pencil', points: [], id: this.getId() }
        } else if (this.selectedTool == 'eraser') {
            return
        } else {
            return
        }

        if (!this.isValidShape(shape!)) return;

        this.undo.push(shape!)

        this.sendMessage("create", shape!)

        this.clearCanvasAndDraw()
        this.redo = []
    }

    mouseMoveHandler = (e: MouseEvent) => {

        if (this.clicked) {
            this.ctx.strokeStyle = 'rgba(255, 255, 255)'
            this.ctx.fillStyle = 'rgb(255, 255, 255)'
            const coordinates = this.getCanvasCoordinate(e.clientX, e.clientY)
            const x = coordinates.x
            const y = coordinates.y
            const width = x - this.startX;
            const height = y - this.startY;

            if (this.selectedTool == 'rect') {

                this.clearCanvasAndDraw()
                this.ctx.strokeRect(this.startX, this.startY, width, height);

            } else if (this.selectedTool == 'circle') {

                this.radius = Math.max(Math.abs(width), Math.abs(height))
                this.clearCanvasAndDraw()
                const centerX = this.startX + this.radius
                const centerY = this.startY + this.radius

                this.ctx.beginPath()
                this.ctx.arc(centerX, centerY, this.radius, 0, Math.PI * 2, true);
                this.ctx.stroke()

            } else if (this.selectedTool == 'line') {
                this.clearCanvasAndDraw()
                this.ctx.beginPath()
                this.ctx.moveTo(this.startX, this.startY)
                this.ctx.lineTo(x, y)
                this.ctx.closePath()
                this.ctx.stroke()

            } else if (this.selectedTool == 'pencil') {
                this.drawWithPencil(x, y);
            } else if (this.selectedTool == 'eraser') {
                this.erase(e);
                this.clearCanvasAndDraw()
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
            this.updatePanning(e);
            this.render();
        }
    }

    KeyDownHandler = (e: KeyboardEvent) => {
        if (!e.ctrlKey) return;

        if (e.key.toLowerCase() === 'z') {
            // Undo
            // Stop browser default undo/redo
            e.preventDefault();
            if (this.undo.length === 0) {
                return;
            }

            console.log("undo ", this.undo);

            const shape = this.undo.pop()!
            this.redo.push(shape)
            this.sendMessage("delete", shape)
            this.clearCanvasAndDraw()
        } else if (e.key.toLowerCase() === 'y') {
            // Redo
            // Stop browser default undo/redo
            e.preventDefault();
            if (this.redo.length === 0) return;

            const shape = this.redo.pop()!
            this.undo.push(shape)
            this.sendMessage("create", shape)
            this.clearCanvasAndDraw()
        }
    }

    doubleClickHandler = (e: MouseEvent) => {
        alert("doubleClick")
    }

    initMouseHandler = () => {
        this.canvas.addEventListener('mousedown', this.mouseDownHandler)

        this.canvas.addEventListener('mouseup', this.mouseUpHandler)

        this.canvas.addEventListener('wheel', this.mouseWheelHandler, { passive: false })

        // this.canvas.addEventListener("dblclick", this.doubleClickHandler)

        document.body.addEventListener('keydown', this.KeyDownHandler, { passive: false })
    }

    destroy = () => {
        this.canvas.removeEventListener('mousedown', this.mouseDownHandler)

        this.canvas.removeEventListener('mouseup', this.mouseUpHandler)

        this.canvas.removeEventListener('wheel', this.mouseWheelHandler)

        this.canvas.removeEventListener('keydown', this.KeyDownHandler)

        // this.canvas.addEventListener("dblclick", this.doubleClickHandler)
    }

}