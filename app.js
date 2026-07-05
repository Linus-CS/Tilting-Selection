/* app.js
   Restliche App-Logik. Compass-Code liegt in compass-interaction.js.
*/

const state = {
    screen: "cover",
    selectedDistance: null,
    currentCategoryId: null,
    currentArticle: null,
    currentPageIndex: 0,

    walkGoal: null,
    walkedMeters: 0,
    afterWalk: null,

    watchId: null,
    walkStartLocation: null
};

let displayedMeters = 0;

const coverScreen = document.querySelector('[data-screen="cover"]');
const screens = document.querySelectorAll("[data-screen]");
const permissionOverlay = document.querySelector("#permissionOverlay");
const permissionStatus = document.querySelector("#permissionStatus");

const coverMeters = document.querySelector("#coverMeters");
const transitionMeters = document.querySelector("#transitionMeters");
const walkingAnimation = document.querySelector("#walkingAnimation");

const articleEyebrow = document.querySelector("#articleEyebrow");
const articleTitle = document.querySelector("#articleTitle");
const articlePage = document.querySelector("#articlePage");
const pageCurrent = document.querySelector("#pageCurrent");
const pageTotal = document.querySelector("#pageTotal");

const mainTocOptions = document.querySelector("#mainTocOptions");
const categoryTitle = document.querySelector("#categoryTitle");
const categoryIntro = document.querySelector("#categoryIntro");
const categoryCompassTitle = document.querySelector("#categoryCompassTitle");
const categoryArticleOptions = document.querySelector("#categoryArticleOptions");

const globalCategoryTitle = document.querySelector(".nav-bar .category-title h2");

function showScreen(name) {
    state.screen = name;

    screens.forEach((screen) => {
        screen.classList.toggle("is-active", screen.dataset.screen === name);
    });

    setGlobalCompassTitle("");
    CompassInteraction.stop();

    if (name === "calibration-compass") {
        setCompassInstruction("Drehe dich und wähle einen Punkt aus");
        animateCompassInstruction();

        CompassInteraction.start({
            options: [
                { key: "north", title: "Auswahl 1", description: "Drehe dich, bis dieser Punkt oben in den Klammern liegt." },
                { key: "east", title: "Auswahl 2", description: "Halte die Position kurz, um die Auswahl einzuloggen." },
                { key: "south", title: "Auswahl 3", description: "Nach dem Einloggen bestätigst du die Auswahl durch Gehen." },
                { key: "west", title: "Auswahl 4", description: "Gehe 5 Meter geradeaus, um fortzufahren." }
            ],
            onConfirm: () => {
                showScreen("calibration-page-turn");
            }
        });
    }

    if (name === "distance-select") {
        CompassInteraction.start({
            options: [
                { key: "north", title: "100 m", value: 100, description: "Eine kurze Strecke zwischen den Artikeln." },
                { key: "east", title: "200 m", value: 200, description: "Ein ruhiger Abstand, um kurz aus dem Text herauszutreten." },
                { key: "south", title: "500 m", value: 500, description: "Mehr Raum zwischen zwei Leseabschnitten." },
                { key: "west", title: "1 km", value: 1000, description: "Eine längere Wanderung zwischen den Artikeln." }
            ],
            onConfirm: (option) => {
                state.selectedDistance = option.value;

                startWalkGoal(
                    50,
                    () => {
                        renderArticle(READER_CONTENT.introArticle, {
                            eyebrow: "Einleitung"
                        });
                    },
                    "Gehe 50m bis zur ersten Seite."
                );
            }
        });
    }

    if (name === "main-toc") {
        CompassInteraction.start({
            options: READER_CONTENT.categories.slice(0, 4).map((category, index) => {
                const keys = ["north", "east", "south", "west"];

                return {
                    key: keys[index],
                    title: category.title,
                    value: category.id,
                    description: category.compassDescription || category.intro || ""
                };
            }),
            onLock: (option) => {
                setTimeout(() => {
                    selectCategory(option.value);
                }, 800);
            }
        });
    }

    if (name === "category-compass") {
        const category = findCategory(state.currentCategoryId);
        if (!category) return;

        const keys = ["north", "east", "south"];

        const articleOptions = category.articles.slice(0, 3).map((article, index) => ({
            key: keys[index],
            title: article.title,
            value: article.id,
            description: article.compassDescription || article.description || article.excerpt || ""
        }));

        articleOptions.push({
            key: "west",
            title: "Zurück",
            value: "back",
            description: "Zurück zur Übersicht der Kategorien."
        });

        CompassInteraction.start({
            options: articleOptions,
            onLock: (option) => {
                setTimeout(() => {
                    if (option.value === "back") {
                        renderMainToc();
                        showScreen("main-toc");
                    } else {
                        selectArticle(option.value);
                    }
                }, 800);
            }
        });
    }
}

function startWalkGoal(meters, callback, label = "Gehe weiter.") {
    state.walkGoal = meters;
    state.walkedMeters = 0;
    state.afterWalk = callback;

    document.querySelector("#walkTransitionTitle").textContent = label;
    updateMetersUI();

    showScreen("walk-transition");
    startRealWalkTracking();
}

function simulateWalk(amount = 10) {
    if (!state.walkGoal) return;

    state.walkedMeters = Math.min(state.walkedMeters + amount, state.walkGoal);
    updateMetersUI();

    if (state.walkedMeters >= state.walkGoal) {
        finishWalkGoal();
    }
}

function updateMetersUI() {
    const remaining = Math.max(0, Math.ceil((state.walkGoal || 0) - state.walkedMeters));
    const progress = state.walkGoal ? state.walkedMeters / state.walkGoal : 0;

    if (coverMeters && state.screen === "cover") {
        coverMeters.textContent = remaining || 50;
    }

    if (transitionMeters) {
        transitionMeters.textContent = remaining;
    }

    if (walkingAnimation) {
        walkingAnimation.style.setProperty("--walk-progress", `${progress * 100}%`);
    }
}

function animateWalk() {
    displayedMeters += (state.walkedMeters - displayedMeters) * 0.08;

    if (coverScreen && state.walkGoal) {
        const progress = displayedMeters / state.walkGoal;
        const split = 100 - progress * 100;

        coverScreen.style.setProperty("--split", `${split}%`);
    }

    requestAnimationFrame(animateWalk);
}

function renderArticle(article, options = {}) {
    state.currentArticle = article;
    state.currentPageIndex = 0;

    articleEyebrow.textContent = options.eyebrow || article.category || "Artikel";
    articleTitle.textContent = article.title;

    showScreen("article-reader");
    renderCurrentPage();
}

function renderCurrentPage() {
    const article = state.currentArticle;
    if (!article) return;

    articlePage.textContent = article.pages[state.currentPageIndex];
    pageCurrent.textContent = state.currentPageIndex + 1;
    pageTotal.textContent = article.pages.length;
}

function pageTurn() {
    const article = state.currentArticle;
    if (!article) return;

    const isLastPage = state.currentPageIndex >= article.pages.length - 1;

    if (!isLastPage) {
        state.currentPageIndex += 1;
        renderCurrentPage();
        return;
    }

    handleArticleFinished();
}

function handleArticleFinished() {
    if (state.currentArticle.id === "introduction") {
        startWalkGoal(
            state.selectedDistance || 100,
            () => {
                renderMainToc();
                showScreen("main-toc");
            },
            "Laufpause bis zum Inhaltsverzeichnis."
        );
        return;
    }

    startWalkGoal(
        state.selectedDistance || 100,
        () => {
            renderCategoryCompass(state.currentCategoryId);
            showScreen("category-compass");
        },
        "Laufpause zurück zur Artikelübersicht."
    );
}

function renderMainToc() {
    mainTocOptions.innerHTML = "";

    READER_CONTENT.categories.forEach((category) => {
        const button = document.createElement("button");
        button.textContent = category.title;
        button.dataset.action = "select-category";
        button.dataset.categoryId = category.id;
        mainTocOptions.appendChild(button);
    });
}

function setGlobalCompassTitle(text = "") {
    if (globalCategoryTitle) {
        globalCategoryTitle.textContent = text;
    }
}

function setCompassInstruction(text = "") {
    const instruction = document.querySelector(
        '[data-screen="calibration-compass"] .compass-instruction'
    );

    if (instruction) {
        instruction.textContent = text;
    }
}

function animateCompassInstruction() {
    const instruction = document.querySelector(
        '[data-screen="calibration-compass"] .compass-instruction'
    );

    if (!instruction) return;

    const text = instruction.textContent.trim();
    instruction.innerHTML = "";

    [...text].forEach((char, index) => {
        const span = document.createElement("span");
        span.className = "char";
        span.style.setProperty("--char-index", index);
        span.textContent = char === " " ? "\u00A0" : char;
        instruction.appendChild(span);
    });
}

function selectCategory(categoryId) {
    const category = findCategory(categoryId);
    if (!category) return;

    state.currentCategoryId = category.id;
    categoryTitle.textContent = category.title;
    categoryIntro.textContent = category.intro;

    showScreen("category-intro");
}

function renderCategoryCompass(categoryId) {
    const category = findCategory(categoryId);
    if (!category) return;

    categoryCompassTitle.textContent = category.title;
    categoryArticleOptions.innerHTML = "";

    category.articles.forEach((article) => {
        const button = document.createElement("button");
        button.textContent = article.title;
        button.dataset.action = "select-article";
        button.dataset.articleId = article.id;
        categoryArticleOptions.appendChild(button);
    });

    const backButton = document.createElement("button");
    backButton.textContent = "Zurück zum Inhaltsverzeichnis";
    backButton.dataset.action = "back-to-main-toc";
    categoryArticleOptions.appendChild(backButton);
}

function selectArticle(articleId) {
    const category = findCategory(state.currentCategoryId);
    if (!category) return;

    const article = category.articles.find((item) => item.id === articleId);
    if (!article) return;

    const articleWithCategory = {
        ...article,
        category: category.title
    };

    startWalkGoal(
        50,
        () => {
            renderArticle(articleWithCategory, { eyebrow: category.title });
        },
        `Gehe 50m bis zum Artikel „${article.title}“.`
    );
}

function findCategory(categoryId) {
    return READER_CONTENT.categories.find((category) => category.id === categoryId);
}

function getDistanceInMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const toRad = (value) => value * Math.PI / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

async function requestPermissions() {
    permissionStatus.textContent = "Berechtigungen werden angefragt …";

    try {
        if (
            typeof DeviceMotionEvent !== "undefined" &&
            typeof DeviceMotionEvent.requestPermission === "function"
        ) {
            const motionPermission = await DeviceMotionEvent.requestPermission();

            if (motionPermission !== "granted") {
                throw new Error("Motion access denied.");
            }
        }

        if (
            typeof DeviceOrientationEvent !== "undefined" &&
            typeof DeviceOrientationEvent.requestPermission === "function"
        ) {
            const orientationPermission = await DeviceOrientationEvent.requestPermission();

            if (orientationPermission !== "granted") {
                throw new Error("Orientation access denied.");
            }
        }

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    localStorage.setItem("motionAccess", "granted");
                    localStorage.setItem("locationAccess", "granted");

                    localStorage.setItem(
                        "startLocation",
                        JSON.stringify({
                            lat: position.coords.latitude,
                            lon: position.coords.longitude
                        })
                    );

                    permissionOverlay.classList.remove("is-visible");
                    startCoverWalk();
                },
                () => {
                    permissionStatus.textContent =
                        "Standort konnte nicht gelesen werden. Bitte erlaube den Standortzugriff auf der Startseite.";

                    localStorage.removeItem("locationAccess");
                },
                {
                    enableHighAccuracy: true,
                    maximumAge: 0,
                    timeout: 20000
                }
            );
        } else {
            throw new Error("Geolocation wird von diesem Browser nicht unterstützt.");
        }
    } catch (error) {
        console.error(error);

        permissionStatus.textContent =
            "Berechtigungen konnten nicht vollständig angefragt werden. Bitte gehe zurück zur Startseite und erlaube den Zugriff dort.";
    }
}

function startCoverWalk() {
    state.walkGoal = 50;
    state.walkedMeters = 0;
    state.afterWalk = () => showScreen("calibration-intro");

    showScreen("cover");
    updateMetersUI();
    startRealWalkTracking();
}

function startRealWalkTracking() {
    if (!navigator.geolocation || !state.walkGoal) return;

    if (state.watchId !== null) {
        navigator.geolocation.clearWatch(state.watchId);
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            state.walkStartLocation = {
                lat: position.coords.latitude,
                lon: position.coords.longitude
            };

            state.watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const distance = getDistanceInMeters(
                        state.walkStartLocation.lat,
                        state.walkStartLocation.lon,
                        position.coords.latitude,
                        position.coords.longitude
                    );

                    state.walkedMeters = Math.min(distance, state.walkGoal);
                    updateMetersUI();

                    if (state.walkedMeters >= state.walkGoal) {
                        finishWalkGoal();
                    }
                },
                () => {
                    console.log("Position konnte nicht gelesen werden.");
                },
                {
                    enableHighAccuracy: true,
                    maximumAge: 0,
                    timeout: 10000
                }
            );
        },
        () => {
            console.log("Startposition konnte nicht gesetzt werden.");
        },
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 10000
        }
    );
}

function finishWalkGoal() {
    if (state.watchId !== null) {
        navigator.geolocation.clearWatch(state.watchId);
        state.watchId = null;
    }

    const callback = state.afterWalk;

    state.walkGoal = null;
    state.walkedMeters = 0;
    state.afterWalk = null;
    state.walkStartLocation = null;

    if (callback) callback();
}

function handleClick(event) {
    const button = event.target.closest("button");
    if (!button) return;

    const action = button.dataset.action;

    if (button.id === "permissionButton") {
        requestPermissions();
        return;
    }

    if (action === "next") {
        showScreen(button.dataset.next);
    }

    if (action === "simulate-walk") {
        simulateWalk(10);
    }

    if (action === "page-turn") {
        pageTurn();
    }

    if (action === "select-category") {
        selectCategory(button.dataset.categoryId);
    }

    if (action === "open-category-compass") {
        renderCategoryCompass(state.currentCategoryId);
        showScreen("category-compass");
    }

    if (action === "select-article") {
        selectArticle(button.dataset.articleId);
    }

    if (action === "back-to-main-toc") {
        renderMainToc();
        showScreen("main-toc");
    }
}

document.addEventListener("click", handleClick);

showScreen("cover");
permissionOverlay?.classList.add("is-visible");
animateWalk();
