//JS for dashboard

document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("csvFile");
    input.addEventListener("change", handleFile);
  });
  
  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = () => parseCSV(reader.result);
    reader.readAsText(file);
  
    document.getElementById("fileStatus").textContent = "File loaded successfully";
  }
  
  function parseCSV(text) {
    const rows = text.split("\n").slice(1);
  
    const time = [];
    const co2 = [];
    const pm25 = [];
    const tvoc = [];
    const temp = [];
  
    rows.forEach(row => {
      const cols = row.trim().split(",");
      if (cols.length < 7) return;
  
      time.push((cols[0] / 1000).toFixed(1));
      co2.push(+cols[1]);
      tvoc.push(+cols[2]);
      temp.push(+cols[3]);
      pm25.push(+cols[6]);
    });
  
    drawChart("co2Chart", "CO₂ (ppm)", co2, "#00796b");
    drawChart("pmChart", "PM2.5 (µg/m³)", pm25, "#ef6c00");
    drawChart("tvocChart", "TVOC Index", tvoc, "#7b1fa2");
    drawChart("tempChart", "Temperature (°F)", temp, "#1976d2");
  }
  
  function drawChart(id, label, data, color) {
    const ctx = document.getElementById(id).getContext("2d");
  
    new Chart(ctx, {
      type: "line",
      data: {
        labels: data.map((_, i) => i),
        datasets: [{
          label,
          data,
          borderColor: color,
          backgroundColor: color + "33",
          pointRadius: 0,
          fill: true,
          tension: 0.2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { display: false },
          y: { beginAtZero: false }
        }
      }
    });
  }
