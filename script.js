const scriptURL = "YOUR_DEPLOYED_APPS_SCRIPT_URL";

// Get stored PIN from localStorage
function getStoredPin() {
  return localStorage.getItem("pin");
}

// Save PIN to localStorage
function savePin(pin) {
  localStorage.setItem("pin", pin);
}

// Ask user for PIN if not already stored
async function ensurePin() {
  let pin = getStoredPin();
  if (!pin) {
    pin = prompt("Enter PIN:");
    if (pin) savePin(pin);
  }
  return pin;
}

// Render input form
function showInput() {
  document.getElementById("content").innerHTML = `
    <h2>Submit Report</h2>
    <form id="inputForm">
      <input type="text" id="criticite" placeholder="Criticité" required>
      <textarea id="description" placeholder="Description" required></textarea>
      <input type="text" id="signalePar" placeholder="Signalé par" required>
      <button type="submit">Send</button>
    </form>
    <p id="response"></p>
  `;

  document.getElementById("inputForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const criticite = document.getElementById("criticite").value;
    const description = document.getElementById("description").value;
    const signalePar = document.getElementById("signalePar").value;
    const pin = await ensurePin();

    const res = await fetch(scriptURL, {
      method: "POST",
      body: JSON.stringify({ criticite, description, signalePar, pin }),
      headers: { "Content-Type": "application/json" }
    });

    const text = await res.text();
    document.getElementById("response").textContent = text;
  });
}

// Render output list
async function showOutput() {
  const pin = await ensurePin();
  if (!pin) return;

  const res = await fetch(`${scriptURL}?pin=${encodeURIComponent(pin)}`);
  const text = await res.text();

  if (text === "Unauthorized") {
    document.getElementById("content").innerHTML = "<p>Access denied</p>";
    localStorage.removeItem("pin"); // Clear bad PIN
    return;
  }

  const data = JSON.parse(text);
  let html = "<h2>Reports</h2><ul>";
  data.forEach(item => {
    html += `
      <li>
        <strong>${item.date}</strong> 
        [${item.criticite}] ${item.description} (${item.signalePar})
      </li>`;
  });
  html += "</ul>";

  document.getElementById("content").innerHTML = html;
}
