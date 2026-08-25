document.addEventListener('DOMContentLoaded', () => {
  const postsListEl = document.getElementById('posts-list');
  const postTitleEl = document.getElementById('post-title');
  const postMetaEl = document.getElementById('post-meta');
  const postTagsEl = document.getElementById('post-tags');
  const postContentEl = document.getElementById('post-content');

  if (!postsData || postsData.length === 0) return;

  // 1. LEER LA URL: Buscamos si hay un "?id=nombre-del-post"
  const urlParams = new URLSearchParams(window.location.search);
  const postIdFromUrl = urlParams.get('id');
  
  // Determinamos el post actual (el de la URL o el primero por defecto)
  let currentPost = postsData.find(p => p.id === postIdFromUrl) || postsData[0];

  // 2. RENDERIZAR LA BARRA LATERAL
  function renderSidebar() {
    postsListEl.innerHTML = '';

    postsData.forEach((post) => {
      const li = document.createElement('li');
      
      // Marcar como activo si es el post actual
      if (post.id === currentPost.id) li.classList.add('active');

      li.innerHTML = `
        <div class="post-item-title">${post.title}</div>
        <div class="post-item-date">${post.date}</div>
      `;

      li.addEventListener('click', () => {
        // Actualizar diseño del menú
        document.querySelectorAll('aside li').forEach(el => el.classList.remove('active'));
        li.classList.add('active');
        
        // Cargar contenido
        loadPost(post);

        // 🌟 MAGIA: Actualizar la URL del navegador sin recargar la página
        const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?id=${post.id}`;
        window.history.pushState({ id: post.id }, '', newUrl);
      });

      postsListEl.appendChild(li);
    });
  }

  // 3. CARGAR EL CONTENIDO DEL POST
  function loadPost(post) {
    currentPost = post; // Guardamos el estado del post activo
    postTitleEl.textContent = post.title;
    postMetaEl.textContent = `${post.date} · Por Adrián Gómez-Lobo Núñez`;

    // Renderizar Tags
    postTagsEl.innerHTML = '';
    if (post.tags) {
      post.tags.forEach(t => {
        const tagSpan = document.createElement('span');
        tagSpan.className = 'tag';
        tagSpan.textContent = t;
        postTagsEl.appendChild(tagSpan);
      });
    }

    // Inyectar HTML del contenido
    postContentEl.innerHTML = post.content;
    
    // (Opcional) Hacer scroll arriba al cambiar de post
    document.querySelector('main').scrollTo(0, 0);
  }

  // Inicializar la página por primera vez
  renderSidebar();
  loadPost(currentPost);
  
  // 4. SOPORTE DE NAVEGACIÓN: Detectar cuando el usuario pulsa "Atrás/Adelante" en el navegador
  window.addEventListener('popstate', () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const postToLoad = postsData.find(p => p.id === id) || postsData[0];
    
    // Actualizar visualmente la barra lateral y el contenido
    document.querySelectorAll('aside li').forEach((el, index) => {
        el.classList.toggle('active', postsData[index].id === postToLoad.id);
    });
    loadPost(postToLoad);
  });
});

// Función de copiar código
function copyCode(button) {
  const code = button.nextElementSibling.innerText;
  navigator.clipboard.writeText(code).then(() => {
    button.textContent = 'Copied!';
    button.style.background = '#059669';
    button.style.color = '#fff';
    setTimeout(() => {
      button.textContent = 'Copy';
      button.style.background = '#1c202d';
      button.style.color = '#9ca3af';
    }, 2000);
  });
}