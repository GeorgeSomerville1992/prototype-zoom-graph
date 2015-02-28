var data = [
  {name: "Locke",    value:  4},
  {name: "Reyes",    value:  8},
  {name: "Ford",     value: 15},
  {name: "Jarrah",   value: 16},
  {name: "Shephard", value: 23},
  {name: "Kwon",     value: 42}
];

var margin = {top: 20, right: 30, bottom: 30, left: 40},
  width = 500 - margin.left - margin.right,
  height = 300 - margin.top - margin.bottom;

var x = d3.scale.ordinal()
  .domain(data.map(function(d) { return d.name; }))
  .rangeRoundBands([0, width], .1);

var y = d3.scale.linear()
  .domain([0, d3.max(data, function(d) { return d.value; })])
  .range([height, 0]);

var xAxis = d3.svg.axis()
  .scale(x)
  .orient("bottom");

var yAxis = d3.svg.axis()
  .scale(y)
  .orient("left");

var chart = d3.select(".chart")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  .call(d3.behavior.zoom().scaleExtent([1, 10]).on("zoom", zoom));
  
chart.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  .call(xAxis);

chart.append("g")
  .attr("class", "y axis")
  .call(yAxis);

var bars = chart.selectAll(".bar")
  .data(data)
  .enter().append("rect")
  .attr("class", "bar")
  .attr("x", function(d) { return x(d.name); })
  .attr("y", function(d) { return y(d.value); })
  .attr("height", function(d) { return height - y(d.value); })
  .attr("width", x.rangeBand());

function zoom() {
    console.log(bars)
  bars.attr("transform", "translate(" + d3.event.translate[0]+",0)scale(" + d3.event.scale + ",1)");
    chart.select(".x.axis").attr("transform", "translate(" + d3.event.translate[0]+","+(height)+")")
        .call(xAxis.scale(x.rangeRoundBands([0, width * d3.event.scale],.1 * d3.event.scale)));
  chart.select(".y.axis").call(yAxis);
}