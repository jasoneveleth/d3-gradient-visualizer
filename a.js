// Define SVG dimensions
const width = 1200
const height = 400

const axis_width = 400

const scale = 600/14 // 600 pixels per 14 units


// Initialize line data with default slope
const screen_origin1 = {x: axis_width/2, y: height/2}
const v = {x: 2, y: 2}
const h = {x: 1, y: 2}

const gap = 50
const screen_origin2 = {x: 3*axis_width/2 + gap, y: height/2}
function add(a, b) {
  return {x: a.x + b.x, y: a.y + b.y}
}

function p(x, y) {
  return {x: x, y: y}
}

function mul(a, b) {
  return {x: a.x * b, y: a.y * b}
}

function matmul(A, b) {
  return {x: A[0].x*b.x + A[1].x*b.y, y: A[0].y*b.x + A[1].y*b.y}
}

function coord2screen(vec, origin=screen_origin1) {
  const flip = {x:vec.x, y:-vec.y}
  const a = add(origin, mul(flip, scale))
  return a
}

function screen2coord(vec) {
  const a = mul(add(vec, mul(screen_origin1, -1)), 1/scale)
  const c = {x: a.x, y: -a.y}
  return c
}

// Create SVG element
const svg = d3.select("svg")

// define arrow markers for vectors
svg.append("defs").append("marker")
    .attr("id", "arrowhead")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 8)
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
  .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", "steelblue");

//################### axes ####################

// Define scales
const xScale = d3.scaleLinear()
  .domain([-(axis_width/scale)/2, (axis_width/scale)/2]) // Adjust domain as needed
  .range([0, axis_width])

const yScale = d3.scaleLinear()
  .domain([-(height/scale)/2, (height/scale)/2]) // Adjust domain as needed
  .range([height, 0])

// Create axis generators
const xAxis = d3.axisBottom(xScale)
const yAxis = d3.axisLeft(yScale)

// Append axes to SVG
const xaxis_group = svg.append("g")
  .attr("transform", "translate(0," + screen_origin1.y + ")") // Translate x-axis to the center of the SVG vertically
  .call(xAxis)
xaxis_group
  .selectAll("line,path")
  .style("stroke", "#ccc") // Change axis line color to grey
xaxis_group
  .selectAll("text")
  .style("fill", "#ccc"); // Change axis label color to grey

const yaxis_group = svg.append("g")
  .attr("transform", "translate(" + screen_origin1.x + ",0)") // Translate y-axis to the center of the SVG horizontally
  .call(yAxis)
yaxis_group
  .selectAll("line,path")
  .style("stroke", "#ccc") // Change axis line color to grey
yaxis_group
  .selectAll("text")
  .style("fill", "#ccc"); // Change axis label color to grey
// create a rectangle around the axes
svg.append("rect")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", axis_width)
  .attr("height", height)
  .style("fill", "none")
  .style("stroke", "black")
  .style("stroke-width", 1)

// ################### axes2 ####################

// Create axis generators
const xAxis2 = d3.axisBottom(xScale)
const yAxis2 = d3.axisLeft(yScale)

// Append axes to SVG
const xaxis_group2 = svg.append("g")
  .attr("transform", "translate(" + (screen_origin2.x - axis_width/2 + gap) + "," + screen_origin2.y + ")") // Translate x-axis to the center of the SVG vertically
  .call(xAxis)
xaxis_group2
  .selectAll("line,path")
  .style("stroke", "#c0c") // Change axis line color to grey
xaxis_group2
  .selectAll("text")
  .style("fill", "#c0c"); // Change axis label color to grey

const yaxis_group2 = svg.append("g")
  .attr("transform", "translate(" + (screen_origin2.x + gap) + ",0)") // Translate y-axis to the center of the SVG horizontally
  .call(yAxis)
yaxis_group2
  .selectAll("line,path")
  .style("stroke", "#c0c") // Change axis line color to grey
yaxis_group2
  .selectAll("text")
  .style("fill", "#c0c"); // Change axis label color to grey
// create a rectangle around the axes
svg.append("rect")
  .attr("x", screen_origin2.x - axis_width/2 + gap)
  .attr("y", 0)
  .attr("width", axis_width)
  .attr("height", height)
  .style("fill", "none")
  .style("stroke", "black")
  .style("stroke-width", 1)

// ################### line ####################

const initialData = [v, add(v, h)].map(x => coord2screen(x))

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
  .attr("marker-end", "url(#arrowhead)") // Use the arrowhead marker
// Create a draggable point at the end of the line
const endPoint = svg.append("circle")
  .attr("cx", initialData[1].x)
  .attr("cy", initialData[1].y)
  .attr("r", 3)
  .attr("fill", "white")
  .attr("stroke", "black")
  .attr("stroke-width", 1)
  .call(d3.drag()
    .on("drag", function(event) {
	  const vec = screen2coord(p(event.x, event.y))
	  updateLine(vec)
	  updateLine2(vec)
    })
  )

// Function to update line and draggable point position
function updateLine(pt) {
  const newData = [v, pt].map(x => coord2screen(x))
  linepath.datum(newData).attr("d", line)
  endPoint.attr("cx", coord2screen(pt).x).attr("cy", coord2screen(pt).y)
}

// ################### line2 ####################

function f(v) {
  return {x: v.x, y: 0.5*v.y}
}

function Df(v) {
	return [{x: 1, y: 0}, {x: 0, y: 0.5}]
}

function line2_func(v, h) {
	return [f(v), add(f(v), matmul(Df(v), h))]
}

const initialData2 = line2_func(v, h).map(x => coord2screen(x, screen_origin2))
const f_image_data = coord2screen(f(add(v, h)), screen_origin2)

// Create initial line
const line2 = d3.line()
  .x(d => d.x)
  .y(d => d.y)

linepath2 = svg.append("path")
  .datum(initialData2)
  .attr("fill", "none")
  .attr("stroke", "steelblue")
  .attr("stroke-width", 2)
  .attr("d", line)
  .attr("marker-end", "url(#arrowhead)") // Use the arrowhead marker
// Create a draggable point at the end of the line
const endPoint2 = svg.append("circle")
  .attr("cx", initialData2[1].x)
  .attr("cy", initialData2[1].y)
  .attr("r", 3)
  .attr("fill", "orange")
const f_image = svg.append("circle")
  .attr("cx", f_image_data.x)
  .attr("cy", f_image_data.y)
  .attr("r", 3)
  .attr("fill", "purple")

// Function to update line and draggable point position
function updateLine2(pt) {
  const h = add(pt, mul(v, -1))
  const newData = line2_func(v, h).map(x => coord2screen(x, screen_origin2))
  const actual = f(add(v, h))
  const screen_actual = coord2screen(actual, screen_origin2)

  linepath2.datum(newData).attr("d", line)
  endPoint2.attr("cx", newData[1].x).attr("cy", newData[1].y)
  f_image.attr("cx", screen_actual.x).attr("cy", screen_actual.y)
}

