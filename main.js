/* =======================================================================
   MOTOR MODIFICADO — Movimiento por cruceta, físicas de salto y gravedad.
   ======================================================================= */
console.log("¡El script del motor híbrido ha arrancado con físicas!");

// 1. Elementos del DOM
const spacer = document.getElementById('scroll-spacer');
const stage = document.getElementById('stage');
const world = document.getElementById('world');
const character = document.getElementById('character');
const bar = document.querySelector('.progress .bar');
const zoneLabel = document.querySelector('.hud .zone');
const card = document.getElementById('project-card');
const far = document.querySelector('.layer-far');
const mid = document.querySelector('.layer-mid');
const close = document.querySelector('.layer-close');
const hint = document.querySelector('.hint');
const root = document.documentElement;

// 2. Variables de control global
const SCROLL_VIEWPORTS = 7;
let charX = 0;
let worldTravel = 0;
let target = 0;
let current = 0;
let last = 0;
let activeProject = -1;
let activeZone = '';

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// --- NUEVAS VARIABLES DE FÍSICAS Y CONTROLES ---
let virtualScrollY = 0; // Controlará el avance horizontal del nivel de manera virtual
let maxScrollValue = 0;

// Configuración física del Personaje
const physics = {
  y: 0,            // Altura de salto actual (0 = suelo)
  vy: 0,           // Velocidad vertical
  gravity: 0.4,    // Fuerza de gravedad
  jumpImpulse: 15, // Impulso inicial hacia arriba
  isJumping: false
};

// Captura de inputs en tiempo real
const keys = { Left: false, Right: false, Up: false };
// 🌟 SISTEMA DE 10 MONEDAS REPARTIDAS POR TODO EL MAPA (POSICIONES RELATIVAS)
let coins = [
  // --- ZONA 1: VIDEOJUEGOS (De 0.0 a 0.25) ---
  { x: 0.06, y: 30, collected: false },  // Moneda introductoria, a ras de suelo
  { x: 0.15, y: 150, collected: false }, // Salto alto (exige saltar con ganas)
  { x: 0.22, y: 65, collected: false },  // Altura media, ideal para coger al caer del anterior

  // --- ZONA 2: UNITY TOOLS (De 0.25 a 0.50) ---
  { x: 0.32, y: 40, collected: false },  // Altura baja, un salto corto o corriendo
  { x: 0.42, y: 175, collected: false }, // ¡Salto extremo! (Justo en el pico más alto de Uncle Belly)

  // --- ZONA 3: CONCEPT ART / PROTOTIPOS (De 0.50 a 0.75) ---
  { x: 0.55, y: 120, collected: false },  // Altura media
  { x: 0.63, y: 30, collected: false },  // En el suelo
  { x: 0.70, y: 165, collected: false }, // Salto alto

  // --- ZONA 4: CV / CONTACTO (De 0.75 a 1.0) ---
  { x: 0.82, y: 65, collected: false },  // Altura media, preparando el tramo final
  { x: 0.93, y: 180, collected: false }  // La última moneda, un salto épico justo antes del final
];

let totalCoinsCollected = 0;
let finalMessageShown = false;
// Comprobamos dependencias
if (typeof projects === 'undefined') console.error("❌ ERROR: 'projects' NO está definido.");
if (typeof ZONE === 'undefined') console.error("❌ ERROR: 'ZONE' NO está definido.");

/* --- Animador de sprites por CANVAS (Añadido 'jump') ------------------------- */
const SPRITE_VER = '7';
const SPRITES = {
  walk: {
    el: character ? character.querySelector('canvas.walk') : null,
    src: 'assets/sprites/UncleBellyAnimations/WalkSpriteSheet.png',
    cols: 32, rows: 1, frames: 32, fps: 29
  },
  idle: {
    el: character ? character.querySelector('canvas.idle') : null,
    src: 'assets/sprites/UncleBellyAnimations/IdleSpriteSheet.png',
    cols: 36, rows: 1, frames: 36, fps: 11
  },
  jump: { // 🌟 NUEVA SPRITE SHEET PARA EL SALTO
    el: character ? character.querySelector('canvas.jump') : null,
    src: 'assets/sprites/UncleBellyAnimations/JumpSpriteSheet.png', // Modifica esta ruta si es diferente
    cols: 33, rows: 1, frames: 33, fps: 24 // Cambia columnas/frames según tenga tu sheet de salto
  }
};

for (const k in SPRITES) {
  const s = SPRITES[k];
  if (!s.el) continue;

  s.ctx = s.el.getContext('2d');
  s.frame = 0; s.acc = 0; s.ready = false;
  const img = new Image();
  img.onload = () => {
    s.img = img;
    s.fw = img.naturalWidth / s.cols;
    s.fh = img.naturalHeight / s.rows;
    s.el.width = s.fw; s.el.height = s.fh;
    s.ready = true;
    drawSprite(s);
  };
  img.src = s.src + '?v=' + SPRITE_VER;
}

function drawSprite(s) {
  if (!s.ready || !s.ctx) return;
  const f = (s.frames - 1) - s.frame;
  const col = f % s.cols, row = Math.floor(f / s.cols);
  s.ctx.clearRect(0, 0, s.el.width, s.el.height);
  s.ctx.drawImage(s.img, col * s.fw, row * s.fh, s.fw, s.fh, 0, 0, s.el.width, s.el.height);
}

let lastSpriteT = performance.now();
function stepSprites(now) {
  const dt = now - lastSpriteT; lastSpriteT = now;
  if (reduceMotion) return;

  const walking = character ? character.classList.contains('walking') : false;
  const jumping = physics.isJumping;

  for (const k in SPRITES) {
    const s = SPRITES[k];
    if (!s.el) continue;

    // Control riguroso de qué Sprite Sheet se despliega
    if (k === 'jump') {
      if (!jumping) { s.el.style.display = 'none'; s.frame = 0; continue; }
      else { s.el.style.display = 'block'; }
    }
    if (k === 'walk') {
      if (!walking || jumping) { s.el.style.display = 'none'; s.frame = 0; continue; }
      else { s.el.style.display = 'block'; }
    }
    if (k === 'idle') {
      if (walking || jumping) { s.el.style.display = 'none'; s.frame = 0; continue; }
      else { s.el.style.display = 'block'; }
    }

    s.acc += dt;
    const dur = 1000 / s.fps;
    let changed = false;
    while (s.acc >= dur) {
      s.acc -= dur;
      // Si es animación de salto, se puede quedar fija en el último frame si sigue en el aire
      if (k === 'jump' && s.frame === s.frames - 1) {
        changed = true;
        break;
      }
      s.frame = (s.frame + 1) % s.frames;
      changed = true;
    }
    if (changed) drawSprite(s);
  }
}

function layout() {
  // Capturamos el contenedor del mundo de forma segura
  const worldElement = document.getElementById('world');
  if (!worldElement) {
    console.error("❌ ERROR: No se encuentra el elemento #world en el HTML");
    return;
  }

  // 1. Forzamos el cálculo del tamaño del mapa entero
  const viewports = typeof SCROLL_VIEWPORTS !== 'undefined' ? SCROLL_VIEWPORTS : 7;
  worldTravel = window.innerWidth * (viewports - 1);
  maxScrollValue = worldTravel;
  const totalWidth = worldTravel + window.innerWidth;

  // 2. 🌟 LE DAMOS EL ANCHO AL MUNDO Y AL SUELO ANTES DE CUALQUIER OTRA COSA
  worldElement.style.width = totalWidth + 'px';

  const groundRows = document.querySelectorAll('.ground');
  if (groundRows.length > 0) {
    groundRows.forEach(row => {
      row.style.width = totalWidth + 'px';
    });
  } else {
    console.warn("⚠️ ADVERTENCIA: No se han encontrado elementos con la clase .ground");
  }

  // 3. Comprobaciones de seguridad para el resto de capas (si fallan, el suelo ya se habrá pintado)
  charX = window.innerWidth * (window.innerWidth < 600 ? 0.18 : 0.26);

  if (typeof far !== 'undefined' && far) far.style.width = (worldTravel * 0.12 + window.innerWidth) + 'px';
  if (typeof mid !== 'undefined' && mid) mid.style.width = (worldTravel * 0.35 + window.innerWidth) + 'px';
  if (typeof close !== 'undefined' && close) close.style.width = (worldTravel * 0.68 + window.innerWidth) + 'px';

  if (typeof buildPosts === 'function') buildPosts();
}



function setAccent(zoneKey) {
  if (zoneKey === activeZone || typeof ZONE === 'undefined') return;
  activeZone = zoneKey;
  const z = ZONE[zoneKey];
  if (!z) return;

  if (root) {
    root.style.setProperty('--accent', `var(${z.a})`);
    root.style.setProperty('--accent2', `var(${z.b})`);
  }

  const stageEl = document.getElementById('stage');
  if (stageEl) stageEl.dataset.zone = zoneKey;
  if (zoneLabel) zoneLabel.textContent = z.label;
}

function buildPosts() {
  if (!world || typeof projects === 'undefined' || typeof ZONE === 'undefined') return;

  // 1. 🧹 LIMPIEZA ABSOLUTA DE POSTES Y MONEDAS PREVIAS
  // Usamos un bucle while para asegurarnos de que no quede ni un solo clon en el DOM
  while (world.querySelector('.post')) {
    world.querySelector('.post').remove();
  }
  while (world.querySelector('.coin')) {
    world.querySelector('.coin').remove();
  }

  // 2. Renderizar Postes (Tu lógica se queda igual)
  projects.forEach(p => {
    const post = document.createElement('div');
    post.className = 'post';
    post.style.left = (charX + p.at * worldTravel) + 'px';
    const z = ZONE[p.zone];
    if (z) {
      post.style.setProperty('--accent', `var(${z.a})`);
      const flag = document.createElement('div');
      flag.className = 'flag';
      flag.style.background = `var(${z.a})`;
      flag.textContent = p.tag;
      post.appendChild(flag);
    }
    world.appendChild(post);
  });

  // 3. Renderizar Monedas (Ahora libre de duplicados)
  if (typeof coins !== 'undefined') {
    coins.forEach((coin, index) => {
      // 🌟 FILTRO CRÍTICO: Si la moneda ya fue recolectada en una partida previa, ni la creamos
      if (coin.collected) return;

      const coinEl = document.createElement('div');
      coinEl.className = 'coin';
      coinEl.dataset.id = index;

      const posX = charX + (coin.x * worldTravel);
      coinEl.style.left = posX + 'px';
      coinEl.style.bottom = `calc(var(--suelo-alto, 140px) + ${coin.y}px)`;

      world.appendChild(coinEl);
    });
  }
}
function showCard(i) {
  if (!card || typeof projects === 'undefined') return;
  const p = projects[i];
  if (!p) return;

  const padre = card.parentNode;

  // Lógica interna para actualizar el contenido real de los nodos
  function renderContenido() {
    // 1. Limpiar previews viejas
    const previewVieja = padre.querySelector('.card.preview-next');
    if (previewVieja) previewVieja.remove();
    card.classList.remove('preview-next');

    // 2. Actualizar tarjeta principal
    const badge = card.querySelector('.badge');
    const title = card.querySelector('h3');
    const meta = card.querySelector('.meta');
    const pText = card.querySelector('p');
    const media = card.querySelector('.media');
    const ph = card.querySelector('.placeholder');
    const links = card.querySelector('.links');

    if (badge) badge.textContent = p.tag;
    if (title) title.textContent = p.title;
    if (meta) meta.textContent = p.meta;
    if (pText) pText.textContent = p.desc;

    if (media) {
      if (p.img) { media.style.backgroundImage = `url('${p.img}')`; if (ph) ph.textContent = ''; }
      else { media.style.backgroundImage = ''; if (ph) ph.textContent = `[ assets/${p.zone}/ ]\nañade aquí tu captura o vídeo`; }
    }

    if (links) {
      links.innerHTML = '';
      p.links.forEach(l => {
        const a = document.createElement('a'); a.href = l.u; a.textContent = l.t; a.target = "_blank";
        if (l.ghost) a.className = 'ghost'; links.appendChild(a);
      });
    }

    // 3. Crear nueva preview
    const nextP = projects[i + 1];
    if (nextP) {
      const previewClone = card.cloneNode(true);
      previewClone.removeAttribute('id');
      previewClone.classList.remove('show', 'switching');
      previewClone.classList.add('preview-next');

      const nextBadge = previewClone.querySelector('.badge');
      const nextTitle = previewClone.querySelector('h3');
      const nextMeta = previewClone.querySelector('.meta');
      const nextPText = previewClone.querySelector('p');
      const nextMedia = previewClone.querySelector('.media');
      const nextLinks = previewClone.querySelector('.links');

      if (nextBadge) nextBadge.textContent = "Siguiente";
      if (nextTitle) nextTitle.textContent = nextP.title;
      if (nextMeta) nextMeta.textContent = nextP.meta;
      if (nextPText) nextPText.textContent = nextP.desc.length > 75 ? nextP.desc.substring(0, 75) + '...' : nextP.desc;

      if (nextMedia) {
        if (nextP.img) { nextMedia.style.backgroundImage = `url('${nextP.img}')`; }
        else { nextMedia.style.backgroundImage = ''; }
      }
      if (nextLinks) nextLinks.innerHTML = '';
      padre.appendChild(previewClone);
    }
  }

  // 🌟 EL TRUCO DE LA TRANSICIÓN: Si la carta ya se estaba mostrando, 
  // hacemos un efecto de cortinilla temporal para cambiar los datos
  if (card.classList.contains('show')) {
    card.classList.add('switching');

    setTimeout(() => {
      renderContenido();
      card.classList.remove('switching');
    }, 200); // 200ms es el tiempo que tarda en encogerse en el CSS
  } else {
    // Si la carta estaba completamente oculta, se renderiza instantáneamente de fondo
    renderContenido();
    card.classList.add('show');
  }

  padre.classList.add('show');
}
function mostrarMensajeAgradecimiento() {
  // Creamos el contenedor del mensaje dinámicamente
  const alertBox = document.createElement('div');
  alertBox.id = 'game-clear-msg';
  alertBox.innerHTML = `
    <div class="msg-content">
      <span class="trophy">🏆</span>
      <h2>¡NIVEL COMPLETADO!</h2>
      <p>Has conseguido todas las monedas. Gracias por jugar y explorar todos mis proyectos.</p>
      <button onclick="this.parentElement.parentElement.remove()">Continuar explorando</button>
    </div>
  `;
  document.body.appendChild(alertBox);
}
// LÓGICA DE ACTUALIZACIÓN DINÁMICA DE ENTRADAS Y FÍSICAS
function updateMovement() {
  const speed = window.innerWidth <= 768 ? 6 : 14;

  // 1. 🌟 LEER LA ALTURA DEL SUELO DESDE EL CSS EN TIEMPO REAL
  const estiloRoot = getComputedStyle(document.documentElement);
  const alturaSuelo = parseInt(estiloRoot.getPropertyValue('--suelo-alto')) || 140;

  // Movimiento Horizontal
  if (keys.Right) virtualScrollY = Math.min(maxScrollValue, virtualScrollY + speed);
  if (keys.Left) virtualScrollY = Math.max(0, virtualScrollY - speed);

  // Mecánica de Salto y Gravedad
  if (keys.Up && !physics.isJumping) {
    physics.vy = -physics.jumpImpulse;
    physics.isJumping = true;
  }

  if (physics.isJumping) {
    physics.vy += physics.gravity;
    physics.y -= physics.vy;

    if (physics.y <= 0) {
      physics.y = 0;
      physics.vy = 0;
      physics.isJumping = false;
    }
  }

  target = maxScrollValue > 0 ? virtualScrollY / maxScrollValue : 0;
  if (target > 0.02 && hint) hint.style.opacity = '0';

  // 2. 🌟 AJUSTAR LA POSICIÓN DEL PERSONAJE USANDO LA VARIABLE GLOBAL
  if (character) {
    // Calculamos el suelo real y le restamos 14px de ajuste para sus piernas
    const baseVisual = alturaSuelo - 14;
    // Aplicamos la altura base más el desplazamiento del salto vertical (physics.y)
    character.style.bottom = `${baseVisual}px`;
    character.style.transform = `translateX(-50%) translateY(${-physics.y}px)`;
  }
  // 🌟 DETECTAR COLISIÓN CON MONEDAS (Caja de colisión integrada)
  const playerWorldX = virtualScrollY + charX; 
  const playerWorldY = physics.y; // 0 en el suelo, sube al saltar

  // Definimos el tamaño del cuerpo de Uncle Belly para la colisión
  const playerWidth = 50;  
  const playerHeight = 90; // Altura estimada de tu personaje

  coins.forEach((coin, index) => {
    if (!coin.collected) {
      const coinWorldX = charX + (coin.x * worldTravel);
      const coinWorldY = coin.y; 

      const coinWidth = 32;  // Tamaño de la moneda en tu CSS
      const coinHeight = 32;

      // Comprobación de Caja AABB (Eje X e Eje Y solapados)
      const colisionX = (playerWorldX - playerWidth / 2) < (coinWorldX + coinWidth / 2) &&
                        (playerWorldX + playerWidth / 2) > (coinWorldX - coinWidth / 2);

      const colisionY = playerWorldY < (coinWorldY + coinHeight) &&
                        (playerWorldY + playerHeight) > coinWorldY;

      // Si se cruzan ambos ejes... ¡RECOLECTADA!
      if (colisionX && colisionY) {
        coin.collected = true;
        totalCoinsCollected++;

        // Actualizar el marcador en el HTML de forma segura
        const scoreEl = document.getElementById('coin-score');
        if (scoreEl) scoreEl.textContent = totalCoinsCollected;

        // Ocultar el elemento visual
        const coinElement = world.querySelector(`.coin[data-id="${index}"]`);
        if (coinElement) {
          coinElement.classList.add('collected');
          setTimeout(() => coinElement.style.display = 'none', 300);
        }

        console.log(`¡Moneda conseguida! ${totalCoinsCollected}/${coins.length}`);
      }
    }
  });
  // Comprobar final de juego
  if (totalCoinsCollected === coins.length && !finalMessageShown) {
    finalMessageShown = true;
    mostrarMensajeAgradecimiento();
  }
}

function loop() {
  // Procesamos la física y inputs en cada ciclo del frame
  updateMovement();

  current += (target - current) * (reduceMotion ? 1 : 0.09);
  const p = current;

  // 1. Mover capas del mundo
  if (world) world.style.transform = `translateX(${-p * worldTravel}px)`;
  if (far) far.style.transform = `translateX(${-p * worldTravel * 0.12}px)`;
  if (mid) mid.style.transform = `translateX(${-p * worldTravel * 0.35}px)`;
  if (close) close.style.transform = `translateX(${-p * worldTravel * 0.68}px)`;
  if (bar) bar.style.transform = `scaleX(${p})`;

  // 2. Evaluar estados de movimiento
  const delta = p - last;
  const moving = Math.abs(delta) > 0.0003;
  if (character) {
    character.classList.toggle('walking', moving && !reduceMotion);
    if (delta < -0.0003) character.classList.add('flip');
    else if (delta > 0.0003) character.classList.remove('flip');
  }
  last = p;

  // 3. Renderizar animaciones de Canvas con estado actualizado
  stepSprites(performance.now());

  // 4. Lógica de zonas y tarjetas
  const progreso = virtualScrollY / maxScrollValue; // Valor de 0 a 1
  let zonaActual = "videojuegos";

  if (progreso < 0.25) {
    zonaActual = "videojuegos"; // Mañana / Día
  } else if (progreso >= 0.25 && progreso < 0.50) {
    zonaActual = "unity";       // Tarde
  } else if (progreso >= 0.50 && progreso < 0.75) {
    zonaActual = "concept";     // Noche
  } else {
    zonaActual = "cv";          // Noche / Fin
  }

  // Aplicamos el atributo al contenedor del escenario para cambiar los cielos y gradientes
  if (stage && stage.getAttribute('data-zone') !== zonaActual) {
    stage.setAttribute('data-zone', zonaActual);

    // Actualizamos dinámicamente los colores de acento del HUD usando tu objeto ZONE
    const configuracionZona = ZONE[zonaActual];
    if (configuracionZona) {
      document.documentElement.style.setProperty('--accent', `var(${configuracionZona.a})`);
      document.documentElement.style.setProperty('--accent2', `var(${configuracionZona.b})`);

      // Si tienes un elemento de texto para el nombre de la zona en el HUD:
      const zoneLabel = document.querySelector('.hud .zone');
      if (zoneLabel) zoneLabel.textContent = configuracionZona.label;
    }
  }

  if (typeof projects !== 'undefined') {
    let near = -1;
    projects.forEach((proj, i) => { if (Math.abs(p - proj.at) < 0.06) near = i; });

    // 🌟 CORRECCIÓN: Solo disparamos la lógica si realmente cambiamos de poste
    if (near !== activeProject) {
      activeProject = near;
      if (near === -1) {
        if (card) card.classList.remove('show');
        // Limpiamos el contenedor y las previews al alejarnos
        const padre = card ? card.parentNode : null;
        if (padre) {
          padre.classList.remove('show');
          const previewVieja = padre.querySelector('.card.preview-next');
          if (previewVieja) previewVieja.remove();
        }
      } else {
        // Ejecuta solo una vez al entrar en el rango del poste
        showCard(near);
      }
    }
  }

  requestAnimationFrame(loop);
}


/* --- CAPTURA DE TECLADO (WASD / FLECHAS / ESPACIO) --- */
window.addEventListener('keydown', e => {
  if (['ArrowLeft', 'a', 'A'].includes(e.key)) keys.Left = true;
  if (['ArrowRight', 'd', 'D'].includes(e.key)) keys.Right = true;
  if (['ArrowUp', 'w', 'W', ' '].includes(e.key)) {
    keys.Up = true;
    e.preventDefault(); // Evita scroll nativo con la barra espaciadora
  }
});

window.addEventListener('keyup', e => {
  if (['ArrowLeft', 'a', 'A'].includes(e.key)) keys.Left = false;
  if (['ArrowRight', 'd', 'D'].includes(e.key)) keys.Right = false;
  if (['ArrowUp', 'w', 'W', ' '].includes(e.key)) keys.Up = false;
});
function calcularPosicionesProyectos() {
  const ordenZonas = ["videojuegos", "unity", "concept", "cv"];
  const totalZonas = ordenZonas.length;
  const espacioPorZona = 1.0 / totalZonas; // 0.25

  ordenZonas.forEach((nombreZona, indiceZona) => {
    const proyectosDeZona = projects.filter(p => p.zone === nombreZona);
    const totalProyectos = proyectosDeZona.length;

    proyectosDeZona.forEach((proyecto, indiceProyecto) => {
      const inicioZona = indiceZona * espacioPorZona;

      let posicionRelativa = 0.5;
      if (totalProyectos > 1) {
        posicionRelativa = indiceProyecto / (totalProyectos - 1);
      }

      // 🌟 AJUSTE: Reducimos el multiplicador a 0.5 y subimos el offset a 0.35.
      // Esto empuja TODOS los postes hacia adelante, dejando el inicio totalmente limpio.
      proyecto.at = inicioZona + (posicionRelativa * espacioPorZona * 0.5) + (espacioPorZona * 0.35);
    });
  });
}

/* --- CONFIGURACIÓN DE LA CRUCETA VISUAL (MÓVIL / CLICS) --- */
const setupDpad = () => {
  const btnUp = document.getElementById('pad-up');
  const btnLeft = document.getElementById('pad-left');
  const btnRight = document.getElementById('pad-right');

  if (!btnUp || !btnLeft || !btnRight) return;

  const bindKey = (el, action) => {
    el.addEventListener('mousedown', () => keys[action] = true);
    el.addEventListener('mouseup', () => keys[action] = false);
    el.addEventListener('mouseleave', () => keys[action] = false);
    el.addEventListener('touchstart', (e) => { e.preventDefault(); keys[action] = true; });
    el.addEventListener('touchend', () => keys[action] = false);
  };

  bindKey(btnUp, 'Up');
  bindKey(btnLeft, 'Left');
  bindKey(btnRight, 'Right');
};

/* --- INTRO SEGURO A PRUEBA DE ERRORES --- */
const startBtn = document.getElementById('start');
const introEl = document.getElementById('intro');

if (startBtn && introEl) {
  startBtn.addEventListener('click', () => {
    introEl.style.display = 'none';
    introEl.classList.add('hide');
    layout();
    virtualScrollY = 0; // Inicializa posición de nivel
  });
}

const toEndBtn = document.getElementById('toEnd');
if (toEndBtn) {
  toEndBtn.addEventListener('click', e => {
    e.preventDefault();
    virtualScrollY = maxScrollValue; // Salto instantáneo por software al final
  });
}
// Asegúrate de que esto se ejecute cuando el DOM esté completamente cargado
function inicializarControlesMoviles() {
  const btnLeft = document.getElementById('btn-left');
  const btnRight = document.getElementById('btn-right');
  const btnUp = document.getElementById('btn-up');

  // Mensaje de depuración para ver si JS encuentra los botones en tu HTML
  console.log("Detectando botones móviles:", { btnLeft, btnRight, btnUp });

  if (!btnLeft || !btnRight || !btnUp) {
    console.warn("⚠️ Cuidado: No se han encontrado todos los botones en el HTML.");
    return;
  }

  // --- BOTÓN IZQUIERDA ---
  btnLeft.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Evita que el móvil haga zoom o scroll nativo al pulsar
    keys.Left = true;
  });
  btnLeft.addEventListener('touchend', (e) => {
    e.preventDefault();
    keys.Left = false;
  });

  // --- BOTÓN DERECHA ---
  btnRight.addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys.Right = true;
  });
  btnRight.addEventListener('touchend', (e) => {
    e.preventDefault();
    keys.Right = false;
  });

  // --- BOTÓN DE SALTO (Físicamente a la derecha) ---
  btnUp.addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys.Up = true;
  });
  btnUp.addEventListener('touchend', (e) => {
    e.preventDefault();
    keys.Up = false;
  });
}

// Forzamos la inicialización segura
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarControlesMoviles);
} else {
  inicializarControlesMoviles();
}
// Deshabilitamos la escucha nativa del scroll del navegador para controlar el flujo por inputs
window.addEventListener('resize', () => { layout(); });
// 🌟 BUSCA EL ARRANQUE DEL JUEGO ABAJO DEL TODO EN TU MAIN.JS:
// Envolvemos la ejecución para que espere a que el HTML exista en el navegador
window.addEventListener('DOMContentLoaded', () => {
  console.log("¡El DOM está listo! Inicializando escenario...");

  // Ejecutamos el layout ahora que los elementos .ground ya existen sí o sí
  layout();
  calcularPosicionesProyectos();
  setupDpad();
  requestAnimationFrame(loop);
});

