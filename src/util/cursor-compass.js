const cursor = document.querySelector(".cursor");

let cursorHeading = 0;

let cursorDetached = false;

let cursorX = window.innerWidth - 24;
let cursorY = 18;

let cursorVx = 0;
let cursorVy = 0;

let lastShakeTime = 0;

const cursorRadius = 9;
const orbitRadius = 13;

const shakeThreshold = 28;
const shakeCooldown = 1200;

const cursorTargets = [
    {
        element: document.querySelector(".distance-field"),
        eventName: "navigateToDistance"
    },
    {
        element: document.querySelector(".category-field"),
        eventName: "navigateToCategories"
    },
    {
        element: document.querySelector(".article-footer"),
        eventName: "navigateToArticles"
    }
];

function updateCursorTargetHighlight(activeTarget) {
    cursorTargets.forEach((target) => {
        if (!target.element) return;

        target.element.querySelectorAll("h2").forEach((h2) => {
            h2.style.color =
                target === activeTarget
                    ? "#8AA0DD"
                    : "";
        });
    });
}

let activeCursorTarget = null;
let cursorTargetStartTime = null;
let cursorTargetTriggered = false;

const cursorTargetDwellTime = 2000;

function updateCursorCompassDot(angleDeg) {
    if (!cursor) return;

    const angle = (angleDeg - 90) * Math.PI / 180;

    const x = orbitRadius * Math.cos(angle);
    const y = orbitRadius * Math.sin(angle);

    cursor.style.setProperty("--compass-dot-x", `${x}px`);
    cursor.style.setProperty("--compass-dot-y", `${y}px`);
}

function detachCursor() {
    if (!cursor || cursorDetached) return;

    const rect = cursor.getBoundingClientRect();

    cursorX = rect.left + rect.width / 2;
    cursorY = rect.top + rect.height / 2;

    cursorDetached = true;
    cursor.classList.add("is-detached");

    updateDetachedCursorPosition();
}

function updateDetachedCursorPosition() {
    if (!cursor) return;

    cursor.style.setProperty("--cursor-x", `${cursorX}px`);
    cursor.style.setProperty("--cursor-y", `${cursorY}px`);
}

function checkCursorNavigationTargets() {
    if (!cursorDetached) return;

    let currentTarget = null;

    cursorTargets.forEach((target) => {
        if (!target.element) return;

        const rect = target.element.getBoundingClientRect();

        const isInside =
            cursorX >= rect.left &&
            cursorX <= rect.right &&
            cursorY >= rect.top &&
            cursorY <= rect.bottom;

        if (isInside) {
            currentTarget = target;
        }
    });

    if (!currentTarget) {
        activeCursorTarget = null;
        cursorTargetStartTime = null;
        cursorTargetTriggered = false;

        updateCursorTargetHighlight(null);

        return;
    }

    if (activeCursorTarget !== currentTarget) {
        activeCursorTarget = currentTarget;
        updateCursorTargetHighlight(currentTarget);
        cursorTargetStartTime = performance.now();
        cursorTargetTriggered = false;
        return;
    }

    const elapsed = performance.now() - cursorTargetStartTime;

    if (elapsed >= cursorTargetDwellTime && !cursorTargetTriggered) {
        cursorTargetTriggered = true;

        document.dispatchEvent(new CustomEvent(currentTarget.eventName));

        setTimeout(() => {
            dockCursor();
        }, 100);
    }
}

function handleOrientation(event) {
    if (event.webkitCompassHeading !== undefined) {
        cursorHeading = event.webkitCompassHeading;
    } else if (event.alpha !== null) {
        cursorHeading = 360 - event.alpha;
    }

    updateCursorCompassDot(cursorHeading);

    if (!cursorDetached) return;

    const gamma = event.gamma || 0;
    const beta = event.beta || 0;

    cursorVx += gamma * 0.025;
    cursorVy += beta * 0.025;

    cursorVx *= 0.92;
    cursorVy *= 0.92;
}

function handleMotion(event) {
    const acc = event.accelerationIncludingGravity;
    if (!acc) return;

    const x = acc.x || 0;
    const y = acc.y || 0;
    const z = acc.z || 0;

    const force = Math.sqrt(x * x + y * y + z * z);
    const now = Date.now();

    if (force > shakeThreshold && now - lastShakeTime > shakeCooldown) {
        lastShakeTime = now;
        detachCursor();
    }
}

function dockCursor() {
    if (!cursor || !cursorDetached) return;

    cursorDetached = false;

    cursorVx = 0;
    cursorVy = 0;

    cursor.classList.remove("is-detached");
    cursor.style.removeProperty("--cursor-x");
    cursor.style.removeProperty("--cursor-y");

    activeCursorTarget = null;
    cursorTargetStartTime = null;
    cursorTargetTriggered = false;
    updateCursorTargetHighlight(null);
}

function animateDetachedCursor() {
    if (cursorDetached) {
        cursorX += cursorVx;
        cursorY += cursorVy;

        cursorX = Math.max(cursorRadius, Math.min(window.innerWidth - cursorRadius, cursorX));
        cursorY = Math.max(cursorRadius, Math.min(window.innerHeight - cursorRadius, cursorY));

        updateDetachedCursorPosition();
        checkCursorNavigationTargets();
    }

    requestAnimationFrame(animateDetachedCursor);
}

window.addEventListener("deviceorientation", handleOrientation, true);
window.addEventListener("devicemotion", handleMotion, true);

animateDetachedCursor();