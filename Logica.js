// ---------- Referencias a elementos ----------
const audio = document.getElementById('audio-principal');
const filas = document.querySelectorAll('.fila-cancion');
const btnPlay = document.getElementById('btn-play');
const btnSiguiente = document.getElementById('btn-siguiente');
const btnAnterior = document.getElementById('btn-anterior');
const btnAleatorio = document.getElementById('btn-aleatorio');
const btnRepetir = document.getElementById('btn-repetir');
const btnVolumen = document.getElementById('btn-volumen');
const btnDescargar = document.getElementById('btn-descargar');
const barraTiempo = document.getElementById('barra-tiempo');
const tiempoActual = document.getElementById('tiempo-actual');
const tiempoTotal = document.getElementById('tiempo-total');
const controlVolumen = document.getElementById('control-volumen');
const campoBusqueda = document.querySelector('.buscador input');

let indiceActual = 0;
let modoAleatorio = false;
let modoRepetir = false; // false = seguir lista | true = repetir la misma canción
let volumenAnterior = 1;
const lista = Array.from(filas);

// ---------- Utilidades ----------
function formatoTiempo(segundos){
  if (isNaN(segundos)) return '0:00';
  const m = Math.floor(segundos / 60);
  const s = Math.floor(segundos % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ---------- Cargar y reproducir canción ----------
function cargarCancion(indice, autoplay){
  lista.forEach(f => {
    f.classList.remove('activa');
    f.querySelector('.boton-fila').textContent = '▶';
  });

  const fila = lista[indice];
  fila.classList.add('activa');
  fila.querySelector('.boton-fila').textContent = '❚❚';

  const titulo = fila.dataset.titulo;
  const artista = fila.dataset.artista;
  const src = fila.dataset.src;

  document.getElementById('titulo-destacado').textContent = titulo;
  document.getElementById('autor-destacado').textContent = artista;
  document.getElementById('pie-titulo').textContent = titulo;
  document.getElementById('pie-artista').textContent = artista;

  audio.src = src;
  btnDescargar.onclick = () => {
    const enlace = document.createElement('a');
    enlace.href = src;
    enlace.download = '';
    enlace.click();
  };

  indiceActual = indice;

  if (autoplay){
    audio.play();
    btnPlay.textContent = '❚❚';
  } else {
    btnPlay.textContent = '▶';
  }
}

// ---------- Clic en una canción de la lista ----------
lista.forEach((fila, i) => {
  fila.addEventListener('click', () => cargarCancion(i, true));
});

// ---------- Play / Pausa ----------
btnPlay.addEventListener('click', () => {
  if (audio.paused){
    audio.play();
    btnPlay.textContent = '❚❚';
    lista[indiceActual].querySelector('.boton-fila').textContent = '❚❚';
  } else {
    audio.pause();
    btnPlay.textContent = '▶';
    lista[indiceActual].querySelector('.boton-fila').textContent = '▶';
  }
});

// ---------- Siguiente / Anterior (respetan el modo aleatorio) ----------
function elegirIndiceSiguiente(){
  if (modoAleatorio){
    let siguiente;
    do {
      siguiente = Math.floor(Math.random() * lista.length);
    } while (siguiente === indiceActual && lista.length > 1);
    return siguiente;
  }
  return (indiceActual + 1) % lista.length;
}

function elegirIndiceAnterior(){
  if (modoAleatorio){
    let anterior;
    do {
      anterior = Math.floor(Math.random() * lista.length);
    } while (anterior === indiceActual && lista.length > 1);
    return anterior;
  }
  return (indiceActual - 1 + lista.length) % lista.length;
}

btnSiguiente.addEventListener('click', () => cargarCancion(elegirIndiceSiguiente(), true));
btnAnterior.addEventListener('click', () => cargarCancion(elegirIndiceAnterior(), true));

// ---------- Aleatorio ----------
btnAleatorio.addEventListener('click', () => {
  modoAleatorio = !modoAleatorio;
  btnAleatorio.style.color = modoAleatorio ? 'var(--rosa)' : '';
});

// ---------- Repetir ----------
btnRepetir.addEventListener('click', () => {
  modoRepetir = !modoRepetir;
  btnRepetir.style.color = modoRepetir ? 'var(--rosa)' : '';
});

// ---------- Cuando termina una canción ----------
audio.addEventListener('ended', () => {
  if (modoRepetir){
    audio.currentTime = 0;
    audio.play();
  } else {
    cargarCancion(elegirIndiceSiguiente(), true);
  }
});

// ---------- Barra de progreso ----------
audio.addEventListener('timeupdate', () => {
  if (audio.duration){
    barraTiempo.value = (audio.currentTime / audio.duration) * 100;
    tiempoActual.textContent = formatoTiempo(audio.currentTime);
    tiempoTotal.textContent = formatoTiempo(audio.duration);
  }
});

barraTiempo.addEventListener('input', () => {
  if (audio.duration){
    audio.currentTime = (barraTiempo.value / 100) * audio.duration;
  }
});

// ---------- Volumen ----------
controlVolumen.addEventListener('input', () => {
  audio.volume = controlVolumen.value;
  btnVolumen.textContent = audio.volume == 0 ? '🔇' : '🔊';
});

btnVolumen.addEventListener('click', () => {
  if (audio.volume > 0){
    volumenAnterior = audio.volume;
    audio.volume = 0;
    controlVolumen.value = 0;
    btnVolumen.textContent = '🔇';
  } else {
    audio.volume = volumenAnterior || 1;
    controlVolumen.value = audio.volume;
    btnVolumen.textContent = '🔊';
  }
});

// ---------- Buscador (filtra por título o artista) ----------
if (campoBusqueda){
  campoBusqueda.addEventListener('input', () => {
    const texto = campoBusqueda.value.trim().toLowerCase();
    lista.forEach(fila => {
      const coincide =
        fila.dataset.titulo.toLowerCase().includes(texto) ||
        fila.dataset.artista.toLowerCase().includes(texto);
      fila.style.display = coincide ? 'flex' : 'none';
    });
  });
}

// ---------- Carga inicial sin reproducir ----------
cargarCancion(0, false);