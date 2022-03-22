const BATCH_SIZE = 20;

function insertNewLine(htmlElem){
    var newLine = document.createElement("br")
    htmlElem.appendChild(newLine)
}

var skip = 0;

function sendBatchRequestBefore(){
    skip -= 2*BATCH_SIZE;
    sendBatchRequest();
}

function sendBatchRequest(){
    var page = document.body
    let request = new XMLHttpRequest();
    page.innerHTML = ""
    var pendingText = document.createElement("p")
    pendingText.innerHTML = "The data access might take some time..."
    page.appendChild(pendingText)
    request.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status === 200) {
                page.removeChild(page.lastChild)
                let listItems = document.createElement("ol")
                listItems.start = skip + 1;
                page.appendChild(listItems)
                let result = JSON.parse(request.responseText)
                for (let i=0; i<result.length; i++){
                    let text = document.createElement("a")
                    text.textContent = "Token ID: " + (result[i]["tokenDetails"]["tokenId"]) +
                        ", Latest Price: " + Math.round(result[i]['latestPrice'] * 10000) / 10000
                    text.setAttribute('href', "https://opensea.io/assets/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d/" + result[i]["tokenDetails"]["tokenId"]);
                    text.setAttribute('target', '_blank')
                    insertIntoList(text ,listItems)
                }
                if (skip === 0){
                    let nextButton = document.createElement("button")
                    nextButton.innerHTML = "Next"
                    skip += BATCH_SIZE;
                    nextButton.onclick = sendBatchRequest
                    nextButton.style.marginLeft = "110px"
                    page.appendChild(nextButton)
                } else if (skip<10000){
                    let beforeButton = document.createElement("button")
                    beforeButton.innerHTML = "Before"
                    beforeButton.onclick = sendBatchRequestBefore
                    beforeButton.style.marginLeft = "80px"
                    page.appendChild(beforeButton)
                    let nextButton = document.createElement("button")
                    nextButton.innerHTML = "Next"
                    skip += BATCH_SIZE;
                    nextButton.onclick = sendBatchRequest
                    nextButton.style.marginLeft = "4px"
                    page.appendChild(nextButton)
                } else {
                    let beforeButton = document.createElement("button")
                    beforeButton.innerHTML = "Before"
                    beforeButton.onclick = sendBatchRequestBefore
                    beforeButton.style.marginLeft = "110px"
                    page.appendChild(beforeButton)
                }
            }
        }
    };
    const params = {
        skip: skip,
    }
    request.open("POST", "/priceListData", true);
    request.setRequestHeader('Content-type', 'application/json')
    request.send(JSON.stringify(params));
}

function insertIntoList(itemString, list){
    let listItem = document.createElement("li")
    listItem.appendChild(itemString)
    list.appendChild(listItem)
}

function onLoad(){
    sendBatchRequest()
}

document.addEventListener("DOMContentLoaded", function(event) {
    onLoad();
});
