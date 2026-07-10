const compass = document.querySelector("[data-screen=compass]");
const COMPASS = compass;
const title = compass.querySelector("[data-compass-preview-title]");
const description = compass.querySelector("[data-compass-preview-description]");
const question = compass.querySelector("[data-compass-question]");
const meterDisplay = compass.querySelector("[data-compass-meter-display]");
const meters = meterDisplay.querySelector("#compassMeters");

const container = compass.querySelector(".compass-container")
const oval = container.querySelector(".compass-oval")
const target = container.querySelector(".target-compass");

const northWest = container.querySelector(".dot-north-west");
const north = container.querySelector(".dot-north");
const northEast = container.querySelector(".dot-north-east");
const east = container.querySelector(".dot-east");
const southEast = container.querySelector(".dot-south-east");
const south = container.querySelector(".dot-south");
const southWest = container.querySelector(".dot-south-west");
const west = container.querySelector(".dot-west");

const dots = { northWest, north, northEast, east, southEast, south, southWest, west };

const distanceTitle = document.querySelector(".distance-title");
const globalCategoryTitle = document.querySelector(".nav-bar .category-title h2");
const articleTitle = document.querySelector(".article-title h2");

let heading = 0;

let lockedOption = null;
let lockHeading = null;
let hoveredOption = null;
let hoverStartTime = null;

const LOCK_DELAY = 1000;
const UNLOCK_ANGLE = 90;
let options = [];

let finishCallback = () => { };

let compassMode = "default";
let articleWalkInProgress = false;

function getCompassTitleElement() {
    if (compassMode === "distance") return distanceTitle;
    if (compassMode === "article") return articleTitle;
    return globalCategoryTitle;
}

function setPreview(option) {
    if (!option) {
        compass.classList.remove("is-compass-preview")
        compass.classList.remove("is-compass-locked");
        title.textContent = "";
        description.textContent = "";
        return;
    }

    compass.classList.add("is-compass-preview");
    compass.classList.add("is-compass-locked");

    title.textContent = option.previewTitle || option.title || "";
    description.textContent = option.description || option.previewDescription || "";
}

function resetLock(options) {
    stopConfirmationWalk();

    lockedOption = null;
    lockHeading = null;
    hoveredOption = null;
    hoverStartTime = null;

    setPreview(null);

    if (compassMode === "category" || compassMode === "article") {
        setGlobalCompassTitle("");
    }

    if (options)
        options.forEach((option) => placeDot(option));
}

function clearDotStates() {
    Object.values(dots).forEach((dot) => {
        if (!dot) return;

        dot.classList.remove("is-active");
        dot.classList.remove("is-locked");
        dot.style.display = "none";
    });
}

function angleDifference(a, b) {
    let diff = Math.abs(a - b);
    if (diff > 180) diff = 360 - diff;
    return diff;
}


function isDotInsideTarget(dot) {
    if (!dot || !target) return false;

    const dotRect = dot.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    const dotCenterX = dotRect.left + dotRect.width / 2;
    const dotCenterY = dotRect.top + dotRect.height / 2;

    return (
        dotCenterX >= targetRect.left &&
        dotCenterX <= targetRect.right &&
        dotCenterY >= targetRect.top &&
        dotCenterY <= targetRect.bottom
    );
}

function getOptionInsideTarget(options) {
    return options.find((option) => {
        const dot = dots[option.key];
        return dot && isDotInsideTarget(dot);
    }) || null;
}

function updateLockState() {
    clearDotStates();

    if (lockedOption) {
        const diff = angleDifference(heading, lockHeading);

        if (diff > UNLOCK_ANGLE) {
            resetLock(options);
            return;
        }

        options.forEach((option) => {
            const dot = dots[option.key];
            if (dot) dot.style.display = "block";
        });

        const lockedDot = dots[lockedOption.key];
        if (lockedDot) lockedDot.classList.add("is-locked");

        setGlobalCompassTitle(lockedOption.title);
        setPreview(lockedOption);
        return;
    }

    options.forEach((option) => placeDot(option));

    const optionInsideTarget = getOptionInsideTarget(options);

    if (!optionInsideTarget) {
        hoveredOption = null;
        hoverStartTime = null;
        setPreview(null);
        setGlobalCompassTitle("");
        return;
    }

    const activeDot = dots[optionInsideTarget.key];
    if (activeDot) activeDot.classList.add("is-active");

    setGlobalCompassTitle(optionInsideTarget.title);

    if (!hoveredOption || hoveredOption.key !== optionInsideTarget.key) {
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

        if (activeDot) {
            activeDot.classList.remove("is-active");
            activeDot.classList.add("is-locked");
        }

        setGlobalCompassTitle(lockedOption.title);
        setPreview(lockedOption);
        startConfirmationWalk(lockedOption);
    }
}



function placeDot(option) {
    const dot = dots[option.key];
    if (!dot || !oval) return;

    const width = oval.offsetWidth;
    const height = oval.offsetHeight;

    const cx = width / 2;
    const cy = height / 2;

    const borderWidth = 2;
    const rx = width / 2 - borderWidth / 2;
    const ry = height / 2 - borderWidth / 2;

    const angleDeg = heading + option.angle;
    const angle = (angleDeg - 90) * Math.PI / 180;

    const x = cx + rx * Math.cos(angle);
    const y = cy + ry * Math.sin(angle);

    dot.style.display = "block";
    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;
    setDotBackgroundFromScreenPosition(dot);
}

function setDotBackgroundFromScreenPosition(dot) {
    const rect = dot.getBoundingClientRect();
    const y = rect.top + rect.height / 2;
    const screenHeight = window.innerHeight;

    const progress = Math.min(Math.max(y / screenHeight, 0), 1);

    const color = getCompassGradientColor(progress);

    dot.style.setProperty("--dot-bg", color);
}

function getCompassGradientColor(progress) {
    const stops = [
        { position: 0, color: [102, 48, 36] },
        { position: 0.399, color: [138, 160, 221] },
        { position: 0.9327, color: [255, 255, 255] }
    ];

    let start = stops[0];
    let end = stops[stops.length - 1];

    for (let i = 0; i < stops.length - 1; i++) {
        if (progress >= stops[i].position && progress <= stops[i + 1].position) {
            start = stops[i];
            end = stops[i + 1];
            break;
        }
    }

    const localProgress =
        (progress - start.position) / (end.position - start.position);

    const r = Math.round(start.color[0] + (end.color[0] - start.color[0]) * localProgress);
    const g = Math.round(start.color[1] + (end.color[1] - start.color[1]) * localProgress);
    const b = Math.round(start.color[2] + (end.color[2] - start.color[2]) * localProgress);

    return `rgb(${r}, ${g}, ${b})`;
}

function stopConfirmationWalk() {
    meterDisplay.style.display = "none";
    meterDisplay.innerHTML = `<span id="compassMeters">5</span>m`;

    compass.classList.remove("is-walking-to-article");
    compass.classList.remove("is-arriving-at-article");

    document.body.classList.remove("is-walking-to-article");

    compass.style.removeProperty("--article-bg-progress");

    articleWalkInProgress = false;

    stopWalk();
}


function startConfirmationWalk(option) {
    meterDisplay.style.display = "none";

    const confirmationMeters = meterDisplay.querySelector("#compassMeters");

    function onChange(walked, progress) {
        if (confirmationMeters) {
            confirmationMeters.textContent = progress;
        }
    }

    startWalk(5, onChange, () => {
        setGlobalCompassTitle(option.title);

        if (compassMode === "article" && option.value !== "back-to-categories") {
            startWalkToArticle(option);
        } else {
            finishCallback(option.value);
        }
    });
}

function startWalkToArticle(option) {
    articleWalkInProgress = true;

    compass.classList.add("is-walking-to-article");
    document.body.classList.add("is-walking-to-article");

    compass.style.setProperty("--article-split", "100%");

    meterDisplay.style.display = "block";
    meterDisplay.innerHTML = `
        <span id="compassMeters">20</span>m
        <p class="walk-to-article-label">to walk to the article</p>
    `;

    const walkMeters = meterDisplay.querySelector("#compassMeters");

    function onChange(walked, remaining) {
        walkMeters.textContent = remaining;

        const progress = Math.min(walked / 20, 1);
        const split = 100 - progress * 100;

        compass.style.setProperty("--article-split", `${split}%`);

        if (walked >= 19.9) {
            compass.classList.add("is-arriving-at-article");
        }
    }

    startWalk(20, onChange, () => {
        compass.classList.add("is-arriving-at-article");

        setTimeout(() => {
            compass.classList.remove("is-walking-to-article");
            compass.classList.remove("is-arriving-at-article");

            document.body.classList.remove("is-walking-to-article");

            compass.style.removeProperty("--article-split");

            articleWalkInProgress = false;

            finishCallback(option.value);
        }, 500);
    });
}

function update() {
    if (articleWalkInProgress) return;

    if (!lockedOption) {
        options.forEach((option) => placeDot(option));
    }

    updateLockState();
}

let t = 0;

function handleOrientation(event) {
    if (event.webkitCompassHeading !== undefined) {
        heading = event.webkitCompassHeading;
    } else if (event.alpha !== null) {
        heading = 360 - event.alpha;
    }

    update();
}

function setGlobalCompassTitle(text = "") {
    const targetTitle = getCompassTitleElement();

    if (targetTitle) {
        targetTitle.textContent = text;
    }
}

function startCompass(newQuestion, newOptions, newFinishCallback, newCompassMode = "default") {
    compassMode = newCompassMode;

    meterDisplay.style.display = "none";
    window.addEventListener("deviceorientation", handleOrientation, true);
    question.textContent = newQuestion;
    options = newOptions;
    resetLock(options);

    finishCallback = (value) => {
        window.removeEventListener("deviceorientation", handleOrientation, true);
        newFinishCallback(value);
    }
}
