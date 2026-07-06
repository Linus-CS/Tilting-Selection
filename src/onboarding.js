const calibrationIntro = document.querySelector("[data-screen=calibration-intro]");
const button = calibrationIntro.querySelector("button");

document.addEventListener("coverWalked", () => {
    showSection(calibrationIntro);

    // TODO: eigentliche passieren was passiert.
    button.onclick = () => {
        hideSection(calibrationIntro);
        document.dispatchEvent(new CustomEvent("onboardingFinished")); // <--- distance.js
    }
});