"use strict";
var every = require('schedule').every;
var ForecastIo = require('forecastio');
var secrets = require('./../secrets');

var Weather = (function () {
    function Weather(bus) {
        var _this = this;
        this.getWeather = function () {
            var forecastIo = new ForecastIo(secrets.ForecastIoApiKey);
            var instance = _this;
            //console.log('Fetching forecast.io data');
            forecastIo.forecast('40.0848523', '-75.2493311', function (err, data) {
                if (err) {
                    console.log("Error fetching forcecast.io data: " + err);
                }
                else {
                    //console.log('Finished fetching forecast.io data');
                    if (data.currently) {
                        instance.currentWeather.temp = Math.round(data.currently.temperature);
                        instance.currentWeather.description = data.currently.summary;
                        instance.currentWeather.icon = data.currently.icon;
                        instance.currentWeather.feelsLike = Math.round(data.currently.apparentTemperature);
						instance.currentWeather.updated = data.currently.time;
                    }
                    if (data.minutely) {
                        instance.currentWeather.nextHour = data.minutely.summary;
                    }
                    if (data.hourly) {
                        instance.currentWeather.nextDay = data.hourly.summary;
                    }
                }
            });
        };
        this.updateWidgets = function () {
            //console.log('Updating weather');
            _this.bus.post({
                event: 'widgetUpdate',
                messageType: 'weather:update',
                messageData: _this.currentWeather
            });
        };
        this.currentWeather = {};
        var instance = this;
        instance.getWeather();
        bus.subscribe({ event: 'userConnected' }, instance.updateWidgets);
        every('5m').do(function () {
            instance.getWeather();
            instance.updateWidgets();
        });
        this.bus = bus;
    }
    return Weather;
})();
exports.Weather = Weather;
//# sourceMappingURL=weather.js.map