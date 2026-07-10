const coverScreen = document.querySelector('[data-screen="cover"]');
const coverMeters = document.querySelector("#coverMeters");

document.addEventListener("permissionsGranted", () => {
    showSection(coverScreen);
    animateHeadlinePath();

    function animateHeadlinePath() {
        const headline = document.querySelector(".headline-path");
        const textPaths = coverScreen.querySelectorAll(".headline-text textPath");

        const duration = 1500;
        const from = -90; // Text startet links außerhalb
        const to = 3;     // Endposition, ungefähr 1rem Abstand

        const startTime = performance.now();

        function easeInOut(t) {
            return t < 0.5
                ? 2 * t * t
                : 1 - Math.pow(-2 * t + 2, 2) / 2;
        }

        function frame(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeInOut(progress);
            const value = from + (to - from) * eased;

            textPaths.forEach((textPath) => {
                textPath.setAttribute("startOffset", `${value}%`);
            });

            if (progress < 1) {
                requestAnimationFrame(frame);
            }
        }

        requestAnimationFrame(frame);
    }


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
