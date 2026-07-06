const articleIntro = document.querySelector("[data-screen=article]");
const articleScreen = document.querySelector(".article-screen");


document.addEventListener("selectedDistance", () => {
    let scrollDirection = 0;
    let animationFrameId = null;

    const scrollSpeed = 3;

    showSection(articleIntro);
    animateHeadlinePath();

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("pointerup", stopHoldScroll);
    document.addEventListener("pointercancel", stopHoldScroll);
    document.addEventListener("pointerleave", stopHoldScroll);
    document.addEventListener("pointermove", onPointerMove);

    function onPointerDown(event) {
        const direction = getScrollDirectionFromTouch(event.clientY);

        if (direction !== 0) {
            event.preventDefault();
            startHoldScroll(direction);
        }
    }

    function onPointerMove(event) {
        if (scrollDirection === 0) return;

        const direction = getScrollDirectionFromTouch(event.clientY);

        if (direction === 0) {
            stopHoldScroll();
        } else {
            scrollDirection = direction;
        }
    }


    function animateHeadlinePath() {
        const headline = document.querySelector(".headline-path");
        const textPaths = document.querySelectorAll(".headline-text textPath");

        const duration = 1500;
        const from = -90; // Text startet links außerhalb
        const to = 3;     // Endposition, ungefähr 1rem Abstand

        const startTime = performance.now();

        function easeInOut(t) {
            return t < 0.5
                ? 2 * t * t
                : 1 - Math.pow(-2 * t + 2, 2) / 2;
        }

        function frame(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeInOut(progress);
            const value = from + (to - from) * eased;

            textPaths.forEach((textPath) => {
                textPath.setAttribute("startOffset", `${value}%`);
            });

            if (progress < 1) {
                requestAnimationFrame(frame);
            }
        }

        requestAnimationFrame(frame);
    }


    function startHoldScroll(direction) {
        scrollDirection = direction;

        if (!animationFrameId) {
            animationFrameId = requestAnimationFrame(scrollArticle);
        }
    }

    function stopHoldScroll() {
        scrollDirection = 0;

        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }

    function scrollArticle() {
        const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight;

        if (atBottom) {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("pointerup", stopHoldScroll);
            document.removeEventListener("pointercancel", stopHoldScroll);
            document.removeEventListener("pointerleave", stopHoldScroll);
            document.removeEventListener("pointermove", onPointerMove);
            hideSection(articleIntro);
            document.dispatchEvent(new CustomEvent("finishedIntro")); // <--- category.js
            return;
        }

        if (scrollDirection !== 0) {
            window.scrollBy({
                top: scrollDirection * scrollSpeed,
                left: 0,
                behavior: "auto"
            });

            animationFrameId = requestAnimationFrame(scrollArticle);
        }
    }

    function getScrollDirectionFromTouch(yPosition) {
        const screenHeight = window.innerHeight;
        const topZone = screenHeight * 0.25;
        const bottomZone = screenHeight * 0.75;

        if (yPosition <= topZone) {
            return -1; // zurück / nach oben scrollen
        }

        if (yPosition >= bottomZone) {
            return 1; // vorwärts / nach unten scrollen
        }

        return 0;
    }
});

