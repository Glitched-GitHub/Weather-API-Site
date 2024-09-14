const apiKey = "6d3d219a8f1c2eaed6b16f72729c4970";

const cityInput = document.getElementById("city__input");

const searchBtn = document.getElementById("search__btn");
const locationBtn = document.getElementById("location__btn");

const weatherError = document.getElementById("weather__error");

const weatherCardsDiv = document.getElementById("forecast__details");
const currentWeatherDiv = document.getElementById("weather__current");

const weatherIconDiv = document.getElementById("weather_icon");

var tempSwitch = document.getElementById("temp__switch-input");

searchBtn.addEventListener("click", searchLocation);

locationBtn.addEventListener("click", userLocation);

cityInput.addEventListener("keyup", e => e.key === "Enter" && searchLocation());

async function searchLocation() {

    const location = cityInput.value.trim();

    if (location) {
        const apiGeoLocation = `https://proxy.cors.sh/http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${apiKey}`;
    
        const getGeoLocation = await fetch(apiGeoLocation);
        const geoLocation = await getGeoLocation.json();

        if (!geoLocation.length) {

            console.error(`${location} is an invalid city.`)
            displayError(`${location} is an invalid city.`)

        } 
    
        const {name, lat, lon} = geoLocation[0];
            getCoordinates(name, lat, lon); 

    } else {
        displayError(`Please enter a valid city name.`)
    }
}

function userLocation() {

    navigator.geolocation.getCurrentPosition(
        
        async position => {
            
            const {latitude, longitude} = position.coords;

            const reverseGeoLocation = `https://proxy.cors.sh/http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`;
            
            const getReverseLocation = await fetch(reverseGeoLocation);
            const reverseLocation = await getReverseLocation.json();
            
            const {name, lat, lon} = reverseLocation[0];
            
            getCoordinates(name, lat, lon); 
        }, 
        
        error => {
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please allow location permission access to your location and try again.")
            }
        }
    )

}

async function getCoordinates(name, lat, lon) {
    
    const apiWeatherInfo = `https://proxy.cors.sh/http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    const getWeatherInfo = await fetch(apiWeatherInfo);
    

    if (!getWeatherInfo.ok) {
        console.error(`Failed to get weather data`);
        displayError(`Failed to get weather data`);
    }

    const weatherInfo = await getWeatherInfo.json();

    const uniqueForecastDays = [];

    const forecastDays = weatherInfo.list.filter(forecast => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueForecastDays.includes(forecastDate)) {
            return uniqueForecastDays.push(forecastDate);
        }
    });

    displayWeather(name, forecastDays);
    
}

function displayWeather(cityName, forecastDays) {
    
    cityInput.value = "";
    weatherCardsDiv.innerHTML = "";
    currentWeatherDiv.innerHTML = "";
    weatherError.textContent = "";

    forecastDays.forEach((weatherItem, index) => {
        if (index === 0) {
            currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
        } else {
            weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
        }
        
    }); 
}

const createWeatherCard = (cityName, weatherItem, index) => {
    
    if (tempSwitch.checked == true) {
        if (index === 0) {
            return `<div class="weather__details" id="weather__details">
                        <!-- Weather Data Goes Here From JS -->
                        <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                        <p>Temperature: ${((weatherItem.main.temp - 273.15) * (9/5) + 32).toFixed(1)}°F°C</p>
                        <p>Wind Speed: ${weatherItem.wind.speed} M/S</p>
                        <p>Humidity: ${weatherItem.main.humidity}%</p>
                    </div>
                    <div class="weather__icon" id="weather__icon">
                        <img src="https://proxy.cors.sh/http://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="${weatherItem.weather[0].description} Icon">
                        <p>${weatherItem.weather[0].description}</p>`
        } else {
            return `<div class="card">
                        <h2 id="${index}">(${weatherItem.dt_txt.split(" ")[0]})</h2>
                        <img src="https://proxy.cors.sh/http://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="${weatherItem.weather[0].description} Icon">
                        <p>Temp: ${((weatherItem.main.temp - 273.15) * (9/5) + 32).toFixed(1)}°F</p>
                        <p>Wind: ${weatherItem.wind.speed} M/S</p>
                        <p>Humidity: ${weatherItem.main.humidity}%</p>`    
        }
    } else {
        if (index === 0) {
            return `<div class="weather__details" id="weather__details">
                        <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                        <p>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(1)}°C</p>
                        <p>Wind Speed: ${weatherItem.wind.speed} M/S</p>
                        <p>Humidity: ${weatherItem.main.humidity}%</p>
                    </div>
                    <div class="weather__icon" id="weather__icon">
                        <img src="https://proxy.cors.sh/http://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="${weatherItem.weather[0].description} Icon">
                        <p>${weatherItem.weather[0].description}</p>`
        } else {
            return `<div class="card">
                        <h2 id="${index}">(${weatherItem.dt_txt.split(" ")[0]})</h2>
                        <img src="https://proxy.cors.sh/http://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="${weatherItem.weather[0].description} Icon">
                        <p>Temp: ${(weatherItem.main.temp - 273.15).toFixed(1)}°C</p>
                        <p>Wind: ${weatherItem.wind.speed} M/S</p>
                        <p>Humidity: ${weatherItem.main.humidity}%</p>`    
        }
    }
}

function displayError(message) {
    
    const errorText = document.createElement("h2");
    errorText.textContent = "Error:";

    const weatherErrorMessage = document.createElement("p");
    weatherErrorMessage.textContent = message;
    
    weatherError.textContent = "";
    weatherError.style.display = "flex";
    weatherError.style.flexDirection = "column";
    weatherError.appendChild(errorText);
    weatherError.appendChild(weatherErrorMessage);
    
}
