const connectedBody = document.getElementById("connected-body");
const countConnected = document.getElementById("count-connected");
const countOk = document.getElementById("count-ok");
const countError = document.getElementById("count-error");

function renderConnected(data) {
  const players = data.players ?? [];

  countConnected.textContent = `Cantidad conectados: ${data.count ?? players.length}`;
  countOk.textContent = `Jugadores OK: ${data.playersOk ?? 0}`;
  countError.textContent = `Jugadores con error: ${data.playersWithError ?? 0}`;

  if (players.length === 0) {
    connectedBody.innerHTML = '<tr><td colspan="6">No hay jugadores conectados.</td></tr>';
    return;
  }

  connectedBody.innerHTML = players
    .map(
      (player) => `
      <tr>
        <td>${player.id}</td>
        <td>${player.name}</td>
        <td>${player.frontModule}</td>
        <td>${player.backModule}</td>
        <td><span class="status-pill ${player.status === "OK" ? "ok" : "error"}">${player.status}</span></td>
        <td>${player.lastError || "-"}</td>
      </tr>`,
    )
    .join("");
}

async function loadConnectedPlayers() {
  try {
    const response = await fetch("/api/admin/players");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    renderConnected(data);
  } catch (error) {
    connectedBody.innerHTML = '<tr><td colspan="6">Error cargando jugadores.</td></tr>';
    console.error(error);
  }
}

loadConnectedPlayers();
setInterval(loadConnectedPlayers, 5000);
