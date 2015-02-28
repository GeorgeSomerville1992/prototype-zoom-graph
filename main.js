// Hub experimental scrollable zoomable graph prototype developed by king George (with some of Vlads help)
// graph is fully working with test data along with panning and zooming functionality.
// Axies are not 100% working when zooming at high levels 
// Graph is able to show lines and bars (or both at the same time) However only manually via function call on line 147


// sizing information, including margins so there is space for labels, etc
var margin = {
        top: 30,
        right: 20,
        bottom: 20,
        left: 20
    },
    width = 1340 - margin.left - margin.right,
    overviewWidth = 1300,
    height = 300 - margin.top - margin.bottom,
    overviewHeight = 100,

    marginOverview = {
        top: 330,
        right: margin.right,
        bottom: 20,
        left: margin.left
    },
    heightOverview = 400 - marginOverview.top - marginOverview.bottom

var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S").parse;


var colourArray = ["#C6F9D6", "#C6D6DD", "#F7C8C8", "#D0DFF4"]
var darkColourArray = [""]
var colour = d3.scale.ordinal()
    .range(["#C6F9D6", "#C6D6DD", "#F7C8C8", "#D0DFF4", "#F4D4BB"]);
colourCounter = 0;

// mathematical scales for the x and y axes
var x = d3.time.scale()
    .range([0, width]);
var y = d3.scale.linear()
    .range([height, 0]);
var xOverview = d3.time.scale()
    .range([0, width]);
var yOverview = d3.scale.linear()
    .range([heightOverview, 0]);


var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickFormat(d3.time.format('%b %Y'))
    .tickPadding(0)


var yAxis = d3.svg.axis()
    .scale(y)
    .tickSize(0)
    .tickPadding(0)
    .orient("left");
var xAxisOverview = d3.svg.axis()
    .scale(xOverview)
    .orient("bottom")


// something for us to render the chart into
var svg = d3.select("#mainContainer")
    .append("svg") // the overall space
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr('class', "mainContainer");
var main = svg.append("g")
    .attr("class", "main")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var overview = d3.select("#toggleContainer")
    .append("svg")
    .attr("class", "overview")
    .attr("width", width)
    .attr("height", overviewHeight + margin.top + margin.bottom)
    // .attr("transform", "translate(0,100)");

// brush tool to let us zoom and pan using the overview chart
var brush = d3.svg.brush()
    .x(xOverview)
    .on("brush", brushed)
    // setup complete, let's get some data!
var area = d3.svg.area()
    .interpolate("step-after")
    .x(function(d) {
        return x(d.date);
    })
    .y0(y(0))
    .y1(function(d) {
        return y(d.value);
    });
d3.json("jsonData.json", function(data) {

    data = parse();

    x.domain(d3.extent(data, function(d) {
        return d.date;
    }));
    y.domain([0, d3.max(data, function(d) {
        return d.total;
    })]);

    xOverview.domain(x.domain());
    yOverview.domain(y.domain());

    colour.domain(d3.keys(data[0]));

    main.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .attr({
            height: "1px",
            "background-color": "none"
        })
        .call(xAxis);

    main.append("g")
        .attr("class", "y axis")
        .append("rect")
        .attr("x", "-50px")
        .attr("width", "50px")
        .attr("y", 0)
        .attr("height", height)
        .style("fill", "#fff");

    var yAxisSelection = main.select(".y.axis");

    yAxisSelection
        .call(yAxis)
        .selectAll("line")
        .style("stroke", "#E9EDF2")
        .attr("transform", "translate(25,0)")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("width", "50px");
    overview.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(-30," + heightOverview + ")")
        .call(xAxisOverview);

    setText()
    // inital call to add custom scale

    // toggles to set bar or line, (needs to be implemented via button)
    triggerBar(data)
    //triggerLine(data)


    // overview toggle, this needs to be set after bars are called. 
    overview.append("g")
        .attr("class", "x brush")
        .call(brush)
        .selectAll("rect")
        .attr("y", -6)
        .attr("height", heightOverview + 7) // +7 is magic number for styling

});



// not in use =====
// var barButton = document.getElementById('bar');
// var lineButton = document.getElementById('line');


// set text for each oof scales, based on boundary values
function setText(denominator) {
    denominator = denominator || "year";
    var selectionAxis = main.select(".x.axis")
        .selectAll("g.tick");
    var testSelect = selectionAxis.select("text");
    var textArray = testSelect[0];
    var splitArray;

    if (denominator === "year") {
        for (i = 0; i < textArray.length; i += 1) {
            splitArray = textArray[i].textContent.split(" ");

            if (splitArray[0] === "Jan") {
                textArray[i].textContent = splitArray[1];
                textArray[i].id = "yearHeader";
            } else {
                textArray[i].textContent = splitArray[0];
            }
        }
        return textArray;
    }
    if (denominator === "month") {
        for (i = 0; i < textArray.length; i += 1) {
            splitArray = textArray[i].textContent.split(" ");
            if (splitArray[1] === "01" || splitArray[1] === "02" || splitArray[1] === "03" || splitArray[1] === "04" || splitArray[1] === "05") {
                textArray[i].textContent = splitArray[0];
                textArray[i].id = "monthHeader";
                i += 1;
            } else {
                textArray[i].textContent = splitArray[1];
            }
        }
        return textArray;
    }
    if (denominator === "date") {
        for (i = 0; i < textArray.length; i += 1) {
            splitArray = textArray[i].textContent.split(" ");
            if (textArray[1] === "Monday") {
                var test = textArray[0] + textArray[1];
                textArray[i].textContent = splitArray[0];
                textArray[i].id = "dateHeader";
                i += 1;
            } else {
                textArray[i].textContent = splitArray[1];
            }
        }
        return textArray;
    }
    if (denominator === "day") {
        for (i = 0; i < textArray.length; i += 1) {
            splitArray = textArray[i].textContent.split(" ");
            if (splitArray[1] === "00:00:00") {
                var test = textArray[0] + textArray[1];
                textArray[i].textContent = splitArray[0];
                textArray[i].id = "dayHeader";
                i += 1;
            } else {
                textArray[i].textContent = splitArray[1];
            }
        }
        return textArray;
    }

};

// append bars to graph
function triggerBar(data) {
    var data = data;

    main.append("g")
        .attr("class", "bars")
        .attr("transform", "translate(25,0)")

    .selectAll(".bar.stack")
        .data(data)
        .enter().append("g")
        .attr("class", "bar stack")
        .attr("transform", function(d) {
            // console.log(x(d.date))
            return "translate(" + x(d.date) + ",0)";
        })

    .selectAll("rect")
        .data(function(d) {
            return d.counts;
        })
        .enter().append("rect")
        .attr("class", "bar")
        .attr("width", 10)
        .attr("y", function(d) {
            return y(d.y1);
        })
        .attr("height", function(d) {
            return y(d.y0) - y(d.y1);
        })
        .style("fill", function(d) {

            colourCounter += 1

            var barColour = adjustColor(colourCounter, 'colourArray')
            return barColour
        });


    // small top bar =================================================== 
    var barStack = main.selectAll(".bar.stack")
        // console.log(barStack)
    main.selectAll(".bar.stack")
        .selectAll(".bars")
        .data(function(d) {
            return d.counts;
        })
        .enter().append("rect")
        .attr("class", "topbar")
        .style("fill", function(d) {
            colourCounter += 1;

            var darkBarColour = adjustColor(colourCounter, 'darkColourArray')
            return darkBarColour;
        })
        .attr("width", 10)
        .attr("y", function(d) {
            return y(d.y1);
        })
        .attr("height", 2);


    overview.append("g")
        .attr("class", "bars")
        .attr("transform", "translate(-30,0)")
        .selectAll(".bar")
        .data(data)
        .enter().append("rect")

    .attr("class", "bar")
        .attr("x", function(d) {
            return xOverview(d.date) - 3;
        })
        .attr("width", 10)
        .attr("y", function(d) {
            return yOverview(d.total);
        })
        .attr("height", function(d) {
            return heightOverview - yOverview(d.total);
        })
        .style("fill", "#D4D8DC");
    // area for bar chart.
    // var area = d3.svg.area()
    //     .interpolate("step-after")
    //     .x(function(d) {
    //         console.log(d)
    //         return x(d.date);
    //     })
    //     .y0(y(0))
    //     .y1(function(d) {
    //         return y(d.value);
    //     });

};

function triggerLine(data) {
    var triggerLineCounter = 0,
        yValue,
        newPath,
        data = data

    function plotTheLine(lineNumber, overview) {

        var line = d3.svg.line()
            .x(function(d) {

                return overview ? xOverview(d.date) - 3 : x(d.date);
            })
            .y(function(d) {
                // console.log(d)
                yValue = d.counts[lineNumber].y1;

                return overview ? yOverview(yValue) : y(yValue);
            });

        return line;
    }

    //  for creating a single seperate point ===============================================================================================================
    main.selectAll(".point")
        .data(data)
        .enter().append("circle")
        .attr("class", "dataPoint")
        .classed("point", true)
        .attr("transform", function(d) {
            return "translate(" + x(d.date) + ",0)";
        })
        .attr("r", 2)
        .style({
            "fill": "black"
        });

    main.selectAll(".point")
        .attr("cx", function(d) {
            return x(d.date);
        })
        .attr("cy", function(d) {
            var yValue;
            for (i = 0; i < d.counts.length; i += 1) {
                yValue = d.counts[i].y1;
            }
            return y(yValue);
        });


    main.append("g")
        .attr("class", "paths")
        .data(data)
        .attr("transform", function(d) {
            // console.log(x(d.date))
            return "translate(" + x(d.date) + ",0)";
        });
    // i have to create a new one for each path, maybe I could put in function???
    main.select(".paths")
        .data(data)
        .append('path')
        .datum(data)
        .attr("class", "line1")
        .attr("d", plotTheLine(0)); // call function here which will make the line

    main.select(".paths")
        .append('path')
        .datum(data)
        .attr("class", "line2")
        .attr("d", plotTheLine(1));
    main.select(".paths")
        .append('path')
        .datum(data)
        .attr("class", "line3")
        .attr("d", plotTheLine(2));
    main.select(".paths")
        .append('path')
        .datum(data)
        .attr("class", "line4")
        .attr("d", plotTheLine(3));

    overview.append('path')
        .datum(data)
        .attr("class", "line1")
        .attr("d", plotTheLine(0, 'overview'))
        .attr("transform", function(d) {
            for (i = 0; i < d.length; i += 1) {
                console.log(d[i].date)
                return "translate(" + x(d[i].date) + ",0)";
            }
        });

    overview.append('path')
        .datum(data)
        .attr("class", "line2")
        .attr("d", plotTheLine(1, 'overview'));
    overview.append('path')
        .datum(data)
        .attr("class", "line3")
        .attr("d", plotTheLine(2, 'overview'));
    overview.append('path')
        .datum(data)
        .attr("class", "line4")
        .attr("d", plotTheLine(3, 'overview'));
    // var allLines = main.selectAll("line")
    // console.log(allLines)
    var lineOne = main.selectAll(".line1 .line2 .line3 .line4")
        // console.log(lineOne.datum)
        // console.log(main.selectAll(".point"));

}

function parse(denominator, counts, startYear) {

    var valueArray = [],
        heatMapArray = [],
        minitMill = 60000,
        hourMil = 3600000,
        dayMil = hourMil * 24,
        monthMil = dayMil * 30,
        yearMil = monthMil * 12;

    startYear = new Date(startYear || '2012'),
    denominator = denominator || 'day',
    counter = counts || 200;

    for (i = 0; i < counter; i += 1) {
        var hourTrigger;

        function generateSpan() {

            var span
            switch (denominator) {
                case 'hour':
                    span = generateHourSpan()
                    console.log(span)
                    break;
                case 'day':
                    testResult = Math.floor((Math.random() * 9) + 1);
                    result = (Math.round(Math.random(), 8) + 1)
                    span = testResult * dayMil;

                    break;

                case 'month':
                    span = (Math.round(Math.random(), 5) + 1) * monthMil;
                    break;

                case 'year':
                    span = yearMil;
                    break;
            }
            return span;
        };

        function generateHourSpan() {
            result = Math.floor((Math.random() * 9) + 1);
            console.log(result)
            hourData = result * hourMil
            hourTrigger = "set"
            return hourData
        };

        function plotTheValue(currencyOne, currencyTwo, currencyThree, currencyFour) {
            value.counts = [currencyOne, currencyTwo, currencyThree, currencyFour].map(function(name) {
                // console.log(name)
                return {
                    name: name,
                    y0: y0,
                    // add this count on to the previous "end" to create a range, and update the "previous end" for the next iteration
                    y1: y0 += +name
                };
            });
            value.total = value.counts[value.counts.length - 1].y1;
            // console.log(value)
            valueArray.push(value);
            // console.log(valueArray)
        };

        var randomCurrency = Math.floor((Math.random() * 2000) + 1),
            randomCurrencyTwo = Math.floor((Math.random() * 2000) + 1),
            randomCurrencyThree = Math.floor((Math.random() * 2000) + 1),
            randomCurrencyFour = Math.floor((Math.random() * 2000) + 1);

        var value,
            dat;

        if (valueArray.length === 0) {
            console.log("got here!")
            dat = new Date(startYear); // make start year
            dat = new Date(dat.valueOf() + generateSpan());
        } else {
            var hourDateChecker = hourTrigger === "set" ? "2012-08-25" + generateSpan() + ":00:00" : generateSpan();
            var testDate = new Date(valueArray[valueArray.length - 1].date);
            testDate = (dat.valueOf() + generateSpan());

            dat = new Date(valueArray[valueArray.length - 1].date);
            dat = new Date(dat.valueOf() + generateSpan());

        };
        if (hourTrigger === "set") {
            value = {
                date: parseDate("2012-08-25T" + dat.getHours() + ":" + dat.getMinutes() + ":00")
            };
        } else {
            value = {
                date: parseDate(dat.getFullYear() + "-" + String(dat.getMonth() + 1) + "-" + dat.getDate() + "T" + dat.getHours() + ":00:00")
            };
        }
        var y0 = 0; // keeps track of where the "previous" value "ended"

        // heatmap plot with different bars ============
        if (i > 30 && i < 60) {
            plotTheValue(randomCurrency, null, randomCurrencyThree, randomCurrencyFour);
        } else if (i > 60 && i < 90) {
            plotTheValue(randomCurrency, randomCurrencyTwo, null, randomCurrencyFour);
        } else if (i > 150 && i < 180) {
            plotTheValue(randomCurrency, randomCurrencyTwo, randomCurrencyThree, null);
        } else if (i > 100 && i < 130) {
            plotTheValue(randomCurrency, null, randomCurrencyThree, randomCurrencyFour);
        } else {
            plotTheValue(randomCurrency, randomCurrencyTwo, randomCurrencyThree, randomCurrencyFour);
        };
        // quick way to get the total from the previous calculations
        value.total = value.counts[value.counts.length - 1].y1;
        valueArray.push(value);

    };
    return valueArray;
};

function adjustColor(counter, type) {
    var result;
    type = type || 'colourArray'
    switch (type) {
        case 'colourArray':
            // console.log('being fired!')
            if (colourCounter > 3) {
                colourCounter = 0;
            }
            var colourArray = ["#C6F9D6", "#FFB922", "#F7C8C8", "#D0DFF4"];
            result = colourArray[colourCounter];
            break;
        case 'darkColourArray':
            if (colourCounter > 3) {
                colourCounter = 0;
            }
            var darkColourArray = ["#34EA6D", "#E09900", "#E85E5E", "#C6D6DD"];
            result = darkColourArray[colourCounter];
            break;
    };
    return result;
};
// zooming/panning behaviour for overview chart
// function to join points together. 
function plotTheLine(lineNumber, overview) {
    // console.log(data)
    var line = d3.svg.line()
        .x(function(d) {

            return overview ? xOverview(d.date) - 3 : x(d.date);
        })
        .y(function(d) {
            // console.log(d)
            yValue = d.counts[lineNumber].y1;

            return overview ? yOverview(yValue) : y(yValue);
        });

    return line;
};

function brushed() {
    var newRange = brush.extent(),
        result = (new Date(newRange[1])).valueOf() - (new Date(newRange[0])).valueOf();
    var testDate = width - result,
        testBreak = 11682875077,
        testBreakTwo = 6126624000,
        testBreakThree = 1846500923,

        testBreakFour = 300000000,
        min = 12 * 86400000,
        breakZero = 700 * 86400000,
        breakOne = 520 * 86400000,
        breakTwo = 200 * 86400000,
        breakThree = 100 * 86400000,
        breakFour = 50 * 86400000


    function updateLine(lineNumber, overview) {
        // console.log(data)
        var line = d3.svg.line()
            .x(function(d) {

                return overview ? xOverview(d.date) - 3 : x(d.date)
            })
            .y(function(d) {
                // console.log(d)
                yValue = d.counts[lineNumber].y1

                return overview ? yOverview(yValue) : y(yValue)
            });

        return line;
    }

    function zoomBars(width, selector) {
        main.selectAll(selector)
            .transition()
            .duration(300)
            .ease("quad")
            .attr("width", width)

    };
    x.domain(brush.empty() ? xOverview.domain() : brush.extent());
    var test = main.selectAll(".bar.stack");
    main.selectAll(".bar.stack")
        .attr("transform", function(d) {
            // ajust scale accordingly with user scroll
            var area = width * 10000000;
            remamingArea = area - result;
            remaningAreaScale = (remamingArea / 10000000000) + 10;
            remaningAreaScaleFactor = (remaningAreaScale / 3) - 0.3;
            return "translate(" + x(d.date) + ",0)scale(" + remaningAreaScaleFactor + ",1)"
        });
    main.selectAll(".point")
        .attr("transform", function(d) {
            return "translate(" + x(d.date) + ",0)";
        })

    main.selectAll(".line1")
        .attr("d", updateLine(0));
    main.selectAll(".line2")
        .attr("d", updateLine(1));
    main.selectAll(".line3")
        .attr("d", updateLine(2));
    main.selectAll(".line4")
        .attr("d", updateLine(3));

    // ajust axis format via breakpoints ====================================
    main.select(".x.axis").call(xAxis);
    if (result > testBreak) {
        xAxis.tickFormat(d3.time.format('%b %Y'));
        setText("year");
    };
    if (result < testBreak) {
        console.log("changeAXIS ========>>>>>")
        xAxis.tickFormat(d3.time.format('%b'))
            .ticks(5);
    };
    if (result < testBreakTwo && result > testBreakThree) {
        console.log("changeAXIS Number two ========>>>>>")
        xAxis.tickFormat(d3.time.format('%B %d'));
        setText("month");
    };
    if (result < testBreakThree && result > testBreakFour) {
        console.log("change AXIS Number three! =========>>>>>")
        xAxis.tickFormat(d3.time.format('%d %A %X'))
            .ticks(10);
        setText("date");
    };
    if (result < testBreakFour) {
        console.log("change AXIS Number Four ==========>>>>>>")
        xAxis.tickFormat(d3.time.format('%A %X'));
        setText("day");
    };

    // manual expanding and contracting of bars via animation .===================================
    // }
    // apparently its much faster to write single ifs over case statements
    // if (remaningAreaScale < 1) {
    //     console.log("shdfksahflkasdhlkdsafhlskdj")
    //     // the vars are alreayd liek this, they are just being scaled so this will not work
    //     zoomBars(2, ".bar")
    //     zoomBars(2, ".topbar")
    // }
    // if (result <= breakZero) {
    //     zoomBars(14, ".bar")
    //     zoomBars(14, ".topbar")
    // }
    // if (result <= breakOne) {
    //     console.log("BREAKPOINT ONE ==========")
    //     zoomBars(18, ".bar")
    //     zoomBars(18, ".topbar")
    // }

    // if (result <= breakTwo) {
    //     zoomBars(20, ".bar")
    //     zoomBars(20, ".topbar")
    // }
    // if (result <= breakThree) {
    //     zoomBars(40, ".bar")
    //     zoomBars(40, ".topbar")
    // }
    // if (result <= breakFour) {
    //     zoomBars(100, ".bar")
    //     zoomBars(100, ".topbar")
    // }

};