import document from "document";
import { me as device } from "device";
import { field } from "./field"
import { unlinkSync, writeFileSync } from "fs";

const SCREEN_SIZE = { x: device.screen.width, y: device.screen.height };
const SEGMENT_SIZE = 15;
const INTERVAL = 150;

let nextMoveX = 1;
let nextMoveY = 0;

const segments: RectElement[] = [];
let iv: number;

function initControls() {
    document.getElementsByClassName('tap').forEach(control => {
        control.addEventListener('click', (evt) => {

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
        })
    })
}

function initSnake() {
    document.getElementsByClassName('s').forEach((segment: RectElement, index) => {
        segment.x = SCREEN_SIZE.x / 2 - SEGMENT_SIZE * 6 + SEGMENT_SIZE * index;
        segment.y = SCREEN_SIZE.y / 2

        segments.push(segment);
    })
}

function startSnake() {
    iv = setInterval(() => {

        const head = segments[segments.length - 1];
        const tail = segments.shift();

        tail.x = head.x + SEGMENT_SIZE * nextMoveX;
        if (tail.x >= SCREEN_SIZE.x) tail.x = 0
        else if (tail.x <= 0) tail.x = SCREEN_SIZE.x

        tail.y = head.y + SEGMENT_SIZE * nextMoveY;
        if (tail.y >= SCREEN_SIZE.y) tail.y = 0
        else if (tail.y <= 0) tail.y = SCREEN_SIZE.y


        segments.push(tail)
        

    }, INTERVAL)
}

initControls();
initSnake();
startSnake();
