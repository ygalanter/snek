import document from "document";
import { me as device } from "device";
import { field } from "./field"
import { unlinkSync, writeFileSync } from "fs";

const SEGMENT_SIZE = 15;
const SCREEN_SIZE = { width: Math.floor(device.screen.width / SEGMENT_SIZE) * SEGMENT_SIZE, height: Math.floor(device.screen.height / SEGMENT_SIZE) * SEGMENT_SIZE };
const INTERVAL = 150;
const INITIAL_SNAKE_LENGTH = 5;

let nextMoveX = 1;
let nextMoveY = 0;

const segments: RectElement[] = [];

function initTitleScreen() {
    document.getElementById('play').addEventListener('click', () => {
        initSnake();
    })
}

let prevEvent = 'right';
function initControls() {

    document.getElementsByClassName('tap').forEach(control => {
        control.addEventListener('mousedown', (evt) => {

            if (
                (prevEvent === 'right' && control.id == 'left') ||
                (prevEvent === 'left' && control.id == 'right') ||
                (prevEvent === 'up' && control.id == 'down') ||
                (prevEvent === 'down' && control.id == 'up')
            ) {
                return
            }

            switch (control.id) {

                case 'left':
                    nextMoveX = -1;
                    nextMoveY = 0;
                    break;
                case 'right':
                    nextMoveX = 1;
                    nextMoveY = 0;
                    break;
                case 'up':
                    nextMoveX = 0;
                    nextMoveY = -1;
                    break;
                case 'down':
                    nextMoveX = 0;
                    nextMoveY = 1;
                    break;

            }

            prevEvent = control.id;
        })
    })
}

function initSnake() {

    let rects = '';
    let i: number;

    for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
        rects += `<rect x="${SEGMENT_SIZE * i + SEGMENT_SIZE}" y="${SEGMENT_SIZE * 2}" class="${i < INITIAL_SNAKE_LENGTH - 1? 's' : 's h'}" />`
    }

    growSnake(rects);
}

function startSnake() {
    return setInterval(() => {

        const oldHead = segments[segments.length - 1];
        const newHead = segments.shift();

        oldHead.class = 's';
        newHead.class = 's h';

        const newX = oldHead.x + SEGMENT_SIZE * nextMoveX;
        const newY = oldHead.y + SEGMENT_SIZE * nextMoveY;

        segments.forEach((segment: RectElement) => {
            if (newX === segment.x && newY === segment.y) {
                console.log('BOOM!');
                clearInterval(iv);
            }
        })

        if (newX >= SCREEN_SIZE.width) newHead.x = 0
        else if (newX <= 0) newHead.x = SCREEN_SIZE.width
        else newHead.x = newX;

        if (newY >= SCREEN_SIZE.height) newHead.y = 0
        else if (newY <= 0) newHead.y = SCREEN_SIZE.height
        else newHead.y = newY;

        segments.push(newHead);

        const apple = document.getElementById("apple") as RectElement;
        if (newHead.x === apple.x && newHead.y === apple.y) {
            growSnake();
        }


    }, INTERVAL)
}


let viewId: number;
function growSnake(rects?: string) {
    console.log("***** GROWING!")
    clearInterval(iv);

    if (!rects) {
        rects = '<rect class="s" />';

        for (let segment of segments) {
            rects += `<rect x="${segment.x}" y="${segment.y}" class="${segment.class}" />`
        }
    
        if (viewId) {
            unlinkSync(`field${viewId}.view`);
        }
    }

    viewId = Math.random();
    const viewName = `field${viewId}.view`;
    writeFileSync(viewName, field.replace('<snake/>', rects), 'utf-8');
    document.location.replace(`/private/data/${viewName}`).then(() => {

        segments.length = 0;
        const rects = document.getElementsByClassName("s");

        rects.forEach((segment: RectElement) => {
            segments.push(segment)
        });

        initControls();
        setApple();
        iv = startSnake();

    })
}

function setApple() {
    const apple = document.getElementById("apple") as RectElement;
    apple.x = Math.floor(Math.random() * (SCREEN_SIZE.width - SEGMENT_SIZE * 2) / SEGMENT_SIZE) * SEGMENT_SIZE + SEGMENT_SIZE * 2;
    apple.y = Math.floor(Math.random() * (SCREEN_SIZE.height - SEGMENT_SIZE * 2) / SEGMENT_SIZE) * SEGMENT_SIZE + SEGMENT_SIZE * 2;
}

let iv;
initTitleScreen();