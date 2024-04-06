// Define SVG dimensions
const width = 600
const height = 400

const scale = width/20

function add(a, b) {
  return {x: a.x + b.x, y: a.y + b.y}
}

function p(x, y) {
  return {x: x, y: y}
}

function mul(a, b) {
  return {x: a.x * b, y: a.y * b}
}

function coord2screen(vec) {
  const flip = {x:vec.x, y:-vec.y}
  const a = add(screen_origin, mul(flip, scale))
  return a
}

function screen2coord(vec) {
  const a = mul(add(vec, mul(screen_origin, -1)), 1/scale)
  const c = {x: a.x, y: -a.y}
  return c
}

// Create SVG element
const svg = d3.select("svg")

// Initialize line data with default slope
const screen_origin = {x: width/2, y: height/2}
const v = {x: 2, y: 2}
const h = {x: 1, y: 3}
const initialData = [v, add(v, h)].map(coord2screen)

//################### axes ####################

// Define scales
const xScale = d3.scaleLinear()
  .domain([-(width/scale)/2, (width/scale)/2]) // Adjust domain as needed
  .range([0, width])

const yScale = d3.scaleLinear()
  .domain([-(height/scale)/2, (height/scale)/2]) // Adjust domain as needed
  .range([height, 0])

// Create axis generators
const xAxis = d3.axisBottom(xScale)
const yAxis = d3.axisLeft(yScale)

// Append axes to SVG
const xaxis_group = svg.append("g")
  .attr("transform", "translate(0," + screen_origin.y + ")") // Translate x-axis to the center of the SVG vertically
  .call(xAxis)
xaxis_group
  .selectAll("line,path")
  .style("stroke", "#ccc") // Change axis line color to grey
xaxis_group
  .selectAll("text")
  .style("fill", "#ccc"); // Change axis label color to grey

const yaxis_group = svg.append("g")
  .attr("transform", "translate(" + screen_origin.x + ",0)") // Translate y-axis to the center of the SVG horizontally
  .call(yAxis)
yaxis_group
  .selectAll("line,path")
  .style("stroke", "#ccc") // Change axis line color to grey
yaxis_group
  .selectAll("text")
  .style("fill", "#ccc"); // Change axis label color to grey



// Create initial line
const line = d3.line()
  .x(d => d.x)
  .y(d => d.y)

linepath = svg.append("path")
  .datum(initialData)
  .attr("fill", "none")
  .attr("stroke", "steelblue")
  .attr("stroke-width", 2)
  .attr("d", line)
svg.append("rect")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", width)
  .attr("height", height)
  .style("fill", "none")
  .style("stroke", "black")
  .style("stroke-width", 1)

// Create a draggable point at the end of the line
const endPoint = svg.append("circle")
  .attr("cx", initialData[1].x)
  .attr("cy", initialData[1].y)
  .attr("r", 3)
  .attr("fill", "red")
  .call(d3.drag()
    .on("drag", function(event) {
	  const vec = screen2coord(p(event.x, event.y))
	  updateLine(vec)
    })
  )

// Function to update line and draggable point position
function updateLine(pt) {
  const newData = [v, pt].map(coord2screen)
  linepath.datum(newData).attr("d", line)
  endPoint.attr("cx", coord2screen(pt).x).attr("cy", coord2screen(pt).y)
}

// console.log('f', screen2coord(p(300, 200)))

