console.log("Starting")
const express = require('express')
const path = require('path')
var request = require('request');


const PORT = process.env.PORT || 5000
var bodyParser = require("body-parser");
var cors = require('cors');


var player = require('play-sound')(opts = {})

var app = express();



const http = require('http')


Web3 = require("web3");


web3 = new Web3('<INFURA_LINK>');

var daiPriceUniswap = 0;
var daiPriceKyber = 0;
var currentlyTrading = false;
const contract_addr = '0x1a5924bed24B4deCe2b2C217049a7CB6628c1200';
const contract_abi = [{ "constant": true, "inputs": [], "name": "getUniswapBuyPrice", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "getUniswapSellPrice", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "getKyberBuyPrice", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "getKyberSellPrice", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "withdrawETHAndTokens", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "fromAddress", "type": "address" }, { "name": "uniSwapContract", "type": "address" }, { "name": "theAmount", "type": "uint256" }], "name": "kyberToUniSwapArb", "outputs": [{ "name": "", "type": "bool" }], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": true, "inputs": [], "name": "proxy", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "payable": true, "stateMutability": "payable", "type": "fallback" }
]

var server = http.createServer(app).listen(PORT, () => console.log(`Listening on ${PORT}`))

app.use(express.static(path.join(__dirname, 'public')))


var cors = require('cors');
app.use(cors({ credentials: true, origin: '*' }));
// .set('views', path.join(__dirname, 'views'))
//.set('view engine', 'ejs')
//.get('/', (req, res) => res.render('pages/index'))
app.get("/", function(req, res) {
  res.send({ uniswapPrice: daiPriceUniswap, kyberPrice: daiPriceKyber });
})


app.get("/exampletransaction", function(req, res) {
  exampleTransactions();
  res.send("the example transactions were created. Check your console.")

})


function getPrices() {

  contractAddr = contract_addr
  arbAbi = contract_abi

  var priceContract = new web3.eth.Contract(arbAbi, contractAddr)

  priceContract.methods.getUniswapSellPrice().call({
    'from': '<PUBLIC_KEY>'

  }, function(error, data) {
    console.log("Uniswap DAI Sell price is:")
    console.log(data)
    daiPriceUniswap = parseInt(data)
  })

  priceContract.methods.getKyberBuyPrice().call({
    'from': '<PUBLIC_KEY>'

  }, function(error, data) {
    console.log("Kyber DAI Buy price is:")
    console.log(data)
    daiPriceKyber = parseInt(data)
  })

}


function arbTrade() {
  ///Executes trade then checks again
  if (currentlyTrading == true) {
    return false;
  }

  currentlyTrading = true;
  setTimeout(function() {
    currentlyTrading = false;
  }, 45000);
  console.log("starting arb trade. Cant execute another trade for 45 seconds")

  //My address and private key
  var addr = '<PUBLIC_KEY>';
  var pvtkey = '<PRIVATE_KEY>';
  var tradeContract = contract_addr
  var arbAbi = contract_abi


  web3.eth.accounts.wallet.add("0x" + pvtkey);

  var contract1 = new web3.eth.Contract(arbAbi, tradeContract);
  let asset_token = "0x6B175474E89094C44Da98b954EedeAC495271d0F" //Dai
  let uniswap_contract = "0x09cabec1ead1c0ba254b09efb3ee13841712be14"
  let tx_amount = 10000000000000000

  //Creates the transaction
  //Works on remix
  //0x6B175474E89094C44Da98b954EedeAC495271d0F,0x09cabec1ead1c0ba254b09efb3ee13841712be14,50000000
  var tx = contract1.methods.kyberToUniSwapArb(asset_token, uniswap_contract,
    500000000).send({
      'from': addr,
      'gas': 3000000,
      'gasLimit': 500000000,
      value: tx_amount,
    }, function(error, data) {
      console.log(error);
      console.log(data)
    })

  console.log('Trade has beem made!!!!!!!!!!!!!');
}

function payOwnerOut() {
  var tradeContract = contract_addr
  var arbAbi = contract_abi
  var payContract = new web3.eth.Contract(arbAbi, tradeContract)

  payContract.methods.withdrawETHAndTokens().call({},
    function(error, data) {
      console.log("You have been paid")
      console.log(error)
      console.log(data)
    })
}

function checkParameters(requiredParams, sentParams) {

  hasAll = true;

  for (i in requiredParams) {
    var hasThis = false;
    for (j in sentParams) {
      if (requiredParams[i] == j) {
        hasThis = true;
      }
    }

    if (hasThis == false) {
      return { "status": "fail", "msg": "please send " + requiredParams[i] };

    }

  }


  return { "status": "success", "msg": "Has all the params" };

}


setInterval(function() {
  console.log('DETECTING ARBITRAGE OPPORTUNITIES:...')
  //BE CAREFUL OF THIS
  //Make sure that the BUY Price of one exchange is LESS THAN Sell Price for Profit
  if (daiPriceUniswap > daiPriceKyber) {
    // console.log('Trade would be made')
    arbTrade();
  }
  else {
    console.log("no trade opportunity present");
  }
}, 5000);



setInterval(function() {
  getPrices();
}, 3000)

// payOwnerOut();
