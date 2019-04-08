<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
    <div class="container">

        <v-card
                class="mx-auto addr-card"
                color="#26c6da"
                dark
                max-width="400"
        >
            <img src="../assets/pkpng.png"
                 alt="privatekey"
                 class="showpk-btn"
                 ref="showpkBtn"
                 v-if="$store.state.accountAddr!='0x00'"
                 @click="showPrivatekey"
            >
            <div class="addr-avatar">
                <img src="../assets/avatar.png" alt="">
            </div>
            <h2>Address</h2>

            <div class="addr-text">
                <p>
                    {{this.$store.state.accountAddr}}
                </p>
            </div>
        </v-card>

        <v-card
                class="mx-auto addr-card"
                color="indigo"
                dark
                max-width="400"
        >
            <img src="../assets/refresh.png"
                 alt="refresh"
                 class="refresh-btn"
                 ref="refreshBtn"
                 v-if="$store.state.accountAddr!='0x00'"
                 @click="refreshBalance"
            >

            <v-tooltip right dark color="primary" v-if="$store.state.accountAddr!='0x00'">
                <template v-slot:activator="{ on }">
                    <img src="../assets/loadtoken.png" alt="loadtoken"
                         class="loadtoken-btn" ref="loadtokenBtn"
                         v-on:click="loadToken"
                         v-on="on"
                    >
                </template>
                <span>{{loadTokenDesc}}</span>
            </v-tooltip>


            <transition name="fade">
                <div class="tokeninput-wrap" v-show="tokeninputShow">
                    <v-text-field
                            class="tokeninput"
                            solo
                            label="输入erc20合约地址"
                            ref="tokeninput"
                            v-model="tokenAddr"
                            append-icon="send"
                            @click:append="sendTokenAddr"
                    >
                    </v-text-field>
                    <v-progress-linear class="tokenProgress" :indeterminate="tokenLoading" color="indigo" background-color="white"></v-progress-linear>
                </div>
            </transition>




            <div class="addr-avatar">
                <img src="../assets/wallet.png" alt="">
                <p>{{this.$store.state.tokenType}}</p>
            </div>
            <h2>Balance</h2>

            <div class="addr-text">
                <span>
                    {{this.$store.state.accountBalance}}
                </span>
                <span class="unit">
                    {{this.$store.state.tokenType}}
                </span>
            </div>
        </v-card>

    </div>
</template>

<script>
    // @ is an alias to /src
    import HelloWorld from '@/components/HelloWorld.vue'
    import MyHeader from "@/components/header";
    import MyFooter from "@/components/footer";

    //加了全局webpack配置axios
    //import axios from "axios";

    import iziToast from "izitoast/dist/js/iziToast.min.js";
    import "izitoast/dist/css/iziToast.min.css";

    //本地测试
    let localurl = "http://127.0.0.1:4000";
    //云服务器
    let cloudurl = "http://154.8.215.126:4000";

    export default {
        name: 'Home',
        components: {
            HelloWorld,
            MyHeader,
            MyFooter
        },
        data() {
            return {
                addr: localStorage.getItem('accountAddr') ? localStorage.getItem('accountAddr') : "0x00",
                tokeninputShow: false,
                tokenAddr: "",
                tokenLoading: false,
            }
        },
        computed: {
            loadTokenDesc() {
                if (this.$store.state.tokenType == "ETH") {
                    return "加载ERC20Token"
                } else {
                    return "加载"
                }
            }
        },
        methods: {

            async etherscan() {
                await this.$store.dispatch('etherscan');
                console.log('dispatch action etherscan分发完毕');
            },

            showPrivatekey() {
                let privatekey = this.$store.state.globalPrivatekey;
                iziToast.warning({
                    timeout: 10000,
                    overlay: true,
                    displayMode: 'once',
                    title: 'PrivateKey',
                    //message: 'Examples',
                    position: 'center',
                    layout: 1,
                    drag: false,
                    inputs: [
                        [`<input type="text" value=${privatekey} readonly style="border:none!important;outline:none;">`, function (instance, toast, input, e) {
                        }, true],
                    ]
                });
            },

            async refreshBalance() {
                //将这个封装到了action中 不然报错
                /*let url = "http://127.0.0.1:4000/users/getbalance";
                let address = this.$store.state.accountAddr;
                let result = await axios({
                    method: "get",
                    url,
                    params:{
                        address,
                    }
                });
                console.log("serverBal",result);
                this.$store.commit("setAccountBalance",result.data.info.balance);*/

                console.log(this.$refs);
                this.$refs.refreshBtn.classList.remove('refresh-pause');
                this.$refs.refreshBtn.classList.add('refresh-play');
                //判token类型调不同的获取余额方法
                if (this.$store.state.tokenType == "ETH") {
                    await this.$store.dispatch('refreshBalance');
                } else {
                    await this.$store.dispatch('refreshERC20Balance');
                }
                console.log('dispatch action refreshBalance分发完毕');
                //await等到结果之后还会转2s再停
                setTimeout(() => {
                    this.$refs.refreshBtn.classList.add('refresh-pause');
                }, 2000);
            },

            async loadToken() {
                console.log('加载token');
                if (this.$store.state.tokenType == "ETH") {
                    this.tokeninputShow = !this.tokeninputShow;
                } else {
                    await this.$store.dispatch('refreshBalance');
                    this.$store.state.tokenType = "ETH";
                    this.$store.state.tokenABI = "";
                    this.$store.state.tokenContractAddr = "";
                }
            },

            async sendTokenAddr() {
                console.log('sendTokenAddr');
                var utils = require('../../utils/myUtils');
                var web3 = utils.getweb3();
                if (!web3.utils.isAddress(this.tokenAddr)) {
                    //Toast地址应为16进制数，以0x开头
                    console.log('地址格式错误');
                    iziToast.warning({
                        title: "Error",
                        message: "合约地址格式错误 !",
                        color: "red",
                        timeout: 2000
                    });
                    return;
                }
                //开始调前端的etherscan api
                this.tokenLoading = true;
                let contractAddr = this.tokenAddr;
                let abiRes = await axios({
                    method: "GET",
                    url: "//api-rinkeby.etherscan.io/api",
                    params: {
                        module: "contract",
                        action: "getabi",
                        //需要etherscan验证过的token
                        address: contractAddr,
                        apikey: "H4EVJDWHGN1QMWR7VTYVVXA1542VE4FJXE"
                    }
                });
                let contractABI = abiRes.data.result;
                //向后端发请求
                let url = `${cloudurl}/users/getsymbol`;

                let symbolRes = await axios({
                    method: "GET",
                    url,
                    params: {
                        contractABI,
                        contractAddr
                    }
                });

                console.log('拿到symbol了',symbolRes);
                this.tokenLoading = false;
                await this.$store.dispatch('refreshERC20Balance');
                this.$store.state.tokenType = String(symbolRes.data.info.symbol);

                this.$store.state.tokenContractABI = contractABI;
                this.$store.state.tokenContractAddr = contractAddr;

                setTimeout(()=>{
                    this.tokeninputShow = false;
                    this.tokenAddr="";
                },500);

            },

            tokenInput(ev) {

                console.log(ev);

            }

        }
    }
</script>

<style scoped lang="scss">

    .container {
        min-width: 600px;
    }

    .addr-card {
        margin-top: 3rem;
        padding: 2rem;
        &:nth-of-type(1) {
            padding-bottom: .25rem;
        }
        position: relative;
    }

    .addr-avatar {
        width: 5rem;
        height: 5rem;
        img {
            width: 100%;
            height: 100%;
        }
        p {
            text-transform: uppercase;
            font-weight: 700;
            color: lightskyblue;
            font-size: 1.5rem;
            font-family: Georgia, 'New Century Schoolbook', Times, TimesNR,
            'New York', serif;

        }
    }

    h2 {
        margin-top: -2rem;
    }

    .addr-text {
        margin-top: 1.2rem;
        span {
            font-size: 1.5rem;
            font-weight: bold;
        }
        p {
            font-size: 1.4rem;
            word-break: break-all;
        }
    }

    span.unit {
        font-weight: bold;
        font-size: 1.8rem;
        text-transform: lowercase;
        color: palevioletred;
        margin-top: .1rem;
    }

    .showpk-btn {
        position: absolute;
        width: 2rem;
        height: 2rem;
        right: 1rem;
        top: 1rem;
        cursor: pointer;
    }

    .refresh-btn {
        position: absolute;
        width: 2rem;
        height: 2rem;
        right: 1rem;
        top: 1rem;
        cursor: pointer;
    }

    .loadtoken-btn {
        position: absolute;
        width: 2rem;
        height: 2rem;
        right: 1rem;
        bottom: .5rem;
        cursor: pointer;
    }

    .refresh-play {
        animation: refresh-rotate 2s infinite ease-in-out;
    }

    .refresh-pause {
        animation-play-state: paused;
    }

    .refresh-run {
        animation-play-state: running;
    }

    //refresh动画
    @keyframes refresh-rotate {
        from {
            transform: rotate(0);
        }
        to {
            transform: rotate(360deg);
        }
    }

    .tokeninput-wrap {
        height: 4rem;
        position: absolute;
        right: 0;
        bottom: -4rem;
        width: 100%;
    }
    .tokenProgress {
        position: absolute;
        bottom: -.9rem;
        left: 0;
    }



    //过渡动画
    .fade-enter-active, .fade-leave-active {
        transition: opacity .75s;
    }

    .fade-enter, .fade-leave-to {
        opacity: 0;
    }

</style>
