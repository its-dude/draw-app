type Point = {
    x: number,
    y: number,
    thickness: number
}

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
};



export function initDraw({ ctx, canvas }: { ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement }) {
    const existingShapes: Shape[] = [];
    let startX: number = 0;
    let startY: number = 0;
    let centerX: number = 0;
    let centerY: number = 0;
    let endX: number = 0;
    let endY: number = 0;
    let lastX: number = 0;
    let lastY: number = 0;
    let mouseX: number = 0;
    let mouseY: number = 0;
    let lineThickness: number = 1;
    let width: number = 0;
    let height: number = 0;
    let radius: number = 0;
    let clicked: boolean;
    let pencil: {
        type: 'pencil',
        points: Point[]
    } = { type: 'pencil', points: [] };
    //@ts-ignore
    let shapeType = window.shapeType
    ctx.fillStyle = 'rgb(0, 0, 0)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    function drawPencil(e: MouseEvent) {

        mouseX = e.pageX - canvas.offsetLeft;
        mouseY = e.pageY - canvas.offsetTop;

        // find all points between        
        var x1 = mouseX,
            x2 = lastX,
            y1 = mouseY,
            y2 = lastY;


        var steep = (Math.abs(y2 - y1) > Math.abs(x2 - x1));
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

        lineThickness = 5 - Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)) / 10;
        if (lineThickness < 2) {
            lineThickness = 2;
        }

        for (var x = x1; x < x2; x++) {
            if (steep) {
                ctx.fillRect(y, x, lineThickness, lineThickness);
            } else {
                ctx.fillRect(x, y, lineThickness, lineThickness);
            }

            error += de;
            if (error >= 0.5) {
                y += yStep;
                error -= 1.0;
            }
        }



        lastX = mouseX;
        lastY = mouseY;
    }

    canvas.addEventListener('mousedown', (e) => {
        //@ts-ignore
        shapeType = window.shapeType
        clicked = true;
        startX = e.clientX;
        startY = e.clientY;
        ctx.fillStyle = "#ffffff";

        if (shapeType == 'pencil') {
            lastX = e.pageX - canvas.offsetLeft;
            lastY = e.pageY - canvas.offsetTop;
        }

    })

    canvas.addEventListener('mousemove', (e) => {

        if (clicked) {
            width = e.clientX - startX;
            height = e.clientY - startY;
            radius = Math.max( Math.abs(width), Math.abs(height)
)

            ctx.strokeStyle = 'rgba(255, 255, 255)'
            if (shapeType == 'rect') {
                clearCanvas(existingShapes, ctx, canvas)
                ctx.strokeRect(startX, startY, width, height);
            } else if (shapeType == 'circle') {
                clearCanvas(existingShapes, ctx, canvas)
                centerX = startX + width / 2
                centerY = startY + height / 2
                ctx.beginPath()
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
                ctx.stroke()
            } else if (shapeType == 'line') {
                clearCanvas(existingShapes, ctx, canvas)
                endX = e.clientX
                endY = e.clientY
                ctx.beginPath()
                ctx.moveTo(startX, startY)
                ctx.lineTo(endX, endY)
                ctx.closePath()
                ctx.stroke()
            } else if (shapeType == 'pencil') {
                drawPencil(e);
                pencil.points.push({ x: lastX, y: lastY, thickness: lineThickness })
            }
        }
    }
    )

    canvas.addEventListener('mouseup', (e) => {

        clicked = false
        width = e.clientX - startX
        height = e.clientY - startY

        radius = Math.max(Math.abs(width), Math.abs(height))

        if (shapeType == 'rect') {
            existingShapes.push({
                type: shapeType,
                x: startX,
                y: startY,
                width,
                height
            })
        } else if (shapeType == 'circle') {
            existingShapes.push({
                type: shapeType,
                centerX,
                centerY,
                radius,
                startAngle: 0,
                endAngle: 2 * Math.PI,
                direction: true
            })
            console.log(radius)
            
        } else if (shapeType == 'line') {
            existingShapes.push({
                type: shapeType,
                startX,
                startY,
                endX,
                endY
            })
        } else if (shapeType == 'pencil') {
            existingShapes.push(pencil)
            pencil = {
                type: 'pencil',
                points: []
            };
        }

    })

}

function clearCanvas(existingShapes: Shape[], ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'rgba(0, 0, 0)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    existingShapes.map((shape: Shape) => {
        ctx.strokeStyle = 'rgba(255, 255, 255)'
        if (shape.type === "rect") {
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        } else if (shape.type === 'circle') {
            ctx.beginPath()
            ctx.arc(shape.centerX, shape.centerY, shape.radius, shape.startAngle, shape.endAngle)
            ctx.stroke()
            console.log(shape.radius)
        } else if (shape.type === 'line') {
            ctx.beginPath()
            ctx.moveTo(shape.startX, shape.startY)
            ctx.lineTo(shape.endX, shape.endY)
            ctx.closePath()
            ctx.stroke()
        } else if (shape.type === 'pencil') {
            ctx.fillStyle = "rgba(255, 255, 255)"
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
                    ctx.fillRect(x, y, thickness, thickness);
                }
            }
        }
    })
}
