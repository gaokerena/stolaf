const scriptURL = "https://script.google.com/macros/s/AKfycbxaYXlocGh2AfEbyi8KcPEeN4GNxRkXkUVwfxOZGuxQPBc48jatKK-ILhb_N4Kby8H9/exec";

function savePin(pin) {
  localStorage.setItem("pin", pin);
}

function getStoredPin() {
  return localStorage.getItem("pin");
}

async function validatePin(pin) {
  const res = await fetch(`${scriptURL}?pin=${encodeURIComponent(pin)}`);
  const text = await res.text();
  return text !== "Unauthorized";
}

async function handlePin(pin) {
  const valid = await validatePin(pin);
  if (valid) {
    savePin(pin);
    window.location.href = "app.html";
  } else {
    document.getElementById("pinMessage").textContent = "Access denied. Wrong PIN.";
    localStorage.removeItem("pin");
  }
}

document.getElementById("pinSubmit").addEventListener("click", () => {
  const pin = document.getElementById("pinInput").value;
  if (!pin) return;
  handlePin(pin);
});

// Auto-validate stored PIN
const storedPin = getStoredPin();
if (storedPin) handlePin(storedPin);
