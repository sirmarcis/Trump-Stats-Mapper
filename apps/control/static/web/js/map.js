

// $(function() {
//   $.getJSON($SCRIPT_ROOT + '/get_poll_data', {
//       week:'curr_week'
//     }, function(data) {
//       console.log(data.result);
//     });
// });

// $(function() {
//   $.getJSON($SCRIPT_ROOT + '/get_headline_data', {
//       week:'curr_week'
//     }, function(data) {
//       console.log(data.result);
//     });
// });



// poll call
function getpolldata(weekstring, handledata) {
    $.getJSON($SCRIPT_ROOT + '/get_poll_data', {
        week: weekstring
    }, function(data) {
        handledata(data.result);
    });
}

// end ajax stuff



// function to create html content string in tooltip div.
function tooltipHtmlDem(n, d) {
    return "<h4>" + n + "</h4><table>" +
        "<tr><td>" + (d.name1) + "</td><td>" + (d.candidate1) + "</td></tr>" +
        "<tr><td>" + (d.name2) + "</td><td>" + (d.candidate2) + "</td></tr>" +
        "<tr><td>" + (d.otherName) + "</td><td>" + (d.other) + "</td></tr>" +
        "</table>";
}

function tooltipHtmlGop(n, d) {
    return "<h4>" + n + "</h4><table>" +
        "<tr><td>" + (d.name1) + "</td><td>" + (d.candidate1) + "</td></tr>" +
        "<tr><td>" + (d.name2) + "</td><td>" + (d.candidate2) + "</td></tr>" +
		"<tr><td>" + (d.name3) + "</td><td>" + (d.candidate3) + "</td></tr>" +
        "<tr><td>" + (d.name4) + "</td><td>" + (d.candidate4) + "</td></tr>" +
        "<tr><td>" + (d.otherName) + "</td><td>" + (d.other) + "</td></tr>" +
        "</table>";
}

function tooltipBar(n, percent) {
    return "<h4>" + n + " " + percent + "</h4>";
}

var party;
var d = new Date();
// Sample random data.
var sampleData = {};

// function to redraw the map with new data
function drawBar(percent1, percent2,percent3) {
    // clamping of percents
    if (percent1 > 1) percent1 = 1;
    if (percent2 > 1) percent2 = 1;
    if (percent1 < 0) percent1 = 0;
    if (percent2 < 0) percent2 = 0;
    // delete previous contents
    d3.select("#barsvg").selectAll("*").remove();
    // draw background black bar
    d3.select("#barsvg").append("rect")
        .attr("x", 123)
        .attr("y", 11)
        .attr("rx", 10)
        .attr("ry", 10)
        .attr("width", 715)
        .attr("height", 44)
        .style("fill", "black");

    var blue_width = 700 * percent1;
    var red_width = 700 * percent2;
    var green_width = 700* percent3;
    var names = ["Trump", "Clinton", "Other"]
    var percents = [percent1 * 100, percent2 * 100, Math.floor((1 - percent1 - percent2).toPrecision(2) * 100)];
    // draw main bars
    function mouseOver(d) {
        d3.select("#tooltip").transition().duration(200).style("opacity", .9);
        d3.select("#tooltip").html(tooltipBar(names[d], percents[d]))
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
    }

    function mouseOut() {
        d3.select("#tooltip").transition().duration(500).style("opacity", 0);
    }

    d3.select("#barsvg").append("rect")
        .attr("x", 130)
        .attr("y", 18)
        .attr("width", 700)
        .attr("height", 30)
        .style("fill", "grey");

    d3.select("#barsvg").append("rect")
        .attr("x", 130)
        .attr("y", 18)
        .attr("width", blue_width)
        .attr("height", 30)
        .style("fill", "blue");

    if(percent1>=0.06){
        d3.select("#barsvg").append("text")
            .attr("x", 130+blue_width/2 -14)
            .attr("y", 40)
            .attr("font-size", "20px")
            .attr("fill", "white")
            .text(percent1*100+"%");
    }

    d3.select("#barsvg").append("rect")
        .attr("x", 130 + 700 - red_width-green_width)
        .attr("y", 18)
        .attr("width", green_width)
        .attr("height", 30)
        .style("fill", "green");
    if(percent3>=0.06){
        d3.select("#barsvg").append("text")
        .attr("x", 130 + 700 - red_width-green_width/2 -14)
        .attr("y", 40)
        .attr("font-size", "20px")
        .attr("fill", "white")
        .text(percent3*100+"%");
    }

    d3.select("#barsvg").append("rect")
        .attr("x", 130 + 700 - red_width)
        .attr("y", 18)
        .attr("width", red_width)
        .attr("height", 30)
        .style("fill", "red");

    if(percent2>=0.06){

        d3.select("#barsvg").append("text")
            .attr("x", 130 + 700 - red_width/2 -14)
            .attr("y", 40)
            .attr("font-size", "20px")
            .attr("fill", "white")
            .text(percent2*100+"%");
    }

   

    d3.select("#barsvg").selectAll("rect")
        .on("mouseover", mouseOver)
        .on("mouseout", mouseOut);
}

// main function that redraws the map
function redrawMap(input) {
	if (input == 'democrat' || input == 'gop') {
		party = input;
	} else {
		d = input;
	}
	console.log("drawing ", input);
	
    //variables to get average for progress bar
    var count = 0;
    var candidate1 = 0;
    var candidate2 = 0;
	var candidate3 = 0;
    var candidate4 = 0;
    var totalC1 = 0;
    var totalC2 = 0;
	var totalC3 = 0;
    var totalC4 = 0;
    var sampleData = {};
    var color = '#ffffff';
    // go through the states with data
    ["Hawaii", "Alaska", "Florida", "New Hampshire", "Michigan", "Vermont", "Maine", "Rhode Island", "New York", "Pennsylvania", "Delaware",
        "Maryland", "Virginia", "West Virginia", "Ohio", "Indiana", "Illinois", "Connecticut", "Wisconsin", "North Carolina", "Washington DC", "Massachusetts",
        "Tennessee", "Arkansas", "Missouri", "Georgia", "South Carolina", "Kentucky", "Alabama", "Louisiana", "Mississippi", "Iowa", "Minnesota",
        "Oklahoma", "Texas", "New Mexico", "Kansas", "Nebraska", "South Dakota", "North Dakota", "Wyoming", "Montana", "Colarado", "Idaho",
        "Utah", "Arizona", "Nevada", "Oregon", "Washington", "California", "New Jersey"
    ]
    .forEach(function(d) {
		if (party == 'democrat') {
			var name1 = "Clinton";
			var name2 = "Sanders";
			var otherName = "Other";
			var other = 0;
			sampleData[d] = { name1, candidate1, name2, candidate2, otherName, other, color };
		} else {
			var name1 = "Trump";
			var name2 = "Cruz";
			var name3 = "Kasich";
			var name4 = "Rubio";
			var otherName = "Other";
			var other = 0;
			sampleData[d] = { name1, candidate1, name2, candidate2,
							name3, candidate3, name4, candidate4, otherName, other, color };
		}
    });
    getpolldata('curr_week', function(output) { //sync
		if (party == 'democrat') {
			var key;
			var counter = 0;
			color = '#ffffff';
			for (key in output) {
				counter = 0;
				candidate1 = 0;
				candidate2 = 0;
				var key2;
				for (key2 in output[key]["blue_poll_dict_list"]) {
					var key3;
					for (key3 in output[key]["blue_poll_dict_list"][key2]) {
						if (output[key]["blue_poll_dict_list"][key2][key3].hasOwnProperty("Clinton")) {
							candidate1 += output[key]["blue_poll_dict_list"][key2][key3]["Clinton"];
						}
						if (output[key]["blue_poll_dict_list"][key2][key3].hasOwnProperty("Sanders")) {
							candidate2 += output[key]["blue_poll_dict_list"][key2][key3]["Sanders"];
						}
					}
					counter++;
				}
				// console.log("State: " + key +" candidate1: " + candidate1 + " candidate2: " + candidate2);
				if (counter > 0) {
					candidate1 = Math.floor(candidate1 / counter);
					candidate2 = Math.floor(candidate2 / counter);
					if (candidate1 > candidate2) {
						var green = ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b',
							'#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b'
						];
						var orange = ['#fee6ce', '#fdd0a2', '#fdae6b',
							'#fd8d3c', '#f16913', '#d94801', '#a63603', '#7f2704'
						];
						var index = candidate1 - candidate2;
						index = Math.floor(index / 5);
						if (index > 7) index = 7;
						else if (index < 0) index = 0;
						color = orange[index];
					} else {
						var blue = ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1',
							'#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'
						];
						var purple = ['#efedf5', '#dadaeb', '#bcbddc',
							'#9e9ac8', '#807dba', '#6a51a3', '#54278f', '#3f007d'
						]
						var index = candidate2 - candidate1;
						index = Math.floor(index / 5);
						if (index > 7) index = 7;
						else if (index < 0) index = 0;
						color = purple[index];
					}
				}
				if (candidate1 == 0 && candidate2 == 0) {
					color = "gray";
				}
				var name1 = "Clinton";
				var name2 = "Sanders";
				totalC1 += candidate1;
				totalC2 += candidate2;
				var otherName = "Other";
				var other = 100 - candidate1 - candidate2;
				count++;
				sampleData[key] = {
					name1,
					candidate1,
					name2,
					candidate2,
					otherName,
					other,
					color
				};
			}
			d3.select("#statesvg").selectAll("*").remove();
			uStates.draw("#statesvg", sampleData, tooltipHtmlDem);
			uStates.updateColor("#statesvg", sampleData);
			drawBar((totalC1 / count / 100).toPrecision(2), (totalC2 / count / 100).toPrecision(2),0);
		} else {
			var key;
			var counter = 0;
			color = '#ffffff';
			for (key in output) {
				counter = 0;
				candidate1 = 0;
				candidate2 = 0;
				candidate3 = 0;
				candidate4 = 0;
				var key2;
				for (key2 in output[key]["red_poll_dict_list"]) {
					var key3;
					for (key3 in output[key]["red_poll_dict_list"][key2]) {
						if (output[key]["red_poll_dict_list"][key2][key3].hasOwnProperty("Trump")) {
							candidate1 += output[key]["red_poll_dict_list"][key2][key3]["Trump"];
						}
						if (output[key]["red_poll_dict_list"][key2][key3].hasOwnProperty("Cruz")) {
							candidate2 += output[key]["red_poll_dict_list"][key2][key3]["Cruz"];
						}
						if (output[key]["red_poll_dict_list"][key2][key3].hasOwnProperty("Kasich")) {
							candidate3 += output[key]["red_poll_dict_list"][key2][key3]["Kasich"];
						}
						if (output[key]["red_poll_dict_list"][key2][key3].hasOwnProperty("Rubio")) {
							candidate4 += output[key]["red_poll_dict_list"][key2][key3]["Rubio"];
						}
					}
					counter++;
				}
				// console.log("State: " + key +" candidate1: " + candidate1 + " candidate2: " + candidate2);
				if (counter > 0) {
					candidate1 = Math.floor(candidate1 / counter);
					candidate2 = Math.floor(candidate2 / counter);
					candidate3 = Math.floor(candidate3 / counter);
					candidate4 = Math.floor(candidate4 / counter);
					candidates = [candidate1,candidate2,candidate3,candidate4];
					var max = 0;
					var maxIndex = 0;
					var secondMax = 0;
					for (var candidate in candidates) {
						if (candidates[candidate] > max) {
							secondMax = max;
							max = candidates[candidate];
							maxIndex = candidate;
						} else if (candidates[candidate] > secondMax) {
							secondMax = candidates[candidate];
						}
					}
					var blue = ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1',
							'#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'];
					var purple = ['#efedf5', '#dadaeb', '#bcbddc',
							'#9e9ac8', '#807dba', '#6a51a3', '#54278f', '#3f007d'];
					var green = ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b',
							'#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b'];
					var orange = ['#fee6ce', '#fdd0a2', '#fdae6b',
							'#fd8d3c', '#f16913', '#d94801', '#a63603', '#7f2704'];
					var colors = [blue,orange,green,purple];
					var colorIndex = max - secondMax;
						colorIndex = Math.floor(colorIndex / 5);
						if (colorIndex > 7) colorIndex = 7;
						else if (colorIndex < 0) colorIndex = 0;
					color = colors[maxIndex][colorIndex];
				}
				if (candidate1 == 0 && candidate2 == 0 && candidate3 == 0 && candidate4 == 0) {
					color = "gray";
				}
				var name1 = "Trump";
				var name2 = "Cruz";
				var name3 = "Kasich";
				var name4 = "Rubio";
				totalC1 += candidate1;
				totalC2 += candidate2;
				totalC3 += candidate3;
				totalC4 += candidate4;
				var otherName = "Other";
				var other = 100 - candidate1 - candidate2;
				count++;
				sampleData[key] = {
					name1,
					candidate1,
					name2,
					candidate2,
					name3,
					candidate3,
					name4,
					candidate4,
					otherName,
					other,
					color
				};
			}
			d3.select("#statesvg").selectAll("*").remove();
			uStates.draw("#statesvg", sampleData, tooltipHtmlGop);
			uStates.updateColor("#statesvg", sampleData);
			drawBar((totalC1 / count / 100).toPrecision(2), (totalC2 / count / 100).toPrecision(2),.06);
		}
    });
}
redrawMap('gop');

// Reset the map
function resetMap() {
    redrawMap('gop');
}
