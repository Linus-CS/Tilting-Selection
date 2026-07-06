
function transitionSection(section1, section2) {
    hideSection(section1);
    showSection(section2);
}

function hideSection(section) {
    if (section)
        section.style.display = "none";
}

function showSection(section) {
    if (section)
        section.style.display = "block";
}