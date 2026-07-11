
let animation_id = 0;
function animateText(text, component, stroke = true) {
    const path = component.querySelector("path");
    path.id = "path" + animation_id;

    const strokePart = document.createElementNS("http://www.w3.org/2000/svg", "text");
    const strokeTextPath = document.createElementNS("http://www.w3.org/2000/svg", "textPath")

    strokeTextPath.setAttribute("startOffset", "-80%");
    strokeTextPath.setAttribute("href", "#path" + animation_id);
    strokeTextPath.textContent = text;
    strokePart.classList.add("animation-text");
    strokePart.classList.add("animation-text-stroke");
    strokePart.appendChild(strokeTextPath);

    const fillPart = document.createElementNS("http://www.w3.org/2000/svg", "text");
    const fillTextPath = document.createElementNS("http://www.w3.org/2000/svg", "textPath");

    fillTextPath.setAttribute("startOffset", "-80%");
    fillTextPath.setAttribute("href", "#path" + animation_id);
    fillTextPath.textContent = text;
    fillPart.classList.add("animation-text");
    fillPart.classList.add("animation-text-fill");
    fillPart.appendChild(fillTextPath);

    component.appendChild(strokePart);
    component.appendChild(fillPart);

    animation_id++;

    const textPaths = [strokeTextPath, fillTextPath];

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