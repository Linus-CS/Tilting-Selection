const calibrationIntro = document.querySelector("[data-screen=calibration-turning]");

document.addEventListener("walkingFinished", () => {
    hideSection(calibrationIntro);
    showSection(COMPASSCALIBRATION);

    const turningOptions = [
        { key: "north", angle: 0, textMiddle: "Now this dot is logged in. Did you want to choose another dot? Turn around again." },
        { key: "east", angle: 90, textMiddle: "Now this dot is logged in. Did you want to choose another dot? Turn around again." },
        { key: "south", angle: 180, textMiddle: "Now this dot is logged in. Did you want to choose another dot? Turn around again." },
        { key: "west", angle: 270, textMiddle: "Now this dot is logged in. Did you want to choose another dot? Turn around again." }
    ];

    startCompassCalibration(
        "... and turning. Whenever there is a decision to make, all options will be presented on a circle and you turn around to select a dot.",
        turningOptions,
        changeCalibriScreen
    );

    function changeCalibriScreen() {
        hideSection(COMPASSCALIBRATION);
        document.dispatchEvent(new CustomEvent("turningFinished"));
    }
});