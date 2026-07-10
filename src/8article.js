document.addEventListener("selectedCategory", () => {
    showSection(COMPASS);

    const articleOptionsByCategory = {
        digital: [
            { key: "north", angle: 0, title: "Citizens of the Streets", description: "", value: "mona-lisa" },
            { key: "northEast", angle: 50, title: "Translation for Borders", description: "", value: "bona-bisa" },
            { key: "east", angle: 100, title: 'Step-counting in the "health-society": phenomenological reflections on walking in the era of the Fitbit', description: "", value: "homer-lisa-simpson" },
            { key: "southEast", angle: 150, title: "Common Cyborg", description: "", value: "common-cyborg" },
            { key: "south", angle: 200, title: "Woman sitting in front of the computer, thinking", description: "", value: "woman-computer" },
            { key: "southWest", angle: 250, title: "Designing with the body", description: "", value: "designing-body" },

            { key: "west", angle: 300, title: "Back to categories", description: "", value: "back-to-categories" }
        ],

        walking: [
            { key: "north", angle: 0, title: "Artikel 1 Poetic Walking", description: "", value: "poetic-walking-1" },
            { key: "east", angle: 90, title: "Artikel 2 Poetic Walking", description: "", value: "poetic-walking-2" },
            { key: "south", angle: 180, title: "Artikel 3 Poetic Walking", description: "", value: "poetic-walking-3" },

            { key: "west", angle: 270, title: "Back to categories", description: "", value: "back-to-categories" }
        ],

        creativity: [
            { key: "north", angle: 0, title: "Tracing a headland", description: "", value: "tracing" },
            { key: "northEast", angle: 72, title: "The Positive Effect of Walking on Creative Thinking ", description: "", value: "" },
            { key: "east", angle: 144, title: "The Mind at Three Miles an Hour", description: "", value: "" },
            { key: "south", angle: 216, title: "Wanderers - A History of Women Walking", description: "", value: "" },

            { key: "west", angle: 288, title: "Back to categories", description: "", value: "back-to-categories" }
        ],

        knowledge: [
            { key: "northEast", angle: 0, title: "Theory of the Derivé ", description: "", value: "" },
            { key: "east", angle: 60, title: "Strollology as a State of Mind - An Aesthetic Approach and Intervention to Pedestrian Centred Urban Planning", description: "", value: "" },
            { key: "southEast", angle: 120, title: "Walking and Mapping – Artists as Cartographers - Wayfinding", description: "", value: "" },
            { key: "south", angle: 180, title: "Walking between the disciplinary and the tactical - An embodied view of Certeau’s everyday practices", description: "", value: "" },
            { key: "southWest", angle: 240, title: "Guide Dogs Don't Lead Blind People. We Wander as One", description: "", value: "" },

            { key: "west", angle: 300, title: "Back to categories", description: "", value: "back-to-categories" }
        ],
    };

    const selectedCategory = localStorage.getItem("category");
    const articleOptions = articleOptionsByCategory[selectedCategory] || [];

    startCompass("Which article do you want to start with?", articleOptions, onSelected, "article");
    function onSelected(value) {
        hideSection(COMPASS);

        if (value === "back-to-categories") {
            document.dispatchEvent(new CustomEvent("backToCategories"));
            return;
        }

        localStorage.setItem("article", value);
        document.dispatchEvent(new CustomEvent("selectedArticle"));
    }
});

document.addEventListener("navigateToArticles", () => {
    const activeScreen = getCurrentScreen();

    if (activeScreen) {
        hideSection(activeScreen);
    }

    showSection(COMPASS);
    document.dispatchEvent(new CustomEvent("selectedCategory"));
});