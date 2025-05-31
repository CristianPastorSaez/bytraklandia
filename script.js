function minecraft_server() {
  if (confirm("¿Quieres unirte al servidor de Minecraft? Esto copiará la IP y abrirá Minecraft.")) {
    const ipServidor = "158.179.214.141:25565";

    // Copiar la IP al portapapeles
    navigator.clipboard.writeText(ipServidor)
      .then(() => {
        document.getElementById("copiado-texto").style.display = "block";
        setTimeout(() => {
          document.getElementById("copiado-texto").style.display = "none";
        }, 3000);

        // Intentar abrir Minecraft con el esquema URI
        const minecraftLink = `minecraft://?addExternalServer=ServidorPersonal|${ipServidor}`;
        window.location.href = minecraftLink;

        // Mostrar mensaje para abrir Minecraft manualmente si no funciona
        setTimeout(() => {
          alert(`La IP del servidor (${ipServidor}) se ha copiado al portapapeles. Si Minecraft no se abre automáticamente, ábrelo manualmente y pega la IP en la sección de servidores.`);
        }, 500);
      })
      .catch(() => {
        alert("No se pudo copiar la IP al portapapeles. Por favor, cópiala manualmente: " + ipServidor);
      });
  }
}

function comprobarServidor() {
  fetch("https://api.mcsrvstat.us/2/158.179.214.141")
    .then(response => response.json())
    .then(data => {
      const checkbox = document.getElementById("checkbox-active");
      const estadoDiv = document.getElementById("estado-servidor");

      if (data.online) {
        checkbox.checked = true;
        estadoDiv.innerHTML = `
          <p class="online">🟢 ¡Servidor online!</p>
          <p>Jugadores conectados: <strong>${data.players.online}</strong> / <strong>${data.players.max}</strong></p>
        `;
      } else {
        checkbox.checked = false;
        estadoDiv.innerHTML = `
          <p class="offline">🔴 Servidor offline</p>
        `;
      }

      checkbox.onclick = (e) => {
        e.preventDefault();
        return false;
      };
    })
    .catch(error => {
      console.error("Error al consultar el estado del servidor:", error);
    });
}

function mostrarUptime() {
  fetch("https://www.bytraklandia.com/uptime")
    .then(response => response.json())
    .then(data => {
      const uptimeSpan = document.getElementById("server-uptime");
      uptimeSpan.textContent = data.uptime || "(No disponible)";
    })
    .catch(() => {
      const uptimeSpan = document.getElementById("server-uptime");
      uptimeSpan.textContent = "(No disponible)";
    });
}

function cargarMods() {
  fetch('https://www.bytraklandia.com/list-mods')
    .then(response => response.json())
    .then(data => {
      const modsListNuevos = document.getElementById('mods-list-nuevos');
      const modsListAntiguos = document.getElementById('mods-list-antiguos');
      const descargarTodosBtn = document.querySelector('#mods-actualizacion .minecraft-btn');
      const noModsMessage = document.getElementById('no-mods-message');

      modsListNuevos.innerHTML = '';
      modsListAntiguos.innerHTML = '';

      data.nuevos.forEach(mod => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = `https://www.bytraklandia.com/download-mod/${mod.name}`;
        link.textContent = mod.name;
        link.setAttribute('download', mod.name);
        listItem.appendChild(link);
        modsListNuevos.appendChild(listItem);
      });

      data.antiguos.forEach(mod => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = `https://www.bytraklandia.com/download-mod/${mod.name}`;
        link.textContent = mod.name;
        link.setAttribute('download', mod.name);
        listItem.appendChild(link);
        modsListAntiguos.appendChild(listItem);
      });

      // Verificar si hay mods nuevos y actualizar visibilidad
      if (data.nuevos.length === 0) {
        descargarTodosBtn.style.display = 'none';
        noModsMessage.style.display = 'block';
      } else {
        descargarTodosBtn.style.display = 'inline-block';
        noModsMessage.style.display = 'none';
      }
    })
    .catch(error => {
      console.error('Error al cargar los mods:', error);
    });
}

document.addEventListener('DOMContentLoaded', () => {
  comprobarServidor();
  cargarMods();
  mostrarUptime();

  const switchElement = document.getElementById('switch');
  if (switchElement) {
    switchElement.checked = true;
  }

  // Evento para el toggle de mods antiguos
  const toggleAntiguos = document.getElementById('toggle-antiguos');
  const containerAntiguos = document.getElementById('mods-antiguos-container');
  if (toggleAntiguos && containerAntiguos) {
    toggleAntiguos.addEventListener('click', () => {
      if (containerAntiguos.classList.contains('show')) {
        containerAntiguos.classList.remove('show');
        toggleAntiguos.textContent = 'Ver más ▼';
      } else {
        containerAntiguos.classList.add('show');
        toggleAntiguos.textContent = 'Ver menos ▲';
      }
    });
  }
});

setInterval(comprobarServidor, 15000); // cada 15 segundos
setInterval(mostrarUptime, 60000); // actualizar uptime cada minuto

function goHome() {
  window.location.href = "index.html";
}

function goRedes() {
  window.location.href = "redes.html";
}

function goDescargar() {
  window.open("https://tlauncher.org", "_blank");
}

function goServer() {
  window.location.href = "server.html";
}

function Oculus() {
  window.open("https://mediafilez.forgecdn.net/files/4578/744/oculus-mc1.18.2-1.6.4.jar");
}

function Rubidium() {
  window.open("https://mediafilez.forgecdn.net/files/4494/903/rubidium-0.5.6.jar");
}

function abrirPopup() {
  const popup = document.getElementById("popup-contacto");
  popup.style.display = "flex"; // Mostrar el popup
}

function cerrarPopup() {
  const popup = document.getElementById("popup-contacto");
  popup.classList.add("closing"); // Añadir la clase de cierre

  // Esperar a que termine la animación antes de ocultar el popup
  const handleAnimationEnd = (event) => {
    if (event.animationName === "popup-close") {
      popup.style.display = "none"; // Ocultar el popup
      popup.classList.remove("closing"); // Eliminar la clase de cierre
      popup.removeEventListener("animationend", handleAnimationEnd); // Limpiar el evento
    }
  };
  popup.addEventListener("animationend", handleAnimationEnd);
}

function reproducirMusica() {
  const musicas = ["musica1", "musica2", "musica3"];
  const randomIndex = Math.floor(Math.random() * musicas.length);
  const musicaSeleccionada = document.getElementById(musicas[randomIndex]);

  // Pausar todas las músicas antes de reproducir una nueva
  musicas.forEach(id => {
    const musica = document.getElementById(id);
    if (musica) {
      musica.pause();
      musica.currentTime = 0;
    }
  });

  if (musicaSeleccionada.paused) {
    musicaSeleccionada.play();
    document.getElementById("play-music-btn").innerHTML = "⏸️";
  } else {
    musicaSeleccionada.pause();
    document.getElementById("play-music-btn").innerHTML = "🎵";
  }
}

function descargarTodos(tipo) {
  const url = `https://www.bytraklandia.com/download-all/${tipo}`;
  window.open(url, '_blank');
}
