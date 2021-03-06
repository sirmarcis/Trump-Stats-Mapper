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

function Map(party,gradient,date,runningThrough) {
	this.party = party;
	this.gradient = gradient;
	this.date = date;
	this.runningThrough = runningThrough;
}

var d = new Date();
d.setHours(0,0,0,0);
var map = new Map('gop',true,d,false);
// variables that the map uses
/*
var party;
var d = new Date();
d.setHours(0,0,0,0);
var gradient = true;
var runningThrough = false;
*/

// function to redraw the progress bar with new data
function drawBar(delegates1, delegates2,delegates3) {

    var percent1;
    var percent2;
    var percent3;
    var colorslist =[];
    // var blue = ['#bdd7e7','#6baed6','#3182bd','#08519c'];
    //                     var purple = ['#cbc9e2','#9e9ac8','#756bb1','#54278f'];
    //                     var green = ['#bae4b3','#74c476','#31a354','#006d2c'];
    //                     var red = ['#fcae91','#fb6a4a','#de2d26','#a50f15'];
    if(delegates3 == 0){//dems
        percent1=(delegates1/4051).toPrecision(2);
        percent2=(delegates2/4051).toPrecision(2);
        percent3=0;
        colorslist[0]='#08519c';
        colorslist[1]='#006d2c';
        colorslist[2]='#a50f15';//not used
    }else{//gop
        percent1 =(delegates1/2472).toPrecision(2);
        percent2 =(delegates2/2472).toPrecision(2);
        percent3 =(delegates3/2472).toPrecision(2);
        colorslist[0]='#08519c';
        colorslist[1]='#a50f15';
        colorslist[2]='#006d2c';

    }
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
        .style("fill", colorslist[0]);

    // do not show number if the percent is less than 6
    if (percent1>=0.06) {
        d3.select("#barsvg").append("text")
            .attr("x", 130+blue_width/2 -14)
            .attr("y", 40)
            .attr("font-size", "20px")
            .attr("fill", "white")
            .text(delegates1);
    }

    d3.select("#barsvg").append("rect")
        .attr("x", 130 + 700 - red_width-green_width)
        .attr("y", 18)
        .attr("width", green_width)
        .attr("height", 30)
        .style("fill", colorslist[2]);

    // do not show the number if the percent is less than 6
    if (percent3>=0.06) {
        d3.select("#barsvg").append("text")
        .attr("x", 130 + 700 - red_width-green_width/2 -14)
        .attr("y", 40)
        .attr("font-size", "20px")
        .attr("fill", "white")
        .text(delegates3);
    }

    d3.select("#barsvg").append("rect")
        .attr("x", 130 + 700 - red_width)
        .attr("y", 18)
        .attr("width", red_width)
        .attr("height", 30)
        .style("fill", colorslist[1]);

    // do not show the number if the percent is less than 6
    if (percent2>=0.06) {
        d3.select("#barsvg").append("text")
            .attr("x", 130 + 700 - red_width/2 -14)
            .attr("y", 40)
            .attr("font-size", "20px")
            .attr("fill", "white")
            .text(delegates2);
    }
}

// go through polling/finished races function
function goThroughDataJson(json,data,mapObj,finished) {
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
    var skipped = {};
    var key;
    var counter = 0;
    color = '#ffffff';
    var poll = "";
    // choose democrat or gop
    if (mapObj.party == 'democrat') {
        poll = "blue_poll_dict_list";
    } else {
        poll = "red_poll_dict_list";
    }
    var totalC1 = 0;
    var totalC2 = 0;
    var totalC3 = 0;
    var totalC4 = 0;
    // go through the states
    // now refactored to take any race finished or polling
    for (key in json) {
        counter = 0;
        var candidate1 = 0;
        var candidate2 = 0;
        var candidate3 = 0;
        var candidate4 = 0;
        var key2;
        // go through the delegates or polling data
        for (key2 in json[key][poll]) {
            var key3;
            for (key3 in json[key][poll][key2]) {
                if (finished) {
                    // check if the selected date is before the voted date for finished races
                    var monthArr = key3.split(" ");
                    var monthNum = months[monthArr[0]] - 1;
                    var pollDate = new Date(2016,monthNum,monthArr[1]);
                
                    // console.log("pollDate: " + pollDate.getTime() + " currentDate: " + d.getTime())
                    // console.log(pollDate);
                    // console.log(d);
                
                    // skip the results if the selected date is before the results
                    if (pollDate.getTime() > (mapObj.date).getTime()) {
                        counter--;
                        // console.log("skipped: " + key);
                        skipped[key] = true;
                        continue;
                    }
                }
                // add the delegates to the candidates
                if (mapObj.party == 'democrat') {
                    if (json[key][poll][key2][key3].hasOwnProperty("Clinton")) {
                        candidate1 += json[key][poll][key2][key3]["Clinton"];
                    }
                    if (json[key][poll][key2][key3].hasOwnProperty("Sanders")) {
                        candidate2 += json[key][poll][key2][key3]["Sanders"];
                    }
                } else {
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
            var totalcandidatevals= candidate4+candidate2+candidate3+candidate1;
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
            if (mapObj.gradient) {
                var blue = ['#bdd7e7','#6baed6','#3182bd','#08519c'];
                var purple = ['#9e9ac8','#9e9ac8','#9e9ac8','#9e9ac8'];
                // var purple = ['#cbc9e2','#9e9ac8','#756bb1','#54278f'];
                var green = ['#bae4b3','#74c476','#31a354','#006d2c'];
                var red = ['#fcae91','#fb6a4a','#de2d26','#a50f15'];
                var colors;
                if (map.party == 'gop') {
                    colors = [blue,red,green,purple];
                } else {
                    colors = [blue,green];
                }
                var colorIndex = max - secondMax;
                colorIndex = Math.floor(((colorIndex/totalcandidatevals)*100) / 10);

                //colorindex/5, 0,1,2,3
                //we need 5%, 10%,15%,20%

                //two cans
                //25, 15
                //total = 40
                //10/40 =
                if (colorIndex > 3) colorIndex = 3;
                else if (colorIndex < 0) colorIndex = 0;
                color = colors[maxIndex][colorIndex];
            } else {
                var colors;
                if (mapObj.party == 'gop') {
                    colors = ['#08519c','#a50f15','#006d2c','#54278f'];
                } else {
                    colors = ['#08519c','#006d2c'];
                }
                color = colors[maxIndex];
            }
        }
        // if the state was skipped, leave it alone
        // otherwise an error happened and make it gray
        if ((candidate1 == 0 && candidate2 == 0 && candidate3 == 0 && candidate4 == 0) || skipped[key]) {
            color = "#ffffff";
        }
        if (mapObj.party == 'gop') {
            var name1 = "Trump";
            var name2 = "Cruz";
            var name3 = "Kasich";
            var name4 = "Rubio";
        } else {
            var name1 = "Clinton";
            var name2 = "Sanders";
        }
        totalC1 += candidate1;
        totalC2 += candidate2;
        totalC3 += candidate3;
        totalC4 += candidate4;
        var otherName = "Other";
        if (finished) {
            var other = 0;
        } else {
            var other = 100 - candidate1 - candidate2 - candidate3 - candidate4;
        }
        
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
        map.party = input;
    } else if (input == "gradient") {
        map.gradient = !map.gradient;
    } else {
        map.date = new Date(input);
        // console.log(d);
    }
    
	// console.log(map);
	
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
        if (map.party == 'democrat') {
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
	// console.log(map);
	// var d = map.date;
	// console.log(d);
    if ((map.date).getTime() == today.getTime()) {
        weekString = 'curr_week';
        // console.log("today");
    } else {
        var extra = ""
        if ((map.date).getMonth() < 9) {
            extra = '0';
        }
        // format the weekString to W/MM/YYYY
        weekString = Math.floor((map.date).getDate()/7) + "." + extra + ((map.date).getMonth()+1) + "." + (map.date).getFullYear();
        // console.log("not today " + input);
    }


        
    // get polling data Ajax call
    getpolldata(weekString, function(output) {
        // democratic party
        sampleData = goThroughDataJson(output,sampleData,map,false)[0];
        // Ajax call to get the data for finished states
        getFinishedStates(function(finished) {
            var returnResult = goThroughDataJson(finished,sampleData,map,true);
            sampleData = returnResult[0];
            totalC1 = returnResult[1];
            totalC2 = returnResult[2];
            totalC3 = returnResult[3];
            totalC4 = returnResult[4];
            if (map.party == 'democrat') {
                // draw the map and progress bar for the Democrats
                d3.select("#statesvg").selectAll("*").remove();
                uStates.draw("#statesvg", sampleData, tooltipHtmlDem);
                uStates.updateColor("#statesvg", sampleData);
                drawBar(totalC1, totalC2,0);
            } else {
                // GOP finished races
                
                d3.select("#statesvg").selectAll("*").remove();
                uStates.draw("#statesvg", sampleData, tooltipHtmlGop);
                uStates.updateColor("#statesvg", sampleData);
                drawBar(totalC1, totalC2, totalC3);
            }
        });
    });
}
//initial draw map
redrawMap('gop');

// Reset the map
function resetMap() {
	if (!map.runningThrough) {
		map.date = new Date();
		map.gradient = true;
		redrawMap('gop');
		document.getElementById("gop").checked = true;
	}
}

function runThroughRace() {
    if (!map.runningThrough) {
        map.runningThrough = true;
        var id = setInterval(runThrough,750);
        var oldDate = map.date;
        var runDate = new Date(2016,0,25);
		runDate.setHours(23,59,59,999);
        var currentDate = new Date();
        var currentParty = map.party;
		// console.log(currentParty);
        var oldGradient = map.gradient;
        function runThrough() {
            //console.log("it is working");
            if (runDate.getTime() > currentDate.getTime()) {
				map.party = currentParty;
                runDate = oldDate;
                map.gradient = oldGradient;
                redrawMap(currentDate);
                document.getElementById(map.party).checked = true;
			} else if (runDate.getTime() == oldDate.getTime()) {
                clearInterval(id);
                map.runningThrough = false;
                map.party = currentParty;
                map.gradient = oldGradient;
				map.date = oldDate;
                redrawMap(map.date);
                document.getElementById(map.party).checked = true;
            } else {
                map.party = currentParty;
				map.gradient = oldGradient;
                redrawMap(runDate);
                runDate.setDate(runDate.getDate() + 7);
				runDate.setHours(23,59,59,999);
                document.getElementById(map.party).checked = true;
            }
        }
    }
}
