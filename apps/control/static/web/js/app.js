angular.module('trump-stats-mapper', ['ngAnimate', 'ui.bootstrap']);

angular.module('trump-stats-mapper').controller('TrumpStatsMapperCtrl', function($scope, $filter) {

    $scope.data = {};
    $scope.keyword = "";
    
    $scope.gradientBool = "true";
	$scope.runThroughBool = "false";

    // First grab of headline data (including keywords)
    getHeadlineData('curr_week', function(output) {
        $scope.data = output;
        $scope.$apply();
    });

    Date.prototype.addDays = function(days) {
        this.setDate(this.getDate() + parseInt(days));
        return this;
    };

    // Calendar reset
    $scope.reset = function() {
		if ($scope.runThroughBool == "false") {
			$scope.dt = new Date();
		}
    };
    $scope.reset();

    $scope.runThroughRace = function() {
		if ($scope.runThroughBool == "false") {
			$scope.runThroughBool = "true";
			var oldDate = $scope.dt;
			var id = setInterval(runThrough, 750);
			var current = new Date();
			current.setHours(0);
			var date = new Date(2016,0,25);
			var finish = false;
			date.setHours(0);
			//date.setHours(0);
			$scope.dt = date;

			function runThrough() {
			  if (finish) {
				clearInterval(id);
				$scope.runThroughBool = "false";
				$scope.setDate(oldDate.getFullYear(),oldDate.getMonth(),oldDate.getDate());
			  } else if (date.getTime() > current.getTime() && $scope.dt.getTime() < current.getTime()) {
				//console.log($filter('date')($scope.dt, 'EEEE, MMMM dd, y') + " > " + $filter('date')(current, 'EEEE, MMMM dd, y'));
				finish = true;
				$scope.setDate(current.getFullYear(),current.getMonth(),current.getDate());				
			  } else {
				$scope.setDate(date.getFullYear(),date.getMonth(),date.getDate());
				date.setDate(date.getDate() + 7);
				//$scope.$apply();
			  }
			  //console.log($filter('date')($scope.dt, 'EEEE, MMMM dd, y'));
			  $scope.$apply();
			  
			}
		}
    };

    // Calendar options
    $scope.inlineOptions = {
        customClass: getDayClass,
        maxDate: new Date(),
        showWeeks: true
    };

    $scope.dateOptions = {
        dateDisabled: disabled,
        formatYear: 'yy',
        minDate: new Date(),
        startingDay: 1
    };

    // Disable weekend selection
    function disabled(data) {
        var date = data.date,
            mode = data.mode;
        return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
    }

    $scope.open1 = function() {
        $scope.popup1.opened = true;
    };

    $scope.open2 = function() {
        $scope.popup2.opened = true;
    };

    $scope.setDate = function(year, month, day) {
        $scope.dt = new Date(year, month, day);
    };

    $scope.formats = ['dd-MMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];
    $scope.altInputFormats = ['M!/d!/yyyy'];

    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    var afterTomorrow = new Date(tomorrow);
    afterTomorrow.setDate(tomorrow.getDate() + 1);
    $scope.events = [{
        date: tomorrow,
        status: 'full'
    }, {
        date: afterTomorrow,
        status: 'partially'
    }];

    function getDayClass(data) {
        var date = data.date,
            mode = data.mode;
        if (mode === 'day') {
            var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

            for (var i = 0; i < $scope.events.length; i++) {
                var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

                if (dayToCheck === currentDay) {
                    return $scope.events[i].status;
                }
            }
        }

        return '';
    }

    // Retrieves headlines data
    function getHeadlineData(weekstring, handledata) {
        $.getJSON($SCRIPT_ROOT + '/get_headline_data', {
            week: weekstring
        }, function(data) {
            handledata(data.result);
        });
    }

    // Checks if new data (headlines + keywords) need to be retrieved and
    //  retrieves if necessary
    $scope.checkForData = function() {
        if ($scope.data[$scope.formatDate($scope.dt)] == null) {
            var week = Math.floor($filter('date')($scope.dt, 'd') / 7) +
                "." +
                $filter('date')($scope.dt, 'MM.yyyy');
            //console.log(week);

            getHeadlineData(week, function(output) {
                for (var newdate in output) $scope.data[newdate] = output[newdate];
                $scope.$apply();
                //console.log("data = ", $scope.data);
            });
        }
    }

    // Checks if headlines exist
    $scope.hasHeadline = function(date) {
        //console.log($scope.data[$scope.formatDate(date)].headlines.length);
        return $scope.data[$scope.formatDate(date)].headlines.length > 0;
    }

    // Formats date to make grabbing JSON data easier
    $scope.formatDate = function(date) {
        var d = $filter('date')(date, 'EEE, dd MMM y');
        return d;
    }

    // Sort by the occurrences of keywords in headlines
    $scope.sortByKeyword = function(headline) {
        return -1 * headline.keywords.indexOf($scope.keyword)
    }

    // Sets word used to sort the headlines
    $scope.clickKeyword = function(word) {
        $scope.keyword = word;
    }
});
