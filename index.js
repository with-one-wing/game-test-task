const START_BUBBLE_AMOUNT = 10;

const BAD_HEALTH_MIN  = 3.5;
const GOOD_HEALTH_MIN  = 7.5;
const TICK_HEALTH_MIN = -4.05;
const TICK_HEALTH_MAX = 5.01;

let gameScore = 0;

function randomIntFromInterval(min, max) // min and max included
{
    return Math.random() * (max - min) + min;
}

function randomString() {
    return 'customer' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

const createBubble = (customerAmount, health, usedSubscriptionDays, lastContactedDays) =>  ({
        id: randomString(),
        customerAmount,
        health,
        usedSubscriptionDays,
        lastContactedDays

});


const createArea = () => {
    return {
        xSize: 360,
        ySize: 30,
        bubbles: new Array(START_BUBBLE_AMOUNT).fill(null).map(() => createBubble(
            randomIntFromInterval(5000, 10000),
            randomIntFromInterval(0, 10),
            randomIntFromInterval(0, 360),
            randomIntFromInterval(0, 30),
        ))
    }
};

function createBubbleElement(bubble, xArea, yArea, onBubbleClick) {
    let color = 'yellow';
    if (bubble.health <= BAD_HEALTH_MIN) {
        color = 'red';
    } else if (bubble.health >= GOOD_HEALTH_MIN) {
        color = 'green';
    }

    const elemBubble = document.createElement('div');
    elemBubble.className = 'bubble';
    elemBubble.style.backgroundColor = color;
    elemBubble.addEventListener('click', () => {
        onBubbleClick(bubble)
    });

    const {top, left} = calculateBubbleCoords(xArea, yArea, bubble);
    elemBubble.style.top = top;
    elemBubble.style.left = left;
    elemBubble.id = bubble.id;

    return elemBubble;
}


function getAreaSize(container) {
    const xArea = container.offsetWidth  / area.xSize;
    const yArea = container.offsetHeight / area.ySize;

    return {xArea, yArea};
}

function calculateBubbleCoords(xArea, yArea, bubble) {
    const top = yArea * bubble.lastContactedDays;
    const left = xArea * bubble.usedSubscriptionDays;

    return {top, left};
}

function drawGameArea(area, options) {
    const container = document.getElementById('area-container');
    getAreaSize(container);
    const {xArea, yArea} = getAreaSize(container);

    const children = area.bubbles.map(bubble => createBubbleElement(bubble, xArea, yArea, options.onBubbleClick));

    children.forEach(child => container.appendChild(child));
}

const rerenderBubbleElem = (bubble, container) => {
    getAreaSize(container)
    const {xArea, yArea} = getAreaSize(container);
    const elemBubble = document.getElementById(bubble.id);
    const {top, left} = calculateBubbleCoords(xArea, yArea, bubble);

    let color = 'yellow';
    if (bubble.health <= BAD_HEALTH_MIN) {
        color = 'red';
    } else if (bubble.health >= GOOD_HEALTH_MIN) {
        color = 'green';
    }

    elemBubble.style.backgroundColor = color;

    elemBubble.style.top = top;
    elemBubble.style.left = left;
}

const removeBubbleElem = (bubble) => {
    const elemBubble = document.getElementById(bubble.id);
    elemBubble.remove();
};

function startGame(area) {
    drawGameArea(area, { onBubbleClick({ id }){
            area.bubbles = area.bubbles.map((bubble) => {
                if (bubble.id === id) {
                   return {
                       ...bubble,
                       lastContactedDays: 0,
                   }
                }

                return  bubble;
            });
     }});

    const t = setInterval(() => {
        const container = document.getElementById('area-container');

        area.bubbles = area.bubbles.map(({usedSubscriptionDays,lastContactedDays,health, ...b}) => {
            const lastContactedDaysValue = lastContactedDays + 6;
            const usedSubscriptionDaysValue = usedSubscriptionDays + 6;
            const healthValue = health +  randomIntFromInterval(TICK_HEALTH_MIN, TICK_HEALTH_MAX);

            return {
                ...b,
                lastContactedDays: lastContactedDaysValue,
                usedSubscriptionDays: usedSubscriptionDaysValue >=360 ? 0: usedSubscriptionDays,
                health: healthValue<= 0 ? 0 : healthValue >= 10 ? 10: healthValue ,
            }
        }).filter((b) => {
            if(b.lastContactedDays < 30  &&( b.usedSubscriptionDays > 0 || b.health != BAD_HEALTH_MIN)) {
                return true
            }

            removeBubbleElem(b);
            return false;
        });
        gameScore += area.bubbles.length;
        const score = document.getElementById('score-value');
        score.innerText = gameScore;
        area.bubbles.forEach(bubble => {
            rerenderBubbleElem(bubble, container);
        });

    }, 1000);
    setTimeout(() => {clearInterval(t)},60 * 2 * 1000 )
}

const area = createArea();
startGame(area);

console.log(JSON.stringify(area, null, 2));