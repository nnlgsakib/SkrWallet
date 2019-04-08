let Web3 = require('web3');
let fs = require('fs');
let path = require('path');

var utils = require('../../utils/myUtils');
var web3 = utils.getweb3();

module.exports = {

    unlockWithPrivatekey: async ctx => {
        let privatekey = ctx.request.body.privatekey;

        try {
            let account = web3.eth.accounts.privateKeyToAccount(privatekey);

            try {
                let balance = await web3.eth.getBalance(account.address);
                ctx.body = {
                    code: 0,
                    message: '私钥解锁账户成功！',
                    info: {
                        account,
                        balance
                    }
                }
            } catch (err) {
                ctx.body = {
                    code: 300,
                    message: "获取余额失败！",
                    info: {
                        account,
                        err
                    }
                }
            }

        } catch (err) {
            ctx.body = {
                code: 100,
                message: '私钥解锁账户失败！',
                info: err
            }
        }


    },

    unlockWithKeystore: async ctx => {
        let {keystore,password} = ctx.request.body;
        try {
            let account = web3.eth.accounts.decrypt(keystore,password);
            try {
                let balance = await web3.eth.getBalance(account.address);
                ctx.body = {
                    code: 0,
                    message: 'keystore解锁账户成功！',
                    info: {
                        account,
                        balance
                    }
                }
            } catch (err) {
                ctx.body = {
                    code: 300,
                    message: "获取余额失败！",
                    info: {
                        account,
                        err
                    }
                }
            }
        } catch (err) {
            ctx.body = {
                code: 200,
                message: "keystore解锁failed",
                info: err
            }
        }

    },

    getBalance: async ctx => {
        let addr = ctx.query.address;
        let balance = await web3.eth.getBalance(addr);
        ctx.body = {
            code: 0,
            message: "getBalance success",
            info: {
                balance
            }
        }
    },

    getSymbol: async ctx => {
        let {contractAddr,contractABI} = ctx.query;
        let contractObj = new web3.eth.Contract(JSON.parse(contractABI),contractAddr);
        try {
            let symbol = await contractObj.methods.symbol.call();
            ctx.body = {
                code: 0,
                message: "Get Symbol success!",
                info: {
                    symbol
                }
            }
        } catch (err) {
            ctx.body = {
                code: 0,
                message: "Get Symbol failed!",
                info: err
            }
        }

    }
};