angular.module('trump-stats-mapper', ['ngAnimate', 'ui.bootstrap']);

angular.module('trump-stats-mapper').controller('TrumpStatsMapperCtrl', function($scope, $filter) {

    $scope.data = {};
    $scope.keyword = "";

    getHeadlineData('curr_week', function(output) {
        $scope.data = output;
        $scope.$apply();
        console.log("keywords length: ", $scope.data[$scope.formatDate($scope.dt)].keywords.length);
        console.log("headlines: ", $scope.data[$scope.formatDate($scope.dt)].headlines);
        console.log("keywords: ", $scope.data[$scope.formatDate($scope.dt)].keywords);
    });

    $scope.today = function() {
        $scope.dt = new Date();
    };
    $scope.today();

    $scope.clear = function() {
        $scope.dt = null;
    };

    $scope.inlineOptions = {
        customClass: getDayClass,
        minDate: new Date(),
        showWeeks: true
    };

    $scope.dateOptions = {
        dateDisabled: disabled,
        formatYear: 'yy',
        maxDate: $scope.today(),
        minDate: new Date(),
        startingDay: 1
    };

    // Disable weekend selection
    function disabled(data) {
        var date = data.date,
            mode = data.mode;
        return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
    }

    $scope.toggleMin = function() {
        $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
        $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
    };

    $scope.toggleMin();

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

    function getHeadlineData(weekstring, handledata) {
        $.getJSON($SCRIPT_ROOT + '/get_headline_data', {
            week: weekstring
        }, function(data) {
            handledata(data.result);
        });
    }

    $scope.checkForData = function() {
        if ($scope.data[$scope.formatDate($scope.dt)] == null) {
            var week = Math.floor($filter('date')($scope.dt, 'd') / 7) +
                "." +
                $filter('date')($scope.dt, 'MM.yyyy');
            console.log(week);

            getHeadlineData(week, function(output) {
                for (var newdate in output) $scope.data[newdate] = output[newdate];
                $scope.$apply();
                console.log("data = ", $scope.data);
            });
        }
    }

    $scope.hasHeadline = function(date) {
        console.log($scope.data[$scope.formatDate(date)].headlines.length);
        return $scope.data[$scope.formatDate(date)].headlines.length > 0;
    }

    $scope.formatDate = function(date) {
        var d = $filter('date')(date, 'EEE, d MMM y');
        return d;
    }

    $scope.sortByKeyword = function(headline) {
        return -1 * headline.keywords.indexOf($scope.keyword)
    }

    $scope.clickKeyword = function(word) {
        $scope.keyword = word;
    }
});
