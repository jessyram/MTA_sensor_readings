/* File Name: temp.js */

// 1. Listen for File Upload
document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('csvFile');

  if (fileInput) {
    fileInput.addEventListener('change', function (e) {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function (e) {
        const text = e.target.result;
        processCSV(text);
      };
      reader.readAsText(file);
    });
  }
});

// 2. Process CSV for Temperature
function processCSV(csvText) {
  const rows = csvText.split('\n');
  const timeLabels = [];
  const tempValues = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i].trim();
    if (!row) continue;

    const cols = row.split(',');

    // Col 0: time (ms)
    // Col 3: Temperature (°F)

    if (cols.length > 3) {
      const seconds = (parseFloat(cols[0]) / 1000).toFixed(1);
      timeLabels.push(seconds);
      tempValues.push(parseFloat(cols[3]));
    }
  }

  drawTempGraph(timeLabels, tempValues);
}

// 3. Draw Temperature Graph
function drawTempGraph(times, tempValues) {
  const canvas = document.getElementById("tempChart");
  const ctx = canvas.getContext("2d");

  if (window.myTempChart) window.myTempChart.destroy();

  window.myTempChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: times,
      datasets: [
        {
          label: "Temperature (°F)",
          data: tempValues,
          borderColor: "#1976d2",
          backgroundColor: "rgba(25,118,210,0.2)",
          borderWidth: 2,
          pointRadius: 0,
          fill: true,
          tension: 0.1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      scales: {
        x: {
          title: { display: true, text: "Time (seconds)" }
        },
        y: {
          title: { display: true, text: "Temperature (°F)" }
        }
      }
    }
  });
}

// --- Modal Logic ---
function openModal(id) {
  document.getElementById("modal-overlay").style.display = "block";
  document.getElementById(id).style.display = "block";
}

function closeModal() {
  document.getElementById("modal-overlay").style.display = "none";
  document.querySelectorAll('.modal').forEach(m => m.style.display = "none");
}
