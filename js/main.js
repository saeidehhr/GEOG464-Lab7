/* Saeideh Hosseini - 2025 */

var myMap;        // global map object
var baseLayers;   // global basemaps

// URLs to remote GeoJSON (raw) on GitHub
var trainStationsURL = "https://raw.githubusercontent.com/brubcam/GEOG-464_Lab-7/main/DATA/train-stations.geojson";
var megacitiesURL   = "https://raw.githubusercontent.com/brubcam/GEOG-464_Lab-7/main/DATA/megacities.geojson";

/* ---------- Fetch data and add as styled GeoJSON layer ---------- */

function fetchData(url) {
    fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {
            L.geoJSON(json, {
                style: styleAll,
                pointToLayer: generateCircles,
                onEachFeature: addPopups
            }).addTo(myMap);
        })
        .catch(function (error) {
            console.log("Error loading data:", error);
        });
}

/* ---------- Styling functions (Q2, Q3 logic here) ---------- */

function generateCircles(feature, latlng) {
    return L.marker(latlng);
}



function styleAll(feature) {

    // base style object for all features
    var styles = {
        dashArray: null,
        dashOffset: null,
        lineJoin: null,
        lineCap: null,
        stroke: false,
        color: "#000",
        opacity: 1,
        weight: 1,
        fillColor: null,
        fillOpacity: 0,
        radius: 6
    };

    // Example Q3: if feature has a postal code → cyan, else white
    // Adjust property name according to dataset fields
    var props = feature.properties || {};

    // train-stations have postal-related fields; megacities may not
    if (props.postal_code) {
    styles.fillColor = "cyan";
    styles.fillOpacity = 0.8;
    styles.stroke = true;

    } else if (feature.geometry.type === "Point") {
        styles.fillColor = "#ffffff";
        styles.fillOpacity = 0.5;
        styles.stroke = true;
    }

    return styles;
}

/* ---------- Popups & feature interaction ---------- */

function addPopups(feature, layer) {
    var p = feature.properties || {};
    var content = "";

        if (p.City && p.Population) {
        content =
            "<strong>" + p.City + "</strong>" +
            "<br>Population: " + p.Population.toLocaleString();
    }

       else if (p.stat_name) {
        content = "<strong>" + p.stat_name + "</strong>";

        if (p.stat_ID) {
            content += "<br>ID: " + p.stat_ID;
        }
        if (p.city) {
            content += "<br>City: " + p.city;
        }
        if (p.province) {
            content += "<br>Province: " + p.province;
        }
        if (p.postal_code) {
            content += "<br>Postal code: " + p.postal_code;
        }
        if (p.country) {
            content += "<br>Country: " + p.country;
        }
    }

    else {
        content = "No attribute information available";
    }

    layer.bindPopup(content);
}


/* ---------- Map loader with dropdown (Q7) ---------- */

function loadMap(mapid) {

    // Remove existing map instance if it exists
    try {
        myMap.remove();
    } catch (e) {
        // console.log("no map to delete");
    } finally {

        // ---- Basemaps (Q1: add a second tileset) ----
        var CartoDB_Positron = L.tileLayer(
            "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
            {
                attribution: '&copy; OpenStreetMap, CARTO',
                subdomains: "abcd"
            }
        );

        var OpenTopo = L.tileLayer(
            "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
            {
                attribution: "&copy; OpenTopoMap, OpenStreetMap contributors"
            }
        );

        baseLayers = {
            "CartoDB Positron": CartoDB_Positron,
            "OpenTopoMap": OpenTopo
        };

        // ---- Choose map settings & dataset based on dropdown ----
        var center, zoom, dataURL;

        if (mapid === "mapa") {
            // Train stations map
            center = [50, 10];   // Europe-ish
            zoom = 4;
            dataURL = trainStationsURL;
        } else if (mapid === "mapb") {
            // Megacities map
            center = [20, 0];    // global
            zoom = 2;
            dataURL = megacitiesURL;
        } else {
            // fallback
            center = [20, 0];
            zoom = 2;
            dataURL = trainStationsURL;
        }

        // ---- Create new map ----
        myMap = L.map("mapdiv", {
            center: center,
            zoom: zoom,
            minZoom: 1,
            maxZoom: 18,
            layers: [CartoDB_Positron]
        });

        // Basemap control
        L.control.layers(baseLayers).addTo(myMap);

        // ---- Load data for the chosen map ----
        fetchData(dataURL);
    }
}

/* ---------- Q7: add event listener instead of inline onChange ---------- */

window.addEventListener("load", function () {
    var dropdown = document.getElementById("mapdropdown");
    if (!dropdown) {
        console.log("Dropdown not found");
        return;
    }

    dropdown.addEventListener("change", function () {
        var selected = this.value;
        if (selected) {
            loadMap(selected);
        }
    });
});

