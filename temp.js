/* File Name: temp.js
Author: Veronica Nieto-Wire */

//Graph settings
   const storedData = localStorage.getItem("sensorData");

   if (!storedData) {
     alert("No data found. Please upload a CSV on the home page first.");
   } else {
     const data = JSON.parse(storedData);
   
     const times = [];
     const tempValues = [];
     const eventPoints = [];
   
     for (let i = 0; i < data.length; i++) {
       const row = data[i];
   
       times.push(row.timestamp);
       tempValues.push(Number(row.temperature_c));
   
       // Detect train arrival/departure
       if (i > 0) {
         const prev = data[i - 1].train_present;
         const curr = row.train_present;
   
         if (prev === "0" && curr === "1") {
           eventPoints.push({
             x: row.timestamp,
             y: Number(row.temperature_c),
             event: "Train Arrives the Station"
           });
         }
   
         if (prev === "1" && curr === "0") {
           eventPoints.push({
             x: row.timestamp,
             y: Number(row.temperature_c),
             event: "Train Leaves the Station"
           });
         }
       }
     }
   
     drawTempGraph(times, tempValues, eventPoints);
   }
   
   function drawTempGraph(times, tempValues, eventPoints) {
     const ctx = document.getElementById("tempChart").getContext("2d");
   
     new Chart(ctx, {
       type: "line",
       data: {
         labels: times,
         datasets: [
           {
             label: "Temperature (°C)",
             data: tempValues,
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
                text: "Temperature Readings with Train Arrivals and Departures"
              },
           tooltip: {
             callbacks: {
               label: function (context) {
                 if (context.raw.event) {
                   return context.raw.event;
                 }
                 return `Temperature: ${context.parsed.y} °C`;
               }
             }
           }
         },
         scales: {
           x: {
             title: { display: true, text: "Time" }
           },
           y: {
             title: { display: true, text: "Temperature (°C)" },
             min: 20,
             max: 25
           }
         }
       }
     });
   }
