const READER_CONTENT = {
    introArticle: {
        id: "introduction",
        title: "Introduction",
        category: "Allgemein",
        pages: [
            "Dies ist die erste Seite der Einleitung.",
            "Dies ist die zweite Seite der Einleitung.",
            "Nach der Einleitung folgt eine Laufpause."
        ]
    },

    distanceOptions: [
        {
            key: "north",
            title: "100 m",
            value: 100,
            previewTitle: "100 Meter",
            description: "Kurze Abschnitte. Gut, wenn du nah am Text bleiben möchtest."
        },
        {
            key: "east",
            title: "200 m",
            value: 200,
            previewTitle: "200 Meter",
            description: "Ein ruhiger Rhythmus zwischen Lesen und Gehen."
        },
        {
            key: "south",
            title: "500 m",
            value: 500,
            previewTitle: "500 Meter",
            description: "Mehr Abstand zwischen den Artikeln. Mehr Zeit zum Nachdenken."
        },
        {
            key: "west",
            title: "1 km",
            value: 1000,
            previewTitle: "1 Kilometer",
            description: "Eine längere Laufpause. Der Reader wird stärker zur Wanderung."
        }
    ],

    categories: [
        {
            id: "creativity",
            title: "Creativity",
            previewTitle: "Creativity",
            description: "Gehen als kreative Methode, Umweg, Rhythmus und Denkform.",
            intro: "In dieser Oberkategorie geht es um Gehen als kreative Methode, als Umweg, als Rhythmus und als Denkform.",
            articles: [
                {
                    id: "walking-as-method",
                    title: "Walking as Method",
                    previewTitle: "Walking as Method",
                    description: "Ein Text über Gehen als Werkzeug des Denkens und Forschens.",
                    pages: [
                        "Erste Seite des Artikels Walking as Method.",
                        "Zweite Seite des Artikels Walking as Method.",
                        "Dritte Seite des Artikels Walking as Method."
                    ]
                },
                {
                    id: "detour",
                    title: "Der Umweg",
                    previewTitle: "Der Umweg",
                    description: "Ein Text über Abschweifung, Orientierung und produktive Umwege.",
                    pages: [
                        "Erste Seite des Artikels Der Umweg.",
                        "Zweite Seite des Artikels Der Umweg."
                    ]
                }
            ]
        }
    ]
};