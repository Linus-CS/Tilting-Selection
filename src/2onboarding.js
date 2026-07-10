

document.addEventListener("coverWalked", () => {
    const calibrationIntro = document.querySelector("[data-screen=calibration-intro]");
    const button = calibrationIntro.querySelector("button");
    const calibrationMeters = calibrationIntro.querySelector("#calibri-meters");

    showSection(calibrationIntro);
    startWalk(5, meterChange, changeCalibriScreen)
    function meterChange(value, progress) {
        calibrationMeters.textContent = progress;
    }


    function changeCalibriScreen() {
        hideSection(calibrationIntro);
        document.dispatchEvent(new CustomEvent("onboardingFinished")); // <--- intro-walking.js
    }
});