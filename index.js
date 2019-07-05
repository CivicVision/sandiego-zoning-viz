require("https://d3js.org/d3.v5.min.js")
require("topojson-client@3")

var sandiego_buildings = d3.json('https://open-data-cv.s3.amazonaws.com/sandiego_buildings.json')
var sandiego_features = topojson.feature(sandiego_buildings, sandiego_buildings.objects.buildings).features.filter(d => "zone_name" in d.properties)
var buildings = { type: "FeatureCollection", features: sandiego_features }

const height = Math.round(900 / 960 * width);
  const indicator = 'zone_name';
  const noDataColor = '#ccc';
  const projection = d3.geoAlbers();
  const scale = width / 960;
  projection.fitExtent([[20, 20], [width, height]], buildings);
  
  function colorForEntry(d) { 
    if(indicator in d.properties) { 
      if(d.properties[indicator].match(/RS/))
      {
        return '#EA60B9'; 
      }
      if(d.properties[indicator].match(/RE|RX|RT|RM/))
      {
        return '#4CAFC5'; 
       }
    }
    return noDataColor;
  }
  
  const context = canvas.node().getContext("2d")
  canvas = d3.select("body").append("canvas").attr("width", width).attr("height", height)
  
  function draw() {
    const path = d3.geoPath()
    .projection(projection)
    .context(context)
    buildings.features.forEach(function(d) {
      context.beginPath();
      context.fillStyle = colorForEntry(d);
      context.strokeStyle = 'rgba(0,0,0,0.7)';
      context.lineWidth = 0.001;
      path(d);
      context.fill();
      context.stroke();
    });
  }
  
  function zoom() {
    var transform = d3.event.transform;
    context.save();
    context.clearRect(0, 0, width, height);
    context.translate(transform.x, transform.y);
    context.scale(transform.k, transform.k);
    draw();
    context.restore();
  }
  
  
  
  canvas.call(d3.zoom().scaleExtent([1, 8]).on("zoom", zoom))
  
  context.scale(scale, scale);
  context.lineJoin = "round";
  context.lineCap = "round";
  
  draw()
  
}
