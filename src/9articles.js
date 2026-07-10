const tracing = document.querySelector("[data-screen=tracing]");

let selectedArticle = tracing;

let articleScrollDirection = 0;
let articleAnimationFrameId = null;
let articleMaxScrollDots = 0;
let articleVisibleScrollDots = 0;

const articleScrollSpeed = 3;
const articleScrollDotSize = 8;
const articleScrollDotGap = 10;

document.addEventListener("selectedArticle", () => {
    const article = localStorage.getItem("article");

    switch (article) {
        case "tracing":
            selectedArticle = tracing;
            break;
        case "bona-bisa":
            selectedArticle = bonaBisa;
            break;
        case "homer-lisa-simpson":
            selectedArticle = homerLisaSimpson;
            break;
    }

    showSection(selectedArticle);
    window.scrollTo(0, 0);
    document.body.classList.add("is-article-screen");

    setupArticleScrollDots();
    updateArticleScrollDots();

    document.addEventListener("pointerdown", onArticlePointerDown);
    document.addEventListener("pointerup", stopArticleHoldScroll);
    document.addEventListener("pointercancel", stopArticleHoldScroll);
    document.addEventListener("pointerleave", stopArticleHoldScroll);
    document.addEventListener("pointermove", onArticlePointerMove);
    window.addEventListener("resize", onArticleResize);
});

function setupArticleScrollDots() {
    const scrollbar = selectedArticle.querySelector(".scrollbar");
    const scrollbarLeft = selectedArticle.querySelector(".scrollbar-left");

    const scrollbars = [scrollbar, scrollbarLeft].filter(Boolean);

    scrollbars.forEach((bar) => {
        bar.innerHTML = "";
    });

    const dotStep = articleScrollDotSize + articleScrollDotGap;
    articleMaxScrollDots = Math.floor(window.innerHeight / dotStep);

    for (let i = 0; i < articleMaxScrollDots; i++) {
        scrollbars.forEach((bar) => {
            const dot = document.createElement("img");
            dot.src = "scrolldot.svg";
            dot.alt = "";
            dot.classList.add("scroll-dot");
            bar.appendChild(dot);
        });
    }

    articleVisibleScrollDots = 0;
}

function updateArticleScrollDots() {
    const scrollbar = selectedArticle.querySelector(".scrollbar");
    const scrollbarLeft = selectedArticle.querySelector(".scrollbar-left");

    const scrollbars = [scrollbar, scrollbarLeft].filter(Boolean);
    if (scrollbars.length === 0) return;

    const nextArticle = selectedArticle.querySelector(".next-article");
    if (!nextArticle) return;

    const nextArticleRect = nextArticle.getBoundingClientRect();

    const maxScroll =
        window.scrollY + nextArticleRect.bottom - window.innerHeight;

    if (maxScroll <= 0) return;

    const progress = Math.min(window.scrollY / maxScroll, 1);
    const dotsToShow = Math.round(progress * articleMaxScrollDots);

    if (dotsToShow === articleVisibleScrollDots) return;

    articleVisibleScrollDots = dotsToShow;

    scrollbars.forEach((bar) => {
        const dots = bar.querySelectorAll(".scroll-dot");

        dots.forEach((dot, index) => {
            dot.classList.toggle("is-visible", index < articleVisibleScrollDots);
        });
    });
}

function onArticleResize() {
    setupArticleScrollDots();
    updateArticleScrollDots();
}

function startArticleHoldScroll(direction) {
    articleScrollDirection = direction;

    if (!articleAnimationFrameId) {
        articleAnimationFrameId = requestAnimationFrame(scrollSelectedArticle);
    }
}

function stopArticleHoldScroll() {
    articleScrollDirection = 0;

    if (articleAnimationFrameId) {
        cancelAnimationFrame(articleAnimationFrameId);
        articleAnimationFrameId = null;
    }
}

function scrollSelectedArticle() {
    if (articleScrollDirection !== 0) {
        window.scrollBy({
            top: articleScrollDirection * articleScrollSpeed,
            left: 0,
            behavior: "auto"
        });

        updateArticleScrollDots();

        const nextArticle = selectedArticle.querySelector(".next-article");

        if (nextArticle) {
            const rect = nextArticle.getBoundingClientRect();

            const nextArticleBottomTouchesScreenBottom =
                articleScrollDirection > 0 &&
                rect.bottom <= window.innerHeight;

            if (nextArticleBottomTouchesScreenBottom) {
                finishSelectedArticle();
                return;
            }
        }

        articleAnimationFrameId = requestAnimationFrame(scrollSelectedArticle);
    }
}

function finishSelectedArticle() {
    stopArticleHoldScroll();

    document.removeEventListener("pointerdown", onArticlePointerDown);
    document.removeEventListener("pointerup", stopArticleHoldScroll);
    document.removeEventListener("pointercancel", stopArticleHoldScroll);
    document.removeEventListener("pointerleave", stopArticleHoldScroll);
    document.removeEventListener("pointermove", onArticlePointerMove);
    window.removeEventListener("resize", onArticleResize);

    hideSection(selectedArticle);
    document.body.classList.remove("is-article-screen");

    document.dispatchEvent(new CustomEvent("selectedCategory"));
}

function getArticleScrollDirectionFromTouch(yPosition) {
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

function onArticlePointerDown(event) {
    const direction = getArticleScrollDirectionFromTouch(event.clientY);

    if (direction !== 0) {
        event.preventDefault();
        startArticleHoldScroll(direction);
    }
}

function onArticlePointerMove(event) {
    if (articleScrollDirection === 0) return;

    const direction = getArticleScrollDirectionFromTouch(event.clientY);

    if (direction === 0) {
        stopArticleHoldScroll();
    } else {
        articleScrollDirection = direction;
    }
}