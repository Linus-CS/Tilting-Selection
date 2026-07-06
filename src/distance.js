document.addEventListener("onboardingFinished", () => {
    showSection(COMPASS);

    const distanceOptions = [
        { key: "north", angle: 0, title: "50m", description: "Laufe 5 Meter um die Auswahl einzulocken!", value: 50 },
        { key: "east", angle: 90, title: "100m", description: "Laufe 5 Meter um die Auswahl einzulocken!", value: 100 },
        { key: "south", angle: 180, title: "500m", description: "Laufe 5 Meter um die Auswahl einzulocken!", value: 500 },
        { key: "west", angle: 270, title: "1km", description: "Laufe 5 Meter um die Auswahl einzulocken!", value: 1000 }
    ];

    startCompass("How far do you want to walk inbetween articles?", distanceOptions, onSelected)

    function onSelected(value) {
        localStorage.setItem("meters", value);
        hideSection(COMPASS);
        document.dispatchEvent(new CustomEvent("selectedDistance")); // <--- intro.js
    }
});