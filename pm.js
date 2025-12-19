/* File Name: pm.js */

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

// 2. Process CSV for PM2.5
function processCSV(csvText) {
  const rows = csvText.split('\n');
  const timeLabels = [];
  const pm25Values = [];

  for (let i = 1; i < rows.length; i++) {
      const row = rows[i].trim();
      if (!row) continue;

      const cols = row.split(',');

      // Col 0: time (ms)
      // Col 6: PM2.5

      if (cols.length > 6) {
          const seconds = (parseFloat(cols[0]) / 1000).toFixed(1);
          timeLabels.push(seconds);
          pm25Values.push(parseFloat(cols[6]));
      }
  }

  drawPM25Graph(timeLabels, pm25Values);
}

// 3. Draw PM2.5 Graph
function drawPM25Graph(times, pm25Values) {
  const canvas = document.getElementById("pmChart");
  const ctx = canvas.getContext("2d");

  if (window.myPMChart) window.myPMChart.destroy();

  window.myPMChart = new Chart(ctx, {
      type: "line",
      data: {
          labels: times,
          datasets: [
              {
                  label: "PM2.5 (µg/m³)",
                  data: pm25Values,
                  borderColor: "#ef6c00",
                  backgroundColor: "rgba(239,108,0,0.2)",
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
                  title: { display: true, text: "PM2.5 (µg/m³)" },
                  beginAtZero: true
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


