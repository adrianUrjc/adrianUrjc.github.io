/* =======================================================================
   BASE DE DATOS DE PUBLICACIONES / BLOG
   ======================================================================= */
const postsData = [
//   {
//     id: "group-values-load-system",
//     title: "Arquitectura de un Save System escalable en Unity",
//     date: "15 Mar 2026",
//     tags: ["Unity", "C#", "Architecture"],
//     summary: "Explicación de cómo sustituir PlayerPrefs por contenedores tipo-seguros basados en ScriptableObjects.",
//     content: `
//       <h2>1. Introducción al problema</h2>
//       <p>PlayerPrefs es suficiente para prototipos pequeños, pero carece de estructura cuando escalamos a inventarios o configuraciones avanzadas.</p>
      
//       <h2>2. Uso de SimpleGroupValues</h2>
//       <p>Para guardar valores rápidos con generics tipo-seguros de forma limpia:</p>
      
//       <div class="code-block">
//         <button class="copy-btn" onclick="copyCode(this)">Copy</button>
//         <pre><code><span class="kw-type">float</span> playerSpeed = <span class="kw-num">7.5f</span>;
// <span class="kw-func">SimpleGroupValues</span>.Set(<span class="kw-str">"speed"</span>, playerSpeed);</code></pre>
//       </div>

//       <p>Y para recuperarlos de forma segura en memoria:</p>

//       <div class="code-block">
//         <button class="copy-btn" onclick="copyCode(this)">Copy</button>
//         <pre><code><span class="kw-type">float</span> currentSpeed = <span class="kw-func">SimpleGroupValues</span>.Get&lt;<span class="kw-type">float</span>&gt;(<span class="kw-str">"speed"</span>);</code></pre>
//       </div>
//     `
//   },
 {
    id: "tile-painter-3d-unity",
    title: "01. Tile Painter de bloques en un grid 3D en Unity",
    date: "31 Jul 2026",
    tags: ["Unity", "C#", "Algorithms", "GameDev", "3D"],
    summary: "Diseño e implementación de un algoritmo de autodiseño de terreno 3D basado en Marching Cubes, Bitmasks y Bases Canónicas.",
    content: `
      <h2>1. El reto del terreno modular</h2>
      <p>
        Últimamente me planteaba cómo añadir terreno modular de una forma cómoda en una escena de Unity.
      </p>
      <p>
        Unity cuenta de forma nativa con una herramienta para rellenar un grid 2D. Sin embargo, no tiene sistemas avanzados de relleno de casillas como por ejemplo los que podemos ver en <em>Super Mario Maker</em>.
      </p>
      <p>
        Así que se me ocurrió la idea de montar un sistema por mi cuenta. Y bueno... los primeros resultados no fueron precisamente los esperados.
      </p>

      <!-- FOTO 1 -->
      <figure class="post-img-container">
        <img src="./references/tilepainter/foto1.png" alt="Primeros resultados del Tile Painter" class="post-img">
        <figcaption>Figura 1: Primeros intentos de generación de terreno en el grid.</figcaption>
      </figure>

      <h2>2. Adentrándome en los Marching Cubes</h2>
      <p>
        Que algo parezca sencillo no significa que sea fácil. Lo que ocurre es que hay tropecientos casos de conexiones entre los bloques y la lógica para lograr un resultado que satisfaga las restricciones es un pelín más compleja que un simple <code>switch</code> que compara todos los vecinos. De haberlo hecho así, aún estaría programando cada caso en un script interminable.
      </p>
      <p>
        Sin saberlo, me acababa de adentrar en el mundo de los <strong>Marching Cubes</strong>.
      </p>
      
      <blockquote>
        El algoritmo de <strong>Marching Cubes</strong> transforma la información de la superficie de un entorno discreto (valores enteros) en una malla poligonal continua.
      </blockquote>

      <p>
        Varios juegos de destrucción y creación de terreno implementan este algoritmo o variaciones del mismo; por ejemplo, <em>Donkey Kong Bananza</em>, <em>ASTRONEER</em> o <em>Subnautica</em> en sus fases tempranas de desarrollo. No sólo eso: también tiene aplicaciones vitales en el campo de la medicina para la visualización 3D de tomografías (TAC).
      </p>

      <!-- FOTO 2 -->
      <figure class="post-img-container">
        <img src="./references/tilepainter/foto2.png" alt="Ejemplos del algoritmo Marching Cubes" class="post-img">
        <figcaption>Figura 2: Ejemplos del algoritmo Marching Cubes y reconstrucción de mallas.</figcaption>
      </figure>

      

      <h2>3. La estructura lógica: Look Up Tables y Bases Canónicas</h2>
      <p>
        Perfecto, la descripción encajaba con lo que quería hacer: tengo la información de las adyacencias de un bloque central y quiero saber qué tipo de bloque colocar.
      </p>

      <!-- FOTO 3 -->
      <figure class="post-img-container">
        <img src="./references/tilepainter/foto3.png" alt="Información de adyacencias de un bloque" class="post-img">
        <figcaption>Figura 3: Consulta de adyacencias para determinar la topología del bloque.</figcaption>
      </figure>
      <p>
        Lo más conveniente para conocer qué clase de bloque colocar es consultar una especie de <strong>Look Up Table (LUT)</strong> donde estén registrados todos los casos posibles de adyacencias. Es tan sencillo como evaluar los vecinos y preguntarle a una función que traduzca el contexto y devuelva el bloque correcto.
      </p>
      <p>
        ¿Cómo represento las adyacencias? ¿Con una matriz de booleanos? ¿Una matriz cúbica quizás?
      </p>
      <p>
        Sí y no. Para mi solución utilicé matrices cuadradas 3x3 para cada capa (centrándome inicialmente en la capa intermedia). 
        Cada celda guarda un valor booleano (0 o 1). Pero eso no era suficiente. Pongamos el siguiente caso:
      </p>

      <!-- FOTO 4 -->
      <figure class="post-img-container">
        <img src="./references/tilepainter/foto4.png" alt="Caso de esquina en matriz 3x3" class="post-img">
        <figcaption>Figura 4: Ejemplo de grid para un bloque de esquina.</figcaption>
      </figure>

      <p>
        Sabemos que con los bloques adyacentes que rodean al centro debemos rellenar con una <strong>esquina</strong>. Apuntamos el caso a nuestra Look Up Table. Pero... ¿y si tenemos el mismo caso con una rotación de 90°?
      </p>

      <!-- FOTO 5 -->
      <figure class="post-img-container">
        <img src="./references/tilepainter/foto5.png" alt="Caso de esquina rotado 90 grados" class="post-img">
        <figcaption>Figura 5: El mismo caso de esquina tras una rotación de 90°.</figcaption>
      </figure>

      <p>
        Un único caso sencillo pasa a convertirse en 4 casos distintos al considerar las rotaciones de 90°, 180° y 270°. Es una locura intentar registrar cada variante.
      </p>
      <p>
        La solución: el uso de <strong>Bases Canónicas</strong>. Definimos el primer caso como nuestra base canónica. Si recibimos un estado rotado, rotamos la matriz de entrada hasta hacerla coincidir con la base canónica, registrando el número de giros para aplicar la rotación final al prefab o malla.
      </p>

      <p>
        Sin embargo, también hay que contemplar los que denomino <strong>casos espejo</strong>:
      </p>

      <!-- FOTOS 6 Y 7 -->
      <div class="post-img-group">
        <figure class="post-img-container">
          <img src="./references/tilepainter/foto6.png" alt="Caso espejo A" class="post-img">
          <figcaption>Figura 6: Variante simétrica A.</figcaption>
        </figure>
        <figure class="post-img-container">
          <img src="./references/tilepainter/foto7.png" alt="Caso espejo B" class="post-img">
          <figcaption>Figura 7: Variante simétrica B (requiere registro individual).</figcaption>
        </figure>
      </div>
      <p>
      Como contamos con casos simétricos hay que guardarlos de manera individual. Pero quedan incógnitas por resolver.
      </p>
      <p>
      ¿Se va a ir rotando una matriz 90° para cada iteración?¿Se van a comparar las 8 celdas en la LUT?
      </p>

      <h2>4. De la trasposición de matrices a las Bitmasks (O(1))</h2>
      <p>
        Rotar una matriz de booleanos evaluando celda por celda por cada rotación es costoso (O(n)). El peor caso implicaría múltiples comparaciones por cada celda modificada en el editor.
      </p>
      <p>
        Para resolver esto de forma óptima utilizo <strong>Bitmasks (máscaras de bits)</strong>.
      </p>
      <p>
        Cada estado de adyacencia de 8 vecinos se representa visualmente con un número de 8 bits (un byte), donde cada bit indica la presencia (1) o ausencia (0) de un bloque adyacente. La representación visual queda:
      </p>
       <!-- FOTO 8 -->
      <figure class="post-img-container">
        <img src="./references/tilepainter/foto8.png" alt="Representación visual de la Bitmask de 8 bit" class="post-img">
        <figcaption>Figura 8: Representación visual de la Bitmask de 8 bits.</figcaption>
      </figure>

      <p>
      Aplicando el mapeo a nuestro caso de ejemplo queda tal que así:
      </p>
      <!-- FOTO 9 -->
      <figure class="post-img-container">
        <img src="./references/tilepainter/foto9.png" alt="Mapeo de adyacencias 3x3 a una Bitmask de 8 bits." class="post-img">
        <figcaption>Figura 9: Mapeo de adyacencias 3x3 a una Bitmask de 8 bits.</figcaption>
      </figure>
      <p>
      Esto significa que el número que obtenemos por esta bitmask es 128*0 + 1*0 + 2*1 + 4*1 + 8*1 + 16*1 + 32*1 + 64*0 = <strong>62</strong>.
      Este número es el identificador que le dice a la LUT que tiene que devolver una esquina.
      </p>
      <p>
      ¿Y si tiene una rotación aplicada? Sale otro número ¿cómo conseguimos "rotar" a nuestra base canónica?
      </p>
      <p>
      La solución radica en desplazar los bits de nuestra bitmask.
      Así, el número 62 (00111110) equivale a los números 143 (10001111),227 (11100011) y 248 (11111000). El código para desplazar los bits es el siguiente:
      </p>
      <div class="code-block">
        <button class="copy-btn" onclick="copyCode(this)">Copy</button>
        <pre><code>
<span class="kw-com">// Rotar 90° en una bitmask de 8 bits equivale a desplazar los bits 2 posiciones</span>
<span class="kw-type">int</span> rotatedMask = ((mask &lt;&lt; <span class="kw-num">2</span>) | (mask &gt;&gt; (<span class="kw-num">8</span> - <span class="kw-num">2</span>)));</code></pre>
      </div>

      <p>
        Al desplazar los bits por software mediante operaciones a nivel de bit (bit-shift), rotar 90° pasa a ser una operación casi instantánea. Consultamos la LUT mediante un diccionario o array directo, logrando una complejidad de búsqueda <strong>O(1)</strong>.
      </p>

      <h2>5. Resultado y próximos pasos</h2>
      <p>
        Gracias a esta arquitectura que combina Marching Cubes, Bases Canónicas y Bitmasks se logra una herramienta ágil y fluida para pintar terreno en tiempo real dentro del editor de Unity:
      </p>

      <!-- VIDEO / DEMOSTRACIÓN -->
      <div class="post-video-container">
        <video controls class="post-video" poster="assets/posts/tile-painter/video-poster.png">
          <source src="./references/tilepainter/demo.mp4" type="video/mp4">
          Tu navegador no soporta vídeos HTML5.
        </video>
        <p class="video-caption">Demostración del Tile Painter 3D funcionando en tiempo real en Unity.</p>
      </div>

      <p>
        Pero este no es el final. Queda manejar los casos con distintas alturas, optimizar la generación de mallas combinadas y mucho más. ¡Esto es sólo el principio de la herramienta!
      </p>
    `
  }
];