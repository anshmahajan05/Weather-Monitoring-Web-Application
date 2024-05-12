// Require application dependencies
// These are express, body-parser, and request

const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const app = express();

// Configure dotenv package

require("dotenv").config();
// Set up your OpenWeatherMap API_KEY

const apiKey = `${process.env.API_KEY}`;

// Setup your express app and body-parser configurations
// Setup your javascript template view engine
// serve your static pages from the public directory, it will act as your root directory
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// Setup your default display on launch
app.get("/", function (req, res) {
	// It will not fetch and display any data in the index page
	res.render("views/index", { weather: null, error: null });
});

// On a post request, the app shall data from OpenWeatherMap using the given arguments
app.post("/", function (req, res) {
	// Get city name passed in the form
	let city = req.body.city;

	// Use that city name to fetch data
	// Use the API_KEY in the '.env' file
	let url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
	console.log(url);
	// Request for data using the URL
	request({ url: url }, function (err, response, body) {
		// check the json data fetched
		if (err) {
			console.log(err, "Internet gone");
			res.render("index", {
				weather: null,
				error: "Error, please try again",
			});
		} else {
			let weather = JSON.parse(body);
			//output it in the console just to make sure that the data being displayed is what you want
			console.log(weather);

			if (weather.main == undefined) {
				res.render("index", {
					weather: null,
					error: "Error, please try again",
				});
			} else {
				// use the data got to set up your output
				let place = `${weather.name}, ${weather.sys.country}`,
					/*calculate the current timezone using the data fetched*/
					weatherTimezone = `${new Date(
						weather.dt * 1000 - weather.timezone * 1000
					)}`;
				let weatherTemp = `${weather.main.temp}`,
					weatherPressure = `${weather.main.pressure}`,
					/*fetch the weather icon and its size using the icon data*/
					weatherIcon = `http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`,
					weatherDescription = `${weather.weather[0].description}`,
					humidity = `${weather.main.humidity}`,
					clouds = `${weather.clouds.all}`,
					visibility = `${weather.visibility}`,
					main = `${weather.weather[0].main}`,
					wind = `${weather.wind.speed}`,
					weatherFahrenheit;
				weatherFahrenheit = (weatherTemp * 9) / 5 + 32;

				// round off the value of the degrees fahrenheit calculated into two decimal places
				function roundToTwo(num) {
					return +(Math.round(num + "e+2") + "e-2");
				}
				weatherFahrenheit = roundToTwo(weatherFahrenheit);
				// now render the data to your page (index.ejs) before displaying it out
				res.render("index", {
					weather: weather,
					place: place,
					temp: weatherTemp,
					pressure: weatherPressure,
					icon: weatherIcon,
					description: weatherDescription,
					timezone: weatherTimezone,
					humidity: humidity,
					fahrenheit: weatherFahrenheit,
					clouds: clouds,
					visibility: visibility,
					main: main,
					wind_speed: wind,
					error: null,
				});
			}
		}
	});
});

//set up your port configurations. also start the server and add a message to display when running.
app.listen(5000, function () {
	console.log("Weather app listening on port 5000!");
});

module.exports = app;
