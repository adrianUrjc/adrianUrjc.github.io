/* =======================================================================
   MOTOR — Mueve el mundo con el scroll, anima el HUD y muestra las tarjetas.
   ======================================================================= */
console.log("¡El script del motor ha arrancado!");

const spacer    = document.getElementById('scroll-spacer');
const stage     = document.getElementById('stage');
const world     = document.getElementById('world');
const character = document.getElementById('character');
const bar       = document.querySelector('.progress .bar');
const zoneLabel = document.querySelector('.hud .zone');
const card      = document.getElementById('card');
const far  = document.querySelector('.layer-far');
const mid  = document.querySelector('.layer-mid');
const sky1 = document.querySelector('.sky--1');
const sky2 = document.querySelector('.sky--2');
const sky3 = document.querySelector('.sky--3');
const hint = document.querySelector('.hint');
const root = document.documentElement;

// Comprobamos si las dependencias externas existen
if (typeof projects === 'undefined') console.error("❌ ERROR: 'projects' NO está definido. Revisa tu HTML.");
else console.log("✅ 'projects' cargado correctamente con", projects.length, "elementos.");

if (typeof ZONE === 'undefined') console.error("❌ ERROR: 'ZONE' NO está definido. Revisa tu HTML.");
else console.log("✅ 'ZONE' cargado correctamente.");

/* --- Animador de sprites por CANVAS --------------------------------------- */
const SPRITE_VER = '6'; // Subimos la versión para forzar al navegador a buscar la nueva ruta
const SPRITES = {
  walk: { el: character ? character.querySelector('canvas.walk') : null,
          src:'assets/sprites/UncleBellyAnimations/WalkSpriteSheet.png',
          cols:32, rows:1, frames:32, fps:29 },
  idle: { el: character ? character.querySelector('canvas.idle') : null,
          src:'assets/sprites/UncleBellyAnimations/UncleBellyIdle.png',
          cols:36, rows:1, frames:36, fps:11 }, 
};

for(const k in SPRITES){
  const s = SPRITES[k];
  if(!s.el) continue; // Si falta un canvas en el HTML, el script no se rompe
  
  s.ctx = s.el.getContext('2d');
  s.frame = 0; s.acc = 0; s.ready = false;
  const img = new Image();
  img.onload = ()=>{
    s.img = img;
    s.fw = img.naturalWidth / s.cols;   
    s.fh = img.naturalHeight / s.rows;  
    s.el.width = s.fw; s.el.height = s.fh;   
    s.ready = true;
    drawSprite(s);
  };
  img.src = s.src + '?v=' + SPRITE_VER;
}

function drawSprite(s){
  if(!s.ready || !s.ctx) return;
  const f = (s.frames - 1) - s.frame;            
  const col = f % s.cols, row = Math.floor(f / s.cols);
  s.ctx.clearRect(0, 0, s.el.width, s.el.height);
  s.ctx.drawImage(s.img, col*s.fw, row*s.fh, s.fw, s.fh, 0, 0, s.el.width, s.el.height);
}

let lastSpriteT = performance.now();
function stepSprites(now){
  const dt = now - lastSpriteT; lastSpriteT = now;
  if(reduceMotion) return;
  
  const walking = character ? character.classList.contains('walking') : false;
  
  for(const k in SPRITES){
    const s = SPRITES[k];
    if(!s.el) continue;
    
    // Intercambio de visibilidad de lienzos
    if(k === 'walk'){
      if(!walking) { s.el.style.display = 'none'; continue; }
      else { s.el.style.display = 'block'; }
    }
    if(k === 'idle'){
      if(walking) { s.el.style.display = 'none'; continue; }
      else { s.el.style.display = 'block'; }
    }
    
    s.acc += dt;
    const dur = 1000 / s.fps;
    let changed = false;
    while(s.acc >= dur){ s.acc -= dur; s.frame = (s.frame + 1) % s.frames; changed = true; }
    if(changed) drawSprite(s);
  }
}

const SCROLL_VIEWPORTS = 7;  
let charX = 0, worldTravel = 0;

function layout(){
  if(!spacer || !world) return;
  spacer.style.height = (window.innerHeight * SCROLL_VIEWPORTS) + 'px';
  charX = window.innerWidth * (window.innerWidth < 600 ? 0.18 : 0.26);
  worldTravel = window.innerWidth * (SCROLL_VIEWPORTS - 1);
  world.style.width = (worldTravel + window.innerWidth) + 'px';
  buildPosts();
}

function buildPosts(){
  if(!world || typeof projects === 'undefined' || typeof ZONE === 'undefined') return;
  world.innerHTML = '';
  projects.forEach(p=>{
    const post = document.createElement('div');
    post.className = 'post';
    post.style.left = (charX + p.at * worldTravel) + 'px';
    const z = ZONE[p.zone];
    if(z) {
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

let target=0, current=0, last=0, activeProject=-1, activeZone='';
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

function onScroll(){
  const max = document.documentElement.scrollHeight - window.innerHeight;
  target = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  if(target > 0.02 && hint) hint.style.opacity = '0';
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
  if(zoneLabel) zoneLabel.textContent = z.label;
  if(sky1) sky1.style.opacity = zoneKey==='videojuegos' ? 1 : 0;
  if(sky2) sky2.style.opacity = zoneKey==='unity'       ? 1 : 0;
  if(sky3) sky3.style.opacity = zoneKey==='concept'     ? 1 : 0;
}

function showCard(i){
  if(!card || typeof projects === 'undefined') return;
  const p = projects[i];
  if(!p) return;
  
  const badge = card.querySelector('.badge');
  const title = card.querySelector('h3');
  const meta = card.querySelector('.meta');
  const pText = card.querySelector('p');
  const media = card.querySelector('.media');
  const ph = card.querySelector('.placeholder');
  const links = card.querySelector('.links');

  if(badge) badge.textContent = p.tag;
  if(title) title.textContent = p.title;
  if(meta) meta.textContent = p.meta;
  if(pText) pText.textContent = p.desc;
  
  if(media) {
    if(p.img){ media.style.backgroundImage = `url('${p.img}')`; if(ph) ph.textContent=''; }
    else { media.style.backgroundImage=''; if(ph) ph.textContent = `[ assets/${p.zone}/ ]\nañade aquí tu captura o vídeo`; }
  }
  
  if(links) {
    links.innerHTML = '';
    p.links.forEach(l=>{ 
      const a=document.createElement('a'); a.href=l.u; a.textContent=l.t;
      if(l.ghost) a.className='ghost'; links.appendChild(a); 
    });
  }
  card.classList.add('show');
}

function loop(){
  current += (target - current) * (reduceMotion ? 1 : 0.09);
  const p = current;

  stepSprites(performance.now());

  if(world) world.style.transform = `translateX(${-p * worldTravel}px)`;
  if(far) far.style.transform   = `translateX(${-p * worldTravel * 0.25}px)`;
  if(mid) mid.style.transform   = `translateX(${-p * worldTravel * 0.55}px)`;
  if(bar) bar.style.transform   = `scaleX(${p})`;

  const delta = p - last;
  const moving = Math.abs(delta) > 0.0003;
  if(character) {
    character.classList.toggle('walking', moving && !reduceMotion);
    if(delta < -0.0003) character.classList.add('flip');
    else if(delta > 0.0003) character.classList.remove('flip');
  }
  last = p;

  if(p < 0.42) setAccent('videojuegos');
  else if(p < 0.74) setAccent('unity');
  else setAccent('concept');

  if(typeof projects !== 'undefined'){
    let near = -1;
    projects.forEach((proj,i)=>{ if(Math.abs(p - proj.at) < 0.06) near = i; });
    if(near !== activeProject){
      activeProject = near;
      if(near === -1 && card) card.classList.remove('show');
      else showCard(near);
    }
  }

  requestAnimationFrame(loop);
}

/* --- INTRO SEGURO A PRUEBA DE ERRORES --- */
const startBtn = document.getElementById('start');
const introEl = document.getElementById('intro');

if(startBtn && introEl) {
  console.log("🎯 Botón de inicio e intro encontrados. Añadiendo evento click.");
  startBtn.addEventListener('click', () => {
    console.log("¡Click detectado! Ocultando intro...");
    introEl.style.display = 'none'; // Forzado drástico por si falla la clase CSS
    introEl.classList.add('hide');
    layout();
  });
} else {
  console.error("❌ ERROR CRÍTICO HTML: No existe un elemento con id='start' o id='intro' en tu HTML.");
}

const toEndBtn = document.getElementById('toEnd');
if(toEndBtn) {
  toEndBtn.addEventListener('click', e=>{
    e.preventDefault();
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior:'smooth' });
  });
}

window.addEventListener('scroll', onScroll, {passive:true});
window.addEventListener('resize', ()=>{ layout(); onScroll(); });

// Arrancar aunque falte projects o ZONE (para que al menos no se rompa la pantalla)
layout(); 
onScroll(); 
requestAnimationFrame(loop);