// Handle Setup Wizard Navigation
let currentStep = 1;
const totalSteps = 5;

document.getElementById("wizardNextBtn").addEventListener("click", () => {
  if (currentStep < totalSteps) {
    document.getElementById(`step${currentStep}`).classList.add("d-none");
    currentStep++;
    document.getElementById(`step${currentStep}`).classList.remove("d-none");
    document.getElementById("wizardBackBtn").disabled = false;
    if (currentStep === totalSteps) {
      document.getElementById("wizardNextBtn").textContent = "Finish";
    }
  } else {
    document.getElementById("setupModal").classList.remove("show");
    document.querySelector(".modal-backdrop")?.remove();
    document.body.classList.remove("modal-open");
    document.body.style.overflow = "";
    applySetupToUI();
  }
});

document.getElementById("wizardBackBtn").addEventListener("click", () => {
  if (currentStep > 1) {
    document.getElementById(`step${currentStep}`).classList.add("d-none");
    currentStep--;
    document.getElementById(`step${currentStep}`).classList.remove("d-none");
    document.getElementById("wizardNextBtn").textContent = "Next";
    if (currentStep === 1) {
      document.getElementById("wizardBackBtn").disabled = true;
    }
  }
});

document.getElementById("openWizardBtn").addEventListener("click", () => {
  document.getElementById("setupModal").classList.add("show");
  document.getElementById("setupModal").style.display = "block";
  document.body.classList.add("modal-open");
  document.body.style.overflow = "hidden";
});

// Apply setup to UI
function applySetupToUI() {
  const nutrientLine = document.getElementById("nutrientLine").value;
  const medium = document.getElementById("growMedium").value;

  document.getElementById("nutrientLineName").textContent = nutrientLine;
  document.getElementById("mediumName").textContent = medium;
}

applySetupToUI();

// VPD Calculator
document.getElementById("calcVpdBtn").addEventListener("click", () => {
  const temp = parseFloat(document.getElementById("vpdTemp").value);
  const rh = parseFloat(document.getElementById("vpdRH").value);
  if (isNaN(temp) || isNaN(rh)) return;

  const leafTemp = temp - 0.5;
  const svp = 610.7 * Math.pow(10, (7.5 * leafTemp) / (237.3 + leafTemp));
  const avp = (rh / 100) * 610.7 * Math.pow(10, (7.5 * temp) / (237.3 + temp));
  const vpd = (svp - avp) / 1000;

  let advice = "VPD is ideal.";
  if (vpd < 0.6) advice = "VPD too low – raise temp or lower humidity.";
  else if (vpd > 1.4) advice = "VPD too high – lower temp or raise humidity.";

  document.getElementById("vpdResult").innerHTML = `<strong>VPD: ${vpd.toFixed(2)} kPa</strong><br>${advice}`;
});

// DLI Calculator
document.getElementById("calcDliBtn").addEventListener("click", () => {
  const ppfd = parseFloat(document.getElementById("ppfdInput").value);
  const hours = parseFloat(document.getElementById("hoursInput").value);
  if (isNaN(ppfd) || isNaN(hours)) return;

  const dli = (ppfd * hours * 3600) / 1_000_000;
  document.getElementById("dliResult").innerHTML = `<strong>DLI: ${dli.toFixed(1)} mol/m²/day</strong>`;
});

// Journal Entry Logic
document.getElementById("addEntryBtn").addEventListener("click", () => {
  const text = document.getElementById("journalText").value;
  const photo = document.getElementById("journalPhoto").files[0];
  const reader = new FileReader();

  const entryDiv = document.createElement("div");
  entryDiv.classList.add("border", "p-2", "mb-2");
  entryDiv.innerHTML = `<strong>${new Date().toLocaleDateString()}</strong><br>${text}`;

  if (photo) {
    reader.onload = function (e) {
      const img = document.createElement("img");
      img.src = e.target.result;
      img.classList.add("img-thumbnail", "mt-2");
      img.style.maxWidth = "150px";
      entryDiv.appendChild(img);
      document.getElementById("journalEntries").appendChild(entryDiv);
    };
    reader.readAsDataURL(photo);
  } else {
    document.getElementById("journalEntries").appendChild(entryDiv);
  }

  document.getElementById("journalText").value = "";
  document.getElementById("journalPhoto").value = "";
});

// Export Journal
document.getElementById("exportJournalBtn").addEventListener("click", () => {
  const entries = document.getElementById("journalEntries").innerText;
  const blob = new Blob([entries], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "grow_journal.txt";
  link.click();
});

// Training timeline (mock)
document.getElementById("applyTrainingBtn").addEventListener("click", () => {
  const timeline = document.getElementById("timelineContent");
  timeline.innerHTML = "<ul>";
  if (document.getElementById("optTopping").checked) timeline.innerHTML += "<li>Topping: Week 2</li>";
  if (document.getElementById("optLST").checked) timeline.innerHTML += "<li>LST: Week 2–4</li>";
  if (document.getElementById("optScrog").checked) timeline.innerHTML += "<li>SCROG Net: Week 3</li>";
  if (document.getElementById("optDefoliation").checked) timeline.innerHTML += "<li>Defoliation: Week 6</li>";
  timeline.innerHTML += "</ul>";
});

// Drying tracker
document.getElementById("startDryingBtn").addEventListener("click", () => {
  const start = new Date();
  localStorage.setItem("dryStart", start.toISOString());
  updateDryingStatus();
});

document.getElementById("resetDryingBtn").addEventListener("click", () => {
  localStorage.removeItem("dryStart");
  updateDryingStatus();
});

function updateDryingStatus() {
  const status = document.getElementById("dryingStatus");
  const dryStart = localStorage.getItem("dryStart");

  if (!dryStart) {
    status.innerHTML = "<p><em>No active drying in progress.</em></p>";
  } else {
    const start = new Date(dryStart);
    const now = new Date();
    const days = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    status.innerHTML = `<p>Drying in progress: <strong>${days} days</strong><br>Check stems for snapping by day 7–10.</p>`;
  }
}
updateDryingStatus();
