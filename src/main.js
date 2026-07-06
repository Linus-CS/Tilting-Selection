const coverScreen = document.querySelector('[data-screen="cover"]');
const coverMeters = document.querySelector("#coverMeters");

document.addEventListener("permissionsGranted", () => {
    showSection(coverScreen);

    startWalk(0, onChange, onFinished);

    function onChange(walked) {
        const progress = walkedMeters / walkGoal;
        const split = 100 - progress * 100;
        coverScreen.style.setProperty("--split", `${split}%`);
        coverMeters.textContent = Math.round(Math.max(Math.min(walkGoal - walkedMeters, 50), 0));
    }

    function onFinished() {
        hideSection(coverScreen);
        document.dispatchEvent(new CustomEvent("coverWalked")); // <--- onboarding.js
    }

});
