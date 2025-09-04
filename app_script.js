const scriptURL = "https://script.google.com/macros/s/AKfycbxaYXlocGh2AfEbyi8KcPEeN4GNxRkXkUVwfxOZGuxQPBc48jatKK-ILhb_N4Kby8H9/exec";

const spreadsheetPreviewURL = "https://docs.google.com/spreadsheets/d/1THA74IOnmlxuof-grG38y395FUAdXpVN46kQ1ZvIrqI/preview";

function showSection(contentHTML) {
  const container = document.getElementById("content");
  container.innerHTML = contentHTML;
}

function setActiveNav(buttonIndex) {
  const buttons = document.querySelectorAll(".navbutton");
  buttons.forEach((btn, i) => btn.classList.toggle("active", i === buttonIndex));
}

function showInput() {
  setActiveNav(2);
  const pin = localStorage.getItem("pin");
  showSection(`
    <h2>Submit Report</h2>
    <form id="inputForm">
      <input type="text" id="criticite" placeholder="Criticité" required>
      <textarea id="description" placeholder="Description" required></textarea>
      <input type="text" id="signalePar" placeholder="Signalé par" required>
      <button class="submitbutton" type="submit">Send</button>
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
    document.getElementById("inputForm").reset();
  });
}

function showOutput() {
  setActiveNav(1); // Highlight Output button
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

      let html = `
        <h2>Corrections en cours</h2>
        <div class="table-container">
          <table class="outputTable">
            <colgroup>
              <col style="width:10%">
              <col style="width:10%">
              <col style="width:10%">
              <col style="width:50%">
              <col style="width:10%">
              <col style="width:10%">
              <col style="width:10%">
            </colgroup>
            <thead>
              <tr>
                <th>Date</th>
                <th>Criticité</th>
                <th>Catégorie</th>
                <th>Description</th>
                <th>Etat</th>
                <th>Niveau</th>
                <th>Signalé par</th>
              </tr>
            </thead>
            <tbody>
      `;

      data.forEach(item => {
        html += `
          <tr>
            <td>${item.date}</td>
            <td>${item.criticite}</td>
            <td>${item.categorie || ''}</td>
            <td>${item.description}</td>
            <td>${item.etat || ''}</td>
            <td>${item.niveau || ''}</td>
            <td>${item.signalePar}</td>
          </tr>
        `;
      });

      html += `</tbody></table></div>`;
      showSection(html);
    });
}

function showParams() {
  setActiveNav(0);
  const html = `
    <h2>Params (Preview)</h2>
    <iframe src="${spreadsheetPreviewURL}" style="width:100%; height:80vh; border:none;"></iframe>
  `;
  showSection(html);
}

// On page load, show Output by default if PIN is valid
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
      showOutput();
    }
  }
})();

