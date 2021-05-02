import document from "document";
import { me as device } from "device";
import { field } from "./field"
import { unlinkSync, writeFileSync } from "fs";

const SCREEN_SIZE = { width: device.screen.width, height: device.screen.height };
const SEGMENT_SIZE = 15;
const INTERVAL = 150;

let nextMoveX = 1;
let nextMoveY = 0;

const segments: RectElement[] = [];

let prevEvent = 'right';
function initControls() {

    document.getElementsByClassName('tap').forEach(control => {
        control.addEventListener('click', (evt) => {

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
    document.getElementsByClassName('s').forEach((segment: RectElement, index) => {
        segment.x = SCREEN_SIZE.width / 2 - SEGMENT_SIZE * 6 + SEGMENT_SIZE * index;
        segment.y = SCREEN_SIZE.height / 2

        segments.push(segment);
    })

    segments[segments.length - 1].class = 's h';
}

function startSnake() {
    return setInterval(() => {

        const oldHead = segments[segments.length - 1];
        const newHead = segments.shift();

        oldHead.class = 's';
        newHead.class = 's h';

        const newX = oldHead.x + SEGMENT_SIZE * nextMoveX;
        const newY = oldHead.y + SEGMENT_SIZE * nextMoveY;

        new Promise(resolve => {
            segments.forEach((segment: RectElement) => {
                if (newX === segment.x && newY === segment.y) {
                    resolve(true)
                }
            })

            resolve(false)
        }).then(isCollided => {
            if (isCollided) {
                console.log('**** BOOM ****');
                clearInterval(iv);
                clearInterval(ivs);
            }
        })




        if (newX >= SCREEN_SIZE.width) newHead.x = 0
        else if (newX <= 0) newHead.x = SCREEN_SIZE.width
        else newHead.x = newX;

        if (newY >= SCREEN_SIZE.height) newHead.y = 0
        else if (newY <= 0) newHead.y = SCREEN_SIZE.height
        else newHead.y = newY;

        segments.push(newHead)


    }, INTERVAL)
}


let viewId: number;
function growSnake() {
    console.log("***** GROWING!")
    clearInterval(iv);

    let rects = '<rect class="s" />';

    for (let segment of segments) {
        rects += `<rect x="${segment.x}" y="${segment.y}" class="${segment.class}" />`
    }

    if (viewId) {
        unlinkSync(`field${viewId}.view`);
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
        iv = startSnake();

    })
}

initControls();
initSnake();
let iv = startSnake();

// simulating snake grows;
const ivs = setInterval(growSnake, 6000);