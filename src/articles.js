
const monaLisa = document.querySelector("[data-screen=mona-lisa]");
const bonaBisa = document.querySelector("[data-screen=bona-bisa]");
const homerLisaSimpson = document.querySelector("[data-screen=homer-lisa-simpson]");

let selectedArticle = monaLisa;

document.addEventListener("selectedArticle", () => {
    const article = localStorage.getItem("article");

    switch (article) {
        case "mona-lisa":
            selectedArticle = monaLisa;
            showSection(monaLisa);
            break;
        case "bona-bisa":
            selectedArticle = bonaBisa;
            showSection(bonaBisa);
            break;
        case "homer-lisa-simpson":
            selectedArticle = homerLisaSimpson;
            showSection(homerLisaSimpson);
            break;
    }

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
            hideSection(selectedArticle);
            document.dispatchEvent(new CustomEvent("selectedCategory")); // <--- article.js 
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

