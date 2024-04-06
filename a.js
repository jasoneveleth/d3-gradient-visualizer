function add(a, b) {
  return {x: a.x + b.x, y: a.y + b.y};
}

function p(x, y) {
  return {x: x, y: y};
}

// Define SVG dimensions
const width = 600;
const height = 400;

// Create SVG element
const svg = d3.select("svg");

// Initialize line data with default slope
let slope = 1;
const origin = {x: width/2, y: height/2};
const initialData = [origin, add(origin, {x: 10, y: slope*10})];

// Create initial line
const line = d3.line()
  .x(d => d.x)
  .y(d => d.y);

svg.append("path")
  .datum(initialData)
  .attr("fill", "none")
  .attr("stroke", "steelblue")
  .attr("stroke-width", 2)
  .attr("d", line);
svg.append("rect")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", width)
  .attr("height", height)
  .style("fill", "none")
  .style("stroke", "black")
  .style("stroke-width", 1);

// Function to update line based on slope
function updateLine(newSlope) {
  slope = newSlope;
  const newData = [
  add(initialData[0], {x: 0, y: 0}), 
  add(initialData[1], {x: 10, y: slope*10})
  ];
  svg.select("path")
	.datum(newData)
	.attr("d", line);
}

// Slider event listener
d3.select("#slopeSlider").on("input", function() {
  const newSlope = +this.value;
  updateLine(newSlope);
});
