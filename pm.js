/*File Name: pm.js
Author: Veronica Nieto-Wire*/

//Graph Settings

const storedData = localStorage.getItem("sensorData");

if (!storedData) {
  alert("No data found. Please upload a CSV on the home page first.");
} else {
  const data = JSON.parse(storedData);

  const times = [];
  const pmValues = [];
  const eventPoints = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    times.push(row.timestamp);
    pmValues.push(Number(row.pm2_5_ugm3));

    if (i > 0) {
      const prev = data[i - 1].train_present;
      const curr = row.train_present;

      if (prev === "0" && curr === "1") {
        eventPoints.push({
          x: row.timestamp,
          y: Number(row.pm2_5_ugm3),
          label: "Train Arrives the Station"
        });
      }

      if (prev === "1" && curr === "0") {
        eventPoints.push({
          x: row.timestamp,
          y: Number(row.pm2_5_ugm3),
          label: "Train Leaves the Station"
        });
      }
    }
  }

  drawPMGraph(times, pmValues, eventPoints);
}

function drawPMGraph(times, pmValues, eventPoints) {
    const ctx = document.getElementById("pmChart").getContext("2d");
  
    new Chart(ctx, {
      type: "line",
      data: {
        labels: times,
        datasets: [
          {
            label: "PM2.5 (µg/m³)",
            data: pmValues,
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
          tooltip: {
            callbacks: {
              label: (context) =>
                context.raw.label || `PM2.5: ${context.raw.y}`
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: "Time" }
          },
          y: {
            min: 0,
            max: 50,
            title: { display: true, text: "PM2.5 (µg/m³)" }
          }
        }
      }
    });
  }
  
