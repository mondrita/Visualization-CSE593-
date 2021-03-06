﻿function addD3Stack(containerId, flattenRecords, key, colorScale) {
    var unixStart = new Date(1970, 0, 1, 12);

    var margin = {left:30, right:30, top:20, bottom:20};
    var width = document.getElementById(containerId).clientWidth
        - margin.left - margin.right;
    var height = 400;

    var tooltip = d3.select("#"+containerId)
        .append("div")
        .attr("class", "remove")
        .attr("id", "info-tooltip")
        .style("position", "absolute")
        .style("z-index", "20")
        .style("visibility", "hidden");

    var xScale = d3.time.scale()
        .range([0, width]);

    var yScale = d3.scale.linear()
        .range([height - 10, 0]);

    var datearray = [];
    colorScale = typeof (colorScale) == 'undefined' ? d3.scale.linear()
        .range(["#B30000", "#E34A33", "#FC8D59", "#FDBB84", "#FDD49E", "#FEF0D9"])
        .domain([0, 0.2, 0.4, 0.6, 0.8, 1]) : colorScale;
    var strokecolor = colorScale(0);

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .ticks(d3.time.months);

    var stack = d3.layout.stack()
        .offset("silhouette")
        .values(function(d) { return d.values; })
        .x(function(d) { return d.Date; })
        .y(function(d) { return +d[key]; });

    var nest = d3.nest()
        .key(function(d) { return d.Key; });

    var area = d3.svg.area()
        .interpolate("cardinal")
        .x(function(d) { return xScale(d.Date); })
        .y0(function(d) { return yScale(d.y0); })
        .y1(function(d) { return yScale(d.y0 + d.y); });

    d3.select("#" + containerId)
        .append("div")
        .attr("id", "chartBody");

    var svg = d3.select("#chartBody")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    tooltip.style("top", document.getElementById("chartBody").offsetTop + "px")
        .style("left", document.getElementById("chartBody").offsetLeft + "px")

    var layers = stack(nest.entries(flattenRecords));

    xScale.domain(d3.extent(flattenRecords, function(d) { return d.Date; }));
    yScale.domain([0, d3.max(flattenRecords, function(d) { return d.y0 + d.y; })]);

    svg.selectAll(".layer")
        .data(layers)
        .enter()
        .append("path")
        .attr("class", "layer")
        .attr("d", function(d) { return area(d.values); })
        .style("fill", function(d, i) { return colorScale(i/stockNames.length); });

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.selectAll(".layer")
        .attr("opacity", 1)
        .on("mouseover", function(d, i) {
            svg.selectAll(".layer")
                .transition()
                .duration(250)
                .attr("opacity", function(d, j) {
                    return j != i ? 0.6 : 1;
                })})
        .on("mousemove", function(d, i) {
            mousex = d3.mouse(this);
            mousex = mousex[0];
            var selectedDate = xScale.invert(mousex);
            var invertedx = parseInt((selectedDate - unixStart)/(1000*60*60*24));
            var selected = (d.values);
            for (var k = 0; k < selected.length; k++) {
                datearray[k] = selected[k].Date
                datearray[k] = parseInt((datearray[k] - unixStart)/(1000*60*60*24));
            }

            mousedate = datearray.indexOf(invertedx);
            pro = d.values[mousedate][key];

            d3.select(this)
                .classed("hover", true)
                .attr("stroke", strokecolor)
                .attr("stroke-width", "0.5px");
            tooltip.html( "<p>" + d.key + "<br>" + pro + "<br>" + selectedDate.toLocaleDateString() + "</p>" )
                .style("visibility", "visible");
        })
        .on("mouseout", function(d, i) {
            svg.selectAll(".layer")
                .transition()
                .duration(250)
                .attr("opacity", "1");
            d3.select(this)
                .classed("hover", false)
                .attr("stroke-width", "0px");
            tooltip.html( "<p>" + d.key + "<br>" + pro + "</p>" )
                .style("visibility", "hidden");
        })

    var vertical = d3.select("#chartBody")
        .append("div")
        .attr("class", "remove")
        .style("position", "absolute")
        .style("z-index", "19")
        .style("width", "1px")
        .style("height", document.getElementById("bodyPanel").clientHeight + "px")
        .style("top", document.getElementById("bodyPanel").offsetTop + "px")
        .style("bottom", "0px")
        .style("left", "0px")
        .style("background", "#fff");

    d3.select("#" + containerId)
        .on("mousemove", function(){
            mousex = d3.mouse(this);
            mousex = mousex[0] + document.getElementById("bodyPanel").offsetLeft;
            vertical.style("left", mousex + "px" )})
        .on("mouseover", function(){
            mousex = d3.mouse(this);
            mousex = mousex[0] + document.getElementById("bodyPanel").offsetLeft;
            vertical.style("left", mousex + "px")});
}