const textElement = document.querySelector(".wordsOnWalk");
const svg = document.getElementById("connections");

const originalText = textElement.textContent.trim();
const words = originalText.split(/\s+/);

textElement.innerHTML = "";

let wordObjects = [];
let startPosition = null;
let walkedDistance = 0;

const targetDistance = 100; // Meter

createWords();
draw();

navigator.geolocation.watchPosition(
    handlePosition,
    handleGeoError,
    {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000
    }
);

function createWords() {
    words.forEach((word, index) => {
        const wrapper = document.createElement("span");
        const beforeDot = document.createElement("span");
        const wordSpan = document.createElement("span");
        const afterDot = document.createElement("span");

        wrapper.classList.add("word-wrapper");
        beforeDot.classList.add("word-dot");
        afterDot.classList.add("word-dot");
        wordSpan.classList.add("floating-word");

        wordSpan.textContent = word;

        wrapper.appendChild(beforeDot);
        wrapper.appendChild(wordSpan);
        wrapper.appendChild(afterDot);
        textElement.appendChild(wrapper);

        wordObjects.push({
            wrapper,
            beforeDot,
            afterDot,
            wordSpan,
            randomX: 0,
            randomY: 0,
            randomRotation: 0,
            targetX: 0,
            targetY: 0
        });
    });

    calculateTargetPositions();
    scatterWords();
}

function calculateTargetPositions() {
    textElement.classList.add("measuring");

    wordObjects.forEach((obj) => {
        obj.wrapper.style.position = "static";
        obj.wrapper.style.transform = "none";
    });

    const containerRect = textElement.getBoundingClientRect();

    wordObjects.forEach((obj) => {
        const rect = obj.wrapper.getBoundingClientRect();

        obj.targetX = rect.left - containerRect.left;
        obj.targetY = rect.top - containerRect.top;
    });

    textElement.classList.remove("measuring");
}

function scatterWords() {
    const margin = 60;

    wordObjects.forEach((obj, index) => {
        if (index === 0) {
            obj.randomX = obj.targetX;
            obj.randomY = obj.targetY;
            obj.randomRotation = 0;
            return;
        }

        obj.randomX =
            margin + Math.random() * (window.innerWidth - margin * 2);

        obj.randomY =
            margin + Math.random() * (window.innerHeight - margin * 2);

        obj.randomRotation = Math.random() * 360 - 180;
    });
}

function handlePosition(position) {
    const current = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
    };

    if (!startPosition) {
        startPosition = current;
        return;
    }

    walkedDistance = distanceInMeters(startPosition, current);

    draw();
}

function handleGeoError(error) {
    console.error(error);
    alert("Standort konnte nicht gelesen werden.");
}

function draw() {
    const progress = Math.min(walkedDistance / targetDistance, 1);

    wordObjects.forEach((obj) => {
        const x = lerp(obj.randomX, obj.targetX, progress);
        const y = lerp(obj.randomY, obj.targetY, progress);
        const rotation = lerp(obj.randomRotation, 0, progress);

        obj.wrapper.style.position = "absolute";
        obj.wrapper.style.left = x + "px";
        obj.wrapper.style.top = y + "px";
        obj.wrapper.style.transform = `rotate(${rotation}deg)`;
    });

    drawConnections(progress);
}

function drawConnections(progress) {
    svg.innerHTML = "";

    if (progress > 0.97) return;

    for (let i = 0; i < wordObjects.length - 1; i++) {
        const p1 = getCenter(wordObjects[i].afterDot);
        const p2 = getCenter(wordObjects[i + 1].beforeDot);

        const line = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
        );

        line.setAttribute("x1", p1.x);
        line.setAttribute("y1", p1.y);
        line.setAttribute("x2", p2.x);
        line.setAttribute("y2", p2.y);

        svg.appendChild(line);
    }
}

function getCenter(element) {
    const rect = element.getBoundingClientRect();

    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };
}

function distanceInMeters(a, b) {
    const R = 6371000;
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lon - a.lon);

    const x =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));

    return R * c;
}

function toRad(value) {
    return value * Math.PI / 180;
}

function lerp(start, end, amount) {
    return start + (end - start) * amount;
}