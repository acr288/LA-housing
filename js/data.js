const map = L.map("map", {
  zoomSnap: 0.1,
  center: [34.0522, -118.2437],
  zoomControl: false,
  zoom: 8,
  minZoom: 6,
  maxZoom: 12,
});

fetch("./data/CENSUS_2010_JOINED.geojson")
  .then(function (response) {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  })
  .then(function (data) {
    const y = [
      "YR1999",
      "YR2003",
      "YR2005",
      "YR2008q3",
      "YR2010q4",
      "YR2012q2",
      "YR2013q3",
      "YR2013q4",
      "YR2018Q1",
      "YR2018Q4",
    ];

    const g = {
      type: "FeatureCollection",
      name: "CLEANED",
      crs: {
        type: "name",
        properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" },
      },
      features: [],
    };

    data.features.forEach((x) => {
      let i = 0;
      y.forEach((y) => {
        const a = x.properties[`home_prices_${y}`];
        if (a !== null) {
          x.properties[`home_prices_${y}`] = +a;
          i++;
        }
      });
      if (i == y.length) g.features.push(x);
    });

    comparePrices(y, g, 0, 9);
  });

function comparePrices(range, data, start, end) {
  
  // Create empty arrays to store the data for comparing variation from mean
  const fromMean = [];
  
  data.features.forEach((x) => {
    const a = x.properties[`home_prices_${range[start]}`];
    const b = x.properties[`home_prices_${range[end]}`];
    if (a != 0) {
      x.properties[`${range[start]}-${range[end]}`] = b / a;
      if (b != 0) {
        // Do not not include zero values
        fromMean.push(b / a);
      }
    } else {
      x.properties[`${range[start]}-${range[end]}`] = null;
    }
  });

  // Calculate the mean of the data using harmonic mean for rates
  const mean = ss.harmonicMean(fromMean);

  // How does the rate compare to the mean?
  // Find all values.
  rates = fromMean.map((e) => {
    return e / mean;
  });

  // Add rate to the data
  data.features.forEach((x) => {
    const a = x.properties[`${range[start]}-${range[end]}`];
    if (a != 0) {
      x.properties[`varMean-${range[start]}-${range[end]}`] = a / mean;
    }
  });

  // Two versions of classifying the data:

  // quantile
  // const breaks = chroma.limits(rates, "q", 7); //switched to K-means
  // const colorize = chroma.scale(chroma.brewer.PuOr).classes(breaks).mode("lab");

  // k-means
  const breaks = ss.ckmeans(rates, 8).map((e) => {
    return e[0];
  });

  let colorize = chroma
    .scale(chroma.brewer.PuOr)
    .classes(breaks)
    .mode("lab");

  // Draw the map
  L.geoJson(data, {
    style: function (feature) {
      const a = feature.properties[`varMean-${range[start]}-${range[end]}`];
      return {
        color: "#838283",
        weight: 1,
        fillOpacity: 1,
        fillColor: colorize(a),
      };
    },
  }).addTo(map);


  let legend = document.querySelector("#temp-legend");
  legend.innerHTML = "<h3><span> Legend: </span>  </h3>";

  for (let i = 0; i < breaks.length - 1; i++) {
    let color = colorize(breaks[i]);

    let classRange = `<div style="background:${color};padding:20px;">
      <div style='background:white;width:33%;padding:5px;'>
      ${breaks[i].toFixed(2)} - ${breaks[i + 1].toFixed(2)}</div>`;

    legend.innerHTML += classRange;
  }

  legend.innerHTML += `<br>The average rate of change is: ${mean.toFixed(2)} for the ${range[start]} - ${range[end]} period.`;

  console.log(data, breaks, mean);
}
