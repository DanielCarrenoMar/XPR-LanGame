const status = document.getElementById("status");
const resetButton = document.getElementById("reset-btn");
const battleButton = document.getElementById("battle-btn");

function setStatus(message, isError = false) {
  status.textContent = message;
  status.style.color = isError ? "#b43a2b" : "rgba(29, 26, 20, 0.7)";
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

battleButton.addEventListener("click", () => {
  setStatus("Batalla iniciada (accion pendiente de enlazar).", false);
});
