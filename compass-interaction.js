/* compass-interaction.js
   Alles, was zur Kompass-Interaktion gehört.
   Erwartet globale Helfer aus app.js:
   - state
   - setGlobalCompassTitle(text)
   - getDistanceInMeters(lat1, lon1, lat2, lon2)
*/

const CompassInteraction = (() => {
    let heading = 0;
    let activeConfig = null;
    let hoveredOption = null;
    let hoverStartTime = null;
    let lockedOption = null;
    let lockHeading = null;
    let confirmedOption = null;

    let confirmWatchId = null;
    let confirmStartLocation = null;

    const CONFIRM_DISTANCE = 5;
    const LOCK_DELAY = 1000;
    const UNLOCK_ANGLE = 90;

    const angles = {
        north: 0,
        east: 90,
        south: 180,
        west: 270
    };

    function getActiveScreen() {
        return document.querySelector(`[data-screen="${state.screen}"]`);
    }

    function getActiveMeterElements() {
        const screen = getActiveScreen();
        if (!screen) return null;

        const display = screen.querySelector(".compass-meter-display");
        const value = screen.querySelector("#compassMeters, [data-compass-meters]");

        if (!display || !value) return null;

        return { display, value };
    }

    function getActivePreviewElements() {
        const screen = getActiveScreen();
        if (!screen) return null;

        return {
            screen,
            title: screen.querySelector("[data-compass-preview-title]"),
            description: screen.querySelector("[data-compass-preview-description]")
        };
    }

    function start(config) {
        activeConfig = config;
        hoveredOption = null;
        hoverStartTime = null;
        lockedOption = null;
        lockHeading = null;
        confirmedOption = null;
        confirmStartLocation = null;

        stopConfirmationWalk();
        hideMeters();
        setPreview(null);
        update();
    }

    function stop() {
        activeConfig = null;
        hoveredOption = null;
        hoverStartTime = null;
        lockedOption = null;
        lockHeading = null;
        confirmedOption = null;
        confirmStartLocation = null;

        stopConfirmationWalk();
        hideMeters();
        setPreview(null);
    }

    function getActiveElements() {
        const container = document.querySelector(
            `[data-screen="${state.screen}"] .compass-container`
        );

        if (!container) return null;

        return {
            container,
            oval: container.querySelector(".compass-oval"),
            target: container.querySelector(".target-compass"),
            dots: {
                north: container.querySelector(".dot-north"),
                east: container.querySelector(".dot-east"),
                south: container.querySelector(".dot-south"),
                west: container.querySelector(".dot-west")
            }
        };
    }

    function getOptions() {
        if (!activeConfig) return [];

        return activeConfig.options.map((option) => ({
            ...option,
            angle: angles[option.key]
        }));
    }

    function placeDot(option, elements) {
        const dot = elements.dots[option.key];
        if (!dot || !elements.oval) return;

        const width = elements.oval.offsetWidth;
        const height = elements.oval.offsetHeight;

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
    }

    function isDotInsideTarget(dot, target) {
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

    function angleDifference(a, b) {
        let diff = Math.abs(a - b);
        if (diff > 180) diff = 360 - diff;
        return diff;
    }

    function clearDotStates(elements) {
        Object.values(elements.dots).forEach((dot) => {
            if (!dot) return;

            dot.classList.remove("is-active");
            dot.classList.remove("is-locked");
            dot.style.display = "none";
        });
    }

    function getOptionInsideTarget(options, elements) {
        return options.find((option) => {
            const dot = elements.dots[option.key];
            return dot && isDotInsideTarget(dot, elements.target);
        }) || null;
    }

    function setPreview(option) {
        const preview = getActivePreviewElements();
        if (!preview) return;

        if (!option) {
            preview.screen.classList.remove("is-compass-preview");
            if (preview.title) preview.title.textContent = "";
            if (preview.description) preview.description.textContent = "";
            return;
        }

        preview.screen.classList.add("is-compass-preview");

        if (preview.title) {
            preview.title.textContent = option.previewTitle || option.title || "";
        }

        if (preview.description) {
            preview.description.textContent = option.description || option.previewDescription || "";
        }
    }

    function updateMeters(remaining) {
        const meter = getActiveMeterElements();
        if (!meter) return;

        meter.value.textContent = Math.max(0, Math.ceil(remaining));
        meter.display.classList.add("is-visible");
    }

    function hideMeters() {
        document.querySelectorAll(".compass-meter-display").forEach((display) => {
            display.classList.remove("is-visible");
        });
    }

    function stopConfirmationWalk() {
        if (confirmWatchId !== null && navigator.geolocation) {
            navigator.geolocation.clearWatch(confirmWatchId);
        }

        confirmWatchId = null;
    }

    function resetLock(options, elements) {
        stopConfirmationWalk();

        lockedOption = null;
        lockHeading = null;
        hoveredOption = null;
        hoverStartTime = null;
        confirmedOption = null;
        confirmStartLocation = null;

        hideMeters();
        setPreview(null);
        setGlobalCompassTitle("");

        options.forEach((option) => placeDot(option, elements));
    }

    function updateLockState(options, elements) {
        clearDotStates(elements);

        if (lockedOption) {
            const diff = angleDifference(heading, lockHeading);

            if (diff > UNLOCK_ANGLE) {
                resetLock(options, elements);
                return;
            }

            options.forEach((option) => {
                const dot = elements.dots[option.key];
                if (dot) dot.style.display = "block";
            });

            const lockedDot = elements.dots[lockedOption.key];
            if (lockedDot) lockedDot.classList.add("is-locked");

            setGlobalCompassTitle(lockedOption.title);
            setPreview(lockedOption);
            return;
        }

        options.forEach((option) => placeDot(option, elements));

        const optionInsideTarget = getOptionInsideTarget(options, elements);

        if (!optionInsideTarget) {
            hoveredOption = null;
            hoverStartTime = null;
            setPreview(null);
            setGlobalCompassTitle("");
            return;
        }

        const activeDot = elements.dots[optionInsideTarget.key];
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
            confirmedOption = null;

            hoveredOption = null;
            hoverStartTime = null;

            if (activeDot) {
                activeDot.classList.remove("is-active");
                activeDot.classList.add("is-locked");
            }

            setGlobalCompassTitle(lockedOption.title);
            setPreview(lockedOption);

            if (typeof activeConfig.onLock === "function") {
                activeConfig.onLock(lockedOption);
            }

            startConfirmationWalk(lockedOption);
        }
    }

    function update() {
        const elements = getActiveElements();
        if (!elements || !activeConfig) return;

        const options = getOptions();

        if (!lockedOption) {
            options.forEach((option) => placeDot(option, elements));
        }

        updateLockState(options, elements);
    }

    function startConfirmationWalk(option) {
        if (!navigator.geolocation) {
            console.log("Geolocation wird nicht unterstützt.");
            return;
        }

        stopConfirmationWalk();
        updateMeters(CONFIRM_DISTANCE);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                confirmStartLocation = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                };

                confirmWatchId = navigator.geolocation.watchPosition(
                    (position) => {
                        if (!lockedOption || confirmedOption || !confirmStartLocation) return;

                        const distance = getDistanceInMeters(
                            confirmStartLocation.lat,
                            confirmStartLocation.lon,
                            position.coords.latitude,
                            position.coords.longitude
                        );

                        const remaining = Math.max(0, CONFIRM_DISTANCE - distance);
                        updateMeters(remaining);

                        if (distance >= CONFIRM_DISTANCE) {
                            confirmedOption = option;
                            stopConfirmationWalk();
                            confirmStartLocation = null;
                            hideMeters();

                            if (typeof activeConfig.onConfirm === "function") {
                                activeConfig.onConfirm(option);
                            }
                        }
                    },
                    () => {
                        console.log("Bestätigung durch Gehen konnte nicht gemessen werden.");
                    },
                    {
                        enableHighAccuracy: true,
                        maximumAge: 0,
                        timeout: 10000
                    }
                );
            },
            () => {
                console.log("Startposition für Kompass-Bestätigung konnte nicht gesetzt werden.");
            },
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 10000
            }
        );
    }

    function handleOrientation(event) {
        if (event.webkitCompassHeading !== undefined) {
            heading = event.webkitCompassHeading;
        } else if (event.alpha !== null) {
            heading = 360 - event.alpha;
        }

        update();
    }

    window.addEventListener("deviceorientation", handleOrientation, true);

    return {
        start,
        stop,
        update
    };
})();
