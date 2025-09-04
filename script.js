const scriptURL = "https://script.google.com/macros/s/AKfycbxaYXlocGh2AfEbyi8KcPEeN4GNxRkXkUVwfxOZGuxQPBc48jatKK-ILhb_N4Kby8H9/exec";

// Store PIN in localStorage
function savePin(pin) { localStorage.setItem("pin", pin); }
function getStoredPin() { return localStorage.getItem("pin"); }

// Validate PIN by trying to fetch Output
async function validatePin(pin) {
  const res = await fetch(`${scriptURL}?pin=${encodeURIComponent(pin)}`);
  const text = await res.text();
  return text !== "Unauthorized";
}

// Render PIN section
function renderPinSection(containerId, onSuccess) {
  const container = document.getElementById(containerId);
  const storedPin = getStoredPin() || "";

  container.innerHTML = `
    <div id="pinSection">
      <input type="password" id="pinInput" placeholder="Enter PIN" value="${storedPin}" />
      <button id="pinSubmit">Submit</button>
      <p id="pinMessage"></p>
    </div>
    <div id="mainContent" style="display:none;"></div>
  `;

  const attemptPin = async (pin) => {
    if (!pin) return false;
    const isValid = await validatePin(pin);
    if (isValid) savePin(pin);
    return isValid;
  };

  if (storedPin) {
    attemptPin(storedPin).then(valid => {
      if (valid) {
        document.getElementById("pinSection").style.display = "none";
        document.getElementById("mainContent").style.display = "block";
        onSuccess(storedPin);
      } else {
        localStorage.removeItem("pin");
        document.getElementById("pinMessage").textContent = "Stored PIN invalid. Please enter again.";
      }
    });
  }

  document.getElementById("pinSubmit").addEventListener("click", async () => {
    const pin = document.getElementById("pinInput").value;
    const isValid = await attemptPin(pin);
    if (isValid) {
      document.getElementById("pinSection").style.display = "none";
      document.getElementById("mainContent").style.display = "block";
      onSuccess(pin);
    } else {
      document.getElementById("pinMessage").textContent = "Access denied. Wrong PIN.";
      localStorage.removeItem("pin");
    }
  });
}

// Show Input page
function showInput() {
  renderPinSection("content", (pin) => {
    const mainContent = document.getElementById("mainContent");
    mainContent.innerHTML = `
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

      const url = `${scriptURL}?pin=${encodeURIComponent(pin)}&criticite=${encodeURIComponent(criticite)}&description=${encodeURIComponent(description)}&signalePar=${encodeURIComponent(signalePar)}`;

      const res = await fetch(url);
      const text = await res.text();
      document.getElementById("response").textContent = text;
    });
  });
}

// Show Output page
function showOutput() {
  renderPinSection("content", async (pin) => {
    const mainContent = document.getElementById("mainContent");
    const res = await fetch(`${scriptURL}?pin=${encodeURIComponent(pin)}`);
    const text = await res.text();

    if (text === "Unauthorized") {
      mainContent.innerHTML = "<p>Access denied</p>";
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

    mainContent.innerHTML = html;
  });
}
