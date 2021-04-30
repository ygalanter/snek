import document from "document";
import { me as device } from "device";
import { field } from "./field"
import { unlinkSync, writeFileSync } from "fs";

const SCREEN_SIZE = { x: device.screen.width, y: device.screen.height };
const SEGMENT_SIZE = 15;
const INTERVAL = 30;

type Direction = {
    axis: "x" | "y";
    sign: -1 | 1;
};

interface DirectElement extends RectElement {
    direction: Direction;
}

let snake: DirectElement[];
let turningPoints: { x: number, y: number, direction: Direction }[]

function initControls() {
    document.getElementsByClassName('tap').forEach(button => {
        switch (button.id) {
            case 'up':
                button.addEventListener('click', () => turnSnake({ axis: 'y', sign: -1 }));
                break
            case 'down':
                button.addEventListener('click', () => turnSnake({ axis: 'y', sign: 1 }));
                break
            case 'left':
                button.addEventListener('click', () => turnSnake({ axis: 'x', sign: -1 }));
                break
            case 'right':
                button.addEventListener('click', () => turnSnake({ axis: 'x', sign: 1 }));
                break
        }
    })
    
}

function initNewSegment(
    newSegment: DirectElement,
    prevSegment: DirectElement
): DirectElement {
    newSegment.direction = { ...prevSegment.direction };
    newSegment.x = prevSegment.x;
    newSegment.y = prevSegment.y;

    newSegment[prevSegment.direction.axis] -=
        SEGMENT_SIZE * prevSegment.direction.sign;

    return newSegment;
}

function initSnake() {
    snake = [];
    turningPoints = [];

    const rects = document.getElementsByClassName("s") as DirectElement[];


    // snake head
    const head = rects[0];
    head.class += " h";
    head.x = SCREEN_SIZE.x / 2;
    head.y = SCREEN_SIZE.y / 2;
    head.direction = { axis: "x", sign: 1 };
    snake.push(head);

    // rest of the snake
    for (let i = 1; i < rects.length; i++) {
        snake.push(initNewSegment(rects[i], rects[i - 1]))
    }
}

function moveSegment(segment: DirectElement) {
    const newCoord = segment[segment.direction.axis] + SEGMENT_SIZE / 3 * segment.direction.sign;

    if (newCoord >= SCREEN_SIZE[segment.direction.axis]) {
        segment[segment.direction.axis] = 0
    } else if (newCoord < 0) {
        segment[segment.direction.axis] = SCREEN_SIZE[segment.direction.axis]
    } else {
        segment[segment.direction.axis] = newCoord
    }
}

function checkTurn(segment: DirectElement, segmentNo: number) {
    for (let turnNo = turningPoints.length - 1; turnNo >= 0; turnNo--) {
        if (segment.x === turningPoints[turnNo].x && segment.y === turningPoints[turnNo].y) {
            segment.direction = { ...turningPoints[turnNo].direction };

            if (segmentNo === snake.length - 1 && turnNo === 0) {
                turningPoints.shift();
            }
        }
    }
}

function hasCollided() {
    const head = snake[0];
    for (let segNo = 1; segNo < snake.length; segNo++) {
        if (head.x === snake[segNo].x && head.y === snake[segNo].y) {
            return true
        }
    }
    return false;
}

function startSnakeMovement() {
    const interval = setInterval(() => {
        snake.forEach((segment, segmentNo) => {
            checkTurn(segment, segmentNo)
            moveSegment(segment)
        });

        if (hasCollided()) {
            console.log('**************** BOOOOM ***********');
            clearInterval(interval);
        }

    }, INTERVAL)

    return interval
}

function turnSnake(direction: Direction) {
    snake[0].direction = { ...direction };
    turningPoints.push({
        x: snake[0].x,
        y: snake[0].y,
        direction: snake[0].direction
    })
}

let viewId: number
function updateField() {
    console.log("***** GROWING!")
    clearInterval(interval);

    const directions: Direction[] = [];
    let rects = '';

    for (let segment of snake) {
        directions.push(segment.direction);
        rects += `<rect x="${segment.x}" y="${segment.y}" class="${segment.class}" />`
    }

    rects += '<rect class="s" />'

    if (viewId) {
        unlinkSync(`field${viewId}.view`);
    }

    viewId = Math.random();
    const viewName = `field${viewId}.view`;
    writeFileSync(viewName, field.replace('<snake/>', rects), 'utf-8');
    document.location.replace(`/private/data/${viewName}`).then(() => {

        snake = [];
        const rects = document.getElementsByClassName("s") as DirectElement[];

        rects.forEach((segment, index) => {
            if (index < rects.length - 1) {
             segment.direction = directions[index];
            }
            snake.push(segment);
        });

        initNewSegment(snake[snake.length - 1], snake[snake.length - 2]);

        initControls();
        interval = startSnakeMovement();
    })
}


initControls();
initSnake();
let interval = startSnakeMovement();

setInterval(updateField,6000);


