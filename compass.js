const dots = {
    north: document.querySelector(".dot-north"),
    east: document.querySelector(".dot-east"),
    south: document.querySelector(".dot-south"),
    west: document.querySelector(".dot-west")
};

const oval = document.querySelector(".compass-oval");
const button = document.querySelector("#enable-compass");

let heading = 0;

function placeDot(dot, angleDeg) {
    const width = oval.offsetWidth;
    const height = oval.offsetHeight;

    const cx = width / 2;
    const cy = height / 2;

    const rx = width / 2;
    const ry = height / 2;

    const angle = (angleDeg - 90) * Math.PI / 180;

    const x = cx + rx * Math.cos(angle);
    const y = cy + ry * Math.sin(angle);

    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;
}

function updateCompass() {
    placeDot(dots.north, heading);
    placeDot(dots.east, heading + 90);
    placeDot(dots.south, heading + 180);
    placeDot(dots.west, heading + 270);
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