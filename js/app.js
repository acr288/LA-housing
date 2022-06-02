//initialize leaflet map
const map = L.map("map", {
    zoomSnap: 0.1,
    center: [34.0522, -118.2437],
    zoomControl: false,
    zoom: 8,
    minZoom: 6,
    maxZoom: 9,
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
        // if has a property called ok, and it is true
        if (response.ok) {
            // The API call was successful!
            // Parse the JSON into a useable format, then return it
            return response.json();
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    })
    // The returned response is now data in a new then method
    .then(function (data) {
        // This is the JSON from our response
        // console.log parameters first.
        //console.log(data);
        // call draw map and send data as parameter
        drawMap(data);
    });

    function NullToNumeric(data){
        console.log(data)
    }


    function drawMap(data) {

       console.log(data)

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

        // updateMap(counties); // draw the map
        // addUi(counties)
        // addLegend()
    }

