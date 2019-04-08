let Web3 = require('web3');
let fs = require('fs');
let path = require('path');
let Tx = require("ethereumjs-tx");

var utils = require('../../utils/myUtils');

var web3 = utils.getweb3();
const ethABI = require('ethereumjs-abi');

module.exports = {

    sendTransaction: async ctx=>{

        var {privatekey,txAmount,txToAddr,txFromAddr,txGasPrice} = ctx.request.body;

        var nonce = await web3.eth.getTransactionCount(txFromAddr);
        console.log('noncenew',nonce);
        var amount = web3.utils.toWei(txAmount,'ether');


        var gasPrice = web3.utils.toHex(txGasPrice*(10**9))
        var gasLimit = await web3.eth.estimateGas({
            to: txToAddr,
            data: "0x00"
        });

        var rawTx = {
            from: txFromAddr,
            nonce: web3.utils.toHex(nonce),
            gasPrice,
            gasLimit,
            to: txToAddr,
            value: web3.utils.toHex(amount),
            data: "0x00"
        }
        var tx = new Tx(rawTx);
        var bufferpk = new Buffer.from(privatekey.substring(2),'hex');
        tx.sign(bufferpk);
        var serializedTx = tx.serialize();
        try {
            let txRes = await web3.eth.sendSignedTransaction('0x'+serializedTx.toString('hex'));
            ctx.body = {
                code: 0,
                message: "转账成功！",
                info: txRes
            }
        } catch (err) {
            ctx.body = {
                code: 200,
                message: "转账失败！",
                info: err
            }
        }
    },

    sendERC20Transaction: async ctx=>{

        var {privatekey,txAmount,txToAddr,txFromAddr,txGasPrice,contractABI,contractAddr} = ctx.request.body;
        let contractObj = new web3.eth.Contract(JSON.parse(contractABI),contractAddr);
        var paramsData = ethABI.rawEncode(["address","uint256"], [txToAddr,txAmount]).toString('hex');
        var gasLimit = await web3.eth.estimateGas({
            from: txFromAddr,
            to: contractAddr,
            data: "0xa9059cbb"+paramsData,
        });
        var gasPrice = web3.utils.toHex(txGasPrice*(10**9))

        var count = Number(await web3.eth.getTransactionCount(txFromAddr));
        var rawTx = {
            from: txFromAddr,
            nonce: count,
            gasPrice: gasPrice,
            gasLimit: gasLimit,
            to: contractAddr,
            data: "0xa9059cbb"+paramsData,
        };
        var bufferPrivatekey = new Buffer.from(privatekey.substring(2),'hex');
        var tx = new Tx(rawTx);
        tx.sign(bufferPrivatekey);
        var serializedTx = tx.serialize();
        try {
            let txRes = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
            ctx.body = {
                code: 0,
                message: "转账成功！",
                info: txRes
            };
        } catch (err) {
            ctx.body = {
                code: 200,
                message: "转账失败！",
                info: err
            }
        }
    },

};