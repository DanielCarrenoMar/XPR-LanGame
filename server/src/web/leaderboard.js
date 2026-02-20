const leaderboardBody = document.getElementById("leaderboard-body");
const leaderCount = document.getElementById("leader-count");

function renderLeaderboard(items) {
  leaderCount.textContent = `Jugadores en ranking: ${items.length}`;

  if (items.length === 0) {
    leaderboardBody.innerHTML = '<tr><td colspan="5">No hay jugadores conectados.</td></tr>';
    return;
  }

  leaderboardBody.innerHTML = items
    .map(
      (player, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${player.name}</td>
        <td>${player.score}</td>
        <td>${player.frontModule}</td>
        <td>${player.backModule}</td>
      </tr>`,
    )
    .join("");
}

async function loadLeaderboard() {
  try {
    const response = await fetch("/api/admin/leaderboard");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    renderLeaderboard(data.leaderboard ?? []);
  } catch (error) {
    leaderboardBody.innerHTML = '<tr><td colspan="5">Error cargando leaderboard.</td></tr>';
    console.error(error);
  }
}

loadLeaderboard();
setInterval(loadLeaderboard, 5000);
