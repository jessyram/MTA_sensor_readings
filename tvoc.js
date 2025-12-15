 /* File Name: tvoc.js
Author: Daniel Sanchez */

const storedData = localStorage.getItem("sensorData");

if (!storedData) {
  alert("No data found. Please upload a CSV on the home page first.");
} else {
  const data = JSON.parse(storedData);

  const times = [];
  const tvocValues = [];
  const eventPoints = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    times.push(row.timestamp);
    tvocValues.push(Number(row.tvoc_ppb));

    if (i > 0) {
      const prev = data[i - 1].train_present;
      const curr = row.train_present;

      if (prev === "0" && curr === "1") {
        eventPoints.push({
          x: row.timestamp,
          y: Number(row.tvoc_ppb),
          label: "Train Arrives the Station"
        });
      }

      if (prev === "1" && curr === "0") {
        eventPoints.push({
          x: row.timestamp,
          y: Number(row.tvoc_ppb),
          label: "Train Leaves the Station"
        });
      }
    }
  }

  drawTVOCGraph(times, tvocValues, eventPoints);
}

function drawTVOCGraph(times, tvocValues, eventPoints) {
  const ctx = document.getElementById("tvocChart").getContext("2d");

  new Chart(ctx, {
    type: "line",
    data: {
      labels: times,
      datasets: [
        {
          label: "TVOC (ppb)",
          data: tvocValues,
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
            text: "TVOC Readings with Train Arrivals and Departures"
          },
        tooltip: {
          callbacks: {
            label: (context) => {
              if (context.raw.label) {
                return context.raw.label;
              }
              return `TVOC: ${context.raw} ppb`;
            }
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: "Time" }
        },
        y: {
          title: { display: true, text: "TVOC (ppb)" },
          min: 0
        }
      }
    }
  });
}
