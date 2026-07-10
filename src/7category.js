document.addEventListener("finishedIntro", startCategoryCompass);
document.addEventListener("backToCategories", startCategoryCompass);

function startCategoryCompass() {
    showSection(COMPASS);

    const distanceOptions = [
        { key: "north", angle: 0, title: "Creativity", description: "Die kommen später mach erstmal Platzhalter.", value: "creativity" },
        { key: "east", angle: 90, title: "Knowledge", description: "Platzhaltertext", value: "knowledge" },
        { key: "south", angle: 180, title: "Bodies", description: "The body in the digital age is a real problem because the body is stil there and the mind is also there I can not write so quick so slow down goddamit... I start to glitch when my computer starts to glitch", value: "digital" },
        { key: "west", angle: 270, title: "Walking", description: "Hmmm", value: "walking" }
    ];

    startCompass("Choose a category to start with.", distanceOptions, onSelected, "category");

    function onSelected(value) {
        localStorage.setItem("category", value);
        console.log("Kategorie gewählt:", value);
        hideSection(COMPASS);
        document.dispatchEvent(new CustomEvent("selectedCategory"));
    }
}

document.addEventListener("navigateToCategories", () => {
    const activeScreen = getCurrentScreen();

    if (activeScreen) {
        hideSection(activeScreen);
    }

    showSection(COMPASS);
    document.dispatchEvent(new CustomEvent("backToCategories"));
});