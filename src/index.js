//import config from './config'


'use strict'

$.getScript('filter.js', function () {
    filter
});

function handleCountryClick() {
    $("#country-list").on( "click", 'li', function () {
        $("#country").val(null)
        $("#country").val($(this).text())
    })
}

function handleFilter() {
    $("#country").keyup(function () {
        let input = $('#country').val()
        filter(input)
        $(`#country-list`).empty().append(filter(input))
    });
}


function handleCountries() {
    $('#country-list').hide();
    $('#country').click(function () {
        $("#country-list").show();
    });
    handleFilter()
    handleCountryClick()
}

function handleUnitButtons() {
    $('#js-weather-results-M').hide();
    $('#js-f').click(event => {
        event.preventDefault();
        $('#js-weather-results-M').hide();
        $('#js-weather-results-I').show();
    });
    $('#js-c').click(event => {
        event.preventDefault();
        $('#js-weather-results-I').hide();
        $('#js-weather-results-M').show();
    });
}

function displayWeatherResults(responseJson, unitType) {
    for (let i = 0; i < responseJson.data.length; i++) {
        $(`#js-weather-results-${unitType}`).append(`
        <div class="weather-data">
        <h4 class="day">Day: ${[i + 1]}</h4>
        <img class="weather-img" src="weather-icons/${responseJson.data[i].weather.icon}.png" alt="An img depicting the weather as ${responseJson.data[i].weather.description}">
        <p class="temp">${responseJson.data[i].high_temp}°/${responseJson.data[i].low_temp}°</p>
        </div>`);
    }
    $('.results').show();
};

function displayNewsResults(responseJson) {
    for (let i = 0; i < responseJson.articles.length; i++) {
        $('#js-news-results-list').append(`
    <li>
    <a href="${responseJson.articles[i].url}" target="_blank">${responseJson.articles[i].title}</a>
    <p>Source name: ${responseJson.articles[i].source.name}</p>
    </li>`)
    }
    $('.results').show();

    //This code will be helpful in displaying images for news articles:
    //<img src="${responseJson.articles[i].urlToImage}" alt="An img about this news article">
};

function formatQueryParams(params) {
    let queryItems = Object.keys(params)
        .map(key => `${key}=${params[key]}`)
    return queryItems.join('&');
}
//console.log(config.WEATHER_API_ENDPOINT)
let weatherBaseUrl = 'https://api.weatherbit.io/v2.0/forecast/daily?'
//config.WEATHER_API_ENDPOINT

let weatherApiKey = '5ae81936c8514eacb8ef228b49c7eaa4';

function getWeather(cityState, unitType) {
    let params = {
        units: unitType,
        city: cityState,
        key: weatherApiKey
    }
    let queryString = formatQueryParams(params)
    let url = weatherBaseUrl + queryString;

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error(response.statusText);
            }
        })
        .then(responseJson => displayWeatherResults(responseJson, unitType))
        .catch(err => {
            $('#js-hide').hide();
            $('#js-error-message-weather').empty().text(`Something went wrong: you probably need to change your input`).show();
        })
};

//replace with new api
let newsBaseUrl = 'https://newsapi.org/v2/'
let newsApiKey = '832ecf1cdf9741c19ffe553820ed8d60';

function getNews(searchType, params) {
    let queryString = formatQueryParams(params);
    let url = newsBaseUrl + searchType + '?' + queryString;

    let options = {
        headers: new Headers({
            "X-Api-Key": newsApiKey
        })
    };

    fetch(url, options)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            else {
                throw new Error(response.statusText);
            }
        })
        .then(responseJson => displayNewsResults(responseJson))
        .catch(err => {
            $('#js-error-message-news').empty().text(`Something went wrong: ${err.message}`).show();
        })
}

function buildNewsQueryUrl(formatedQuery) {
    let params = {
        q: formatedQuery,
        page: 1
    }

    let searchType = 'everything';
    // getNews(searchType, params)
}

function buildNewsCountryUrl(countryInput) {
    let params = {
        country: countryInput
    }

    let searchType = 'top-headlines';
    //getNews(searchType, params)

}

function handleGettingNews(country, formatedQuery) {
    $('#js-news-results-list').empty();
    // buildNewsQueryUrl(formatedQuery);
    //buildNewsCountryUrl(country);
};

function handleGetting(cityState, country, formatedQuery) {
    if ($('#news').is(':checked')) {
        //  handleGettingNews(country, formatedQuery);
        $('#js-news-results').show();
        $('.results').show();
        $('#js-weather-results').hide();
    }
    else if ($('#weather').is(':checked')) {
        $('#js-weather-results-I').empty();
        getWeather(cityState, "I");
        $('#js-weather-results-M').empty();
        getWeather(cityState, "M");
        $('#js-weather-results').show();
        $('#js-news-results').hide();
    }
    else {
        handleGettingNews(country, formatedQuery);
        $('#js-weather-results-I').empty();
        getWeather(cityState, "I");
        $('#js-weather-results-M').empty();
        getWeather(cityState, "M");
        $('#js-weather-results').show();
        $('#js-news-results').show();
    }
};

function formatParamsUri(params) {
    const queryItems = encodeURIComponent(params);
    return queryItems;
}

function combine(city, state) {
    let formatedCity = city.split(' ');
    formatedCity = formatedCity.join('+');
    formatedCity = formatedCity + ',' + state;
    return formatedCity
}
function hideError() {
    $('#js-error-message-weather').hide()
    $('#js-error-message-news').hide()
}

function getCountryId() {
    //make sure to also get the id from the input 
    //by comparing input to object in filter file 
    //this will help when a user enters the in input without clicking li
    $("#country-list li").click(function () {
        return $(this).attr('id')
    })
}

function handleSubmit() {
    $('form').submit(function (event) {
        event.preventDefault();
        hideError()
        $('#js-hide').show();
        let city = $('#city').val();
        let state = $('#state').val();
        let country = getCountryId()
        let cityState = combine(city, state);
        let newsCityState = `"` + city + `"` + ` AND ` + `"` + state + `"`;
        let formatedQuery = formatParamsUri(newsCityState);
        handleGetting(cityState, country, formatedQuery);
    });
};


function handleExploreApp() {
    handleCountries()
    $('.results').hide();
    hideError()
    handleSubmit();
    handleUnitButtons();
};

export default function handleJquery() {
    $(handleExploreApp);
}
