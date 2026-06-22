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
const card = document.getElementById('card');
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
  if (!spacer || !world) return;
  
  // 1. EL CAMBIO CLAVE: Definimos el tamaño del nivel por software (7 pantallas de ancho)
  worldTravel = window.innerWidth * (SCROLL_VIEWPORTS - 1);
  maxScrollValue = worldTravel; // Ahora el límite es el tamaño real del mapa, no el scroll del navegador

  charX = window.innerWidth * (window.innerWidth < 600 ? 0.18 : 0.26);
  world.style.width = (worldTravel + window.innerWidth) + 'px';

  if (far) far.style.width = (worldTravel * 0.12 + window.innerWidth) + 'px';
  if (mid) mid.style.width = (worldTravel * 0.35 + window.innerWidth) + 'px';
  if (close) close.style.width = (worldTravel * 0.68 + window.innerWidth) + 'px';

  buildPosts();
}



function setAccent(zoneKey){
  if(zoneKey === activeZone || typeof ZONE === 'undefined') return;
  activeZone = zoneKey;
  const z = ZONE[zoneKey];
  if(!z) return;
  
  if(root) {
    root.style.setProperty('--accent', `var(${z.a})`);
    root.style.setProperty('--accent2', `var(${z.b})`);
  }
  
  const stageEl = document.getElementById('stage');
  if(stageEl) stageEl.dataset.zone = zoneKey; 
  if(zoneLabel) zoneLabel.textContent = z.label;
}

function buildPosts() {
  if (!world || typeof projects === 'undefined' || typeof ZONE === 'undefined') return;
  world.innerHTML = '';
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
}

function showCard(i) {
  if (!card || typeof projects === 'undefined') return;
  const p = projects[i];
  if (!p) return;

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
      const a = document.createElement('a'); a.href = l.u; a.textContent = l.t;
      if (l.ghost) a.className = 'ghost'; links.appendChild(a);
    });
  }
  card.classList.add('show');
}

// LÓGICA DE ACTUALIZACIÓN DINÁMICA DE ENTRADAS Y FÍSICAS
function updateMovement() {
    const speed = 16; // Velocidad de avance horizontal del nivel

    // 1. Movimiento Horizontal
    if (keys.Right) {
        virtualScrollY = Math.min(maxScrollValue, virtualScrollY + speed);
    }
    if (keys.Left) {
        virtualScrollY = Math.max(0, virtualScrollY - speed);
    }

    // 2. Mecánica de Salto y Gravedad (Consistente y unificada)
    if (keys.Up && !physics.isJumping) {
        physics.vy =- physics.jumpImpulse; // Reducimos ligeramente el impulso inicial (antes 15) para controlar la parábola
        physics.isJumping = true;
    }

    if (physics.isJumping) {
        // Ajustamos la gravedad a 0.55 (antes 0.7) para que el personaje flote de forma 
        // más natural y compense el retraso visual del movimiento de cámara (lerp)
        physics.vy += physics.gravity; 
        physics.y -= physics.vy;

        // Comprobación de colisión con el suelo estable
        if (physics.y <= 0) {
            physics.y = 0;
            physics.vy = 0;
            physics.isJumping = false;
        }
    }

    // Sincronizar el target con el avance virtual seguro
    target = maxScrollValue > 0 ? virtualScrollY / maxScrollValue : 0;
    
    if (target > 0.02 && hint) hint.style.opacity = '0';

    // 3. Aplicar la posición del salto usando 'current' en lugar de un cambio instantáneo
    if (character) {
        // Al aplicar la elevación con un pequeño suavizado o multiplicándola limpiamente,
        // la GPU empareja perfectamente el movimiento vertical con el horizontal del parallax.
        character.style.transform = `translateX(-50%) translateY(${-physics.y}px)`;
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
  if (p < 0.42) setAccent('videojuegos');
  else if (p < 0.74) setAccent('unity');
  else setAccent('concept');

  if (typeof projects !== 'undefined') {
    let near = -1;
    projects.forEach((proj, i) => { if (Math.abs(p - proj.at) < 0.06) near = i; });
    if (near !== activeProject) {
      activeProject = near;
      if (near === -1 && card) card.classList.remove('show');
      else showCard(near);
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

/* --- CONFIGURACIÓN DE LA CRUCETA VISUAL (MÓVIL / CLICS) --- */
const setupDpad = () => {
    const btnUp = document.getElementById('pad-up');
    const btnLeft = document.getElementById('pad-left');
    const btnRight = document.getElementById('pad-right');

    if(!btnUp || !btnLeft || !btnRight) return;

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

// Deshabilitamos la escucha nativa del scroll del navegador para controlar el flujo por inputs
window.addEventListener('resize', () => { layout(); });

// Inicialización inicial limpia
layout();
setupDpad();
requestAnimationFrame(loop);