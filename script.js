console.log("Assignment 5");

var margin = {t:50,r:100,b:50,l:50};
var width = document.getElementById('map').clientWidth - margin.r - margin.l,
    height = document.getElementById('map').clientHeight - margin.t - margin.b;

var canvas = d3.select('.canvas');
var map = canvas
    .append('svg')
    .attr('width',width+margin.r+margin.l)
    .attr('height',height + margin.t + margin.b)
    .append('g')
    .attr('class','canvas')
    .attr('transform','translate('+margin.l+','+margin.t+')');


//choropleth of median household income by census block group in the City of Boston.

//TODO: set up a mercator projection, and a d3.geo.path() generator
//Center the projection at the center of Boston
var bostonLngLat = [-71.088066,42.315520]; //from http://itouchmap.com/latlong.html
var projection = d3.geo.mercator()
    .scale(200000)
    .center(bostonLngLat)
    .translate([width/2, height/2]);


var path = d3.geo.path().projection(projection);



//TODO: create a color scale
//var scaleColor = d3.scale.linear().domain([0,250001]).range(['blue','red']);
var scaleColor = d3.scale.linear().domain([0,250001]).range(['#ff0084','#33001b']);

//TODO: create a d3.map() to store the value of median HH income per block group
var incomeByBlock = d3.map();

//TODO: import data, parse, and draw
queue()
    .defer(d3.json, "data/bos_neighborhoods.geojson")
    .defer(d3.json, "data/bos_census_blk_group.geojson")
    //.defer(d3.csv, "data/acs2013_median_hh_income.csv")
    .defer(d3.csv, "data/acs2013_median_hh_income.csv", parseData)
    .await(function(err, neighborhoods, blocks, income){
        console.log(err);
        var maxIncome = d3.max(income);
        console.log(maxIncome);
        //console.log(neighborhoods);
        //console.log(blocks);
        //console.log(income);
        console.log(incomeByBlock);
        draw(blocks, neighborhoods);
    });
//
//<g class="block-groups">
//    <path class="block-group" ...>
//    </g>
//    <g class="neighborhoods">
//    <g class="neighborhood">
//    <path class="boundary" ...>
//    <text class="label" ...>
//    </g>
//    </g>

function draw(blocks, neighborhoods){
    drawBlocks = map
        .append('g')
        .attr('class', 'many_blocks')
        .selectAll('.blocks')
        .data(blocks.features)
        .enter()
        .append('g')
        .attr('class', 'block-groups')
        .append('path')
        .attr('class', 'block-groups')
        .attr('d',path)
        //.style('fill','black');
        .style('fill',function(d){
            return scaleColor(incomeByBlock.get(d.properties.geoid).income);

        });


    drawNeighborhoods = map
        .append("g")
        .attr('class','neighborhoods')
        .selectAll('neighborhood')
        .data(neighborhoods.features)
        .enter()
        .append('g')
        .attr('class', 'neighborhood')
        .append('path')
        .attr('class', 'boundary')
        .attr('d', path)
        .style("stroke", "white")

        .style("stroke-width", "1px")
        .style("fill", "none");

    drawNeighborhoods = map.selectAll('.neighborhood')
        .append('text')
        .attr('class','label')
        .style('font-family', 'serif')
        .style("font-size", "15px")
        .text(function (d) {return d.properties.Name;})
        .attr("x", function (d) {return path.centroid(d)[0];})
        .attr("y", function (d) {return path.centroid(d)[1];});


}

function parseData(d){
    incomeByBlock.set(d.geoid, {
        'neighborhoodName':d.name,
        'income':+d.B19013001
    });

    return +d.B19013001;
}

