import document from "document";
import { me as device } from "device";
import { Dir } from "fs";

const SCREEN_SIZE = { x: device.screen.width, y: device.screen.height };
const SEGMENT_SIZE = 15;
const INITIAL_SNAKE_LENGTH = 10;
const INTERVAL = 100;

type Direction = {
    axis: "x" | "y";
    sign: -1 | 1;
};

interface DirectElement extends RectElement {
    direction: Direction;
}

let snake: DirectElement[];
let snakeReserve: DirectElement[];
let turningPoints: { x: number, y: number, direction: Direction }[]

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
    snakeReserve = [];
    turningPoints = [];

    const freeSegments = document.getElementsByClassName("s") as DirectElement[];

    // segments[0] is ignored - it's in <defs> section

    // snake head
    const head = freeSegments[1];
    head.class = "h";
    head.x = SCREEN_SIZE.x / 2;
    head.y = SCREEN_SIZE.y / 2;
    head.direction = { axis: "x", sign: 1 };
    snake.push(head);

    // rest of the snake
    for (let i = 2; i < freeSegments.length; i++) {
        // snake segments are added to snake
        if (i < INITIAL_SNAKE_LENGTH + 1) {
            snake.push(initNewSegment(freeSegments[i], freeSegments[i - 1]))
            // rest of segments added to reserve
        } else {
            snakeReserve.push(freeSegments[i]);
        }
    }
}

function moveSegment(segment: DirectElement) {
    const newCoord = segment[segment.direction.axis] + SEGMENT_SIZE * segment.direction.sign;

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
}

function turnSnake(direction: Direction) {
    snake[0].direction = { ...direction };
    turningPoints.push({
        x: snake[0].x,
        y: snake[0].y,
        direction: snake[0].direction
    })
}

function growSnake() {
    const newSegment = snakeReserve.pop()!;
    initNewSegment(newSegment, snake[snake.length-1]);
    snake.push(newSegment); 
    console.log('GROWING!')
}


initSnake();
startSnakeMovement();

// simulating random snake turns
setInterval(() => {
    turnSnake({ axis: snake[0].direction.axis === 'x' ? 'y' : 'x', sign: Math.random() > 0.4 ? 1 : -1 })
}, 2000)

// simulating snake growth.
setInterval(() => {
    growSnake();
}, 5000)