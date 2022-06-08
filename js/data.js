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

    const prices = [];

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
          prices.push(+a);
          x.properties[`home_prices_${y}`] = +a;
          i++;
        }
      });
      if (i == y.length) g.features.push(x);
    });

    prices.sort((a, b) => b - a)

    L.geoJson(g, {
      style: function (feature) {
        return {
          color: "#838283",
          weight: 1,
          fillOpacity: 1,
          fillColor: "black",
        };
      },
    }).addTo(map);

    comparePrices(y, prices, g, 7);
  });

function comparePrices(range, all, data, time) {
  data.features.forEach((x) => {
    range.forEach((y) => {
      const a = x.properties[`home_prices_${range[time]}`];
      const b = x.properties[`home_prices_${y}`];
      if (a != 0) {
        x.properties[`${range[0]}-${y}`] = b/a;
      } else {
        x.properties[`${range[0]}-${y}`] = null;
      }
    });
  });
  console.log(data);
}
