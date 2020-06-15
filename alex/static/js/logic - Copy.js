function GenerateMap()
{ 
  // Creating our initial map object
  // We set the longitude, latitude, and the starting zoom level (arbitrary values)
  // Add to <div id="map"/>
  var mapboxMap = L.map("map", {
    center: [45.52, -122.67],
    zoom: 7
  });

  var darkSatelliteLayer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox/dark-v9',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: MBAPI_KEY
  }).addTo(mapboxMap);

  // Create bottom left leaflet legend
  let legend = L.control({position: 'bottomleft'});

  legend.onAdd = function(map) {
    let div = L.DomUtil.create('div', 'info legend'),
      grades = [0, 1, 2, 3, 4, 5, 6, 7],
      labels = ["0-1", "1-2", "2-3", "3-4", "4-5", "5-6", "6-7", "7+"];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
          '<i style="background:' + GetColor(grades[i]) + '"></i> ' +
          grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
  };
  legend.addTo(mapboxMap);

  return mapboxMap;
} 

function CreateFeatures(geoJson, map) {

  function onEachLayer(feature) {
    return new L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
      radius: feature.properties.mag * 2,
      fillOpacity: 0.8,
      color: GetColor(feature.properties.mag),
      fillColor: GetColor(feature.properties.mag)
    });
  }

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p><hr><p>" + feature.properties.mag + "</p>");
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(geoJson, {
    onEachFeature: onEachFeature,
    pointToLayer: onEachLayer
  }).addTo(map);
}

// Load in geojson data
var geoData = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson";

var mapBoxMap = GenerateMap(); 

// Grab data with d3
d3.json(geoData, function(data) {
  console.log(data);
  CreateFeatures(data, mapBoxMap);
  
});


function GetColor(magnitude) {
  // up to magnitude 7, anything higher uses red
  var colors = ["lightgreen","green", "darkgreen", "lightblue", "blue", "darkblue", "orange", "red"]

  var mag = Math.min(Math.floor(magnitude), colors.length - 1);
  return colors[mag];
};