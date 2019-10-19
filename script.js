//Warning make sure you are editing the ts file and not the js file
var legalAge = 18;
let siteName = "Is Your Waifu Legal?";
//units
let millisecond = 1;
let second = 1000 * millisecond;
let minute = 60 * second;
let hour = 60 * minute;
let day = 24 * hour;
var countdown = -1;
let months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];
function hasValue(data, key) {
    try {
        return data.hasOwnProperty(key) && data[key] !== null;
    }
    catch (error) {
        return false;
    }
}
function hasYear(waifu) {
    return hasValue(waifu, "year");
}
function hasMonth(waifu) {
    return hasValue(waifu, "month");
}
function hasDay(waifu) {
    return hasValue(waifu, "day-of-month");
}
function getCountdownHTML(countdownTime) {
    //sanity check
    if (countdownTime === undefined) {
        return "";
    }
    let currentDate = new Date();
    let currentTime = currentDate.getTime();
    let difference = countdownTime - currentTime;
    let seconds = Math.floor((difference % minute) / second);
    let minutes = Math.floor((difference % hour) / minute);
    let hours = Math.floor((difference % day) / hour);
    let days = Math.floor(difference / day);
    //To do calculate years, take into account leap years.
    let html = "Countdown to 18th birthday: ";
    html += days + " days ";
    html += hours + " hours ";
    html += minutes + " minutes ";
    html += seconds + " seconds<br>\n";
    return html;
}
function getAgeHTML(waifu) {
    let html = "";
    if (hasYear(waifu)) {
        let currentDate = new Date();
        let age = currentDate.getFullYear() - waifu["year"];
        //take into count the month
        if (hasMonth(waifu)) {
            let month = waifu["month"];
            let currentMonth = currentDate.getMonth() + 1;
            if ((currentMonth < month) || (
            //take into count the day
            currentMonth === month &&
                waifu.hasOwnProperty("day-of-month") &&
                waifu["day-of-month"] !== null &&
                currentDate.getDay() < waifu["day-of-month"])) {
                --age;
            }
        }
        html += "age: ";
        html += age.toString();
        html += " years old<br>\n";
        if (legalAge <= age) {
            html += "Looks legal to me.<br>\n";
            //stop timer
            if (countdown !== -1) {
                clearInterval(countdown);
                //congrats, your waifu is now of legal age
            }
        }
        else {
            html += "Not legal<br>\n" +
                "Wait ";
            html += legalAge - age;
            html += " more years.<br>\n";
            //We need to start the timer before we can display it
            if (countdown === -1) {
                countdown = window.setInterval(function () {
                    let countdownElement = document.getElementById("dynamic-data");
                    if (countdownElement !== null) {
                        countdownElement.innerHTML = getDynamicDataHTML(waifu);
                    }
                }, 1 * second);
            }
            html += getCountdownHTML(getBirthDate(waifu, legalAge).getTime());
        }
    }
    else {
        html += "Year of birth is unknown. Sorry.<br>\n";
    }
    return html;
}
function getBirthDate(waifu, yearsOffset = 0) {
    if (!hasYear(waifu)) {
        return new Date();
    }
    let year = waifu["year"] + yearsOffset;
    if (!hasMonth(waifu)) {
        return new Date(year);
    }
    else if (!hasDay(waifu)) {
        return new Date(year, waifu["month"] - 1);
    }
    else {
        return new Date(year, waifu["month"], waifu["day-of-month"]);
    }
}
function getDynamicDataHTML(waifu) {
    return getAgeHTML(waifu);
}
function sanitizeInput(input) {
    return input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}
function getCurrentURL() {
    return location.protocol + '//' + location.host + location.pathname;
}
function getWaifuNameHTML(englishName, CSSClass) {
    let HTML = "";
    HTML += "<h1 class=\"";
    HTML += CSSClass;
    HTML += "\">";
    HTML += englishName;
    HTML += "</h1>\n";
    return HTML;
}
function getMarginMobile() {
    return "<div class=\"flex-margins-mobile\"></div>";
}
function displayWaifuStats(name) {
    let input = sanitizeInput(name);
    let foundOutput = document.getElementById("output");
    let output;
    if (foundOutput === null)
        return;
    else
        output = foundOutput;
    output.innerHTML = "";
    if (input === "") {
        return;
    }
    //add search to history
    let parms = new URLSearchParams(window.location.search);
    let search = parms.get("q");
    let historyState = { "q": input };
    let query = "?q=" + input;
    if (search === null || search !== input) {
        history.pushState(historyState, "", query);
    }
    else {
        history.replaceState(historyState, "", query);
    }
    let request = new XMLHttpRequest();
    request.open("GET", getCurrentURL() + "waifus/" + input.toLowerCase() + ".json");
    request.responseType = "json";
    request.onerror = function (event) {
        console.log(event);
        output.innerHTML = "Something went wrong. Look at console for more info";
    };
    request.onload = function () {
        let newHTML = "";
        switch (this.status) {
            case 200: //OK
                break;
            case 404:
                newHTML +=
                    "Could not find this person. Sorry.<br>\n" +
                        "Maybe you spelled her name wrong.<br>\n" +
                        "Maybe you forgot to enter her full name.<br>\n" +
                        "If you know her age, " +
                        "<a href=\"https://github.com/yourWaifu/is-your-waifu-legal#How-to-add-a-waifu-to-the-list\">" +
                        "please add her" +
                        "</a>.";
            default:
                let error = "Error " + this.status.toString();
                output.innerHTML = error + "<br>\n" + newHTML;
                document.title = error + " - " + siteName;
                return;
        }
        //clear values before starting
        if (countdown !== -1) {
            clearInterval(countdown);
            countdown = -1;
        }
        let data = this.response;
        newHTML += "<div class=\"waifu-body\">\n";
        let englishName = data.hasOwnProperty("english-name") ? data["english-name"] : "";
        document.title = englishName + " - " + siteName;
        //display waifu image
        if (data.hasOwnProperty("image") && data["image"] !== null && data["image"] !== "") {
            newHTML += "<div class=\"waifu-image-parent\">\n";
            newHTML += "<img class=\"waifu-image\" src=\"";
            newHTML += data["image"];
            newHTML += "\" alt=\"";
            newHTML += englishName;
            newHTML += "\">\n";
            newHTML += "</div>\n";
        }
        newHTML += "<div class=\"flex-margins-mobile-container\">\n";
        newHTML += getMarginMobile();
        newHTML += "<div class=\"waifu-stats\">\n";
        newHTML += getWaifuNameHTML(englishName, "waifu-name");
        if (hasValue(data, "definitely-legal") && data["definitely-legal"] === true)
            newHTML += "Definitely Legal<br><br>\n";
        //display birthday
        newHTML += "Based on birthday:\n";
        let hasAnyBirthDayInfo = false;
        if (hasMonth(data)) {
            newHTML += months[Number(data["month"]) - 1] + " ";
            hasAnyBirthDayInfo = true;
        }
        if (hasDay(data)) {
            newHTML += data["day-of-month"].toString();
            hasAnyBirthDayInfo = true;
        }
        if (hasYear(data)) {
            if (hasAnyBirthDayInfo) {
                newHTML += ", ";
            }
            newHTML += data["year"].toString();
            hasAnyBirthDayInfo = true;
        }
        if (hasAnyBirthDayInfo)
            newHTML += "<br>\n";
        // Calculate data
        newHTML += "<div id=\"dynamic-data\">\n";
        newHTML += getDynamicDataHTML(data);
        newHTML += "</div>\n";
        //based on appearance
        let appearanceDataHTML = "";
        let appearanceAnswer = "";
        if (hasValue(data, "age-group-by-appearance")) {
            appearanceDataHTML += "looks like a(n) ";
            appearanceDataHTML += data["age-group-by-appearance"];
            appearanceDataHTML += "\n";
            switch (data["age-group-by-appearance"]) {
                case "child":
                    appearanceAnswer = "Doesn't look legal";
                    break;
                case "teenager":
                    appearanceAnswer = "Looks like they might be too young to be legal. Maybe?";
                    break;
                default:
                    appearanceAnswer = "looks legal";
                    break;
            }
        }
        if (hasValue(data, "age-range-by-appearance") && data["age-range-by-appearance"][0] !== undefined) {
            if (appearanceDataHTML !== "")
                appearanceDataHTML += "<br>\n";
            let startAge = data["age-range-by-appearance"][0];
            appearanceDataHTML += "looks about ";
            appearanceDataHTML += startAge;
            let endAge = data["age-range-by-appearance"][1];
            if (endAge !== undefined && startAge !== endAge) {
                appearanceDataHTML += " to ";
                appearanceDataHTML += endAge;
            }
            appearanceDataHTML += " years old\n";
            if (appearanceAnswer !== "") {
                //to do, looks like there's repeated code here
                appearanceAnswer =
                    startAge < legalAge ?
                        "Doesn't look legal"
                        : startAge <= legalAge + 1 ?
                            "Looks barely legal"
                            :
                                "Looks legal";
            }
        }
        if (appearanceDataHTML !== "") {
            newHTML += "<br>\nBased on appearance:\n<br>\n";
            newHTML += appearanceDataHTML;
            newHTML += "<br>\n";
            newHTML += appearanceAnswer;
            newHTML += "<br>\n";
        }
        //in the story
        let storyAgeHTML = "";
        if (hasValue(data, "age-in-show")) {
            let storyAge = data["age-in-show"];
            storyAgeHTML += "Age in story: ";
            storyAgeHTML += storyAge.toString();
            storyAgeHTML += "\n<br>\n";
            storyAgeHTML += storyAge < legalAge ? "Not legal" : "Legal";
            storyAgeHTML += "\n";
        }
        if (hasValue(data, "finally-legal-in-show")) {
            if (storyAgeHTML !== "")
                storyAgeHTML += "<br>\n";
            storyAgeHTML += "When they became legal: ";
            storyAgeHTML += data["finally-legal-in-show"];
            storyAgeHTML += "\n";
        }
        if (storyAgeHTML !== "") {
            newHTML += "<br>\nBased on story:\n<br>\n";
            newHTML += storyAgeHTML;
            newHTML += "<br>\n";
        }
        //list notes and sources
        function createListHtml(jsonKey, displayName) {
            let html = "";
            if (!data.hasOwnProperty(jsonKey) || data[jsonKey] === null || data[jsonKey].length === 0) {
                return html;
            }
            html += "<br>";
            html += displayName;
            html += ":<br>\n<ul>\n";
            let values = data[jsonKey];
            values.forEach(function (value) {
                html += "<li>";
                //https://stackoverflow.com/a/1500501
                let urlRegex = /(https?:\/\/[^\s]+)/g;
                html += value.replace(urlRegex, function (url) {
                    return '<a href="' + url + '">' + url + '</a>';
                });
                html += "</li>\n";
            });
            html += "</ul>\n";
            return html;
        }
        newHTML += createListHtml("notes", "Notes");
        newHTML += createListHtml("sources", "Sources");
        newHTML += "</div>\n";
        newHTML += getMarginMobile();
        newHTML += "</div>\n";
        newHTML += "</div>\n";
        output.innerHTML = newHTML;
    };
    request.send();
}
function onWaifuSearch() {
    let searchBar = document.getElementById("waifu-search");
    if (searchBar !== null && searchBar.value !== "")
        displayWaifuStats(searchBar.value);
}
//Search prediction
let searchTree = undefined;
function predictWaifu(input) {
    if (searchTree === undefined ||
        searchTree["root"] === undefined ||
        searchTree["root"][ /*children*/"c"] === undefined ||
        searchTree["allKeys"] === undefined)
        return [];
    let position = searchTree["root"];
    let filteredInput = input.toLowerCase();
    for (let i = 0; i < input.length; ++i) {
        let letter = filteredInput[i];
        let branches = position[ /*children*/"c"];
        if (branches[letter] === undefined || branches[letter] === null)
            return [];
        position = branches[letter];
    }
    if (position[ /*value*/"v"] === undefined)
        return [];
    let topPrediction = position[ /*value*/"v"];
    let topPredictions = [];
    for (let i = 0; i < 5; ++i) {
        let prediction = searchTree["allKeys"][topPrediction + i];
        if (prediction === undefined)
            break;
        topPredictions.push(prediction);
    }
    return topPredictions;
}
function displayWaifuPredictions() {
    let element = document.getElementById("waifu-predictions");
    if (element === null)
        return;
    let output = element;
    let newHTML = "";
    let input = document.getElementById("waifu-search").value;
    input = sanitizeInput(input);
    if (input === "") {
        output.innerHTML =
            "Search predictions will show up here<br>\n";
        return;
    }
    let predictions = predictWaifu(input);
    for (let i = 0; i < predictions.length; ++i) {
        let prediction = predictions[i];
        newHTML += "<a href=\"?q=";
        newHTML += prediction;
        newHTML += "\">";
        newHTML += prediction;
        newHTML += "</a><br>\n";
    }
    if (newHTML === "") {
        newHTML +=
            "Sorry, no results.<br>\n" +
                "Maybe you misspelled her name.<br>\n" +
                "She might not be in the database. " +
                "<a href=\"https://github.com/yourWaifu/is-your-waifu-legal#How-to-add-a-waifu-to-the-list\">" +
                "If so, please add her." +
                "</a><br>\n";
    }
    output.innerHTML = newHTML;
}
function onWaifuPrediction() {
    if (searchTree === undefined) {
        let request = new XMLHttpRequest();
        request.open("GET", "search-tree.json");
        request.responseType = "json";
        request.onerror = function () {
        };
        request.onload = function () {
            searchTree = this.response;
            displayWaifuPredictions();
        };
        request.send();
    }
    else {
        displayWaifuPredictions();
    }
}
let inputHistory = [];
let inputHistoryIndex = 0;
let maxInputHistorySize = 128;
function onWaifuPredictionAutoComplete() {
    if (searchTree === undefined)
        return;
    let inputElement = document.getElementById("waifu-search");
    let input = inputElement.value;
    input = sanitizeInput(input);
    let predictions = predictWaifu(input);
    if (predictions.length === 0)
        return;
    if (inputElement.value === predictions[0] && 1 < predictions.length) {
        inputElement.value = predictions[1];
    }
    else {
        inputElement.value = predictions[0];
    }
    if (inputElement.value == input) //don't save input if it hasn't changed
        return;
    if (inputHistoryIndex < inputHistory.length) {
        let removedElements = inputHistory.splice(inputHistoryIndex, inputHistory.length - inputHistoryIndex);
    }
    if (maxInputHistorySize <= inputHistory.length)
        inputHistory.shift(); //keeps memory usage low
    inputHistory.push(input);
    inputHistoryIndex = inputHistory.length;
}
function getLastWaifuPredictionAutoComplete() {
    if (inputHistory.length <= 0 || inputHistoryIndex <= 0)
        return;
    let inputElement = document.getElementById("waifu-search");
    --inputHistoryIndex;
    inputElement.value = inputHistory[inputHistoryIndex];
}
//read me
function displayReadMe() {
    let request = new XMLHttpRequest();
    request.open("GET", getCurrentURL() + "/README.html");
    request.responseType = "document";
    request.onload = function () {
        switch (this.status) {
            case 200: break; //OK
            default: return;
        }
        let data = this.responseXML;
        if (data === null)
            return;
        let output = document.getElementById("output");
        if (output === null)
            return;
        output.innerHTML = "";
        output.appendChild(data.documentElement);
        //Detect firefox mobile
        let frontScreen = document.getElementById("front-screen");
        if (frontScreen === null)
            return;
        let frontScreenHeight = frontScreen.clientHeight;
        let frontScreenText = document.getElementById("front-screen-text");
        if (frontScreenText === null)
            return;
        let frontScreenTextHeight = frontScreenText.clientHeight;
        if (frontScreenHeight <= frontScreenTextHeight)
            frontScreen.className = "front-screen-firefox";
    };
    request.send();
    //auto set focus on search bar
    let element = document.getElementById("waifu-search");
    if (element === null)
        return;
    let searchBar = element;
    searchBar.focus();
}
function displaySiteContent(q) {
    if (q === undefined || q === null)
        displayReadMe();
    else
        displayWaifuStats(q);
}
//read query string values
window.onload = function () {
    let parms = new URLSearchParams(window.location.search);
    let search = parms.get("q");
    displaySiteContent(search);
};
window.onpopstate = function (event) {
    let search = hasValue(event.state, "q") ? event.state["q"] : null;
    displaySiteContent(search);
};
// Some UI stuff
function onClickWaifuPrediction(elementID) {
    //using on foucs and on blur causes clicking on
    //predictions to close instead of going to the predicted
    //link
    //Doing this fixes this issue
    let showElements = new Set();
    showElements.add("waifu-search");
    showElements.add("waifu-predictions");
    showElements.add("mobile-waifu-search-button");
    let show = showElements.has(elementID) ||
        (document.activeElement !== null && document.activeElement.id === "waifu-search");
    let menu = document.getElementById("waifu-predictions");
    menu.style.display = show ? "unset" : "none";
    //hide search button on mobile
    let mobileSearchButton = document.getElementById("mobile-waifu-search-button");
    if (mobileSearchButton === null)
        return;
    mobileSearchButton.className = show ?
        "mobile-search-button-during-search" : "mobile-search-button";
}
let uiOnClickCallbacks = new Array();
uiOnClickCallbacks.push(onClickWaifuPrediction);
window.onclick = function (mouse) {
    let element = document.elementFromPoint(mouse.clientX, mouse.clientY);
    if (element === null)
        return;
    let clickedElement = element;
    uiOnClickCallbacks.forEach(function (f) {
        f(clickedElement.id);
    });
};
