let co2Chart, pmChart, tvocChart, tempChart;

document.addEventListener("DOMContentLoaded", () => {
  initCharts();

  document.getElementById("csvFile").addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => processCSV(evt.target.result);
    reader.readAsText(file);

    document.getElementById("fileStatus").innerText =
      `Loaded: ${file.name}`;
  });
});

/* ========= INIT CHARTS ========= */
function initCharts() {
  co2Chart = makeChart("co2Chart", "CO2 (ppm)", "teal");
  pmChart  = makeChart("pmChart", "PM2.5 (µg/m³)", "orange");
  tvocChart = makeChart("tvocChart", "TVOC Index", "purple");
  tempChart = makeChart("tempChart", "Temperature (°F)", "red");
}

function makeChart(id, label, color) {
  return new Chart(document.getElementById(id), {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label,
        data: [],
        borderColor: color,
        pointRadius: 0,
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false
    }
  });
}

/* ========= CSV PROCESSING ========= */
/*
CSV FORMAT:
T_ms,CO2,VOC_Idx,Tmp,Hum,PM1,PM2.5,PM10,...
*/
function processCSV(csv) {
  const rows = csv.split("\n").slice(1);

  const t = [], co2 = [], pm25 = [], tvoc = [], temp = [];

  rows.forEach(row => {
    if (!row.trim()) return;
    const c = row.split(",");

    const time = parseFloat(c[0]) / 1000;
    const co2v = parseFloat(c[1]);
    const tvocv = parseFloat(c[2]);
    const tempv = parseFloat(c[3]);
    const pm25v = parseFloat(c[6]);

    if (isNaN(time)) return;

    t.push(time.toFixed(1));
    co2.push(co2v);
    pm25.push(pm25v);
    tvoc.push(tvocv);
    temp.push(tempv);
  });

  updateChart(co2Chart, t, co2);
  updateChart(pmChart, t, pm25);
  updateChart(tvocChart, t, tvoc);
  updateChart(tempChart, t, temp);
}

/* ========= UPDATE ========= */
function updateChart(chart, labels, data) {
  chart.data.labels = labels;
  chart.data.datasets[0].data = data;
  chart.update();
} 
