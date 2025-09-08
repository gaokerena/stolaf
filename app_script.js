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
  setActiveNav(1); // Highlight Input button
  const pin = localStorage.getItem("pin");

  showSection(`
    <h2>Reporter un bug ou une demande d'amélioration</h2>
    <form id="inputForm">
      <select id="criticite" required>
        <option value="" disabled selected>Choisir Criticité</option>
        <option value="Faible">Faible</option>
        <option value="Moyenne">Moyenne</option>
        <option value="Elevée">Elevée</option>
      </select>
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
  setActiveNav(0); // Highlight Output button
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

      // Separate "Corrigé" rows
      const corrected = data.filter(item => item.etat && item.etat.toLowerCase() === "corrigé");
      const others = data.filter(item => !item.etat || item.etat.toLowerCase() !== "corrigé");

      // Put corrected rows at the bottom
      const ordered = [...others, ...corrected];

      let html = `
        <h2>Corrections en cours</h2>
        <div class="table-container">
          <table class="outputTable">
            <colgroup>
              <col style="width:15%">
              <col style="width:15%">
              <col style="width:15%">
              <col style="width:45%">
              <col style="width:15%">
              <col style="width:15%">
              <col style="width:15%">
            </colgroup>
            <thead>
              <tr>
                <th data-column="0">Date</th>
                <th data-column="1">Criticité</th>
                <th data-column="2">Catégorie</th>
                <th data-column="3">Description</th>
                <th data-column="4">Etat</th>
                <th data-column="5">Niveau</th>
                <th data-column="6">Signalé par</th>
              </tr>
            </thead>
            <tbody>
      `;

      ordered.forEach(item => {
        const isCorrected = item.etat && item.etat.toLowerCase() === "corrigé";
        html += `
          <tr class="${isCorrected ? "corrected-row" : ""}">
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

      // Make table sortable
      makeTableSortable(".outputTable");
    });
}

function makeTableSortable(tableSelector) {
  const table = document.querySelector(tableSelector);
  const headers = table.querySelectorAll("th");

  headers.forEach((th, index) => {
    th.style.cursor = "pointer";
    th.addEventListener("click", () => {
      const tbody = table.querySelector("tbody");
      const rows = Array.from(tbody.querySelectorAll("tr"));
      const ascending = !th.asc;

      rows.sort((a, b) => {
        let aText = a.children[index].textContent.trim();
        let bText = b.children[index].textContent.trim();

        // Parse Date column (index 0) correctly
        if (index === 0) {
          aText = new Date(aText);
          bText = new Date(bText);
        }

        return ascending
          ? (aText > bText ? 1 : aText < bText ? -1 : 0)
          : (aText < bText ? 1 : aText > bText ? -1 : 0);
      });

      tbody.innerHTML = "";
      rows.forEach(row => tbody.appendChild(row));

      th.asc = ascending;
    });
  });
}


function showParams() {
  setActiveNav(2);
  const html = `
    <h2>Gestion OLAF locale LFST</h2>
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

