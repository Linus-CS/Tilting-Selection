const options = [
    {
        key: "north",
        title: "Kreativität",
        dot: document.querySelector(".dot-north"),
        angle: 0
    },
    {
        key: "east",
        title: "Wissensproduktion",
        dot: document.querySelector(".dot-east"),
        angle: 90
    },
    {
        key: "south",
        title: "Körper",
        dot: document.querySelector(".dot-south"),
        angle: 180
    },
    {
        key: "west",
        title: "Allgemeines",
        dot: document.querySelector(".dot-west"),
        angle: 270
    }
];

const oval = document.querySelector(".compass-oval");
const targetCompass = document.querySelector(".target-compass");
const categoryTitle = document.querySelector(".category-title h2");
const button = document.querySelector("#enable-compass");

let heading = 0;

let hoveredOption = null;
let hoverStartTime = null;

let lockedOption = null;
let lockHeading = null;

const LOCK_DELAY = 1000;
const UNLOCK_ANGLE = 20;

function placeDot(option) {
    const width = oval.offsetWidth;
    const height = oval.offsetHeight;

    const cx = width / 2;
    const cy = height / 2;

    const rx = width / 2;
    const ry = height / 2;

    const angleDeg = heading + option.angle;
    const angle = (angleDeg - 90) * Math.PI / 180;

    const x = cx + rx * Math.cos(angle);
    const y = cy + ry * Math.sin(angle);

    option.dot.style.left = `${x}px`;
    option.dot.style.top = `${y}px`;
}

function isDotInsideTarget(dot) {
    const dotRect = dot.getBoundingClientRect();
    const targetRect = targetCompass.getBoundingClientRect();

    const dotCenterX = dotRect.left + dotRect.width / 2;
    const dotCenterY = dotRect.top + dotRect.height / 2;

    return (
        dotCenterX >= targetRect.left &&
        dotCenterX <= targetRect.right &&
        dotCenterY >= targetRect.top &&
        dotCenterY <= targetRect.bottom
    );
}

function angleDifference(a, b) {
    let diff = Math.abs(a - b);

    if (diff > 180) {
        diff = 360 - diff;
    }

    return diff;
}

function getOptionInsideTarget() {
    return options.find(option => isDotInsideTarget(option.dot)) || null;
}

function clearDotStates() {
    options.forEach(option => {
        option.dot.classList.remove("is-active");
        option.dot.classList.remove("is-locked");
    });
}

function updateLockState() {
    clearDotStates();

    if (lockedOption) {
        const diff = angleDifference(heading, lockHeading);

        if (diff > UNLOCK_ANGLE) {
            lockedOption = null;
            lockHeading = null;
            hoverStartTime = null;
            hoveredOption = null;
            categoryTitle.textContent = "";

            options.forEach(placeDot);
            return;
        }

        lockedOption.dot.classList.add("is-locked");
        categoryTitle.textContent = lockedOption.title;
        return;
    }

    const optionInsideTarget = getOptionInsideTarget();

    if (!optionInsideTarget) {
        hoveredOption = null;
        hoverStartTime = null;
        categoryTitle.textContent = "";
        return;
    }

    optionInsideTarget.dot.classList.add("is-active");
    categoryTitle.textContent = optionInsideTarget.title;

    if (hoveredOption !== optionInsideTarget) {
        hoveredOption = optionInsideTarget;
        hoverStartTime = Date.now();
        return;
    }

    const hoverDuration = Date.now() - hoverStartTime;

    if (hoverDuration >= LOCK_DELAY) {
        lockedOption = optionInsideTarget;
        lockHeading = heading;

        hoveredOption = null;
        hoverStartTime = null;

        lockedOption.dot.classList.remove("is-active");
        lockedOption.dot.classList.add("is-locked");

        categoryTitle.textContent = lockedOption.title;
    }
}

function updateCompass() {
    if (lockedOption) {
        updateLockState();
        return;
    }

    options.forEach(placeDot);
    updateLockState();
}

async function enableCompass() {
    if (
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
        const permission = await DeviceOrientationEvent.requestPermission();

        if (permission !== "granted") {
            alert("Kompass-Zugriff wurde nicht erlaubt.");
            return;
        }
    }

    window.addEventListener("deviceorientation", handleOrientation, true);
    button.style.display = "none";
}

function handleOrientation(event) {
    if (event.webkitCompassHeading !== undefined) {
        heading = event.webkitCompassHeading;
    } else if (event.alpha !== null) {
        heading = 360 - event.alpha;
    }

    updateCompass();
}

button.addEventListener("click", enableCompass);

updateCompass();