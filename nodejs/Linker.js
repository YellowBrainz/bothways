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

function receive2To1(err, data) {
console.log(net2.eth.getTransaction(data.transactionHash));
  logErrors(err);
  var token = "0x" + data.topics[1].substr(26);
  var rcpt = "0x" + data.topics[3].substr(26);
  console.log("Importing A-Token " + token + " --> A/" + rcpt);
  tokenContract.at(token).receive(rcpt, {from:net1.eth.accounts[0], gas: 100000}, logErrors)
}

function receive1To2(err, data) {
console.log(net1.eth.getTransaction(data.transactionHash).from);
  logErrors(err);
  var token = "0x" + data.topics[1].substr(26);
  var rcpt = "0x" + data.topics[3].substr(26);
  console.log("Exporting A-Token " + token + " --> B/" + rcpt);
  externaltokensContract.at(ExternalTokens).receive(token, rcpt, {from:net2.eth.accounts[0], gas:100000}, logErrors)
}

var filter1 = net1.eth.filter({topics: [TokenMovedEvent]});
var filter2 = net2.eth.filter({topics: [TokenMovedEvent]});

filter1.watch(receive1To2);
filter2.watch(receive2To1);

console.log("Ready!")
