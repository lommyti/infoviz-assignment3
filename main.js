
// Setup svg using Bostock's margin convention

var margin = {top: 40, right: 100, bottom: 100, left: 50};

var width = 2000 - margin.left - margin.right,
height = 470 - margin.top - margin.bottom;

var svg = d3.select(".svg")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var fulldict = []; //dataset in dictionary form, for tooltips
var dataset;

var min_appearances = 1;
var included_genders = ["Male Characters", "Female Characters", "Genderfluid Characters"]
var included_gsm = ["", "Homosexual Characters", "Bisexual Characters"]

function makeAll() {
  d3.csv("data/marvel-wikia-data.csv", function(data) {
    makeDataset(data);
    console.log(fulldict);
    makeViz(dataset);
  });
}
makeAll()

var parse = d3.time.format("%Y").parse;


function makeDataset(charData) {
  // console.log(charData[0]);
  fulldict = [];
  dataset = d3.layout.stack()(["Male Characters", "Female Characters", "Genderfluid Characters"].map(function(sex) {
    let tempData = datasetHelper(charData, sex);
    fulldict.push(tempData)
    return dictToArr(tempData);
  }));
}



function datasetHelper(charData, s) {
  // minYear: 1939, maxYear: 2013
  let tempData = {}; // {year: 1964, sexCount: 1}
  charData.map(function(d) {
    if(typeof d.Year !== 'undefined' && d.Year.length === 4) {
      let yr = parseInt(d.Year);
      let sex = d.SEX;
      let gsm = d.GSM;
      let num_app = parseInt(d.APPEARANCES);
      // console.log("gsm: |", gsm, "|");
      if(s === sex && num_app >= min_appearances && included_genders.includes(sex) && (included_gsm.includes(gsm))) {
        // console.log("gsm: ", gsm)
        if(yr in tempData) {
          tempData[yr] = tempData[yr] + 1;
        }
        else {
          tempData[yr] = 1;
        }
      }
    }
  });

  for(var curYear = 1939; curYear <= 2013; curYear++) {
    if (!(curYear in tempData)) {
      tempData[curYear] = 0;
    }
  }

  return tempData;

}

function dictToArr(dict) {
  // turn it into array
  let finalArr = []
  for (const [key, value] of Object.entries(dict)) {
    finalArr.push({x: parse(key),y: value});
  }
  return finalArr;
}







function makeViz(dataset) {
  // Set x, y and colors
  var x = d3.scale.ordinal()
  .domain(dataset[0].map(function(d) {
    return d.x;
  }))
  .rangeRoundBands([10, width-10], 0.02);

  // console.log(dataset);

  var y = d3.scale.linear()
  .domain([0, d3.sum(dataset, function(d) {
    return d3.max(d, function(d) {
      return d.y;
    });
  })])
  .range([height, 0]);

  // console.log("x: ", x, "y: ", y);

  var colors = ["#84b3ff", "#ffc4dd", "#c3ffba"];


  // Define and draw axes
  var yAxis = d3.svg.axis()
  .scale(y)
  .orient("left")
  .ticks(4)
  .tickSize(-width, 0, 0)
  .tickFormat( function(d) { return d } );

  var xAxis = d3.svg.axis()
  .scale(x)
  .orient("bottom")
  .tickFormat(d3.time.format("%Y"));


  svg.append("g")
  .attr("class", "y axis")
  .call(yAxis);

  svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  .call(xAxis)
  .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");



  // Create groups for each series, rects for each segment
  var groups = svg.selectAll("g.cost")
  .data(dataset)
  .enter().append("g")
  .attr("class", "cost")
  .style("fill", function(d, i) { return colors[i]; });

  var rect = groups.selectAll("rect")
  .data(function(d) { return d; })
  .enter()
  .append("rect")
  .attr("x", function(d) { return x(d.x); })
  .attr("y", function(d) { return y(d.y0 + d.y); })
  .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); })
  .attr("width", x.rangeBand())

  .on("mouseover", function() { tooltip.style("display", null); })
  .on("mouseout", function() { tooltip.style("display", "none"); })
  .on("mousemove", function(d) {
    var xPosition = d3.mouse(this)[0] - 15;
    var yPosition = d3.mouse(this)[1] - 25;
    tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
    // tooltip.select("text").text("year: " + d.x.getFullYear()
    //   + "\n# male: " + fulldict[0][parseInt(d.x.getFullYear())]
    //   + "\n# female: " + fulldict[1][parseInt(d.x.getFullYear())]
    //   + "\n# genderfluid: " + fulldict[2][parseInt(d.x.getFullYear())]);
    tooltip.select("text").text(tooltipText(d.x.getFullYear()));
  });

  function tooltipText(year) {
    let str = "year: " + year;
    if(included_genders.includes("Male Characters")) {
      str += ", # male: " + fulldict[0][year];
    }
    if(included_genders.includes("Female Characters")) {
      str += ", # female: " + fulldict[1][year];
    }
    if(included_genders.includes("Genderfluid Characters")) {
      str += ", # genderfluid: " + fulldict[2][year]
    }
    return str;
  }


  // Draw legend
  var legend = svg.selectAll(".legend")
  .data(colors)
  .enter().append("g")
  .attr("class", "legend")
  .attr("transform", function(d, i) { return "translate(" + (-1815 + i * 200) + ", 410)"; });

  legend.append("rect")
  .attr("x", width - 18)
  .attr("width", 18)
  .attr("height", 18)
  .style("fill", function(d, i) {return colors.slice()[i];});

  legend.append("text")
  .attr("x", width + 5)
  .attr("y", 9)
  .attr("dy", ".35em")
  .style("text-anchor", "start")
  .text(function(d, i) {
    switch (i) {
      case 0: return "Male Characters";
      case 1: return "Female Characters";
      case 2: return "Genderfluid Characters";
    }
  });



  // Prep the tooltip bits, initial display is hidden
  var tooltip = svg.append("g")
  .attr("class", "tooltip")
  .style("display", "none");

  // tooltip.append("rect")
  // .attr("width", 10)
  // .attr("height", 20)
  // .attr("fill", "white")
  // .style("opacity", 0.5);

  tooltip.append("text")
  .attr("x", 15)
  .attr("dy", "1.2em")
  .style("text-anchor", "middle")
  .attr("font-size", "12px")
  .attr("font-weight", "bold");




  //slider stuff
  d3.select("#goal").on("input", function() {
    min_appearances = this.value;
  });

  function updateGenders() {
    let tempGenders = []
    d3.selectAll("input[name='gender']").each(function(d) {
      cb = d3.select(this);
      if(cb.property("checked")) {
        tempGenders.push(cb.property("value"));
      }
      included_genders = tempGenders
    });
  }

  function updateGSM() {
    let tempGSM = []
    d3.selectAll("input[name='sexuality']").each(function(d) {
      cb = d3.select(this);
      if(cb.property("checked")) {
        tempGSM.push(cb.property("value"));
      }
      included_gsm = tempGSM
    });
    console.log("included_gsm: ", included_gsm)
  }

  document.getElementById("filter_app_button").addEventListener("click", function(){
    // console.log(min_appearances)
    svg.selectAll("*").remove();
    d3.select('#goal-value').text(min_appearances);
    updateGenders();
    updateGSM();
    makeAll();
  });


}
