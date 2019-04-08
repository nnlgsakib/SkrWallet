module.exports = {
    getweb3(){
        var Web3 = require('web3');
        var web3 = new Web3("https://rinkeby.infura.io/v3/33a947db47094090b8331ea2f6f4bbd3");
        return web3;
    },
};