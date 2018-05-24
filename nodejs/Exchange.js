const TokenMovedEvent = "0x3a5038142a51ba5b2a59f6f340b12ffe771948a37f32542e45f422d86f39e02b";
const ExternalTokens = "0xc196b5f1e711ed939e988007175a5c228f396865";

const Web3 = require('web3')
const net1 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
const net2 = new Web3(new Web3.providers.HttpProvider("http://localhost:8546"))

var tokenContract = net1.eth.contract([{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"receive","outputs":[],"type":"function"}]);

var externaltokensContract = net2.eth.contract([{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"newOwner","type":"address"}],"name":"receive","outputs":[],"type":"function"}]);

function logErrors(err) {
  if (err) {console.log(err)}
}

var pendingTrades = {};
var tradeStatus = {};

function propose1To2(err, data) {
  logErrors(err);
  console.log("Proposed exchange A -> B");
  var txHash = data.transactionHash;
  var sender = net1.eth.getTransaction(txHash).from;
  var token = "0x" + data.topics[1].substr(26);
  var otherToken = "0x" + data.topics[2].substr(26);
  var rcpt = "0x" + data.topics[3].substr(26);
  pendingTrades[sender + token + rcpt + otherToken] = txHash;
  tradeStatus[txHash] = "PENDING";
  setTimeout(function() {rollback(txHash, token, sender)}, 90000);
}

function rollback(txHash, token, sender) {
  if (tradeStatus[txHash] == "PENDING") {
    console.log("Trade Timeout");
    writeTo1(token, sender);
    delete tradeStatus[txHash];
  }
}

function propose2To1(err, data) {
  logErrors(err);
  console.log("Proposed exchange B -> A");
  var txHash = data.transactionHash;
  var sender = net2.eth.getTransaction(txHash).from;
  var token = "0x" + data.topics[1].substr(26);
  var otherToken = "0x" + data.topics[2].substr(26);
  var rcpt = "0x" + data.topics[3].substr(26);
  // Check if matching trade exists
  var txHash = pendingTrades[rcpt + otherToken + sender + token];
  if (!txHash || tradeStatus[txHash] != "PENDING") {
    console.log("No matching trade ");
    writeTo2(token, sender);
  } else {
    console.log("Trade successful!");
    delete tradeStatus[txHash];
    writeTo1(token, rcpt);
    writeTo2(otherToken, sender);
  }
}

function writeTo1(token, rcpt) {
  console.log("Importing A-Token " + token + " --> A/" + rcpt);
  tokenContract.at(token).receive(rcpt, {from:net1.eth.accounts[0], gas: 100000}, logErrors)
}

function writeTo2(token, rcpt) {
  console.log("Exporting A-Token " + token + " --> B/" + rcpt);
  externaltokensContract.at(ExternalTokens).receive(token, rcpt, {from:net2.eth.accounts[0], gas:100000}, logErrors)
}

var filter1 = net1.eth.filter({topics: [TokenMovedEvent]});
var filter2 = net2.eth.filter({topics: [TokenMovedEvent]});

filter1.watch(propose1To2);
filter2.watch(propose2To1);

console.log("Ready!")
