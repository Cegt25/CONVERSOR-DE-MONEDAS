// Pega aquí la clave que copiaste de la página web
const API_KEY = 'e0dec1615c560ae8aefdca00';

// NUEVA FUNCIÓN: Intercambia monedas y ejecuta la animación
function intercambiarMonedas() {
  const origen = document.getElementById('moneda-origen');
  const destino = document.getElementById('moneda-destino');
  const icono = document.querySelector('.icon');

  // 1. Intercambiamos los valores (lo hacemos de forma asíncrona para que la UI se actualice primero)
  const temporal = origen.value;
  origen.value = destino.value;
  destino.value = temporal;

  // 2. Iniciamos la animación
  icono.classList.add('icon-swap-animate');

  // Eliminamos la clase de animación después de que termine para que pueda reutilizarse
  // El tiempo (600ms) debe coincidir con el tiempo de transición en CSS
  setTimeout(() => {
    icono.classList.remove('icon-swap-animate');
  }, 600); // 0.6s = 600ms

  // 3. Recalculamos la conversión inmediatamente
  // (Asumimos que tu función de cálculo se llama convertirMoneda y está definida)
  convertirMoneda();
}

async function convertirMoneda() {
  const monto = document.getElementById('monto').value;
  const origen = document.getElementById('moneda-origen').value;
  const destino = document.getElementById('moneda-destino').value;
  const resultadoDiv = document.getElementById('resultado');

  if (origen === destino) {
    resultadoDiv.innerText = "Por favor, elige monedas distintas.";
    return;
  }

  const nombreDelPar = `${origen}-${destino}`;
  resultadoDiv.innerText = "Calculando...";

  // CASO 1: EL USUARIO TIENE INTERNET
  if (navigator.onLine) {
    try {
      // Usamos la nueva URL de ExchangeRate-API con tu clave y las monedas
      const respuesta = await fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/pair/${origen}/${destino}`);
      const datos = await respuesta.json();
      
      // Verificamos que la API no haya devuelto un error (ej. clave inválida)
      if (datos.result === "error") {
        resultadoDiv.innerText = "Error: Verifica tu API Key.";
        console.error("Error de la API:", datos['error-type']);
        return;
      }

      // La nueva API nos entrega la tasa en 'conversion_rate'
      const tasaDelDia = datos.conversion_rate;
      
      // Guardamos la tasa en la memoria del celular
      localStorage.setItem(nombreDelPar, tasaDelDia);
      
      // Calculamos el total
      const total = monto * tasaDelDia;
      resultadoDiv.innerText = `${monto} ${origen} = ${total.toFixed(2)} ${destino}`;
      
    } catch (error) {
      resultadoDiv.innerText = "Error al conectar con la API.";
      console.error(error);
    }
  } 
  // CASO 2: EL USUARIO NO TIENE INTERNET
  else {
    const tasaGuardada = localStorage.getItem(nombreDelPar);

    if (tasaGuardada) {
      const total = monto * parseFloat(tasaGuardada);
      resultadoDiv.innerText = `⚡ (Sin conexión) ${monto} ${origen} = ${total.toFixed(2)} ${destino}`;
    } else {
      resultadoDiv.innerText = `⚠️ No hay internet y nunca has convertido ${origen} a ${destino} antes.`;
    }
  }
}

// Escuchadores de eventos para la conexión
window.addEventListener('offline', () => {
  const resultadoDiv = document.getElementById('resultado');
  const boton = document.querySelector('button');
  resultadoDiv.innerText = "⚠️ Te has quedado sin conexión a internet.";
  boton.disabled = true;
  boton.style.background = "#cccccc"; 
  boton.style.cursor = "not-allowed";
});

window.addEventListener('online', () => {
  const resultadoDiv = document.getElementById('resultado');
  const boton = document.querySelector('button');
  resultadoDiv.innerText = "✅ Conexión restaurada. ¡Listo para convertir!";
  boton.disabled = false;
  boton.style.background = "#ff7eb3";
  boton.style.cursor = "pointer";
});

// 1. Seleccionamos el campo donde el usuario escribe el monto
// (Revisa que el ID en tu HTML sea 'monto'. Si le pusiste otro nombre, cámbialo aquí)
const inputMonto = document.getElementById('monto');

// 2. Le agregamos el "escuchador" para detectar cuando se presiona una tecla
inputMonto.addEventListener('keypress', function(event) {
  
  // 3. Verificamos si la tecla presionada fue "Enter"
  if (event.key === 'Enter') {
    
    // Evita que el navegador intente enviar un formulario por defecto (recargar la página)
    event.preventDefault(); 
    
    // 4. Ejecutamos tu función de conversión (asumiendo que se llama así)
    convertirMoneda(); 
  }
});