const status = document.getElementById("status");
const resetButton = document.getElementById("reset-btn");
const battleButton = document.getElementById("battle-btn");
const battleTimer = document.getElementById("battle-timer");
const playersBody = document.getElementById("players-body");
const connectedCount = document.getElementById("connected-count");

let startedAt = null;

function formatElapsedTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function setStatus(message, isError = false) {
  status.textContent = message;
  status.className = isError ? "status error" : "status";
}

function updateBattleUI(battle) {
  battleButton.textContent = battle.active ? "Parar partida" : "Iniciar partida";
  startedAt = battle.active ? battle.startedAt : null;
  if (!battle.active) {
    battleTimer.textContent = "Tiempo activo: 00:00";
  }
}

function renderPlayers(players) {
  if (players.length === 0) {
    playersBody.innerHTML = '<tr><td colspan="4">No hay jugadores conectados.</td></tr>';
    return;
  }

  playersBody.innerHTML = players
    .map(
      (player) => `
      <tr>
        <td>${player.name}</td>
        <td>${player.frontModule}</td>
        <td>${player.backModule}</td>
        <td><span class="status-pill ${player.status === "OK" ? "ok" : "error"}">${player.status}</span></td>
      </tr>`,
    )
    .join("");
}

async function loadBattleStatus() {
  const response = await fetch("/api/admin/battle");
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  updateBattleUI(data.battle);
}

async function loadPlayers() {
  const [playersResponse, countResponse] = await Promise.all([
    fetch("/api/admin/players"),
    fetch("/api/admin/players/count"),
  ]);
  if (!playersResponse.ok) throw new Error(`HTTP ${playersResponse.status}`);
  if (!countResponse.ok) throw new Error(`HTTP ${countResponse.status}`);

  const playersData = await playersResponse.json();
  const countData = await countResponse.json();
  connectedCount.textContent = `Conectados: ${countData.count ?? 0}`;
  renderPlayers(playersData.players ?? []);
}

resetButton.addEventListener("click", async () => {
  setStatus("Reiniciando variables...");
  try {
    const response = await fetch("/sendReset", { method: "POST" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    setStatus("Variables reiniciadas correctamente.");
  } catch (error) {
    setStatus("No se pudo reiniciar. Revisa el servidor.", true);
    console.error(error);
  }
});

battleButton.addEventListener("click", async () => {
  setStatus("Actualizando estado de partida...");
  try {
    const response = await fetch("/api/admin/battle/toggle", { method: "POST" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    updateBattleUI(data.battle);
    setStatus(data.battle.active ? "Partida iniciada." : "Partida detenida.");
  } catch (error) {
    setStatus("No se pudo cambiar el estado de partida.", true);
    console.error(error);
  }
});

setInterval(() => {
  if (!startedAt) return;
  battleTimer.textContent = `Tiempo activo: ${formatElapsedTime(Date.now() - startedAt)}`;
}, 1000);

async function initializeDashboard() {
  setStatus("Cargando datos...");
  try {
    await Promise.all([loadBattleStatus(), loadPlayers()]);
    setStatus("Dashboard actualizado.");
  } catch (error) {
    setStatus("No se pudieron cargar los datos del dashboard.", true);
    console.error(error);
  }
}

initializeDashboard();
setInterval(loadPlayers, 5000);
