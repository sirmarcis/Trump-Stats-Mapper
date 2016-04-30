// Ajax call for polling data
// takes in a week formatted W/MM/YYYY and 
// a function handler that uses the data
function getpolldata(weekString, handledata) {
    $.getJSON($SCRIPT_ROOT + '/get_poll_data', {
        week: weekString
    }, function(data) {
        handledata(data.result);
    });
}

// Ajax call for getting the finished races data
// takes in a function handler that uses the results
function getFinishedStates(handledata) {
    $.getJSON($SCRIPT_ROOT + '/get_finished_states_data', {}, 
	  function(data) {
        handledata(data.result);
    });
}

// function to create html content string in tooltip div for the Democrats
function tooltipHtmlDem(n, d) {
    return "<h4>" + n + "</h4><table>" +
        "<tr><td>" + (d.name1) + "</td><td>" + (d.candidate1) + "</td></tr>" +
        "<tr><td>" + (d.name2) + "</td><td>" + (d.candidate2) + "</td></tr>" +
        "<tr><td>" + (d.otherName) + "</td><td>" + (d.other) + "</td></tr>" +
        "</table>";
}

// function to create html content string in tooltip div for the GOP
function tooltipHtmlGop(n, d) {
    return "<h4>" + n + "</h4><table>" +
        "<tr><td>" + (d.name1) + "</td><td>" + (d.candidate1) + "</td></tr>" +
        "<tr><td>" + (d.name2) + "</td><td>" + (d.candidate2) + "</td></tr>" +
		"<tr><td>" + (d.name3) + "</td><td>" + (d.candidate3) + "</td></tr>" +
        "<tr><td>" + (d.name4) + "</td><td>" + (d.candidate4) + "</td></tr>" +
        "<tr><td>" + (d.otherName) + "</td><td>" + (d.other) + "</td></tr>" +
        "</table>";
}

// variables that the map uses
var party;
var d = new Date();
d.setHours(0,0,0,0);
var gradient = true;

// function to redraw the progress bar with new data
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

	// get width of bars
    var blue_width = 700 * percent1;
    var red_width = 700 * percent2;
    var green_width = 700* percent3;

    // draw main bars
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

	// do not show number if the percent is less than 6
    if (percent1>=0.06) {
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

	// do not show the number if the percent is less than 6
	if (percent3>=0.06) {
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

	// do not show the number if the percent is less than 6
    if (percent2>=0.06) {
        d3.select("#barsvg").append("text")
            .attr("x", 130 + 700 - red_width/2 -14)
            .attr("y", 40)
            .attr("font-size", "20px")
            .attr("fill", "white")
            .text(percent2*100+"%");
    }
}

// go through data function
function goThroughDataJson(json,data,party,date,finished) {
	// months variable that helps format the results data
	var months = {
		'January': 1,
		'February': 2,
		'March': 3,
		'April': 4,
		'May': 5,
		'June': 6,
		'July': 7,
		'August': 8,
		'September': 9,
		'October': 10,
		'November': 11,
		'December': 12
	};
	// GOP finished races
	var skipped = {};
	var key;
	var counter = 0;
	color = '#ffffff';
	var poll = "";
	if (party == 'democrat') {
		poll = "blue_poll_dict_list";
	} else {
		poll = "red_poll_dict_list";
	}
	var totalC1 = 0;
    var totalC2 = 0;
	var totalC3 = 0;
    var totalC4 = 0;
	// go through the states
	// should refactor going through data
	for (key in json) {
		counter = 0;
		var candidate1 = 0;
		var candidate2 = 0;
		var candidate3 = 0;
		var candidate4 = 0;
		var key2;
		// go through the GOP delegates
		for (key2 in json[key][poll]) {
			var key3;
			for (key3 in json[key][poll][key2]) {
				if (finished) {
					// check if the selected date is before the voted date
					var monthArr = key3.split(" ");
					var monthNum = months[monthArr[0]] - 1;
					var pollDate = new Date(2016,monthNum,monthArr[1]);
				
					// console.log("pollDate: " + pollDate.getTime() + " currentDate: " + d.getTime())
					// console.log(pollDate);
					// console.log(d);
				
					// skip the results if the selected date is before the results
					if (pollDate.getTime() > d.getTime()) {
						counter--;
						// console.log("skipped: " + key);
						skipped[key] = true;
						continue;
					}
				}
				if (party == 'democrat') {
					if (json[key][poll][key2][key3].hasOwnProperty("Clinton")) {
						candidate1 += json[key][poll][key2][key3]["Clinton"];
					}
					if (json[key][poll][key2][key3].hasOwnProperty("Sanders")) {
						candidate2 += json[key][poll][key2][key3]["Sanders"];
					}
				} else {
					// add the delegates to the candidates
					if (json[key][poll][key2][key3].hasOwnProperty("Trump")) {
						candidate1 += json[key][poll][key2][key3]["Trump"];
					}
					if (json[key][poll][key2][key3].hasOwnProperty("Cruz")) {
						candidate2 += json[key][poll][key2][key3]["Cruz"];
					}
					if (json[key][poll][key2][key3].hasOwnProperty("Kasich")) {
						candidate3 += json[key][poll][key2][key3]["Kasich"];
					}
					if (json[key][poll][key2][key3].hasOwnProperty("Rubio")) {
						candidate4 += json[key][poll][key2][key3]["Rubio"];
					}
				}
				
			}
			counter++;
		}
		// console.log("State: " + key +" candidate1: " + candidate1 + " candidate2: " + candidate2);
		if (counter > 0) {
			// find the max number of delegates and second largest
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
			// select the color based on who has the most delegates 
			// gradient based on how many more than the second largest
			if (gradient) {
				var blue = ['#bdd7e7','#6baed6','#3182bd','#08519c'];
				var purple = ['#cbc9e2','#9e9ac8','#756bb1','#54278f'];
				var green = ['#bae4b3','#74c476','#31a354','#006d2c'];
				var red = ['#fcae91','#fb6a4a','#de2d26','#a50f15'];
				var colors;
				if (party == 'gop') {
					colors = [blue,red,green,purple];
				} else {
					colors = [blue,green];
				}
				var colorIndex = max - secondMax;
				colorIndex = Math.floor(colorIndex / 5);
				if (colorIndex > 3) colorIndex = 3;
				else if (colorIndex < 0) colorIndex = 0;
				color = colors[maxIndex][colorIndex];
			} else {
				var colors;
				if (party == 'gop') {
					colors = ['blue','red','green','purple'];
				} else {
					colors = ['blue','green'];
				}
				color = colors[maxIndex];
			}
		}
		// if the state was skipped, leave it alone
		// otherwise an error happened and make it gray
		if ((candidate1 == 0 && candidate2 == 0 && candidate3 == 0 && candidate4 == 0) || skipped[key]) {
			color = "#ffffff";
		}
		if (party == 'gop') {
			var name1 = "Trump";
			var name2 = "Cruz";
			var name3 = "Kasich";
			var name4 = "Rubio";
		}
		totalC1 += candidate1;
		totalC2 += candidate2;
		totalC3 += candidate3;
		totalC4 += candidate4;
		var otherName = "Other";
		var other = 0;
		// add it to the json
		data[key] = {
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
	return [data,totalC1,totalC2,totalC3,totalC4];
}

// main function that redraws the map
// input can be either a party, Democrat/GOP
// or date
function redrawMap(input) {
	if (input == 'democrat' || input == 'gop') {
		party = input;
	} else if (input == "gradient") {
		gradient = !gradient;
	} else {
		d = new Date(input);
		// console.log(d);
	}
	
    // set default variables
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
    // go through the states to set their initial values to 0
    ["Hawaii", "Alaska", "Florida", "New Hampshire", "Michigan", "Vermont", "Maine", "Rhode Island", "New York", "Pennsylvania", "Delaware",
     "Maryland", "Virginia", "West Virginia", "Ohio", "Indiana", "Illinois", "Connecticut", "Wisconsin", "North Carolina", "Washington DC", "Massachusetts",
     "Tennessee", "Arkansas", "Missouri", "Georgia", "South Carolina", "Kentucky", "Alabama", "Louisiana", "Mississippi", "Iowa", "Minnesota",
     "Oklahoma", "Texas", "New Mexico", "Kansas", "Nebraska", "South Dakota", "North Dakota", "Wyoming", "Montana", "Colarado", "Idaho",
     "Utah", "Arizona", "Nevada", "Oregon", "Washington", "California", "New Jersey"]
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
	
	// set the weekString for the polling data Ajax call
	var weekString;
	var today = new Date();
	today.setHours(0,0,0,0);
	// check if current date is today
	if (d.getTime() == today.getTime()) {
		weekString = 'curr_week';
		// console.log("today");
	} else {
		var extra = ""
		if (d.getMonth() < 9) {
			extra = '0';
		}
		// format the weekString to W/MM/YYYY
		weekString = Math.floor(d.getDate()/7) + "." + extra + (d.getMonth()+1) + "." + d.getFullYear();
		// console.log("not today " + input);
	}


		
	// get polling data Ajax call
    getpolldata(weekString, function(output) {
		// democratic party
		sampleData = goThroughDataJson(output,sampleData,party,d,false)[0];
		// Ajax call to get the data for finished states
		getFinishedStates(function(finished) {
			var returnResult = goThroughDataJson(finished,sampleData,party,d,true);
			sampleData = returnResult[0];
			totalC1 = returnResult[1];
			totalC2 = returnResult[2];
			totalC3 = returnResult[3];
			totalC4 = returnResult[4];
			if (party == 'democrat') {
				// draw the map and progress bar for the Democrats
				d3.select("#statesvg").selectAll("*").remove();
				uStates.draw("#statesvg", sampleData, tooltipHtmlDem);
				uStates.updateColor("#statesvg", sampleData);
				drawBar((totalC1 / 4051).toPrecision(2), (totalC2 / 4051).toPrecision(2),0);
			} else {
				// GOP finished races
				
				d3.select("#statesvg").selectAll("*").remove();
				uStates.draw("#statesvg", sampleData, tooltipHtmlGop);
				uStates.updateColor("#statesvg", sampleData);
				drawBar((totalC1 / 2472).toPrecision(2), (totalC2 / 2472).toPrecision(2), (totalC3 / 2472).toPrecision(2));
			}
		});
    });
}
//initial draw map
redrawMap('gop');

// Reset the map
function resetMap() {
	d = new Date();
    redrawMap('gop');
    document.getElementById("gop").checked = true;
}
