// --- COMIENZO DEL ARCHIVO script.js ---

// *** TIEMPOS DEFINIDOS ***
const TIEMPO_CARTA_MS = 3000; // 3 segundos para cartas normales
const TIEMPO_IMPOSTOR_MS = 2000; // 2 segundos para el zoom del impostor

const cartas = [
    { nombre: "Príncipe 🐎", imagen: "principe.png" },
    { nombre: "Mini P.E.K.K.A ⚔️", imagen: "mini_pekka.png" },
    { nombre: "Mosquetera 🎯", imagen: "mosquetera.png" },
    { nombre: "Bruja 🧙‍♀️", imagen: "bruja.png" },
    { nombre: "Mago Eléctrico ⚡", imagen: "mago_electrico.png" },
    { nombre: "Gigante 🏰", imagen: "gigante.png" },
    { nombre: "Caballero 🗡️", imagen: "caballero.png" },
    { nombre: "Princesa 👸", imagen: "princesa.png" },
    { nombre: "Dragón Infernal 🔥", imagen: "dragon_infernal.png" },
    { nombre: "Montapuercos 🐖", imagen: "montapuercos.png" },
    { nombre: "P.E.K.K.A 🤖", imagen: "pekka.png" },
    { nombre: "Esbirros 🐦", imagen: "esbirros.png" },
    { nombre: "Bebé Dragón 🐉", imagen: "bebe_dragon.png" },
    { nombre: "Barril de Duendes 🥁", imagen: "barril_duendes.png" },
    { nombre: "Gólem 🪨", imagen: "golem.png" },
    { nombre: "Leñador 🪓", imagen: "lenador.png" },
    { nombre: "Sabueso de Lava 🐶🔥", imagen: "sabueso_lava.png" },
    { nombre: "Globo Bombástico 🎈💣", imagen: "globo_bombastico.png" },
    { nombre: "Duendes con Lanza 🎯", imagen: "duendes_lanza.png" },
    { nombre: "Megaesbirro 🦅", imagen: "megaesbirro.png" },
    { nombre: "Cañón con Ruedas 🏰", imagen: "canon_ruedas.png" },
    { nombre: "Barril de Bárbaros 🥁🗡️", imagen: "barril_barbaros.png" },
    { nombre: "Bruja Nocturna 🌙", imagen: "bruja_nocturna.png" },
    { nombre: "Cementerio ⚰️", imagen: "cementerio.png" },
    { nombre: "Dragón Eléctrico 🐉⚡", imagen: "dragon_electrico.png" }
];

let jugadores = [];
let cartasAsignadas = [];
let impostorIndex = 0; 
let ronda = 1;
let juegoIniciado = false; 
let poolImpostores = [];
let poolIniciaRonda = [];
let poolCartas = []; // ✅ NUEVA VARIABLE: Pool de cartas para evitar repetición
let cartaMostrada = false;

const MIN_JUGADORES = 3;
const MAX_JUGADORES = 15;

const audio = document.getElementById("audio");
const btnMusica = document.getElementById("btnMusica"); 
const cartaCentral = document.getElementById("carta-central");
const body = document.body;


// ---------------- LECTURA DE JUGADORES ----------------
function getJugadores() {
  return Array.from(document.querySelectorAll("#jugadores-container input"))
              .map(i => i.value || "Jugador");
}

// ---------------- GESTIÓN DE ESTADO Y BOTONES ----------------
function actualizarEstadoBotones(iniciado){
    juegoIniciado = iniciado;
    
    // Controla la clase principal para el CSS
    if (iniciado) {
        body.classList.add('game-active');
    } else {
        body.classList.remove('game-active');
    }
    
    // Botones de Configuración
    document.getElementById("btnStar").style.display = iniciado ? 'none' : 'inline-block';
    document.getElementById("btnAnadir").style.display = iniciado ? 'none' : 'inline-block';
    
    // Botones de Juego
    document.getElementById("btnNuevaRonda").style.display = iniciado ? 'inline-block' : 'none';
    document.getElementById("btnFinalizar").style.display = iniciado ? 'inline-block' : 'none';
    
    // Control de Inputs
    document.querySelectorAll("#jugadores-container input").forEach(input => {
        input.disabled = iniciado; 
    });
}


// ---------------- FUNCIONES DE LA INTERFAZ ----------------
function agregarJugador(){
  if(juegoIniciado) return;
  const container = document.getElementById("jugadores-container");
  const currentCount = container.querySelectorAll(".jugador-div").length;
  if(currentCount >= MAX_JUGADORES){ alert(`Máximo ${MAX_JUGADORES} jugadores`); return; }

  const div = document.createElement("div");
  div.className = "jugador-div";
  // Los botones Ver Carta y Eliminar son controlados por la clase .game-active del body
  div.innerHTML = `<input type="text" placeholder="Jugador ${currentCount+1}" title="Nombre del Jugador ${currentCount+1}">
                   <button class="btn azul" onclick="toggleCarta(${currentCount})">Ver Carta</button>
                   <button class="eliminar" onclick="eliminarJugador(${currentCount})">🗑️</button>`;
  container.appendChild(div);

  reiniciarRondas();
}

function eliminarJugador(index){
  if(juegoIniciado) return;
  const container = document.getElementById("jugadores-container");
  const jugadoresDiv = container.querySelectorAll(".jugador-div");
  if(jugadoresDiv.length <= MIN_JUGADORES){ alert(`Debe haber al menos ${MIN_JUGADORES} jugadores`); return; }
  const div = jugadoresDiv[index];
  if(div) container.removeChild(div);
  
  // Reasigna los índices
  Array.from(container.querySelectorAll(".jugador-div")).forEach((div, i) => {
    div.querySelector(".btn.azul").setAttribute('onclick', `toggleCarta(${i})`);
    div.querySelector(".eliminar").setAttribute('onclick', `eliminarJugador(${i})`);
  });

  reiniciarRondas();
}

// ---------------- LÓGICA DEL JUEGO ----------------
function generarPoolImpostores(){
  jugadores = getJugadores();
  poolImpostores = jugadores.map((_,i)=>i);
  poolImpostores.sort(()=>Math.random()-0.5);
}

function generarPoolInicioRonda(){
  jugadores = getJugadores();
  poolIniciaRonda = jugadores.map((_,i)=>i);
  poolIniciaRonda.sort(()=>Math.random()-0.5);
}

/** ✅ NUEVA FUNCIÓN: Inicializa y mezcla el pool de cartas. */
function generarPoolCartas(){
    // Crea una copia de las cartas y las mezcla.
    poolCartas = [...cartas]; 
    poolCartas.sort(()=>Math.random()-0.5);
}


function reiniciarRondas(){
  jugadores = getJugadores();
  ronda = 1;
  
  // ✅ MODIFICADO: Genera el pool de cartas al iniciar/reiniciar
  generarPoolCartas();
  generarPoolImpostores();
  generarPoolInicioRonda();
  
  if (poolImpostores.length > 0) {
      impostorIndex = poolImpostores.pop();
  } else {
      generarPoolImpostores();
      if (poolImpostores.length > 0) impostorIndex = poolImpostores.pop();
  }
  
  asignarCartas();
  actualizarContador();
}

/** ✅ FUNCIÓN MODIFICADA: Usa la próxima carta del pool. */
function asignarCartas(){
  // Extrae la última carta del pool. Si el pool está vacío, siguienteRonda lo regenera.
  const cartaComunObjeto = poolCartas.pop();

  cartasAsignadas = [];
  for(let i=0;i<jugadores.length;i++){
    if(i===impostorIndex){
      cartasAsignadas[i] = "IMPOSTOR"; 
    } else {
      // Asigna la carta única de esta ronda
      cartasAsignadas[i] = cartaComunObjeto;
    }
  }
}

// *** FUNCIÓN DE FASE: Iniciar el juego (STAR) ***
function iniciarJuego(){
    jugadores = getJugadores();
    if(jugadores.length < MIN_JUGADORES){ 
        alert(`¡Alerta! Se necesitan al menos ${MIN_JUGADORES} jugadores para presionar STAR.`); 
        return; 
    }
    
    actualizarEstadoBotones(true); // Cambia a modo JUEGO
    
    // Prepara la primera ronda
    reiniciarRondas(); 
    
    // Determina quién empieza
    if(poolIniciaRonda.length===0) generarPoolInicioRonda();
    const indexEmpieza = poolIniciaRonda.pop();
    const jugadorEmpieza = jugadores[indexEmpieza];
    
    document.getElementById("resultado").innerHTML = `<p>¡Juego Iniciado! Empieza la ronda: <strong>${jugadorEmpieza}</strong></p>`;
    document.getElementById("contadorRonda").innerText = `Ronda 1/${jugadores.length}`;
}

// *** FUNCIÓN DE FASE: Siguiente Ronda ***
function siguienteRonda(){
    if(!juegoIniciado){
        alert("¡Presiona STAR para iniciar la partida primero!");
        return;
    }
    
    jugadores = getJugadores();
    
    // Asegura el ciclo de jugadores que empiezan la ronda
    if(poolIniciaRonda.length===0) generarPoolInicioRonda();
    const indexEmpieza = poolIniciaRonda.pop();
    const jugadorEmpieza = jugadores[indexEmpieza];

    // Asegura el ciclo de impostores
    if(poolImpostores.length===0) generarPoolImpostores();
    impostorIndex = poolImpostores.pop();
    
    // ✅ MODIFICADO: Si el pool de cartas se agotó, lo regenera para un nuevo ciclo
    if(poolCartas.length===0) generarPoolCartas();

    asignarCartas();
    ronda = 1; // Reinicia el contador de turnos dentro de la ronda mayor
    actualizarContador();

    document.getElementById("resultado").innerHTML = `<p>¡NUEVA RONDA! El turno para ver la carta es de: <strong>${jugadorEmpieza}</strong></p>`;
}

// *** FUNCIÓN DE FASE: Finalizar juego ***
function finalizarJuego(){
    if(!confirm("¿Estás seguro de que deseas finalizar la partida?")) return;
    
    actualizarEstadoBotones(false); // Cambia a modo CONFIGURACIÓN
    reiniciarRondas();
    document.getElementById("resultado").innerHTML = `<p>✨ Partida Finalizada. Configura los jugadores y presiona STAR.</p>`;
    actualizarContador(); 
}

// *** FUNCIÓN CLAVE: Ver Carta (Turno) ***
function toggleCarta(index){
  if(!juegoIniciado) {
      alert("¡El juego no ha iniciado! Presiona STAR.");
      return;
  }
  if(cartaMostrada) return;
  cartaMostrada = true;

  const nombreJugador = jugadores[index];
  const asignacion = cartasAsignadas[index];
  const esImpostor = (asignacion === "IMPOSTOR"); 
  const flash = document.getElementById("impostor-flash");

  cartaCentral.classList.remove("impostor-show", "show");

  let contenidoHTML = `<h2>${nombreJugador}</h2>`;
  let tiempoDuracion;
  
  if (esImpostor) {
      cartaCentral.classList.add("impostor-show");
      tiempoDuracion = TIEMPO_IMPOSTOR_MS;
      flash.classList.add('active'); 
      contenidoHTML += `<p class="impostor large-role">🎯 ¡ERES EL IMPOSTOR!</p>`;
  } else {
      cartaCentral.classList.add("show");
      tiempoDuracion = TIEMPO_CARTA_MS;
      contenidoHTML += `<img src="cartas/${asignacion.imagen}" alt="${asignacion.nombre}" class="carta-imagen">`;
      contenidoHTML += `<p class="carta">${asignacion.nombre}</p>`; 
  }

  cartaCentral.innerHTML = contenidoHTML;

  setTimeout(()=>{
    cartaCentral.classList.remove("impostor-show", "show"); 
    cartaMostrada = false;
    
    if (esImpostor) {
        setTimeout(() => { flash.classList.remove('active'); }, 500); 
    }
    
    // === LÓGICA DE TURNO: Pasa el dispositivo ===
    const totalJugadores = jugadores.length;
    const siguienteIndex = (index + 1) % totalJugadores;
    const siguienteJugador = jugadores[siguienteIndex];
    
    // Muestra el mensaje de turno y esconde la carta central
    
    if (ronda < totalJugadores) {
        // Aún quedan jugadores por ver la carta
        ronda++;
        document.getElementById("resultado").innerHTML = 
            `<p style="font-size: 20px;">¡CARTA VISTA! 🤫 Entrégale el dispositivo a: <strong>${siguienteJugador}</strong></p>`;
    } else {
        // Todos han visto su carta
        document.getElementById("resultado").innerHTML = 
            `<p style="font-size: 20px; color: #7FFF00; border-color: #7FFF00;">✨ ¡TODOS VIERON SU CARTA! Momento de Debatir. Presiona 'Nueva Ronda' o 'Finalizar'.</p>`;
    }
    
    actualizarContador();
    
  }, tiempoDuracion);
}

// ---------------- CONTROL DE AUDIO SIMPLE ----------------
function toggleMusica(){
  if(audio.paused){
    audio.play().catch(()=>{});
    btnMusica.innerText = '🔊';
    btnMusica.classList.remove('musica-off');
    if(audio.volume === 0) audio.volume = 0.5; 
  } else {
    audio.pause();
    btnMusica.innerText = '🔇';
    btnMusica.classList.add('musica-off');
  }
}

function actualizarContador(){
  const total = jugadores.length;
  // Muestra la ronda actual (turno)
  document.getElementById("contadorRonda").innerText = `Turno ${ronda}/${total}`;
}

// ---------------- INICIALIZACIÓN ----------------

// 1. Inicializa los jugadores en la interfaz
for(let i=0;i<MIN_JUGADORES;i++){ agregarJugador(); }

// 2. Control del Overlay de inicio
document.getElementById('inicioOverlay').addEventListener('click',()=>{
  audio.volume = 0.5;
  audio.play().catch(()=>{}); 
  
  document.getElementById('inicioOverlay').style.display='none';
  btnMusica.innerText = '🔊'; 
  btnMusica.classList.remove('musica-off');
  
  // Establece el estado inicial: Configuración
  actualizarEstadoBotones(false); 
  reiniciarRondas();
  document.getElementById("resultado").innerHTML = `Escribe los nombres de los jugadores y presiona STAR.`;
});

// --- FIN DEL ARCHIVO script.js ---
