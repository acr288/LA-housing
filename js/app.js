const map = L.map("map", {
    zoomSnap: 0.1,
    center: [34.0522, -118.2437],
    zoomControl: false,
    zoom: 8,
    minZoom: 6,
    maxZoom: 12,
});

//get tiles
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);


// GETTING DATA


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

        processData(data);
    });



// MAIN FUNCTION

function processData(data) {
    const conversionTextObj = {
        "home_prices_YR1999": "1999",
        "home_prices_YR2003": "2003",
        "home_prices_YR2005": "2005",
        "home_prices_YR2008q3": "2008 q3",
        "home_prices_YR2010q4": "2010 q4",
        "home_prices_YR2012q2": "2012 q2",
        "home_prices_YR2013q3": "2013 q3",
        "home_prices_YR2013q4": "2013 q4",
        "home_prices_YR2018Q1": "2018 q1",
        "home_prices_YR2018Q4": "2018 q4",
    }

    let startInput = document.getElementById("start-input")
    let endInput = document.getElementById("end-input")
    let submitButton = document.getElementById("submit-input");
    let keys = Object.keys(data.features[0].properties)
    let homePriceYearsStr = []

    keys.forEach(str => {
        if (str.includes("home")) {
            homePriceYearsStr.push(str)
        }
    })

    drawBaseMap(data)
    dropDownMenuElements(homePriceYearsStr, startInput, conversionTextObj)
    dropDownMenuElements(homePriceYearsStr, endInput, conversionTextObj)


    submitButton.addEventListener("click", () => {
        const conversionTextObj2 = {
            "home_prices_YR1999": "1999",
            "home_prices_YR2003": "2003",
            "home_prices_YR2005": "2005",
            "home_prices_YR2008q3": "2008 q3",
            "home_prices_YR2010q4": "2010 q4",
            "home_prices_YR2012q2": "2012 q2",
            "home_prices_YR2013q3": "2013 q3",
            "home_prices_YR2013q4": "2013 q4",
            "home_prices_YR2018Q1": "2018 q1",
            "home_prices_YR2018Q4": "2018 q4",
        }
        let keys = Object.keys(data.features[0].properties)
        let homePriceYearsStr = []
        let homePriceKeysIndexed = {}
        let classBreaks = 7
        let counter = 0

        keys.forEach(str => {
            if (str.includes("home")) {
                homePriceYearsStr.push(str)
            }
        })

        homePriceYearsStr.forEach(e => {
            homePriceKeysIndexed[e] = counter
            counter += 1
        })

        let percentDifferenceData = calcPercentDifference(data, homePriceKeysIndexed)
        let rates = getRates(percentDifferenceData)
        const functions = getColor(rates, classBreaks)
        let color = functions[0]
        let breaks = functions[1]


        drawMap(percentDifferenceData, color, "yearDiff", conversionTextObj2)
        drawLegend(breaks, color)
    })
}



// OTHER FUNCTIONS:



// FUNCTIONS ANALYZING DATA:

function calcPercentDifference(data, homePriceKeysIndexed) {
    let start = document.getElementById("start-input").value
    let end = document.getElementById("end-input").value
    let startIndexValue = homePriceKeysIndexed[start]
    let endIndexValue = homePriceKeysIndexed[end]
    let features = data.features

    if ((start == end) || startIndexValue > endIndexValue) {
        alert("The two inputs are either the same or the first is greater than the second. Make sure the first input is less than the second.")
    } else {
        features.forEach(e => {
            let prop = e.properties
            let year1 = +prop[start]
            let year2 = +prop[end]

            if (year1 == 0 || year2 == 0) {
                prop["yearDiff"] = null
            } else if ((year1 == null || year2 == null)) {
                prop["yearDiff"] = null
            } else { 
                prop["yearDiff"] = +(((year2 - year1) / year1) * 100).toFixed(4)
                console.log(prop["yearDiff"])
            }
        })
    }
    return data
}

function getRates(DATA) {
    let rates = []
    let features = DATA.features
    let key = "yearDiff"

    features.forEach(e => {
        let prop = e.properties

        // use only values that are not null
        if (prop["yearDiff"]) {
            rates.push(prop["yearDiff"])
        }
        
    })

    // verify that there are no null values
    return rates
}




// COLOR RELATED FUNCTIONS:

function getColor(rates, classBreaksNum) {

    // Use simple stats to calculate the breaks
    const newBreaks = ss.ckmeans(rates, classBreaksNum).map(e => {
        // get the first element of the array from chroma js color scale
        return e[0]
    })
    // let breaks = chroma.limits(rates, 'q', classBreaksNum); //switched to K-means
    let colorize = chroma.scale(chroma.brewer.PuOr)
        .classes(newBreaks)
        .mode('lab');
    return [colorize, newBreaks]
}

// This is only used in the legend. Fold into function above.
function getBreaks(rates, classBreaksNum) {
    // return chroma.limits(rates, 'q', classBreaksNum); //switched to K-means
    return ss.ckmeans(rates, classBreaksNum).map(e => {
        return e[0]
    })
}




// MAP RELATED FUNCTIONS:

function drawBaseMap(data) {
    let tracts = L.geoJson(data, {
        style: function (feature) {
            return {
                color: "white",
                weight: 0.2,
                fillOpacity: 1,
                fillColor: "black",
            };
        },
        onEachFeature: function (feature, layer) {
            layer.on("mouseover", function () {
                layer
                    .setStyle({
                        color: "#e3e0e0"
                    })
                    .bringToFront();
            });
            layer.on("mouseout", function () {
                layer.setStyle({
                    color: "#838283"
                });
            });
        },
    }).addTo(map);
    // fit the map's bounds and zoom level using the counties extent
    map.fitBounds(tracts.getBounds(), {
        animate: false,
        padding: [18, 18], // add padding around counties
    });
    return tracts
}

function drawMap(data, color, Year, conversionTextObj2) {
    let tracts = drawBaseMap(data)
    updateMap(tracts, color, Year, conversionTextObj2)
}

function updateMap(dataLayer, color, year, conversionTextObj2) {
    


    let newMap = dataLayer.eachLayer(layer => {
        let startInput = document.getElementById("start-input")
        let endInput = document.getElementById("end-input")
        let prop = layer.feature.properties

        if (prop[year]) {
            layer.setStyle({
                fillColor: color(Number(prop[year]))
            })

            let popup = `<h5>Census Tract: ${prop["geoid10"]}</h5> <br>
                    <p>${conversionTextObj2[startInput.value]}: $${prop[startInput.value]} <br>
                    ${conversionTextObj2[endInput.value]}: $${prop[endInput.value]} <br>
                    Percent Difference: ${prop[year].toFixed(4)}%</p>`
            layer.bindPopup(popup);


        } else {
            layer.setStyle({
                fillColor: "FF0000FF"
            })
        }
    }).addTo(map);
}




// LEGEND FUNCTIONS:

function generateLegend() {
    let legendInfo = L.control({
        position: 'bottomleft'
    });
    legendInfo.onAdd = function (map) {
        let legend = L.DomUtil.create('div', 'legend')
        return legend;
    }
    legendInfo.addTo(map);
    return legendInfo
}

function removePreviousLegend() {
    let collection = document.querySelectorAll('.legend');
    for (let elem of collection) {
        elem.remove();
    }
}

function drawLegend(breaks, colorized) {
    removePreviousLegend()
    generateLegend()

    // select div and create legend title
    let legend = document.querySelector('.legend')
    legend.innerHTML = "<h3><span> Legend: </span>  </h3><ul>";

    // loop through the break values
    for (let i = 0; i < breaks.length - 1; i++) {

        // determine color value 
        let color = colorized(breaks[i], breaks);

        // create legend item
        let classRange = `<li><span style="background:${color}"></span>
      ${breaks[i].toLocaleString()}% &mdash;
      ${breaks[i + 1].toLocaleString()}% </li>`

        // append to legend unordered list item
        legend.innerHTML += classRange;
    }
    // close legend unordered list
    legend.innerHTML += "</ul>";
}




// DROPDOWN FUNCTION:
function dropDownMenuElements(data, input,conversionTextKey) {
    data.forEach(e => {
        let optionObj = document.createElement("option");
        optionObj.textContent = conversionTextKey[e];
        optionObj.value = e;
        input.appendChild(optionObj);
    });
}