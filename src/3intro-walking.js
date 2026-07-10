
document.addEventListener("onboardingFinished", () => {
    const walkingCalibrationIntro = document.querySelector("[data-screen=calibration-walking]");
    const walkingCalibrationMeters = walkingCalibrationIntro.querySelector("#walking-calibri-meters");


    showSection(walkingCalibrationIntro);
    startWalk(5, walkingMeterChange, changeCalibriWalkingScreen)
    function walkingMeterChange(value, progress) {
        walkingCalibrationMeters.textContent = progress;
    }


    function changeCalibriWalkingScreen() {
        hideSection(walkingCalibrationIntro);
        document.dispatchEvent(new CustomEvent("walkingFinished")); // <--- intro-turning.js
    }
});