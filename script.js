//JS for dashboard

/* ========= LIVE ESP32 DASHBOARD SCRIPT ========= */

let co2Chart, pmChart, tvocChart, tempChart;

// Data buffers
const maxPoints = 60;
const timeData = [];
const co2Data = [];
const pm25Data = [];
const tvocData = [];
const tempData = [];

/* ========= CREATE CHARTS ========= */
function initCharts() {
  co2Chart = new Chart(document.getElementById("co2Chart"), {
    type: "line",
    data: { labels: [], datasets: [{
      label: "CO2 (ppm)",
      data: [],
      borderColor: "teal",
      fill: false,
      tension: 0.1
    }]},
    options: { responsive: true, animation: false }
  });

  pmChart = new Chart(document.getElementById("pmChart"), {
    type: "line",
    data: { labels: [], datasets: [{
      label: "PM2.5 (µg/m³)",
      data: [],
      borderColor: "orange",
      fill: false,
      tension: 0.1
    }]},
    options: { responsive: true, animation: false }
  });

  tvocChart = new Chart(document.getElementById("tvocChart"), {
    type: "line",
    data: { labels: [], datasets: [{
      label: "TVOC Index",
      data: [],
      borderColor: "purple",
      fill: false,
      tension: 0.1
    }]},
    options: { responsive: true, animation: false }
  });

  tempChart = new Chart(document.getElementById("tempChart"), {
    type: "line",
    data: { labels: [], datasets: [{
      label: "Temperature (°F)",
      data: [],
      borderColor: "red",
      fill: false,
      tension: 0.1
    }]},
    options: { responsive: true, animation: false }
  });
}

/* ========= FETCH LIVE DATA ========= */
async function fetchLiveData() {
  try {
    const res = await fetch("/data");
    const d = await res.json();

    if (!d || !d.co2) return;

    const t = (d.t_ms / 1000).toFixed(1);

    timeData.push(t);
    co2Data.push(d.co2);
    pm25Data.push(d.pm25);
    tvocData.push(d.tvoc);
    tempData.push(d.temp);

    if (timeData.length > maxPoints) {
      timeData.shift();
      co2Data.shift();
      pm25Data.shift();
      tvocData.shift();
      tempData.shift();
    }

    updateCharts();
  } catch (err) {
    console.error("ESP32 fetch failed", err);
  }
}

/* ========= UPDATE CHARTS ========= */
function updateCharts() {
  co2Chart.data.labels = timeData;
  co2Chart.data.datasets[0].data = co2Data;
  co2Chart.update();

  pmChart.data.labels = timeData;
  pmChart.data.datasets[0].data = pm25Data;
  pmChart.update();

  tvocChart.data.labels = timeData;
  tvocChart.data.datasets[0].data = tvocData;
  tvocChart.update();

  tempChart.data.labels = timeData;
  tempChart.data.datasets[0].data = tempData;
  tempChart.update();
}

/* ========= START ========= */
document.addEventListener("DOMContentLoaded", () => {
  initCharts();
  setInterval(fetchLiveData, 1000);
});

  
