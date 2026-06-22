// =======================================================================
// BASE DE DATOS DE CONCEPT ART (Almacenados en assets/concepts/)
// =======================================================================
const CONCEPTS_DATA = [
    {
        title: "Testing de Uncle Belly",
        description: "Captura sacada durante el testeo de los niveles de Uncle Belly.",
        image: "assets/concepts/UncleBellyTesting.png"
    },
    {
        title: "Molino en Sketch-up",
        description: "Molino hecho en Sketch-up, aprendizaje de creación de estructuras usando la herramienta.",
        image: "assets/concepts/TestingSketchUp.png"
    },
    {
        title: "Personaje hecho en 3ds Max",
        description: "Primer modelo hecho en 3ds Max. Modelado orgánico de un personaje para un trabajo de la universidad.",
        image: "assets/concepts/Testing3dsMax.png"
    },
     {
        title: "Primer render hecho en Blender",
        description: "Primer modelo hecho en Blender. Modelado orgánico siguiendo un tutorial de Blender.",
        image: "assets/concepts/Render1Blender.png"
    },
    {
        title: "Segundo render hecho en Blender",
        description: "Modelo original creado en Blender.",
        image: "assets/concepts/Render2Blender.png"
    },
    {
        title: "Rigging de personaje hecho en Blender",
        description: "Primer modelo hecho en Blender. Sirvió para aprender a utilizar la herramienta y transicionar de 3ds Max.",
        image: "assets/concepts/CharacterRigging.png"
    },

    {
        title: "Modelado de personajes para el juego Deep Within hecho en Blender",
        description: "Modelos creados para el juego de Jam Deep Within. Primera creación de modelos de estilo low poly.",
        image: "assets/concepts/RonnieModeling.png"
    },
    {
        title: "Concept de personaje",
        description: "Concept de un personaje para un trabajo de la universidad. Primera vez dibujando en formato digital usando Krita.",
        image: "assets/concepts/CharacterDrawing.png"
    },
    {
        title: "Producto coloreado",
        description: "Primera vez dando un acabado a color de un concept.",
        image: "assets/concepts/CharacterColoring.png"
    },
    {
        title: "Concept de escenario de un cementerio",
        description: "Concept general de un entorno de videojuego sobre un cementerio.",
        image: "assets/concepts/ConceptEnvironment.png"
    },
    {
        title: "Concept de personaje en Krita",
        description: "Desarrollo de un concept de personaje tras unos meses de uso con Krita",
        image: "assets/concepts/CharacterConcept.png"
    },
    {
        title: "Entintado de concept en Krita",
        description: "Entintado del concept usando cross-hatching y un estilo de cómic sobre el dibujo.",
        image: "assets/concepts/CharacterInking.png"
    },
    {
        title: "Concept de personaje",
        description: "Otro diseño de concepto sobre un personaje original.",
        image: "assets/concepts/CharacterConcept2.png"
    },
    {
        title: "Concept del protagonista de Legado de Sangre",
        description: "Desarrollo del turnaround de Alex, protagonista de Legado de sangre",
        image: "assets/concepts/CharacterConcept3.png"
    },
    {
        title: "Concept de enemigo de Legado de Sangre",
        description: "Concept temprano sobre el enemigo Abuelo. Sirve para definir las dimensiones del monstruo y su personalidad.",
        image: "assets/concepts/LegadoDeSangreConcept.png"
    },
    {
        title: "Concept genérico de Legado de Sangre",
        description: "Lluvia de ideas plasmada en una capa de Krita sobre el diseño general de los enemigos de Legado de Sangre",
        image: "assets/concepts/LegadoDeSangreConcept2.png"
    },
     {
        title: "Diagrama de clases",
        description: "Diagrama de clases realizado para esquematizar la lógica de la carga y el guardado del juego.",
        image: "assets/concepts/DiagramaClases.png"
    },
    {
        title: "Pantalla de inicio de Legado de Sangre",
        description: "Pantalla de inicio del videojuego conseguida gracias al encuadre de la cámara y diversos efectos visuales realizados en Unity",
        image: "assets/concepts/LegadoDeSangrePortada.png"
    },
    {
        title: "Render final de personaje",
        description: "Render final en blanco y negro de un personaje original",
        image: "assets/concepts/CharacterFinishRender.png"
    },
    {
        title: "Concept de personaje de un concurso de dibujo",
        description: "Concept de personaje basado en el tema mitología. Representa a un wendigo aullando a la luna llena en mitad de un bosque oscuro.",
        image: "assets/concepts/DrawingContestConcept.png"
    },
    {
        title: "Personaje coloreado con el estilo Street Fighter",
        description: "Coloreado de un personaje estilo Street Fighter usando colores planos.",
        image: "assets/concepts/JCStreetFighter.png"
    },
    {
        title: "Dibujo de Grogu hecho en Krita",
        description: "Dibujo y coloreado de Grogu de la serie Mandalorian. Se ha usado un estilo sencillo para colorearlo.",
        image: "assets/concepts/GroguFinishedDrawing.png"
    }
];

// Instancia del contenedor HTML
const container = document.getElementById('gallery-container');

// Renderizado automático de tarjetas en la rejilla
function renderGallery() {
    // Añadimos 'style="cursor: pointer;"' y el atributo 'onclick' pasando la URL de la imagen de forma segura
    container.innerHTML = CONCEPTS_DATA.map(concept => `
        <article class="g-card" style="cursor: pointer;" onclick="openModal('${concept.image}', '${concept.title}')">
            <div class="media" style="background-image: url('${concept.image}');" role="img" aria-label="${concept.title}"></div>
            <div class="body">
                <h3>${concept.title}</h3>
                <p>${concept.description}</p>
            </div>
        </article>
    `).join('');
}

// --- LÓGICA DEL MODAL ---

// Creamos e inyectamos el HTML del modal dinámicamente para que no tengas que tocar tu HTML base
const modalHTML = `
    <div id="image-modal" class="custom-modal" onclick="closeModal()">
        <span class="close-btn">&times;</span>
        <img class="modal-content" id="modal-img" alt="Concept Art Ampliado">
        <div id="modal-caption"></div>
    </div>
`;
document.body.insertAdjacentHTML('beforeend', modalHTML);

const modal = document.getElementById('image-modal');
const modalImg = document.getElementById('modal-img');
const captionText = document.getElementById('modal-caption');

// Función para abrir el modal
function openModal(imageSrc, title) {
    modal.style.display = "flex"; // Usamos flex para centrar perfectamente la imagen
    modalImg.src = imageSrc;
    captionText.innerHTML = title;
}

// Función para cerrar el modal
function closeModal() {
    modal.style.display = "none";
}

// Inicializar galería al cargar la página
document.addEventListener('DOMContentLoaded', renderGallery);