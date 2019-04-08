<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
    <div class="container">

        <v-card class="txcard">

            <v-text-field
                    class="tokenField"
                    label="Token"
                    single-line
                    solo
                    light
                    readonly
                    :value="$store.state.tokenType"
                    background-color = "#E1F9EC"
            ></v-text-field>

            <v-layout justify-space-between align-center class="main">
                <v-text-field
                        class="amountField"
                        label="转账金额"
                        :suffix= "$store.state.tokenType=='ETH'?'ether':$store.state.tokenType.toLowerCase()"
                        :rules="[rules.type]"
                        @input="changeAmount($event)"
                ></v-text-field>

                <v-text-field
                        class="gaspriceField"
                        label="GasPrice"
                        suffix="Gwei"
                        v-model="txGasPrice"
                        :rules="[rules.type,rules.counter]"
                ></v-text-field>
            </v-layout>

            <v-text-field
                    class="targetAddr"
                    label="目标地址"
                    prepend-inner-icon="near_me"
                    single-line
                    box
                    clearable
                    @input="changeAddr($event)"
            ></v-text-field>

            <v-btn
                    block
                    color="#55A47E"
                    class="white--text sendtx-btn"
                    @click="sendTx"
            >发送
                <v-icon right color="white">present_to_all</v-icon>
            </v-btn>


            <v-progress-linear class="txProgress" :indeterminate="txSending" color="rgb(0,255,184)" background-color="#E1F9EC"></v-progress-linear>
        </v-card>


        <div class="txtip-card" v-show="txHash!=''">
            <v-tooltip bottom dark color="rgb(0, 255, 184)" content-class="black--text"
            >
                <template v-slot:activator="{ on }">
                    <a target="_blank"
                       :href="`https://rinkeby.etherscan.io/tx/${txHash}`"
                       v-on="on"
                       ref="txlink"
                    >{{txHash}}</a>
                </template>
                <span>查看交易详情</span>
            </v-tooltip>
        </div>

    </div>
</template>

<script>

    import iziToast from "izitoast/dist/js/iziToast.min.js";
    import "izitoast/dist/css/iziToast.min.css";

    //local
    let localurl = "http://127.0.0.1:4000";
    //cloud server
    let cloudurl = "http://154.8.215.126:4000";

    export default {
        name: "SendTx",
        data() {
            return {
                // tokenType: "ETH",
                txAmount: "",
                txToAddr: "",
                txGasPrice: "20",
                txHash: "",
                txSending: false,
                rules: {
                    counter: val => val >= 20 || "GasPrice过小可能导致交易失败！",
                    type: val => {
                        const pattern = /^[1-9]+\.?[0-9]*$/
                        const pattern2 = /^(([1-9]+\.?)|([1-9]*0\.))[0-9]*$/
                        return pattern2.test(val) || "请输入有效数字！"
                    },
                    addrFormat: val => {
                        const addrPattern = /^0x[0-9a-fA-F]{40}$/;
                        return addrPattern.test(val) || "请输入正确格式的地址!"
                    }
                }
            }
        },
        computed: {
            tokenCoin: function(){
                if (this.$store.state.tokenType=="ETH") {
                    return "ether"
                }else {
                    return this.$store.state.tokenType.toLowerCase();
                }
            }
        },
        methods: {
            changeAmount(ev) {
                this.txAmount = ev;
            },
            changeAddr(ev) {
                this.txToAddr = ev;
            },
            changeGasPrice(ev) {
                this.txGasPrice = ev;
            },
            async sendTx() {
                if (this.txAmount && this.txToAddr && this.txGasPrice) {

                    if (Object.is(Number(this.txAmount), NaN)||Number(this.txAmount)<=0) {
                        iziToast.warning({
                            title:"Warning",
                            message: "转账金额输入有误 !",
                            color: "red",
                            timeout: 2000
                        });
                        return;
                    }

                    if (Object.is(Number(this.txGasPrice), NaN)) {
                        iziToast.warning({
                            title:"Warning",
                            message: "GasPrice输入有误 !",
                            color: "red",
                            timeout: 2000
                        });
                        return;
                    }

                    var utils = require('../../utils/myUtils');
                    var web3 = utils.getweb3();
                    if (!web3.utils.isAddress(this.txToAddr)) {
                        iziToast.warning({
                            title:"Error",
                            message: "地址格式错误 !",
                            color: "red",
                            timeout: 2000
                        });
                        return;
                    }

                    if (this.$store.state.accountAddr == "0x00" || this.$store.state.globalPrivatekey == "") {
                        //Toast 账户未登录
                        console.log('Please access your Wallet first!');
                        iziToast.warning({
                            message: "请先创建或加载钱包 !",
                            color: "red",
                            timeout: 2000
                        });
                        return;
                    }
                    let accountBalance = Number(this.$store.state.accountBalance);
                    let txAmount = Number(this.txAmount);
                    if (accountBalance <= txAmount) {
                        iziToast.error({
                            title:"Error",
                            message: "钱包余额不足 !",
                            timeout: 2000
                        });
                        return;
                    }

                    this.txSending = true;

                    let url = `${cloudurl}/users/sendtx`;
                    let ercurl = `${cloudurl}/users/senderc20tx`;
                    try {
                        if (this.$store.state.tokenType=="ETH") {
                            var result = await axios({
                                method: "post",
                                url,
                                data: {
                                    privatekey: this.$store.state.globalPrivatekey,
                                    txAmount: this.txAmount,
                                    txFromAddr: this.$store.state.accountAddr,
                                    txToAddr: this.txToAddr,
                                    txGasPrice: this.txGasPrice,
                                }
                            });
                        }else {
                            var result = await axios({
                                method: "post",
                                url:ercurl,
                                data: {
                                    privatekey: this.$store.state.globalPrivatekey,
                                    txAmount: this.txAmount,
                                    txFromAddr: this.$store.state.accountAddr,
                                    txToAddr: this.txToAddr,
                                    txGasPrice: this.txGasPrice,
                                    contractABI: this.$store.state.tokenContractABI,
                                    contractAddr: this.$store.state.tokenContractAddr
                                }
                            });
                        }

                        this.txHash = result.data.info.transactionHash;

                        this.txSending = false;

                        iziToast.success({
                            title: "SUCCESS",
                            message: "转账成功 !",
                            timeout: 2000,
                            position: "bottomCenter"
                        });
                        
                        let txlink = this.$refs.txlink;
                        txlink.style.visibility="visible";

                        iziToast.success({
                            // message: "下载并保存好keystore ! ",
                            message: "交易Hash",
                            messageColor: "rgb(0, 255, 184)",
                            timeout: 20000,
                            displayMode: 2,
                            resetOnHover: true,
                            target: ".txtip-card",
                            progressBarColor: 'rgb(0, 255, 184)',
                            transitionIn: 'flipInX',
                            transitionOut: 'flipOutX',
                            color: 'grey',
                            theme: "dark",
                            onClosing:()=>{
                                //隐藏掉a标签
                                txlink.style.visibility="hidden";
                            }
                        })

                        try {
                            if (this.$store.state.tokenType=="ETH"){
                                await this.$store.dispatch('refreshBalance');
                            }else{
                                await this.$store.dispatch('refreshERC20Balance');
                            }
                        } catch (err) {
                            console.log('get balance failed',err);
                        }


                    } catch (err) {
                        this.txSending = false;
                        iziToast.info({
                            title:"Error",
                            message: "很遗憾,交易失败 !",
                            color: "red",
                            timeout: 2000
                        });
                    }
                } else {
                    iziToast.warning({
                        message: "请正确输入转账金额、目标地址和GasPrice !",
                        timeout: 2000,
                        color: "red"
                    });
                }
            }
        }
    }
</script>

<style scoped lang="scss">

    .container {
        padding:0 2rem;
    }

    .tokenField {
        position: absolute;
        width: 100%;
        left: 0;
        top: 0;
        font-weight: bold;
        input {
            text-transform: uppercase!important;

        }
    }

    .main {
        margin-top: 4rem;
    }

    .gaspriceField, .amountField {
        flex: .49;
    }

    .v-card {
        margin: 4rem auto 2rem;
        padding: 2rem 2rem 3.5rem;
        width: 60%;
    }

    .txcard {
        min-width: 480px !important;
        max-width: 800px !important;
    }

    div.v-text-field__suffix {
        font-weight: bold !important;
    }

    .sendtx-btn {
        height: 3rem;
        font-size: 1.2rem;
    }

    .targetAddr {
        margin-top: 1rem;
    }

    .txtip-card {
        //background: limegreen;
        //padding: 1rem;
        position: relative;
        color: white;
        width: 90%;
        min-width: 600px;
        a{
            position: absolute;
            top: 22px;
            left: 115px;
            color: white;
            text-decoration: none;
        }
    }

    @keyframes running {
        from{
            left:0;
        }
        to {
            left: 90%;
        }
    }

    .wait {
        bottom: 0.25rem;
        font-size: 1.6rem;
        position: absolute;
        animation: running .8s linear infinite;
    }

    .txProgress {
        position: absolute;
        width: 100%;
        left: 0;
        bottom: -.97rem;
    }
    
</style>