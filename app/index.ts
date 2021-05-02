import document from "document";
import { me as device } from "device";
import { field } from "./field"
import { unlinkSync, writeFileSync } from "fs";

const SEGMENT_SIZE = 15; // size of individual snake segment

// screen size needs to be adjusted to be a multiple of segment size for coordinates (of apples etc. to matcg)
const SCREEN_SIZE = { width: Math.floor(device.screen.width / SEGMENT_SIZE) * SEGMENT_SIZE, height: Math.floor(device.screen.height / SEGMENT_SIZE) * SEGMENT_SIZE };

const INTERVAL = 150; // interval between snake movements for setInterval()
const INITIAL_SNAKE_LENGTH = 5; // initial snake lengths in segments

// direction for snake head to move
let nextMoveX = 1;
let nextMoveY = 0;

// array to hold snake segments
const segments: RectElement[] = [];

/** Initializes title screen with PLAY and OPTIONS selection */
function initTitleScreen() {
    document.getElementById('play').addEventListener('click', () => {
        initSnake();
    })
}

let prevEvent = 'right';
/** Initializes Up Down left Right controls */
function initControls() {

    document.getElementsByClassName('tap').forEach(control => {
        control.addEventListener('mousedown', (evt) => {
            
            // Preventing accidental move in the direction opposite current that would cause snake to collide with itself
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

/** Creates initial snake */
function initSnake() {

    let rects = '';
    let i: number;

    // Creating a string of SVG rectangles to represent snake
    for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
        rects += `<rect x="${SEGMENT_SIZE * i + SEGMENT_SIZE}" y="${SEGMENT_SIZE * 2}" class="${i < INITIAL_SNAKE_LENGTH - 1? 's' : 's h'}" />`
    }

    growSnake(rects);
}

/** Kicks of interval to start snake movement */
function startSnake() {
    return setInterval(() => {

        /*
        We take first SVG from the snake array (its "tail") and move it to the end
        with coordinates representing next snake move - it becomes new snake head
        */

        const oldHead = segments[segments.length - 1];
        const newHead = segments.shift(); // former tail becomes new head

        oldHead.class = 's'; // old head is no longer head, so we give it regular segment colors
        newHead.class = 's h'; // new head gets head colors

        const newX = oldHead.x + SEGMENT_SIZE * nextMoveX;
        const newY = oldHead.y + SEGMENT_SIZE * nextMoveY;

        // Verifying if new head coordinates collided with any part of snake body
        segments.forEach((segment: RectElement) => {
            if (newX === segment.x && newY === segment.y) {
                console.log('BOOM!');
                clearInterval(iv);
            }
        })

        // if snake went past screen edge - it will emerge from opposite side
        if (newX >= SCREEN_SIZE.width) newHead.x = 0
        else if (newX <= 0) newHead.x = SCREEN_SIZE.width
        else newHead.x = newX;

        if (newY >= SCREEN_SIZE.height) newHead.y = 0
        else if (newY <= 0) newHead.y = SCREEN_SIZE.height
        else newHead.y = newY;

        segments.push(newHead);

        // if head ate apple - snake grows
        const apple = document.getElementById("apple") as RectElement;
        if (newHead.x === apple.x && newHead.y === apple.y) {
            growSnake();
        }


    }, INTERVAL)
}


let viewId: number;

/** Recreates SVG field with updates snake
 * @param string Optional set of string representation of SVG rects to put into the field
 */
function growSnake(rects?: string) {
    console.log("***** GROWING!")

    // stopping current snake movement
    clearInterval(iv);

    // If parameter with SVG rects isn't passed - we recreate it from snake array
    if (!rects) {

        // Snake needs to grow, so we add an extra rect
        rects = '<rect class="s" />';

        // creating string of SVG rectangles from existing snake array
        for (let segment of segments) {
            rects += `<rect x="${segment.x}" y="${segment.y}" class="${segment.class}" />`
        }
    
        // if previous SVG file exists - delete it
        if (viewId) {
            unlinkSync(`field${viewId}.view`);
        }
    }

    // Creating new SVG field and writing it into file
    viewId = Math.random();
    const viewName = `field${viewId}.view`;
    writeFileSync(viewName, field.replace('<snake/>', rects), 'utf-8');

    // loading newly created SVG view
    document.location.replace(`/private/data/${viewName}`).then(() => {

        segments.length = 0;
        const rects = document.getElementsByClassName("s");

        // recreating snake array from SVG elements
        rects.forEach((segment: RectElement) => {
            segments.push(segment)
        });

        initControls();
        setApple();
        iv = startSnake();

    })
}

/** Puts apple in random location on the screen */
function setApple() {
    const apple = document.getElementById("apple") as RectElement;
    apple.x = Math.floor(Math.random() * (SCREEN_SIZE.width - SEGMENT_SIZE * 2) / SEGMENT_SIZE) * SEGMENT_SIZE + SEGMENT_SIZE * 2;
    apple.y = Math.floor(Math.random() * (SCREEN_SIZE.height - SEGMENT_SIZE * 2) / SEGMENT_SIZE) * SEGMENT_SIZE + SEGMENT_SIZE * 2;
}

let iv;
initTitleScreen();