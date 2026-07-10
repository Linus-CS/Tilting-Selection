let currentScreen = null;

function transitionSection(section1, section2) {
    hideSection(section1);
    showSection(section2);
}

function hideSection(section) {
    if (!section) return;

    section.style.display = "none";

    if (currentScreen === section) {
        currentScreen = null;
    }
}

function showSection(section) {
    if (!section) return;

    section.style.display = "block";
    currentScreen = section;

    updateThemeColor(section);
}

function getCurrentScreen() {
    return currentScreen;
}

const themeColorMeta = document.querySelector('meta[name="theme-color"]');

function updateThemeColor(screen) {
    if (!themeColorMeta || !screen) return;

    const screenName = screen.dataset.screen;

    const brownScreens = [
        "cover",
        "calibration-turning",
        "compass",
        "compass-calibration"
    ];

    if (brownScreens.includes(screenName)) {
        themeColorMeta.setAttribute("content", "#663024");
    } else {
        themeColorMeta.setAttribute("content", "#8AA0DD");
    }
}