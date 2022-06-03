//initialize leaflet map
const map = L.map("map", {
    zoomSnap: 0.1,
    center: [34.0522, -118.2437],
    zoomControl: false,
    //zoom: 8,
    minZoom: 6,
    maxZoom: 12,
    //maxBounds: L.latLngBounds([34.22, -118.72], [33.76, -117.83]),
});

//get tiles
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);

fetch("./data/CENSUS_2010_JOINED.geojson")
    // after it is returned...
    .then(function (response) {
        //console.log(response);
        return response.json();
    })
    .then(function (data) {
        //console.log(data);
        // We now have the json file
        processData(data);
    })
    .catch(function (error) {
        console.log(`Ruh roh! An error has occurred`, error);
    });







function processData(data) {

    // empty array to store all the data values
    const prices = [];

    // iterate through all the counties
    data.features.forEach(function (tract) {

        // iterate through all the props of each county
        for (const prop in tract.properties) {

            // if the attribute is a number and not one of the fips codes or name
            if (prop != "geoid10") {

                // push that attribute value into the array
                prices.push(Number(tract.properties[prop]));
            }
        }
    });

    // verify the result!
    //console.log(prices);

    // create class breaks
    const breaks = chroma.limits(prices, 'q', 5);

    // create color generator function
    const colorize = chroma.scale(chroma.brewer.greens)
        .classes(breaks)
        .mode('lab');
    //console.log(colorize)
    drawMap(data, colorize)
    drawLegend(colorize, breaks)
} //end of processData

function drawMap(data, colorize) {

    // console.log(data)

    // create Leaflet data layer and add to map
    const tracts = L.geoJson(data, {
        // style counties with initial default path options
        style: function (feature) {
            return {
                color: "#838283",
                weight: 1,
                fillOpacity: 1,
                fillColor: "black",
            };
        },
        // add hover/touch functionality to each feature layer
        onEachFeature: function (feature, layer) {
            // when mousing over a layer
            layer.on("mouseover", function () {
                // change the stroke color and bring that element to the front
                layer
                    .setStyle({
                        color: "#e3e0e0",
                    })
                    .bringToFront();
            });

            // on mousing off layer
            layer.on("mouseout", function () {
                // reset the layer style to its original stroke color
                layer.setStyle({
                    color: "#838283",
                });
            });
        },
    }).addTo(map);
    // fit the map's bounds and zoom level using the counties extent
    map.fitBounds(tracts.getBounds(), {
        padding: [18, 18], // add padding around counties
    });
    //console.log(data)
    //createSliderUI(tracts, colorize)
    updateMap(tracts, colorize, 'home_prices_YR1999')

} //end drawMap

function updateMap(tracts, colorize, year) {
    tracts.eachLayer(function (layer) {
        let props = layer.feature.properties
        //console.log(props)
        layer.setStyle({
            fillColor: colorize(Number(props[year]))
        })


    })

} // end updateMap()

function drawLegend(colorize, breaks) {
    // create a Leaflet control for the legend
    const legendControl = L.control({
        position: 'bottomleft'
    });
    // when the control is added to the map
    legendControl.onAdd = function (map) {

        // create a new division element with class of 'legend' and return
        const legend = L.DomUtil.create('div', 'legend');
        return legend;

    };

    // add the legend control to the map
    legendControl.addTo(map);

    // select div and create legend title
    const legend = document.querySelector('.legend')
    legend.innerHTML = "<h3><span>2006</span> Unemployment Rates</h3><ul>";

    // loop through the break values
    for (let i = 0; i < breaks.length - 1; i++) {

        // determine color value 
        const color = colorize(breaks[i], breaks);

        // create legend item
        const classRange = `<li><span style="background:${color}"></span>
      ${breaks[i].toLocaleString()}% &mdash;
      ${breaks[i + 1].toLocaleString()}% </li>`

        // append to legend unordered list item
        legend.innerHTML += classRange;
    }
    // close legend unordered list
    legend.innerHTML += "</ul>";
} // end drawLegend()

function createSliderUI(tracts, colorize) {
    // create Leaflet control for the slider
    const sliderControl = L.control({
        position: 'bottomright'
    });
    // when added to the map
    sliderControl.onAdd = function (map) {

        // select an existing DOM element with an id of "ui-controls"
        const slider = L.DomUtil.get("ui-controls");

        // disable scrolling of map while using controls
        L.DomEvent.disableScrollPropagation(slider);

        // disable click events while using controls
        L.DomEvent.disableClickPropagation(slider);

        // return the slider from the onAdd method
        return slider;
    }

    // add the control to the map
    sliderControl.addTo(map);
    // select the form element
    const slider = document.querySelector(".year-slider");

    // listen for changes on input element
    slider.addEventListener("input", function (e) {
        // get the value of the selected option
        const currentYear = e.target.value;
        console.log(currentYear)
        // update the map with current timestamp
        updateMap(tracts, colorize, currentYear);
        // update timestamp in legend heading
        document.querySelector(".legend h3 span").innerHTML = currentYear;
    });

} // end createSliderUI()