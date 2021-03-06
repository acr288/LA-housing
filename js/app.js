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

    let inglewoodText = document.getElementById("tract1")
    let siliconBeach = document.getElementById("tract2")
    let eastLA = document.getElementById("tract3")
    let storyTracts = [inglewoodText, siliconBeach, eastLA]

    let startInput = document.getElementById("start-input")
    let endInput = document.getElementById("end-input")
    let submitButton = document.getElementById("submit-input")
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


    storyTracts.forEach(e => {
        e.addEventListener("click", () => {
            zoomToTract(e)
        })
    })

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
        let color = getColor(rates, classBreaks)
        let breaks = getBreaks(rates, classBreaks)


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

    return rates
}




// COLOR RELATED FUNCTIONS:

function getBreaks(rates, classBreaksNum) {
    return ss.ckmeans(rates, classBreaksNum).map(e => {
        return e[0]
    })
}

function getColor(rates, classBreaksNum) {
    const breaks = getBreaks(rates, classBreaksNum)
    let colorize = chroma.scale(chroma.brewer.PuOr)
        .classes(breaks)
        .mode('lab');
    return colorize
}

// MAP RELATED FUNCTIONS:

function isSpecifiedTract(tractNumber) {
    if (tractNumber == "06037601001" || tractNumber == "06037273200" || tractNumber == "06037204300") {
        return true
    } else {
        return false
    }

}

function zoomToTract(tract) {
    let textContent = tract.textContent

    if (textContent == "Inglewood") {
        map.setView([33.961018, -118.355370], 15)
    } else if (textContent == "Silicon Beach") {
        map.setView([33.9764002, -118.4667452], 15)
    } else {
        map.setView([34.034, -118.205], 15)
    }
}


function drawBaseMap(data) {
    let tracts = L.geoJson(data, {
        style: function (feature) {
            let prop = feature.properties
            let tractNumber = prop.geoid10
            if (isSpecifiedTract(tractNumber)) {
                return {
                    color: "red",
                    weight: 1.5,
                    fillOpacity: 1,
                    fillColor: "black",
                };
            } else {
                return {
                    color: "white",
                    weight: 0.34,
                    fillOpacity: 1,
                    fillColor: "black",
                };
            }
        },
        onEachFeature: function (feature, layer) { // ACHTUNG: fix color for specific tracts
            let prop = feature.properties
            let tractNumber = prop.geoid10

            layer.on("mouseover", function () {

                if (isSpecifiedTract(tractNumber)) {
                    layer.setStyle({
                            color: "orange"
                        })
                        .bringToFront();
                } else {
                    layer.setStyle({
                            color: "grey"
                        })
                        .bringToFront();
                }
            });
            layer.on("mouseout", function () {
                if (isSpecifiedTract(tractNumber)) {
                    layer.setStyle({
                            color: "red"
                        })
                        .bringToFront();
                } else {

                    layer.setStyle({
                        color: "white"
                    });
                }
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
        let censusTract = prop.geoid10

        if (prop[year]) {
            if (isSpecifiedTract(censusTract)) {
                layer.setStyle({
                    fillColor: color(Number(prop[year])),
                    color: "red",
                    weight: 3.3,
                })
            } else {
                layer.setStyle({
                    fillColor: color(Number(prop[year]))
                })
            }

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
function dropDownMenuElements(data, input, conversionTextKey) {
    data.forEach(e => {
        let optionObj = document.createElement("option");
        optionObj.textContent = conversionTextKey[e];
        optionObj.value = e;
        input.appendChild(optionObj);
    });
}