let sample = {
    daily: {
        time: [
            "2026-01-01",
            "2026-01-02",
            "2026-01-03",
            "2026-01-04",
            "2026-01-05",
            "2026-01-06",
            "2026-01-07"
        ],
        temperature_2m_max: [
            10,
            22,
            34,
            40,
            25,
            36,
            27
        ],
        temperature_2m_min: [
            10,
            25,
            15,
            35,
            8,
            24,
            32
        ],
        windspeed_10m_max: [
            10,
            20,
            12,
            15,
            23,
            10,
            25
        ],
        weather_code: [
            10,
            11,
            12,
            13,
            14,
            15,
            16
        ]
    }
}

const WMO_CODE_ICONS = {
    0: "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/clear-day.svg",
    1: "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/mostly-clear-day.svg",
    2: "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/partly-clear-day.svg",
    3: "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/overcast.svg",
    45: "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/haze.svg",
    48: "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/fog.svg",
    51: "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/drizzle.svg",
    53: "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/drizzle.svg",
    55: "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/drizzle.svg",
    56: "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/drizzle.svg",
    57: "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/drizzle.svg",
    61: "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/rain.svg",
    63: "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/overcast-rain.svg",
    65: "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/extreme-rain.svg",
    66: "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/rain.svg",
    67: "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/rain.svg",
    71: "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/snow.svg",
    73: "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/overcast-snow.svg",
    75: "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/extreme-snow.svg",
    77: "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/overcast-snow.svg",
    80: "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/overcast-rain.svg",
    81: "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/overcast-rain.svg",
    82: "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/overcast-rain.svg",
    85: "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/overcast-rain.svg",
    86: "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/overcast-rain.svg",
    95: "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/thunderstorms-rain.svg",
    96: "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/thunderstorms-sleet.svg",
    99: "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/thunderstorms-hail.svg"
}

function get_day(date) {
    let day = new Date(date);
    return day.toLocaleString("en-US", { weekday: "long" });
}

function create_card(data) {
    const container = document.getElementById("card-container");
    container.innerHTML = data.daily.time.map((date, i) =>
        `<div class="card">
            <h3>${get_day(date)}</h3>
            <img class="weather-icon" src="${WMO_CODE_ICONS[data.daily.weather_code[i]]}"/>
            <p class="temperature"> Temperature: ${data.daily.temperature_2m_max[i]}° - ${data.daily.temperature_2m_max[i]}°</p>
            <p class="wind">Wind speed: ${data.daily.windspeed_10m_max[i]} km/h</p>
            <p class="date">${date}</p>
        </div>`
    ).join("");
}

function create_empty_card() {
    const container = document.getElementById("card-container");
    let html = [];
    for (let i = 0; i < 7; i++) {
        html.push(`<div class="card">
            <h3>_</h3>
            <img class="weather-icon" src="image/cloudy.svg"/>
            <p class="temperature"> Temperature: _° - _°</p>
            <p class="wind">Wind speed: _ km/h</p>
            <p class="date">_</p>
        </div>`)
    }
    container.innerHTML = html.join("");
}

async function get_coord(city) {
    const params = new URLSearchParams({
        name: city,
        count: 1,
        language: "fr"
    });
    try {
        const url = `https://geocoding-api.open-meteo.com/v1/search?${params}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.results)
            return { latitude: data.results[0].latitude, longitude: data.results[0].longitude }
        else
            return null;
    }
    catch (err) {
        return -1;
    }
}

async function get_forecast(coord) {
    const params = new URLSearchParams({
        latitude: coord.latitude,
        longitude: coord.longitude,
        daily: "temperature_2m_max,temperature_2m_min,weather_code,windspeed_10m_max",
        forcast_days: 7,
        timezone: "auto"
    });

    try {
        const url = `https://api.open-meteo.com/v1/forecast?${params}`;
        const response = await fetch(url);
        const data = await response.json();
        return {
            timezone: data.timezone,
            daily: data.daily
        };
    }
    catch (err) {
        return -1;
    }
}


async function show_weather() {
    if (!navigator.onLine) {    //Check if online
        show_message("No internet connection");
        return;
    }

    let city = document.getElementById("text_input").value.trim();
    if (!city) {    //Check if input is not empty
        show_message("No city selected");
        return;
    }

    show_message("Fetching...");
    const coord = await get_coord(city);
    if (coord === null) {    //Check if city is not found
        show_message("City not found");
        return;
    }
    else if (coord === -1) {    //Check if fetch failed
        show_message("Weather service unreachable");
        return;
    }

    const data = await get_forecast(coord);
    if (data === -1) {  //Check if fetch failed
        show_message("Error fetching data");
        return;
    }

    close_message();
    console.log("data received: ", data);

    create_card(data);
}

function show_message(message) {
    document.getElementById("message-container").classList.remove("hidden");
    document.getElementById("message").textContent = message;
}

function close_message() {
    document.getElementById("message-container").classList.add("hidden");
}

if (!navigator.onLine) {
    show_message("No internet connection");
}
else close_message();


document.getElementById("search").addEventListener("click", show_weather);
document.getElementById("text_input").addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.repeat) {
        show_weather();
    }
})
document.getElementById("close-message").addEventListener("click", close_message);


create_empty_card();