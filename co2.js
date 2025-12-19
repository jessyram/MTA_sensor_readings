/* File Name: co2.js */

// 1. Listen for File Upload
document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('csvFile');
  
  if(fileInput) {
      fileInput.addEventListener('change', function(e) {
          const file = e.target.files[0];
          if (!file) return;

          const reader = new FileReader();
          reader.onload = function(e) {
              const text = e.target.result;
              processCSV(text);
          };
          reader.readAsText(file);
      });
  }
});

// 2. Process Data (Specific to your Arduino Format)
function processCSV(csvText) {
  const rows = csvText.split('\n');
  const timeLabels = [];
  const co2Values = [];

  // Loop through rows (Start at 1 to skip Header)
  for (let i = 1; i < rows.length; i++) {
      const row = rows[i].trim();
      if (!row) continue;

      const cols = row.split(',');

      // YOUR DATA MAP: 
      // Col 0: T_ms, Col 1: CO2, Col 2: VOC...
      
      if (cols.length > 1) {
          // Convert Time (ms) to Seconds
          const seconds = (parseFloat(cols[0]) / 1000).toFixed(1);
          timeLabels.push(seconds);

          // Get CO2 Value
          co2Values.push(cols[1]); 
      }
  }

  drawCO2Graph(timeLabels, co2Values);
}

// 3. Draw Graph
function drawCO2Graph(times, co2Values) {
const canvas = document.getElementById("co2Chart");
const ctx = canvas.getContext("2d");

// Destroy old chart if re-uploading
if (window.myCO2Chart) window.myCO2Chart.destroy();

window.myCO2Chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: times,
    datasets: [
      {
        label: "CO2 (ppm)",
        data: co2Values,
        borderColor: "teal",
        backgroundColor: "rgba(0, 128, 128, 0.2)",
        borderWidth: 2,
        pointRadius: 0, // Clean line without dots
        pointHoverRadius: 4,
        fill: true,
        tension: 0.1 // Slight curve
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false, 
    animation: false, // Instant load
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    scales: {
      x: { 
          grid: { display: false },
          title: { display: true, text: 'Time (Seconds)' },
          ticks: { maxTicksLimit: 10 } 
      },
      y: { 
          beginAtZero: false,
          title: { display: true, text: 'CO2 PPM' }
      }
    },
    plugins: {
      legend: { display: true }
    }
  }
});
}

// --- Modal Logic (Popups) ---
function openModal(id) {
  document.getElementById("modal-overlay").style.display = "block";
  document.getElementById(id).style.display = "block";
}
function closeModal() {
  document.getElementById("modal-overlay").style.display = "none";
  document.querySelectorAll('.modal').forEach(m => m.style.display = "none");
}
