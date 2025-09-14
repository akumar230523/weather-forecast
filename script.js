const sc = document.querySelector("#search-city");     // search city button
const sl = document.querySelector("#search-location");     // search location button
const dm = document.querySelector("#dropdown-div");
const s1 = document.querySelector("#s1");
const fc = document.querySelector("#forecast");

// OpenWeather API key
const API_key = "7d4b6afb6c827477180a2f9fca802609";

sc.addEventListener("click", searchCity);
sl.addEventListener("click", searchLocation);

// Run automatically when page loads.
window.onload = searchCity;


// Search City Function ---------------------------------------------------------------------------

function searchCity() {  
    let inputElement = document.querySelector("input");     // get input value from user
    let cityname = (inputElement && inputElement.value) || "New Delhi";
    if (cityname) {
        // Get city data from URL 1: ( https://openweathermap.org/api/geocoding-api )
        const url_1 = `https://api.openweathermap.org/geo/1.0/direct?q=${cityname}&limit=1&appid=${API_key}`;
        fetch(url_1)
            .then(response => response.json())
            .then((data) => {
                if (data.length == 1) {
                    citylocationData(data);
                }
                else {
                    alert("Invalid city name. Please try again.");
                }
            })
            .catch((error) => {
                alert("Failed to fetch city data!");
            });
    }
    else {
        alert("Please enter the city name.");
    }
    document.querySelector("input").value = "";     // clear previous search input
}


// Search Location Function -----------------------------------------------------------------------

function searchLocation() {
    const success = (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        // Get location data from URL 2: ( https://openweathermap.org/api/geocoding-api#reverse )
        const url_2 = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_key}`;
        fetch(url_2)
            .then(response => response.json())
            .then((data) => {
                citylocationData(data);
                navigator.geolocation.clearWatch(watchID);     // stop tracking after first successful fetch
            })
            .catch((error) => {
                alert("Failed to fetch location data!");
                navigator.geolocation.clearWatch(watchID);     // stop tracking in case of error
            });
    };
    const error = () => {
        alert("Please, allow access to your location.");  
    };
    const watchID = navigator.geolocation.watchPosition(success, error);
}


// CityLocationData Function ----------------------------------------------------------------------

// To extract Country, Latitude, Longitude, Name of city / location.
function citylocationData (data) { 
    let clln = data[0];
    let country = clln.country;
    let lat = clln.lat;
    let lon = clln.lon;
    let name = clln.name;
    weatherData(country, lat, lon, name);     // call 'Weather Data Function'
    dropdownDiv(name);     // call 'DropdownDiv Function' to store search city / locatopn name
}


// ------------------------------------------------------------------------- Weather Data Function.

function weatherData (country, lat, lon, name) {
    // Get weather data from URL 3: ( https://openweathermap.org/forecast5 )
    const url_3 =`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_key}`;
    fetch(url_3)
        .then(response => response.json())
        .then((data) => {
            fc.innerHTML = "";     // clear previous forecast cards
            for (let i = 0; i < data.list.length; i = i + 8) {
                if (i == 0) {   
                    todayWeather(name, country, data.list[i]);     // call 'Weather Today Function'
                }
                else {
                    forecastWeather(data.list[i]);     // call 'Weather Forecast Function'
                }
            }
        })
        .catch((error) => {
            alert("Failed to fetch weather data!");
        });
}


// ------------------------------------------------------------------------ Today Weather Function.

function todayWeather (name, country, tdihmw) {          // tdihmw (temp, date, icons, humidity max/min, wind)
    s1.innerHTML = `
                    <div id="w_info1" class="flex flex-col">
                        <p id="temp"> ${(tdihmw.main.temp - 273.15).toFixed(2)}° C </p>
                        <p id="city"> ${name}, ${country} </p>
                        <p id="date"> ${tdihmw.dt_txt.split(" ")[0]} </p>
                    </div>
                    <div id="w_icons">
                        <img src="https://openweathermap.org/img/wn/${tdihmw.weather[0].icon}@2x.png" alt="weather_icons">
                        <figcaption> ${tdihmw.weather[0].description} </figcaption>
                    </div>
                    <div id="w_info2" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                        <p class="flex flex-wrap items-center justify-center"> 
                            <i class="fa-solid fa-droplet"></i> Humidity: ${tdihmw.main.humidity} % 
                        </p>
                        <p class="flex flex-wrap items-center justify-center"> 
                            <i class="fa-solid fa-temperature-high"></i> Max: ${(tdihmw.main.temp_max - 273.15).toFixed(2)}° C 
                        </p>
                        <p class="flex flex-wrap items-center justify-center"> 
                            <i class="fa-solid fa-temperature-low"></i> Min: ${(tdihmw.main.temp_min - 273.15).toFixed(2)}° C 
                        </p>
                        <p class="flex flex-wrap items-center justify-center"> 
                            <i class="fa-solid fa-wind"></i> Wind: ${tdihmw.wind.speed} m/s 
                        </p>
                    </div>
                `;
}


// --------------------------------------------------------------------- Forecast Weather Function.

function forecastWeather (dtihw) {          // dtihw (date, temp, icons, humidity, wind)
    let wf = document.createElement("div");
    wf.classList.add("wf-card");
    wf.innerHTML = `
                    <p class="date"> ${dtihw.dt_txt.split(" ")[0]} </p>
                    <p class="temp"> ${(dtihw.main.temp - 273.15).toFixed(2)}° C </p>
                    <img src="https://openweathermap.org/img/wn/${dtihw.weather[0].icon}@2x.png" alt="weather_icon">
                    <p> Humidity: ${dtihw.main.humidity} % </p>
                    <p> Wind: ${dtihw.wind.speed} m/s </p>
                `;
    fc.appendChild(wf);
}


// Dropdown Div Function --------------------------------------------------------------------------

function dropdownDiv (name) {
    dm.innerHTML="";     // clear previous dropdown entries
    let lsl = localStorage.length;     // lsl (LocalStorage Length)
    // Check name exists or not in localStorage.
    let exists = false;
    for (let i = 0; i < lsl; i++) {
        let cityexists = JSON.parse(localStorage.getItem(i + 1));
        if (name == cityexists) {
            exists = true;
            break;
        }      
    }
    if (!exists) {
        localStorage.setItem(lsl + 1, JSON.stringify(name));     // set name to LocalStorage
    }
    // Display the stored city in dropdown div.
    for (let i = lsl; i >= 0; i--) {
        let storedName = JSON.parse(localStorage.getItem(i + 1));     // get name from LocalStorage
        if (!storedName) continue;
        let btn = document.createElement("div");
        btn.textContent = storedName;
        dm.appendChild(btn);
        btn.classList.add("dropdown-btn");
        btn.onclick = () => {
            document.querySelector("input").value = storedName;     // set input value for display weather data
            searchCity();     // call 'Search City Function'
        };
    }
}


// ------------------------------------------------------------------------------------------------