// Function to create the map and add earthquake markers
function createMap(earthquakeMarkers) {
    // Create the tile layer that will be the background of our map.
    let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
  
    // Create a baseMaps object to hold the streetmap layer.
    let baseMaps = {
      "Street Map": streetmap
    };
  
    // Create an overlayMaps object to hold the earthquake markers layer.
    let overlayMaps = {
      "Earthquake Markers": earthquakeMarkers
    };
  
    // Create the map object with options.
    let map = L.map("map", {
      center: [20, 0],
      zoom: 2,
      layers: [streetmap, earthquakeMarkers]
    });
  
    // Create a layer control, and add it to the map.
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(map);
  
    // Create a legend to display information about our map.
    let legend = L.control({
      position: "bottomright"
    });
  
    // When the layer control is added, insert a div with the class of "legend".
    legend.onAdd = function() {
      let div = L.DomUtil.create("div", "legend");
      return div;
    };
  
    // Add the info legend to the map.
    legend.addTo(map);
  
    // Update the legend's innerHTML with the depth ranges and corresponding colors.
    updateLegend();
  }

  // Function to update the legend's innerHTML with the depth ranges and corresponding colors.
  function updateLegend() {
    let legend = document.querySelector(".legend");
    let depths = [0, 10, 30, 50, 70, 90];
    
    legend.innerHTML = '<b>Depth</b><br><ul>';
    for (let i = 0; i < depths.length; i++) {
      legend.innerHTML +=
        '<li style="background:' + getColor(depths[i] + 1) + '"></li> ' +
        depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
    }
    legend.innerHTML += '</ul>';
  }
  
  // Function to get color based on depth (green to red)
  function getColor(depth) {
    return depth > 90 ? '#FF0000' :
           depth > 70 ? '#FF4500' :
           depth > 50 ? '#FF8C00' :
           depth > 30 ? '#FFD700' :
           depth > 10 ? '#ADFF2F' :
                        '#00FF00';
  }
  
  // Function to get radius based on magnitude
  function getRadius(magnitude) {
    return magnitude * 3;
  }
  
  // Function to create markers from earthquake data
  function createMarkers(response) {
    // Pull the "features" property from response.
    let earthquakes = response.features;
  
    // Initialize an array to hold earthquake markers.
    let earthquakeMarkers = [];
  
    // Loop through the earthquakes array.
    for (let index = 0; index < earthquakes.length; index++) {
      let earthquake = earthquakes[index];
      let coordinates = earthquake.geometry.coordinates;
      let properties = earthquake.properties;
  
      // For each earthquake, create a marker, and bind a popup with the earthquake's details.
      let earthquakeMarker = L.circleMarker([coordinates[1], coordinates[0]], {
        radius: getRadius(properties.mag),
        fillColor: getColor(coordinates[2]),
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      }).bindPopup(
        `<h3>Magnitude: ${properties.mag}</h3><hr><p>Location: ${properties.place}</p><p>Depth: ${coordinates[2]} km</p>`
      );
  
      // Add the marker to the earthquakeMarkers array.
      earthquakeMarkers.push(earthquakeMarker);
    }
  
    // Create a layer group that's made from the earthquake markers array, and pass it to the createMap function.
    createMap(L.layerGroup(earthquakeMarkers));
  }
  
  // Perform an API call to the USGS Earthquake API to get the earthquake information. Call createMarkers when it completes.
  d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(createMarkers);
  