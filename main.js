const express = require('express');
const bodyParser = require('body-parser')
const path = require('path')
const app = express();
var MongoClient = require('mongodb').MongoClient

app.use(bodyParser.json());

var password = process.env.CONNECTION_PASSWORD
password = encodeURIComponent(password)
var connectionURL = process.env.CONNECTION_URL

app.use(express.static(__dirname + '/public'))

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
})

app.get('/index.js', function(req, res){
    res.sendFile(__dirname + '/index.js');
})

app.get('/sortRarity.js', function(req, res){
    res.sendFile(__dirname + '/sortRarity.js');
})

app.get('/sortRarity', function (req, res){
    res.sendFile(__dirname + "/sortRarity.html");
})

app.get('/priceList.js', function(req, res){
    res.sendFile(__dirname + '/priceList.js');
})

app.get('/priceList', function (req, res){
    res.sendFile(__dirname + "/priceList.html");
})

app.post('/sortRarityData', async function (req, res){
    const client = new MongoClient(connectionURL, {
        connectTimeoutMS: 70000,
        serverSelectionTimeoutMS: 70000,
    });
    let skip  = req.body["skip"];
    var jsonData = []
    await client.connect()
    const database = client.db("test");
    const collection = database.collection("sortRarity");
    const query = {};
    const cursor = collection.find(query).skip(skip).limit(20);
    await cursor.forEach((batch) => {
        jsonData.push(batch);
    });
    await client.close()
    console.log("Connection closed...")
    res.send(jsonData);
})

app.post('/priceListData', async function (req, res) {
    const client = new MongoClient(connectionURL, {
        connectTimeoutMS: 70000,
        serverSelectionTimeoutMS: 70000,
    });
    let skip = req.body["skip"];
    var jsonData = []
    await client.connect()
    const database = client.db("test");
    const collection = database.collection("sortPrice");
    const query = {};
    const cursor = collection.find(query).skip(skip).limit(20);
    await cursor.forEach((batch) => {
        jsonData.push(batch);
    });
    await client.close()
    console.log("Connection closed...")
    res.send(jsonData);
})

app.post('/plotToken', async function (req, res){
    const client = new MongoClient(connectionURL, {
        connectTimeoutMS: 70000,
        serverSelectionTimeoutMS: 70000,
    });
    let startDate  = req.body["startDate"];
    let endDate  = req.body["endDate"];
    let tokenID  = req.body["tokenID"];
    let jsonData = {}
    await client.connect()
    console.log("Connected to database.")
    const database = client.db("test");
    const collection = database.collection("nfts");
    const query = { "tokenDetails.tokenId": tokenID };
    const cursor = collection.findOne(query);
    await cursor.then((e)=>{
        jsonData = e;
    })
    await client.close()
    console.log("Connection closed...")
    let priceArray = []
    let timeStampArray = []
    for (let i = 0; i<jsonData['transfer'].length; i++){
        if (Date.parse(jsonData['transfer'][i].blockTimestamp) > Date.parse(startDate) && Date.parse(jsonData['transfer'][i].blockTimestamp) < Date.parse(endDate)) {
            let price = parseFloat(jsonData['transfer'][i].txValue.decimalValue) / parseFloat(jsonData['transfer'][i].nftTransfersQuantity)
            price = Math.round(price * 10000) / 10000
            if (price > 0) {
                priceArray.push(price)
                timeStampArray.push(jsonData['transfer'][i].blockTimestamp)
            }
        }
    }
    let returnData = {
        y: priceArray,
        x: timeStampArray,
    }
    // console.log(returnData)
    res.header('Content-Type', 'application/json');
    res.send(JSON.stringify(returnData));
})

app.post('/plotAll', async function (req, res){
    const client = new MongoClient(connectionURL, {
        connectTimeoutMS: 70000,
        serverSelectionTimeoutMS: 70000,
    });
    let endDate  = req.body["endDate"];

    await client.connect()
    console.log("Connected to database.")
    const database = client.db("test");
    const collection = database.collection("sortPrice");
    const query = {};
    const cursor = collection.find(query);
    let rarityScore = []
    let latestPriceList = []
    let tokenIds = []
    await cursor.forEach((jsonData)=>{
        let latestPrice = 0
        let rarity = 0
        for (let i = 0; i<jsonData['transfer'].length; i++){
            if (Date.parse(jsonData['transfer'][i].blockTimestamp) < Date.parse(endDate)) {
                let price = parseFloat(jsonData['transfer'][i].txValue.decimalValue) / parseFloat(jsonData['transfer'][i].nftTransfersQuantity)
                price = Math.round(price * 10000) / 10000
                if (price > 0) {
                    latestPrice = price
                    rarity = jsonData['rarityScore']
                }
            }
        }
        if (latestPrice > 0){
            latestPriceList.push(latestPrice)
            rarityScore.push(rarity)
            tokenIds.push("Token Id: " + jsonData['tokenDetails']["tokenId"])
            console.log("Value is added: ")
        }
    })
    await client.close()
    console.log("Connection closed...")
    let returnData = {
        y: latestPriceList,
        x: rarityScore,
        tokenText: tokenIds,
    }
    // console.log(returnData)
    res.header('Content-Type', 'application/json');
    res.send(JSON.stringify(returnData));
})

// app.get('/uploadFile', (req, res)=>{
//     const jsonDataList = require("./BoredApeYachtClubJSON.json")
//
//     const client = new MongoClient(connectionURL, {
//         connectTimeoutMS: 70000,
//         serverSelectionTimeoutMS: 70000,
//     });
//     jsonDataList.forEach((jsonData)=>{
//         let latestPrice = 0
//         let rarity = 0
//         for (let i = 0; i<jsonData['transfer'].length; i++){
//                 let price = parseFloat(jsonData['transfer'][i].txValue.decimalValue) / parseFloat(jsonData['transfer'][i].nftTransfersQuantity)
//                 price = Math.round(price * 10000) / 10000
//                 if (price > 0) {
//                     latestPrice = price
//                     rarity = jsonData['rarityScore']
//                 }
//         }
//         jsonData['latestPrice'] = latestPrice
//     })
//
//     jsonData.sort(function(x,y){return y["latestPrice"]-x["latestPrice"]});
//     async function run() {
//         try {
//             await client.connect();
//             const database = client.db("test");
//             const collection = database.collection("sortPrice");
//             const result = await collection.insertMany(jsonData, { ordered: true });
//             console.log(`${result.insertedCount} documents were inserted`);
//         } finally {
//             await client.close();
//         }
//     }
//     run().catch(console.dir);
//     res.send(200)
// })


app.listen(process.env.PORT || 3000, () =>{
    console.log("Server is listening.")
});


