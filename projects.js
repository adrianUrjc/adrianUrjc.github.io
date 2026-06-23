/* =======================================================================
   DATOS DE PROYECTOS  ←  Distribuido Automáticamente por Zonas
   ======================================================================= */
const projects = [
    // ----- ZONA 1: VIDEOJUEGOS -----
    {
        zone: "videojuegos", tag: "Juego", title: "Uncle Belly & The Magic Mushroom",
        meta: "Unity · C# · 2022-23", img: "assets/videojuegos/PortadaUB.png",
        desc: "Tras perder el Magic Mushroom ante las garras de ???. Uncle Belly se embarcará en una aventura por todo el reino Mágico para recuperar el poderoso objeto.",
        links: [{ t: "Jugar", u: "https://drakon04.itch.io/uncle-belly-the-magic-mushroom" }, { t: "Itch.io", u: "https://drakon04.itch.io", ghost: true }]
    },
    {
        zone: "videojuegos", tag: "Juego", title: "Deep Within",
        meta: "Unity · C# · 2024", img: "assets/videojuegos/PortadaDeepWithin.png",
        desc: "Averigua qué misterios depara el interior de las paredes de esta escuela abandonada, y enfréntate a tu pasado. No se garantiza tu seguridad...",
        links: [{ t: "Jugar", u: "https://bluecario123.itch.io/deep-within" }, { t: "Itch.io", u: "https://drakon04.itch.io", ghost: true }]
    },
    {
        zone: "videojuegos", tag: "Juego", title: "Time Bender",
        meta: "Unity · C# · 2025", img: "assets/videojuegos/PortadaTimeBender.png",
        desc: "El juego en el que el tiempo es nuestro. Utiliza tus poderes para rebobinar o adelantar el tiempo",
        links: [{ t: "Jugar", u: "https://alba1212.itch.io/time-bender" }, { t: "Itch.io", u: "https://drakon04.itch.io", ghost: true }]
    },
    {
        zone: "videojuegos", tag: "Juego", title: "Legado de Sangre",
        meta: "Unity · C# · 2025-26", img: "assets/videojuegos/PortadaLegadoSangre.png",
        desc: "Intenta sobrevivir 5 noches en la mansión encantada de tu familia.",
        links: [{ t: "Jugar", u: "https://bollychaos22.itch.io/legado-de-sangre" }, { t: "Itch.io", u: "https://drakon04.itch.io", ghost: true }]
    },

    // ----- ZONA 2: HERRAMIENTAS PARA UNITY -----
    {
        zone: "unity", tag: "Herramienta", title: "Group Values Load System",
        meta: "Unity Editor · C# · Package", img: "assets/videojuegos/PortadaGroupValues.png",
        desc: "A flexible and scalable data management tool for Unity that replaces PlayerPrefs with a structured, type-safe save system. Store data in organized ScriptableObject-based containers.",
        links: [{ t: "AssetStore", u: "https://assetstore.unity.com/packages/tools/painting/group-values-load-system-371056", ghost: true }]
    },

    // ----- ZONA 3: CONCEPT -----
    {
        zone: "concept", tag: "Galería", title: "Concept Art / Prototipos",
        meta: "Diseño · Prototipado", img: "assets/videojuegos/PortadaGaleria.png",
        desc: "Bocetos, mundos, mecánicas exploradas. Échale un vistazo al proceso creativo.",
        links: [{ t: "Ver", u: "gallery.html" }]
    },

    // ----- ZONA 4: DESCARGAR CV -----
    {
        zone: "cv", tag: "Contacto", title: "Adrián Gómez-Lobo Núñez",
        meta: "Correo Electrónico", img: "assets/videojuegos/PortadaContacto.png", /* Añade aquí una portada o déjalo vacío */
        desc: "¿Te interesa mi perfil para tu equipo o proyecto? Puedes contactar conmigo pulsando el botón de abajo.",
        links: [{ t: "Contactar", u: "https://www.linkedin.com/in/adri%C3%A1n-gomez-lobo-97b89a2ab?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" }] 
    },
    {
        zone: "cv", tag: "CV", title: "Adrián Gómez-Lobo Núñez",
        meta: "Currículum Vitae", img: "assets/videojuegos/Portada_CV.png", /* Añade aquí una portada o déjalo vacío */
        desc: "Puedes ver y descargar mi historial profesional completo en formato PDF pulsando el botón de abajo.",
        links: [{ t: "Ver CV", u: "assets/Adrian_Gomez_Lobo_CV.pdf" }] /* Ajusta la ruta de tu PDF */
    }
];

/* Configuración de las 4 Zonas del HUD (Colores y Textos) */
const ZONE = {
    videojuegos: { a: "--z1-a", b: "--z1-b", label: "Videojuegos" },
    unity: { a: "--z2-a", b: "--z2-b", label: "Herramientas Unity" },
    concept: { a: "--z3-a", b: "--z3-b", label: "Galería" },
    cv: { a: "--z1-a", b: "--z3-b", label: "Final / CV" } /* Colores mezclados o personalizados */
};