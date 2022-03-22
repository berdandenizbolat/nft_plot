function insertNewLine(htmlElem){
    var newLine = document.createElement("br")
    htmlElem.appendChild(newLine)
}

function sortRarity(){
    window.open("/sortRarity", '__blank')
}

function listLatestPrice(){
    window.open("/priceList", '__blank')
}


let firstButtonInput = document.createElement("input")
let startDate = document.createElement("input")
let endDate = document.createElement("input")
var secondEndDate = document.createElement("input")

let plotDiv = document.createElement("div")

function plotAll(){
    while (plotDiv.childNodes.length !== 0){
        plotDiv.removeChild(plotDiv.firstChild)
    }
    let waitText = document.createElement("p")
    waitText.innerHTML ="Please wait."
    plotDiv.appendChild(waitText)
    let page = document.body
    if (!secondEndDate.value){
        alert("Please enter necessary fields.")
        return 0
    }

    let rarityList, priceList, result;
    rarityList = []
    let request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status === 200) {
                waitText.innerHTML = ""
                result = JSON.parse(request.responseText)
                priceList = result.y
                rarityList = result.x
                var data = [{
                    x: rarityList,
                    y: priceList,
                    text: result.tokenText,
                    mode:"markers"
                }];
                console.log(data)
                console.log(secondEndDate.value)
                var layout = {
                    xaxis: { title: "Rarity Score"},
                    yaxis: { rangemode: 'nonnegative', title: "Price in ETH"},
                    title: "Prices vs. Rarity Score"
                };

                Plotly.newPlot("nftPlot", data, layout);
            }
        }
    };
    const params = {
        endDate: secondEndDate.value,
    }
    request.open("POST", "/plotAll", true);
    request.setRequestHeader('Content-type', 'application/json')
    request.send(JSON.stringify(params));
}

function plotByID(){
    while (plotDiv.childNodes.length !== 0){
        plotDiv.removeChild(plotDiv.firstChild)
    }
    let waitText = document.createElement("p")
    waitText.innerHTML ="Please wait."
    plotDiv.appendChild(waitText)
    let page = document.body
    if (!startDate.value || !endDate.value || !firstButtonInput.value){
        alert("Please enter necessary fields.")
        return 0
    } else if (Date.parse(endDate.value) < Date.parse(startDate.value)) {
        alert("Ending date should be later than starting date.")
        return 0
    } else if (firstButtonInput.value >= 10000 || firstButtonInput.value < 0 || isNaN(parseInt(firstButtonInput.value))){
        alert("Token ID should be in between 0-10000")
        return 0
    }

    let timeList, priceList, result;
    timeList = []
    let request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status === 200) {
                waitText.innerHTML = ""
                result = JSON.parse(request.responseText)
                priceList = result.y
                for (let i = 0; i<result.x.length; i++){
                    let text = "";
                    for (let j = 0; j<10; j++){
                        text += (result.x[i])[j]
                    }
                    timeList.push(text);
                }
                var data = [{
                    x: timeList,
                    y: priceList,
                    mode:"markers"
                }];
                console.log(data)
                console.log(endDate.value)
                var layout = {
                    xaxis: { range: [startDate.value, endDate.value], title: "Time", type: 'date'},
                    yaxis: { rangemode: 'nonnegative', title: "Price in ETH"},
                    title: "Prices vs. Time"
                };

                Plotly.newPlot("nftPlot", data, layout);
            }
        }
    };
    const params = {
        startDate: startDate.value,
        endDate: endDate.value,
        tokenID: firstButtonInput.value,
    }
    request.open("POST", "/plotToken", true);
    request.setRequestHeader('Content-type', 'application/json')
    request.send(JSON.stringify(params));
}

function onLoad(){
    var page = document.body
    var entryText = document.createElement("p")
    entryText.innerHTML = "The Bored Ape Yacht Club is a collection of 10000 unique Bored Ape NFTs. Its tokens can be plotted with the options below:"
    var startDateDiv = document.createElement("div")
    var endDateDiv = document.createElement("div")

    startDate.type = "date"
    startDate.id = "startDateId"
    startDate.min = "2018-01-01"
    startDate.style.marginLeft = "15px"
    var startDateText = document.createElement("p")
    startDateText.innerHTML = "Choose starting date:"
    startDateText.style.display = "inline"

    endDate.type = "date"
    endDate.id = "endDateId"
    endDate.min = "2018-01-02"
    endDate.style.marginLeft = "19px"
    var endDateText = document.createElement("p")
    endDateText.innerHTML = "Choose ending date:"
    endDateText.style.display = "inline"
    var firstButton = document.createElement("button")
    firstButton.innerHTML = "Plot by token ID"
    firstButton.style.marginLeft = "15px"
    firstButton.onclick = plotByID
    var secondButton = document.createElement("button")
    secondButton.innerHTML = "Token IDs and their corresponding rarity scores calculated"
    secondButton.onclick = sortRarity
    var secondText = document.createElement("p")
    secondText.innerHTML = "Token ID information can be retrieved with the following options:"
    var thirdButton = document.createElement("button")
    thirdButton.innerHTML = "Token IDs and their corresponding latest transfer price"
    thirdButton.onclick = listLatestPrice
    thirdButton.style.marginTop = "9px"
    var thirdText = document.createElement("p")
    thirdText.innerHTML = "Collection can also be plotted wrt. tokens' latest transfer price at specified date:"

    var secondEndDateDiv = document.createElement("div")
    var secondEndDateText = document.createElement("p")

    secondEndDateText.innerHTML = "Choose ending date:"
    secondEndDateText.style.display = "inline"
    secondEndDate.type = "date"
    secondEndDate.id = "secondEndDateId"
    secondEndDate.min = "2019-01-02"
    var allPlotButton = document.createElement("button")
    allPlotButton.innerHTML = "Plot all tokens wrt. latest transfer price and rarity score"
    allPlotButton.onclick = plotAll

    secondEndDate.style.marginLeft = "19px"
    allPlotButton.style.marginTop = "10px"

    secondEndDateDiv.appendChild(secondEndDateText)
    secondEndDateDiv.appendChild(secondEndDate)
    insertNewLine(secondEndDateDiv)
    secondEndDateDiv.appendChild(allPlotButton)


    page.appendChild(entryText)
    page.appendChild(startDateDiv)
    page.appendChild(endDateDiv)
    startDateDiv.appendChild(startDateText)
    startDateDiv.appendChild(startDate)
    insertNewLine(page)
    page.appendChild(endDateDiv)
    endDateDiv.appendChild(endDateText)
    endDateDiv.appendChild(endDate)
    insertNewLine(page)
    page.appendChild(firstButtonInput)
    page.appendChild(firstButton)
    page.appendChild(thirdText)
    page.appendChild(secondEndDateDiv)
    page.appendChild(secondText)
    page.appendChild(secondButton)
    insertNewLine(page)
    page.appendChild(thirdButton)

    let plotText = document.createElement("p")
    plotText.innerHTML = "The plot will appear in below container:"
    plotText.style.marginLeft = "300px"
    plotDiv.style.borderStyle = "solid"
    plotDiv.style.marginLeft = "50px"
    plotDiv.style.width = "750px"
    plotDiv.style.height = "400px"
    page.appendChild(plotText)
    plotDiv.id = "nftPlot"
    page.appendChild(plotDiv)
}

document.addEventListener("DOMContentLoaded", function(event) {
    onLoad();
});
