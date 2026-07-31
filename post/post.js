document.addEventListener('DOMContentLoaded', () => {
  const postsListEl = document.getElementById('posts-list');
  const postTitleEl = document.getElementById('post-title');
  const postMetaEl = document.getElementById('post-meta');
  const postTagsEl = document.getElementById('post-tags');
  const postContentEl = document.getElementById('post-content');

  if (!postsData || postsData.length === 0) return;

  // 1. Renderizar la lista lateral de Posts
  function renderSidebar() {
    postsListEl.innerHTML = '';

    postsData.forEach((post, index) => {
      const li = document.createElement('li');
      if (index === 0) li.classList.add('active');

      li.innerHTML = `
        <div class="post-item-title">${post.title}</div>
        <div class="post-item-date">${post.date}</div>
      `;

      li.addEventListener('click', () => {
        document.querySelectorAll('aside li').forEach(el => el.classList.remove('active'));
        li.classList.add('active');
        loadPost(post);
      });

      postsListEl.appendChild(li);
    });
  }

  // 2. Cargar un post en el panel de la derecha
  function loadPost(post) {
    postTitleEl.textContent = post.title;
    postMetaEl.textContent = `${post.date} · Por Adrián Gómez-Lobo Núñez`;

    // Tags
    postTagsEl.innerHTML = '';
    if (post.tags) {
      post.tags.forEach(t => {
        const tagSpan = document.createElement('span');
        tagSpan.className = 'tag';
        tagSpan.textContent = t;
        postTagsEl.appendChild(tagSpan);
      });
    }

    // Contenido
    postContentEl.innerHTML = post.content;
  }

  // Cargar el primer post por defecto
  renderSidebar();
  loadPost(postsData[0]);
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