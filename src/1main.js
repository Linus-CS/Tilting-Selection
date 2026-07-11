

document.addEventListener("permissionsGranted", () => {
    const coverScreen = document.querySelector('[data-screen="cover"]');
    const coverMeters = document.querySelector("#coverMeters");
    const headlineSVG = document.querySelector("#headline-svg")

    showSection(coverScreen);
    animateText("Go outside and start walking", headlineSVG);

    startWalk(50, onChange, onFinished);

    function onChange(walked, p) {
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
