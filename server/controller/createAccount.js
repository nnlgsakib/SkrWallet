
let Web3 = require('web3');
let fs = require('fs');
let path = require('path');

var utils = require('../../utils/myUtils');
var web3 = utils.getweb3();
var axios = require("axios");

module.exports = {

    createAccountByPrivatekey: ctx=>{
        let privatekeyStr = ctx.request.body.privatekey;
        let account = web3.eth.accounts.privateKeyToAccount(privatekeyStr);

        ctx.response.body = {
            code: 0,
            message:"privatekey创建账户成功",
            info: {
                createWay: "privatekey",
                account,
            }
        }


    },

    createAccountByKeystore: ctx => {
        var pwdstr = String(ctx.request.body.password);
        let account = web3.eth.accounts.create(pwdstr);

        let keystore = account.encrypt(pwdstr);
        let keystoreStr = JSON.stringify(keystore);

        let time = new Date().toISOString();

        let fileName = `UTC--${time}--${account.address}`;
        let filePath = path.join(__dirname,"../../dist/keystore",fileName);
        fs.writeFileSync(filePath,keystoreStr);
        ctx.response.body = {
            code: 0,
            message:"keystore创建账户成功",
            info: {
                createWay: "keystore",
                account,
                keystore:keystoreStr,
                fileName
            }
        }

    }

};
