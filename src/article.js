
document.addEventListener("selectedCategory", () => {
    showSection(COMPASS);

    const articleDigitalOptions = [
        { key: "north", angle: 0, title: "Citizens of the Streets", description: "", value: "mona-lisa" },
        { key: "northEast", angle: 60, title: "Translation for Borders", description: "", value: "bona-bisa" },
        { key: "east", angle: 120, title: 'Step-counting in the "health-society": phenomenological reflections on walking in the era of the Fitbit', description: "", value: "homer-lisa-simpson" },
        { key: "southEast", angle: 180, title: "Common Cyborg", description: "", value: "" },
        { key: "south", angle: 240, title: "Woman sitting in front of the computer, thinking", description: "", value: "" },
        { key: "southWest", angle: 300, title: "Designing with the body", description: "", value: "" },
    ];

    startCompass("Choose a category to start with.", articleDigitalOptions, onSelected)

    function onSelected(value) {
        localStorage.setItem("article", value);
        hideSection(COMPASS);
        document.dispatchEvent(new CustomEvent("selectedArticle")); // <--- .js
    }
});