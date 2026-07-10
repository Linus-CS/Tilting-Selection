const articleIntro = document.querySelector("[data-screen=article]");
const navCategoryTitle = document.querySelector(".nav-bar .category-title h2");
const scrollbar = articleIntro.querySelector(".scrollbar");
const scrollbarLeft = articleIntro.querySelector(".scrollbar-left");

let scrollDirection = 0;
let animationFrameId = null;
let maxScrollDots = 0;
let visibleScrollDots = 0;

const scrollSpeed = 3;
const scrollDotSize = 8;
const scrollDotGap = 10;

document.addEventListener("selectedDistance", () => {
    showSection(articleIntro);
    window.scrollTo(0, 0);

    navCategoryTitle.textContent = "";
    document.body.classList.add("is-article-screen");

    setupScrollDots();
    updateScrollDots();

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("pointerup", stopHoldScroll);
    document.addEventListener("pointercancel", stopHoldScroll);
    document.addEventListener("pointerleave", stopHoldScroll);
    document.addEventListener("pointermove", onPointerMove);
    window.addEventListener("resize", onResize);
});

function setupScrollDots() {
    const scrollbars = [scrollbar, scrollbarLeft].filter(Boolean);

    scrollbars.forEach((bar) => {
        bar.innerHTML = "";
    });

    const dotStep = scrollDotSize + scrollDotGap;
    maxScrollDots = Math.floor(window.innerHeight / dotStep);

    for (let i = 0; i < maxScrollDots; i++) {
        scrollbars.forEach((bar) => {
            const dot = document.createElement("img");
            dot.src = "scrolldot.svg";
            dot.alt = "";
            dot.classList.add("scroll-dot");
            bar.appendChild(dot);
        });
    }

    visibleScrollDots = 0;
}

function updateScrollDots() {
    const scrollbars = [scrollbar, scrollbarLeft].filter(Boolean);

    if (scrollbars.length === 0) return;

    const nextArticle = articleIntro.querySelector(".next-article");
    if (!nextArticle) return;

    const nextArticleRect = nextArticle.getBoundingClientRect();

    const maxScroll =
        window.scrollY + nextArticleRect.bottom - window.innerHeight;

    const progress = Math.min(window.scrollY / maxScroll, 1);
    const dotsToShow = Math.round(progress * maxScrollDots);

    if (dotsToShow === visibleScrollDots) return;

    visibleScrollDots = dotsToShow;

    scrollbars.forEach((bar) => {
        const dots = bar.querySelectorAll(".scroll-dot");

        dots.forEach((dot, index) => {
            dot.classList.toggle("is-visible", index < visibleScrollDots);
        });
    });
}

function onResize() {
    setupScrollDots();
    updateScrollDots();
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
    if (scrollDirection !== 0) {
        window.scrollBy({
            top: scrollDirection * scrollSpeed,
            left: 0,
            behavior: "auto"
        });

        updateScrollDots();

        const nextArticle = articleIntro.querySelector(".next-article");

        if (nextArticle) {
            const rect = nextArticle.getBoundingClientRect();

            const nextArticleBottomTouchesScreenBottom =
                scrollDirection > 0 &&
                rect.bottom <= window.innerHeight;

            if (nextArticleBottomTouchesScreenBottom) {
                finishIntroArticle();
                return;
            }
        }

        animationFrameId = requestAnimationFrame(scrollArticle);
    }
}

function getScrollDirectionFromTouch(yPosition) {
    const screenHeight = window.innerHeight;
    const topZone = screenHeight * 0.25;
    const bottomZone = screenHeight * 0.75;

    if (yPosition <= topZone) {
        return -1;
    }

    if (yPosition >= bottomZone) {
        return 1;
    }

    return 0;
}

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

function finishIntroArticle() {
    stopHoldScroll();

    document.removeEventListener("pointerdown", onPointerDown);
    document.removeEventListener("pointerup", stopHoldScroll);
    document.removeEventListener("pointercancel", stopHoldScroll);
    document.removeEventListener("pointerleave", stopHoldScroll);
    document.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("resize", onResize);

    hideSection(articleIntro);
    document.body.classList.remove("is-article-screen");

    document.dispatchEvent(new CustomEvent("finishedIntro"));
}