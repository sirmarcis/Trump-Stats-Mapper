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

// main function that redraws the map
// input can be either a party, Democrat/GOP
// or date
function redrawMap(input) {
	if (input == 'democrat' || input == 'gop') {
		party = input;
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
		
	// get polling data Ajax call
    getpolldata(weekString, function(output) {
		// democratic party
		if (party == 'democrat') {
			var key;
			var counter = 0;
			color = '#ffffff';
			// go through the states
			for (key in output) {
				counter = 0;
				candidate1 = 0;
				candidate2 = 0;
				var key2;
				// go through the democratic polling data
				for (key2 in output[key]["blue_poll_dict_list"]) {
					var key3;
					// go through the last few polls from that state
					for (key3 in output[key]["blue_poll_dict_list"][key2]) {
						// add the data to the candidates if they are in the polling
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
				// if there was at least one poll for the state
				if (counter > 0) {
					// average out the polls for the candidates
					candidate1 = Math.floor(candidate1 / counter);
					candidate2 = Math.floor(candidate2 / counter);
					// check who is winning the race
					if (candidate1 > candidate2) {
						//var green = ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b',
						//	'#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b'];
						// create gradient color for candidate
						var orange = ['#fee6ce', '#fdd0a2', '#fdae6b',
							'#fd8d3c', '#f16913', '#d94801', '#a63603', '#7f2704'];
						var index = candidate1 - candidate2;
						index = Math.floor(index / 5);
						// clamp the gradient
						if (index > 7) index = 7;
						else if (index < 0) index = 0;
						color = orange[index];
					} else {
						//var blue = ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1',
						//	'#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'];
						// create gradient color for candidate
						var purple = ['#efedf5', '#dadaeb', '#bcbddc',
							'#9e9ac8', '#807dba', '#6a51a3', '#54278f', '#3f007d'];
						var index = candidate2 - candidate1;
						index = Math.floor(index / 5);
						// clamp the gradient
						if (index > 7) index = 7;
						else if (index < 0) index = 0;
						color = purple[index];
					}
				}
				// if both candidates are 0, then something went wrong
				// set the color to gray
				if (candidate1 == 0 && candidate2 == 0) {
					color = "gray";
					count--;
				}
				var name1 = "Clinton";
				var name2 = "Sanders";
				var otherName = "Other";
				var other = 100 - candidate1 - candidate2;
				count++;
				// add the data to the json
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
			/*
			d3.select("#statesvg").selectAll("*").remove();
			uStates.draw("#statesvg", sampleData, tooltipHtmlDem);
			uStates.updateColor("#statesvg", sampleData);
			drawBar((totalC1 / count / 100).toPrecision(2), (totalC2 / count / 100).toPrecision(2),0);
			*/
		} else {
			// GOP for polling data
			var key;
			var counter = 0;
			color = '#ffffff';
			// go through the states
			for (key in output) {
				counter = 0;
				candidate1 = 0;
				candidate2 = 0;
				candidate3 = 0;
				candidate4 = 0;
				var key2;
				// go through the republician data
				for (key2 in output[key]["red_poll_dict_list"]) {
					var key3;
					for (key3 in output[key]["red_poll_dict_list"][key2]) {
						// add the polling data to the candidates that are in the json
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
					// if there was a poll or multiple, average them
					candidate1 = Math.floor(candidate1 / counter);
					candidate2 = Math.floor(candidate2 / counter);
					candidate3 = Math.floor(candidate3 / counter);
					candidate4 = Math.floor(candidate4 / counter);
					candidates = [candidate1,candidate2,candidate3,candidate4];
					var max = 0;
					var maxIndex = 0;
					var secondMax = 0;
					// find the highest and the second highest polling numbers
					for (var candidate in candidates) {
						if (candidates[candidate] > max) {
							secondMax = max;
							max = candidates[candidate];
							maxIndex = candidate;
						} else if (candidates[candidate] > secondMax) {
							secondMax = candidates[candidate];
						}
					}
					// select the color for the candidate with the highest numbers
					var blue = ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1',
							'#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'];
					var purple = ['#efedf5', '#dadaeb', '#bcbddc',
							'#9e9ac8', '#807dba', '#6a51a3', '#54278f', '#3f007d'];
					var green = ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b',
							'#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b'];
					var orange = ['#fee6ce', '#fdd0a2', '#fdae6b',
							'#fd8d3c', '#f16913', '#d94801', '#a63603', '#7f2704'];
					var colors = [blue,orange,green,purple];
					// make it a gradient versus the person in second place
					var colorIndex = max - secondMax;
						colorIndex = Math.floor(colorIndex / 5);
						if (colorIndex > 7) colorIndex = 7;
						else if (colorIndex < 0) colorIndex = 0;
					color = colors[maxIndex][colorIndex];
				}
				// if they are all 0, then something went wrong, and set the color to gray
				// most likely a poll for the democratic party but not the GOP
				if (candidate1 == 0 && candidate2 == 0 && candidate3 == 0 && candidate4 == 0) {
					color = "gray";
					count--;
				}
				var name1 = "Trump";
				var name2 = "Cruz";
				var name3 = "Kasich";
				var name4 = "Rubio";
				var otherName = "Other";
				var other = 100 - candidate1 - candidate2 - candidate3 - candidate4;
				count++;
				// put the data into the json
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
			/*
			d3.select("#statesvg").selectAll("*").remove();
			uStates.draw("#statesvg", sampleData, tooltipHtmlGop);
			uStates.updateColor("#statesvg", sampleData);
			drawBar((totalC1 / count / 100).toPrecision(2), (totalC2 / count / 100).toPrecision(2),.06);
			*/
		}
		// Ajax call to get the data for finished states
		getFinishedStates(function(finished) {
			if (party == 'democrat') {
				var skipped = {};
				var key;
				var counter = 0;
				color = '#ffffff';
				// go through the states
				for (key in finished) {
					counter = 0;
					candidate1 = 0;
					candidate2 = 0;
					var key2;
					// go through the polls
					for (key2 in finished[key]["blue_poll_dict_list"]) {
						var key3;
						for (key3 in finished[key]["blue_poll_dict_list"][key2]) {
							// get the date of when the race finished
							// in the json it is formatted
							// MonthName DayofMonth so March 1
							var monthArr = key3.split(" ");
							var monthNum = months[monthArr[0]]
							var pollDate = new Date(2016,monthNum,monthArr[1]);
							
							// console.log("pollDate: " + pollDate.getTime() + " currentDate: " + d.getTime())
							// console.log(pollDate);
							// console.log(d);
							
							// check the date that the race finished versus
							// the date that is selected
							if (pollDate.getTime() > d.getTime()) {
								counter--;
								// console.log("skipped: " + key);
								
								// if it is past the selected date, skip it
								skipped[key] = true;
								continue;
							}
							// set the number of delegates for each canidate
							if (finished[key]["blue_poll_dict_list"][key2][key3].hasOwnProperty("Clinton")) {
								candidate1 += finished[key]["blue_poll_dict_list"][key2][key3]["Clinton"];
							}
							if (finished[key]["blue_poll_dict_list"][key2][key3].hasOwnProperty("Sanders")) {
								candidate2 += finished[key]["blue_poll_dict_list"][key2][key3]["Sanders"];
							}
						}
						counter++;
					}
					// console.log("State: " + key +" candidate1: " + candidate1 + " candidate2: " + candidate2);
					if (counter > 0) {
						// get the color for who ever has more delegates in the state
						candidate1 = Math.floor(candidate1 / counter);
						candidate2 = Math.floor(candidate2 / counter);
						if (candidate1 > candidate2) {
							// var green = ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b',
							//	'#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b'];
							var orange = ['#fee6ce', '#fdd0a2', '#fdae6b',
								'#fd8d3c', '#f16913', '#d94801', '#a63603', '#7f2704'];
							var index = candidate1 - candidate2;
							index = Math.floor(index / 5);
							if (index > 7) index = 7;
							else if (index < 0) index = 0;
							color = orange[index];
						} else {
							//var blue = ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1',
							//	'#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'];
							var purple = ['#efedf5', '#dadaeb', '#bcbddc',
								'#9e9ac8', '#807dba', '#6a51a3', '#54278f', '#3f007d'];
							var index = candidate2 - candidate1;
							index = Math.floor(index / 5);
							if (index > 7) index = 7;
							else if (index < 0) index = 0;
							color = purple[index];
						}
					}
					// if the state was skipped, leave it as the color it was
					// otherwise something went wrong and make it gray
					if (candidate1 == 0 && candidate2 == 0) {
						if (skipped[key]) {
							color = color = "#ffffff";
						} else {
							color = "gray";
						}
						count--;
					}
					var name1 = "Clinton";
					var name2 = "Sanders";
					totalC1 += candidate1;
					totalC2 += candidate2;
					var otherName = "Other";
					var other = 0;
					count++;
					// over write any previous data put in for the state
					// (polling data or 0)
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
				// draw the map and progress bar for the Democrats
				d3.select("#statesvg").selectAll("*").remove();
				uStates.draw("#statesvg", sampleData, tooltipHtmlDem);
				uStates.updateColor("#statesvg", sampleData);
				drawBar((totalC1 / 4051).toPrecision(2), (totalC2 / 4051).toPrecision(2),0);
			} else {
				// GOP finished races
				var skipped = {};
				var key;
				var counter = 0;
				color = '#ffffff';
				// go through the states
				// should refactor going through data
				for (key in finished) {
					counter = 0;
					candidate1 = 0;
					candidate2 = 0;
					candidate3 = 0;
					candidate4 = 0;
					var key2;
					// go through the GOP delegates
					for (key2 in finished[key]["red_poll_dict_list"]) {
						var key3;
						for (key3 in finished[key]["red_poll_dict_list"][key2]) {
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
							// add the delegates to the candidates
							if (finished[key]["red_poll_dict_list"][key2][key3].hasOwnProperty("Trump")) {
								candidate1 += finished[key]["red_poll_dict_list"][key2][key3]["Trump"];
							}
							if (finished[key]["red_poll_dict_list"][key2][key3].hasOwnProperty("Cruz")) {
								candidate2 += finished[key]["red_poll_dict_list"][key2][key3]["Cruz"];
							}
							if (finished[key]["red_poll_dict_list"][key2][key3].hasOwnProperty("Kasich")) {
								candidate3 += finished[key]["red_poll_dict_list"][key2][key3]["Kasich"];
							}
							if (finished[key]["red_poll_dict_list"][key2][key3].hasOwnProperty("Rubio")) {
								candidate4 += finished[key]["red_poll_dict_list"][key2][key3]["Rubio"];
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
					// if the state was skipped, leave it alone
					// otherwise an error happened and make it gray
					if (candidate1 == 0 && candidate2 == 0 && candidate3 == 0 && candidate4 == 0) {
						if (skipped[key]) {
							color = "#ffffff";
						} else {
							color = "gray";
						}
						count--;
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
					var other = 0;
					count++;
					// add it to the json
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
				drawBar((totalC1 / 2472).toPrecision(2), (totalC2 / 2472).toPrecision(2), (totalC3 / 2472).toPrecision(2));
			}
		});
    });
}
//initial draw map
redrawMap('gop');

// Reset the map
function resetMap() {
    redrawMap('gop');
    document.getElementById("gop").checked = true;
}
