/* File Name: tvoc.js */

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

// 2. Process CSV for TVOC
function processCSV(csvText) {
  const rows = csvText.split('\n');
  const timeLabels = [];
  const tvocValues = [];

  for (let i = 1; i < rows.length; i++) {
      const row = rows[i].trim();
      if (!row) continue;

      const cols = row.split(',');

      // Col 0: time (ms)
      // Col 2: TVOC index

      if (cols.length > 2) {
          const seconds = (parseFloat(cols[0]) / 1000).toFixed(1);
          timeLabels.push(seconds);
          tvocValues.push(parseInt(cols[2]));
      }
  }

  drawTVOCGraph(timeLabels, tvocValues);
}

// 3. Draw TVOC Graph
function drawTVOCGraph(times, tvocValues) {
  const canvas = document.getElementById("tvocChart");
  const ctx = canvas.getContext("2d");

  if (window.myTVOCChart) window.myTVOCChart.destroy();

  window.myTVOCChart = new Chart(ctx, {
      type: "line",
      data: {
          labels: times,
          datasets: [
              {
                  label: "TVOC Index",
                  data: tvocValues,
                  borderColor: "#7b1fa2",
                  backgroundColor: "rgba(123,31,162,0.2)",
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
                  title: { display: true, text: "TVOC Index (0–500)" },
                  beginAtZero: true,
                  max: 500
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
