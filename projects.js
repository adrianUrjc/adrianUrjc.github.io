/* =======================================================================
   DATOS DE PROYECTOS  ←  ESTE es el archivo que editas para tu contenido.
   - Ordénalos por importancia: videojuegos primero, luego tools, luego concept.
   - 'at'  = posición en el nivel (0 = inicio, 1 = final).
   - 'img' = ruta a tu imagen en /assets (déjalo vacío "" para placeholder).
   - 'links' = botones; añade {t:"Texto", u:"url"} y opcional ghost:true.
   ======================================================================= */
const projects = [
    // ----- ZONA 1: VIDEOJUEGOS -----
    {
        zone: "videojuegos", at: 0.16, tag: "Juego", title: "Uncle Belly & The Magic Mushroom",
        meta: "Unity · C# · 2022-23", img: "assets/videojuegos/PortadaUB.png",
        desc: "Tras perder el Magic Mushroom ante las garras de ???. Uncle Belly se embarcará en una aventura por todo el reino Mágico para recuperar el poderoso objeto.",
        links: [{ t: "Jugar", u: "https://drakon04.itch.io/uncle-belly-the-magic-mushroom" }, { t: "Itch.io", u: "https://drakon04.itch.io", ghost: true }]
    },

    {
        zone: "videojuegos", at: 0.32, tag: "Juego", title: "Deep Within",
        meta: "Unity · C# · 2024", img: "assets/videojuegos/PortadaDeepWithin.png",
        desc: "Averigua qué misterios depara el interior de las paredes de esta escuela abandonada, y enfréntate a tu pasado. No se garantiza tu seguridad...",
        links: [{ t: "Jugar", u: "https://bluecario123.itch.io/deep-within" }, { t: "Itch.io", u: "https://drakon04.itch.io", ghost: true }]
    },

    {
        zone: "videojuegos", at: 0.48, tag: "Juego", title: "Time Bender",
        meta: "Unity · C# · 2025", img: "assets/videojuegos/PortadaTimeBender.png",
        desc: "El juego en el que el tiempo es nuestro. Utiliza tus poderes para rebobinar o adelantar el tiempo",
        links: [{ t: "Jugar", u: "https://alba1212.itch.io/time-bender" }, { t: "Itch.io", u: "https://drakon04.itch.io", ghost: true }]
    },
     {
        zone: "videojuegos", at: 0.64, tag: "Juego", title: "Legado de Sangre",
        meta: "Unity · C# · 2025-26", img: "assets/videojuegos/PortadaLegadoSangre.png",
        desc: "Intenta sobrevivir 5 noches en la mansión encantada de tu familia.",
        links: [{ t: "Jugar", u: "https://bollychaos22.itch.io/legado-de-sangre" }, { t: "Itch.io", u: "https://drakon04.itch.io", ghost: true }]
    },


    // ----- ZONA 2: HERRAMIENTAS PARA UNITY -----
    {
        zone: "unity", at: 0.80, tag: "Herramienta", title: "Group Values Load System",
        meta: "Unity Editor · C# · Package", img: "assets/videojuegos/PortadaGroupValues.png",
        desc: "A flexible and scalable data management tool for Unity that replaces PlayerPrefs with a structured, type-safe save system. Store data in organized ScriptableObject-based containers.",
        links: [{ t: "AssetStore", u: "https://assetstore.unity.com/packages/tools/painting/group-values-load-system-371056", ghost: true }]
    },

    // { aun no
    //     zone: "unity", at: 0.82, tag: "Herramienta", title: "Graph Generator",
    //     meta: "Unity · Editor Scripting", img: "",
    //     desc: "Sistema modular, generador procedural, etc. Enfócate en el valor técnico.",
    //     links: [{ t: "Ver", u: "#" }]
    // },

    // ----- ZONA 3: CONCEPT -----
    {
        zone: "concept", at: 1, tag: "Concept", title: "Concept Art / Prototipos",
        meta: "Diseño · Prototipado", img: "",
        desc: "Bocetos, mundos, mecánicas exploradas. Un vistazo a tu proceso creativo.",
        links: [{ t: "Galería", u: "gallery.html" }]
    },
];

/* Mapa de zona → acentos de color y etiqueta del HUD.
   Si añades una zona nueva, defínela también aquí. */
const ZONE = {
    videojuegos: { a: "--z1-a", b: "--z1-b", label: "Videojuegos" },
    unity: { a: "--z2-a", b: "--z2-b", label: "Herramientas Unity" },
    concept: { a: "--z3-a", b: "--z3-b", label: "Concept" },
};