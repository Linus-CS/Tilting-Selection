const compassCalibration = document.querySelector("[data-screen=compass-calibration]");
const COMPASSCALIBRATION = compassCalibration;

const calibrationQuestion = compassCalibration.querySelector("[data-compass-calibration-question]");
const calibrationMeterDisplay = compassCalibration.querySelector("[data-compass-calibration-meter-display]");
const calibrationMeters = compassCalibration.querySelector("#compassCalibrationMeters");

const calibrationContainer = compassCalibration.querySelector(".compass-container");
const calibrationOval = calibrationContainer.querySelector(".compass-oval");
const calibrationTarget = calibrationContainer.querySelector(".target-compass");

const calibrationDots = {
    north: calibrationContainer.querySelector(".dot-north"),
    east: calibrationContainer.querySelector(".dot-east"),
    south: calibrationContainer.querySelector(".dot-south"),
    west: calibrationContainer.querySelector(".dot-west")
};

let calibrationHeading = 0;
let calibrationOptions = [];
let calibrationFinishCallback = () => { };

let calibrationLockedOption = null;
let calibrationLockHeading = null;

let calibrationHoveredOption = null;
let calibrationHoverStartTime = null;

let calibrationLockCount = 0;
let calibrationIsConfirming = false;

const CALIBRATION_LOCK_DELAY = 1000;
const CALIBRATION_UNLOCK_ANGLE = 90;

function startCompassCalibration(startText, newOptions, callback) {
    calibrationOptions = newOptions;
    calibrationFinishCallback = callback;

    calibrationLockedOption = null;
    calibrationLockHeading = null;
    calibrationHoveredOption = null;
    calibrationHoverStartTime = null;

    calibrationLockCount = 0;
    calibrationIsConfirming = false;

    calibrationQuestion.textContent = startText;

    //hier eigentlich 5
    calibrationMeters.textContent = 5;
    calibrationMeterDisplay.style.display = "none";

    clearCalibrationDots();

    window.addEventListener("deviceorientation", handleCalibrationOrientation, true);

    updateCalibration();
}

function handleCalibrationOrientation(event) {
    if (event.webkitCompassHeading !== undefined) {
        calibrationHeading = event.webkitCompassHeading;
    } else if (event.alpha !== null) {
        calibrationHeading = 360 - event.alpha;
    }

    updateCalibration();
}

function updateCalibration() {
    clearCalibrationDots();

    if (calibrationLockedOption) {
        const diff = angleDifference(calibrationHeading, calibrationLockHeading);

        calibrationOptions.forEach((option) => {
            const dot = calibrationDots[option.key];
            if (dot) dot.style.display = "block";
        });

        const lockedDot = calibrationDots[calibrationLockedOption.key];
        if (lockedDot) {
            lockedDot.classList.add("is-locked");
        }

        if (!calibrationIsConfirming && diff > CALIBRATION_UNLOCK_ANGLE) {
            calibrationLockedOption = null;
            calibrationLockHeading = null;

            calibrationQuestion.textContent = "Select another dot";
        }

        return;
    }

    calibrationOptions.forEach(placeCalibrationDot);

    const optionInsideTarget = getCalibrationOptionInsideTarget();

    if (!optionInsideTarget) {
        calibrationHoveredOption = null;
        calibrationHoverStartTime = null;
        return;
    }

    const activeDot = calibrationDots[optionInsideTarget.key];

    if (activeDot) {
        activeDot.classList.add("is-active");
    }

    if (!calibrationHoveredOption || calibrationHoveredOption.key !== optionInsideTarget.key) {
        calibrationHoveredOption = optionInsideTarget;
        calibrationHoverStartTime = Date.now();
        return;
    }

    const hoverDuration = Date.now() - calibrationHoverStartTime;

    if (hoverDuration >= CALIBRATION_LOCK_DELAY) {
        lockCalibrationOption(optionInsideTarget);
    }
}

function lockCalibrationOption(option) {
    calibrationLockedOption = option;
    calibrationLockHeading = calibrationHeading;

    calibrationHoveredOption = null;
    calibrationHoverStartTime = null;

    calibrationLockCount++;

    const lockedDot = calibrationDots[option.key];

    if (lockedDot) {
        lockedDot.classList.remove("is-active");
        lockedDot.classList.add("is-locked");
    }

    if (calibrationLockCount >= 2) {
        calibrationIsConfirming = true;
        calibrationQuestion.textContent = "To confirm your selection, walk forward.";
        startCalibrationWalk();
        return;
    }

    calibrationQuestion.textContent = option.textMiddle || "";
}

function startCalibrationWalk() {
    calibrationMeterDisplay.style.display = "block";
    //hier eigentlich 5
    calibrationMeters.textContent = 5;

    startWalk(
        //hier eigentlich 5
        5,
        function onChange(value, progress) {
            calibrationMeters.textContent = progress;
        },
        function onFinished() {
            stopCompassCalibration();
            calibrationFinishCallback();
        }
    );
}

function stopCompassCalibration() {
    stopWalk();

    window.removeEventListener("deviceorientation", handleCalibrationOrientation, true);

    calibrationMeterDisplay.style.display = "none";
    clearCalibrationDots();

    calibrationLockedOption = null;
    calibrationLockHeading = null;
    calibrationHoveredOption = null;
    calibrationHoverStartTime = null;
    calibrationIsConfirming = false;
}

function clearCalibrationDots() {
    Object.values(calibrationDots).forEach((dot) => {
        if (!dot) return;

        dot.classList.remove("is-active");
        dot.classList.remove("is-locked");
        dot.style.display = "none";
    });
}

function placeCalibrationDot(option) {
    const dot = calibrationDots[option.key];

    if (!dot || !calibrationOval) return;

    const width = calibrationOval.offsetWidth;
    const height = calibrationOval.offsetHeight;

    const cx = width / 2;
    const cy = height / 2;

    const borderWidth = 2;
    const rx = width / 2 - borderWidth / 2;
    const ry = height / 2 - borderWidth / 2;

    const angleDeg = calibrationHeading + option.angle;
    const angle = (angleDeg - 90) * Math.PI / 180;

    const x = cx + rx * Math.cos(angle);
    const y = cy + ry * Math.sin(angle);

    dot.style.display = "block";
    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;
}

function getCalibrationOptionInsideTarget() {
    return calibrationOptions.find((option) => {
        const dot = calibrationDots[option.key];

        if (!dot || !calibrationTarget) return false;

        const dotRect = dot.getBoundingClientRect();
        const targetRect = calibrationTarget.getBoundingClientRect();

        const dotCenterX = dotRect.left + dotRect.width / 2;
        const dotCenterY = dotRect.top + dotRect.height / 2;

        return (
            dotCenterX >= targetRect.left &&
            dotCenterX <= targetRect.right &&
            dotCenterY >= targetRect.top &&
            dotCenterY <= targetRect.bottom
        );
    }) || null;
}