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
let activeOption = null;

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

function updateActiveOption() {
    activeOption = null;

    options.forEach(option => {
        option.dot.classList.remove("is-active");

        if (isDotInsideTarget(option.dot)) {
            activeOption = option;
        }
    });

    if (activeOption) {
        activeOption.dot.classList.add("is-active");
        categoryTitle.textContent = activeOption.title;
    } else {
        categoryTitle.textContent = "";
    }
}

function updateCompass() {
    options.forEach(placeDot);
    updateActiveOption();
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