// D3 Scatterplot Assignment

var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "percentPoverty";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
        d3.max(data, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
  
  }

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup,labelTextGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]));

      labelTextGroup.transition()
      .duration(1000)
      .attr("dx", d => newXScale(d[chosenXAxis]));

      return circlesGroup;

  }
  
  // function used for updating circles group with new tooltip
  function updateToolTip(chosenXAxis, circlesGroup) {
  
    if (chosenXAxis === "percentPoverty") {
      var label = "In Poverty:";
    }
    else {
      var label = "Median Income:";
    }
  
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>${label} ${d[chosenXAxis]}<br>No Insurance: ${d.noHealthInsurance}`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(censusData) {
      toolTip.show(censusData);
    })
      // onmouseout event
      .on("mouseout", function(censusData, index) {
        toolTip.hide(censusData);
      });
  
    return circlesGroup;
  }
  
// Retrieve data from the CSV file and execute everything below
d3.csv("data/dataMain.csv", function(err, data) {
    if (err) throw err;
  
    // parse data
  data.forEach(function(censusData) {
    censusData.percentPoverty = +censusData.poverty;
    censusData.noHealthInsurance = +censusData.healthcare;
    censusData.mediumIncome = +censusData.income;
  });

// debugger;  
// xLinearScale function above csv import
var xLinearScale = xScale(data, chosenXAxis);

// Create y scale function
var yLinearScale = d3.scaleLinear()
  .domain([0, d3.max(data, d => d.noHealthInsurance)])
  .range([height, 0]);

// Create initial axis functions
var bottomAxis = d3.axisBottom(xLinearScale);
var leftAxis = d3.axisLeft(yLinearScale);

// append x axis
var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

// append y axis
chartGroup.append("g")
    .call(leftAxis);

// add x-axis "Demographics" title
chartGroup.append("text")
    .attr("transform", `translate(${width - 100},${height - 5})`)
    .attr("class", "axis-text-main")
    .text("Demographics") 

// add y-axis "Behavioral Risk Factors" title
chartGroup.append("text")
    .attr("transform", `translate(15,160 )rotate(270)`)
    .attr("class", "axis-text-main")
    .text("Behavioral Risk Factors")

// append initial circles
var circlesSelection = chartGroup.selectAll("circle")
    .data(data)
    .enter();

var circlesGroup = circlesSelection.append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.noHealthInsurance))
    .attr("r", 20)
    .attr("fill", "blue")
    .attr("opacity", ".5");

// create state abbrev labels 
var labelTextGroup = circlesSelection
    .append("text")
    .attr("dx", d => xLinearScale(d[chosenXAxis]))
    .attr("dy", d => yLinearScale(d.noHealthInsurance))
    .attr("font-size", "12px")
    .attr("text-anchor", "middle")
    .text(function (d) {
      return d.abbr;
    })

  // Create group for  2 x- axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var percentPovertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "percentPoverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var medianIncomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "medianIncome") // value to grab for event listener
    .classed("inactive", true)
    .text("Median Income");

  // append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .classed("active", true)
    .text("Lack of Health Insurance (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;
        // console.log(chosenXAxis)
        // updates x scale for new data
        xLinearScale = xScale(data, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, labelTextGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "medianIncome") {
          medianIncomeLabel
            .classed("active", true)
            .classed("inactive", false);
          percentPovertyLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          medianIncomeLabel
            .classed("active", false)
            .classed("inactive", true);
          percentPovertyLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
});