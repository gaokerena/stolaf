const scriptURL = "https://script.google.com/macros/s/AKfycbxaYXlocGh2AfEbyi8KcPEeN4GNxRkXkUVwfxOZGuxQPBc48jatKK-ILhb_N4Kby8H9/exec";

const spreadsheetPreviewURL = "https://docs.google.com/spreadsheets/d/1THA74IOnmlxuof-grG38y395FUAdXpVN46kQ1ZvIrqI/preview";

function showSection(contentHTML) {
  const container = document.getElementById("content");
  container.innerHTML = contentHTML;
}

function showInput() {
  const pin = localStorage.getItem("pin");
  showSection(`
    <h2>Submit Report</h2>
    <form id="inputForm">
      <input type="text" id="criticite" placeholder="Criticité" required>
      <textarea id="description" placeholder="Description" required></textarea>
      <input type="text" id="signalePar" placeholder="Signalé par" required>
      <button type="submit">Send</button>
    </form>
    <p id="response"></p>
  `);

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
}

function showOutput() {
  const pin = localStorage.getItem("pin");
  fetch(`${scriptURL}?pin=${encodeURIComponent(pin)}`)
    .then(res => res.text())
    .then(text => {
      if (text === "Unauthorized") {
        localStorage.removeItem("pin");
        window.location.href = "index.html";
        return;
      }
      const data = JSON.parse(text);
      let html = "<h2>Reports</h2><ul>";
      data.forEach(item => {
        html += `<li><strong>${item.date}</strong> [${item.criticite}] ${item.description} (${item.signalePar})</li>`;
      });
      html += "</ul>";
      showSection(html);
    });
}

function showParams() {
  const html = `
    <h2>Params (Preview)</h2>
    <iframe src="${spreadsheetPreviewURL}" style="width:100%; height:80vh; border:none;"></iframe>
  `;
  showSection(html);
}

// On page load, ensure PIN is valid
(async () => {
  const pin = localStorage.getItem("pin");
  if (!pin) {
    window.location.href = "index.html";
  } else {
    const res = await fetch(`${scriptURL}?pin=${encodeURIComponent(pin)}`);
    const text = await res.text();
    if (text === "Unauthorized") {
      localStorage.removeItem("pin");
      window.location.href = "index.html";
    } else {
      // Default page
      showInput();
    }
  }
})();
