/* File Name: cos2.js
Author: Dennis Lee */


//Graph Settings

const storedData = localStorage.getItem("sensorData");

if (!storedData) {
  alert("No data found. Please upload a CSV on the home page first.");
} else {
  const data = JSON.parse(storedData);

  const times = [];
  const co2Values = [];
  const eventPoints = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    times.push(row.timestamp);
    co2Values.push(Number(row.co2_ppm));

    if (i > 0) {
      const prev = data[i - 1].train_present;
      const curr = row.train_present;

      if (prev === "0" && curr === "1") {
        eventPoints.push({
          x: row.timestamp,
          y: Number(row.co2_ppm),
          label: "Train Arrives the Station"
        });
      }

      if (prev === "1" && curr === "0") {
        eventPoints.push({
          x: row.timestamp,
          y: Number(row.co2_ppm),
          label: "Train Leaves the Station"
        });
      }
    }
  }

  drawCO2Graph(times, co2Values, eventPoints);
}

function drawCO2Graph(times, co2Values, eventPoints) {
  const ctx = document.getElementById("co2Chart").getContext("2d");

  new Chart(ctx, {
    type: "line",
    data: {
      labels: times,
      datasets: [
        {
          label: "CO2 (ppm)",
          data: co2Values,
          borderWidth: 2,
          pointRadius: 3
        },
        {
          label: "Train Event",
          data: eventPoints,
          parsing: false,
          type: "scatter",
          pointRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
            display: true,
            text: "CO2 Readings with Train Arrivals and Departures"
          },
        tooltip: {
          callbacks: {
            label: function (context) {
              const raw = context.raw;
      
              // If this point is a train event
              if (raw && raw.label) {
                return raw.label;
              }
      
              // Otherwise, it's a normal CO2 data point
              return `CO2: ${context.parsed.y} ppm`;
            }
          }
        }
      }
      ,
      scales: {
        x: {
          title: { display: true, text: "Time" }
        },
        y: {
          title: { display: true, text: "CO2 (ppm)" }
        }
      }
    }
  });
}




