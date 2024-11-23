// Define SVG dimensions
const width = 800
const height = 375

const axis_width = 375

const scale = 600/14 // 600 pixels per 14 units


// Initialize line data with default slope
const screen_origin1 = {x: axis_width/2, y: height/2}
const v_init = {x: 2, y: 2}
const h_init = {x: 1, y: 2}

const gap = 25
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

// Either computs b^T A if A is a matrix
// or dot product if A is a vector
function matmul2(b, A) {
  if (Array.isArray(A)) {
	return {x: A[0].x*b.x + A[0].y*b.y, 
			y: A[1].x*b.x + A[1].y*b.y}
  } else {
	return b.x*A.x + b.y*A.y
  }
}

function transpose(A) {
  return [{x: A[0].x, y: A[1].x}, 
	      {x: A[0].y, y: A[1].y}]
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
const svg = d3.select("#graphssvg")

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
    .attr("fill", "black");

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

const initialData = [v_init, add(v_init, h_init)].map(x => coord2screen(x))

// Create initial line
const line = d3.line()
  .x(d => d.x)
  .y(d => d.y)

let cache_v_h = add(v_init, h_init)

linepath = svg.append("path")
  .datum(initialData)
  .attr("fill", "none")
  .attr("stroke", "black")
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
	  cache_v_h = vec
	  redraw()
    })
  )

// Function to update line and draggable point position
function updateAxis1(pt) {
  const newData = [v_init, pt].map(x => coord2screen(x))
  linepath.datum(newData).attr("d", line)
  endPoint.attr("cx", coord2screen(pt).x).attr("cy", coord2screen(pt).y)
}

// ################### line2 ####################
const A = [{x: 1, y: 0}, {x: 0, y: 0.5}]
const b = {x: 0, y: -3}

const linear_f = (v) => {
  return add(matmul(A, v), b)
}
const linear_Df = (v) => {
  return h => {
	return matmul(A, h)
  }
}
// note: we approximate scalars as (x, 0)
const quadratic_f = (v) => {
  return {x: matmul2(v, matmul(A, v)) - (-b.y), y: 0}
}
const quadratic_Df = (v) => {
  return h => {
	const should_be_row_vec = add(matmul2(v, A), matmul2(v, transpose(A)))
	return {x: matmul2(h, should_be_row_vec), y: 0}
  }
}
const sine_f = (v) => {
  return {x: Math.sin(v.x), y: Math.sin(v.y)}
}
const sine_Df = (v) => {
  return h => {
	return matmul([{x: Math.cos(v.x), y: 0}, {x: 0, y: Math.cos(v.y)}], h)
  }
}

let f = linear_f
let Df = linear_Df

function line2_func(v, h) {
  return [f(v), add(f(v), Df(v)(h))]
}

const initialData2 = line2_func(v_init, h_init).map(x => coord2screen(x, screen_origin2))
const f_image_data = coord2screen(f(add(v_init, h_init)), screen_origin2)

// Create initial line
const line2 = d3.line()
  .x(d => d.x)
  .y(d => d.y)

linepath2 = svg.append("path")
  .datum(initialData2)
  .attr("fill", "none")
  .attr("stroke", "black")
  .attr("stroke-width", 2)
  .attr("d", line)
  .attr("marker-end", "url(#arrowhead)") // Use the arrowhead marker
// Create a draggable point at the end of the line
const endPoint2 = svg.append("circle")
  .attr("cx", initialData2[1].x)
  .attr("cy", initialData2[1].y)
  .attr("r", 3)
  .attr("fill", "orange")
// we want to modify the 'transform' attribute of the path, but it applies to the whole group
const f_image = svg.append("g")
  .attr("transform", "translate(" + f_image_data.x + "," + f_image_data.y + ")") // Translate to the point's position
f_image.append("path")
  .attr("d", "M-5,-5L5,5M5,-5L-5,5") // Define the path for the X mark
  .attr("stroke", "red")
  .attr("stroke-width", 2);

// Function to update line and draggable point position
function updateAxis2(pt) {
  const h = add(pt, mul(v_init, -1))
  const newData = line2_func(v_init, h).map(x => coord2screen(x, screen_origin2))
  const screen_actual = coord2screen(f(add(v_init, h)), screen_origin2)

  linepath2.datum(newData).attr("d", line)
  endPoint2.attr("cx", newData[1].x).attr("cy", newData[1].y)
  f_image.attr("transform", "translate(" + screen_actual.x + "," + screen_actual.y + ")")
}

funcs_options = ["linear: Av + b", "quadratic: v^TAv - b", "sine: sin(v)"]

d3.select("#selectButton")
  .selectAll('myOptions')
	.data(funcs_options)
  .enter()
	.append('option')
  .text(function (d) { return d; }) // text showed in the menu
  .attr("value", function (d) { return d[0]; }) // corresponding value returned by the button

d3.select("#selectButton").on("change", function(d) {
	var selectedOption = d3.select(this).property("value")
	if (selectedOption == "l") {
	  f = linear_f
	  Df = linear_Df
	} else if (selectedOption == "q") {
	  f = quadratic_f
	  Df = quadratic_Df
	} else if (selectedOption == "s") {
	  f = sine_f
	  Df = sine_Df
	}
})

d3.select("#resetButton").on("click", function(d) {
  cache_v_h = add(v_init, h_init)
  redraw()
})

function redraw() {
  const h = add(cache_v_h, mul(v_init, -1))
  const v = v_init
  const lin_approx = add(f(v), Df(v)(h))
  r = (x) => x.toFixed(2)
  updateAxis1(add(v, h))
  updateAxis2(add(v, h))

  let df_str
  if (f == quadratic_f) {
	df_str = `Df(v) = (${r(Df(v)({x: 1, y: 0}).x)}, ${r(Df(v)({x: 0, y: 1}).x)})`
  } else {
	console.log(Df(v)({x: 1, y: 0}))
	df_str = `Df(v) = ((${r(Df(v)({x: 1, y: 0}).x)}, ${r(Df(v)({x: 0, y: 1}).x)})
         (${r(Df(v)({x: 1, y: 0}).y)}, ${r(Df(v)({x: 0, y: 1}).y)}))`
  }
  document.getElementById("vals").innerHTML = `<pre>
v = (${v.x}, ${v.y})
h = (${r(h.x)}, ${r(h.y)})
f(v) = (${r(f(v).x)}, ${r(f(v).y)})
${df_str}
f(v + h) = (${r(f(add(v, h)).x)}, ${r(f(add(v, h)).y)})
f(v) + Df(v)h = (${r(lin_approx.x)}, ${r(lin_approx.y)})
</pre>`
}

redraw()

