async function createChart() {
  var sandiego_buildings = await d3.json('https://open-data-cv.s3.amazonaws.com/sandiego_buildings.json')
  var sandiego_features = topojson.feature(sandiego_buildings, sandiego_buildings.objects.buildings).features.filter(d => "zone_name" in d.properties)
  var buildings = { type: "FeatureCollection", features: sandiego_features }

  var bbox = d3.select('#map').node().getBoundingClientRect()
  const width = bbox.width;
  const height = bbox.height;
  const indicator = 'zone_name';
  const noDataColor = '#ccc';
  const projection = d3.geoAlbers();
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

  d3.select("#map").html('');
  const canvas = d3.select("#map").append("canvas").attr("width", width).attr("height", height)
  const context = canvas.node().getContext("2d")

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

  context.lineJoin = "round";
  context.lineCap = "round";

  draw()
  return canvas;
}
function downloadImage(canvas) {
  var link = document.createElement("a");
  link.download = "sandiego.png";

  canvas.toBlob(function(blob){
    link.href = URL.createObjectURL(blob);
    link.click();
  },'image/png');
}
const canvas = createChart();
async function download() {
  const node = await canvas;
  downloadImage(node.node());
}
