<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
    <div class="container">

        <h1>{{createtitle}}</h1>

        <v-layout align-start justify-space-around class="create_wrapper">
            <div @click="kscreate()" v-if="kscard" class="kscard">
                <img src="../assets/kspng.png" alt="">
                <h2>By Keystore</h2>
            </div>

            <div @click="pkcreate()" v-if="pkcard" class="pkcard">
                <img src="../assets/pkpng.png" alt="">
                <h2>By Privatekey</h2>
            </div>
        </v-layout>

        <!--keystore ui part-->

        <div class="kslayout" v-if="kslayout">
            <v-layout align-start justify-space-between>

                <div class="ksWrap">
                <v-text-field
                        outline
                        single-line
                        clearable
                        :append-icon="showpwd ? 'visibility' : 'visibility_off'"
                        :type="showpwd ? 'text' : 'password'"
                        label="input password"
                        class="input-password"
                        v-model="password"
                        @click:append="showpwd = !showpwd"
                ></v-text-field>
                <v-progress-linear ref="cksProgress" class="cksProgress" :indeterminate="progressRunning" :color="cksProgressColor" background-color="indigo"></v-progress-linear>
                </div>


                <v-tooltip bottom dark color="indigo">
                    <template v-slot:activator="{ on }">
                        <v-btn dark fab color="indigo"
                               @click="createAccountByKeystore"
                               v-on="on"
                        >
                            <i class="mdi mdi-account-arrow-right ibig"></i>
                        </v-btn>
                    </template>
                    <span>Create New Wallet!</span>
                </v-tooltip>

            </v-layout>

            <a class="downlink animated fadeInUpBig"
               ref="downlink"
               v-show="downable"
               href=""
               target="_blank"
               download="keystore">
            </a>

            <div class="backbtn">
                <v-btn outline fab color="indigo" @click="back">
                    <v-icon>arrow_back</v-icon>
                </v-btn>
            </div>
        </div>

        <!--privatekey ui part-->
        <div class="pklayout" v-if="pklayout">

            <v-tooltip top>
                <template v-slot:activator="{ on }">
                    <img v-on="on" src="../assets/dice.png" alt="" ref="ani" class="dice" @click="randompk">
                </template>
                <span>Click to throw the Dice!</span>
            </v-tooltip>

            <v-layout align-start justify-space-between>
                <div class="pkWrap">
                <v-text-field
                        outline
                        single-line
                        :append-icon="showpwd ? 'visibility' : 'visibility_off'"
                        :type="showpwd ? 'text' : 'password'"
                        label="Throw the Dice for a random Privatekey"
                        readonly
                        v-model="privatekey"
                        @click:append="showpwd = !showpwd"
                >
                </v-text-field>
                    <v-progress-linear ref="cpkProgress" class="cpkProgress" :indeterminate="progressRunning" :color="cpkProgressColor" background-color="indigo"></v-progress-linear>
                </div>


                <v-tooltip bottom dark color="indigo">
                    <template v-slot:activator="{ on }">
                        <v-btn dark fab color="indigo"
                               @click="createAccountByPrivatekey"
                               v-on="on"
                        >
                            <i class="mdi mdi-account-arrow-right ibig"></i>
                        </v-btn>
                    </template>
                    <span>Create New Wallet!</span>
                </v-tooltip>


            </v-layout>



            <div class="backbtn">
                <v-btn outline fab color="indigo" @click="back">
                    <v-icon>arrow_back</v-icon>
                </v-btn>
            </div>
        </div>

    </div>
</template>

<script>

    import "animate.css/animate.css";

    import iziToast from "izitoast/dist/js/iziToast.min.js";
    import "izitoast/dist/css/iziToast.min.css";

    //local
    //let localurl = "http://127.0.0.1:4000";
    //cloud server
    let cloudurl = "http://154.8.215.126:4000";

    export default {
        name: "CreateAccount",
        data() {
            return {
                showpwd: false,
                password: '',
                privatekey: '',
                downUrl: "",
                downable: false,
                pkcard: true,
                kscard: true,
                pklayout: false,
                kslayout: false,
                progressRunning: false,
                cpkProgressColor: "rgb(0,255,255)",
                cksProgressColor: "rgb(0,255,184)",
                createtitle: "Create A New Wallet"
            }
        },
        computed: {
            progress () {
                return Math.min(100, this.value.length * 10)
            },
            color () {
                return ['error', 'warning', 'success'][Math.floor(this.progress / 40)]
            }
        },
        methods: {

            pkcreate() {
                console.log('改pk');
                this.createtitle = "Create Wallet By Privatekey"
                this.pkcard = false;
                this.kscard = false;
                this.pklayout = true;
            },
            kscreate() {
                console.log('改ks');
                this.createtitle = "Create Wallet By Keystore"
                this.kscard = false;
                this.pkcard = false;
                this.kslayout = true;
            },
            back() {
                console.log('back');
                this.createtitle = "Create A New Wallet";
                this.password = "";
                this.privatekey = "";
                this.pkcard = true;
                this.kscard = true;
                this.pklayout = false;
                this.kslayout = false;
                this.downable = false;
                this.progressRunning = false;
            },

            randompk() {
                this.$refs.ani.classList.add('animated', 'wobble')
                setTimeout(() => {
                    this.$refs.ani.classList.remove('animated', 'wobble')
                }, 2000);


                var utils = require('../../utils/myUtils');
                var web3 = utils.getweb3();
                let rand_privatekey = web3.utils.randomHex(32);

                this.cpkProgressColor = "rgb(0,255,255)"
                this.progressRunning = true;

                setTimeout(()=>{
                    this.progressRunning = false;
                    this.privatekey = rand_privatekey;
                    //Toast 妥善保存好私钥！
                    iziToast.warning({
                        title: 'Caution',
                        message: '请妥善保存好私钥 !',
                        displayMode: 2,
                        timeout: 1500,
                        position: "bottomCenter"
                    });
                },1000)



            },

            async createAccountByKeystore() {
                let _vuethis = this;
                if (this.password === "") {
                    iziToast.info({
                        message: "请输入密码 !",
                        timeout: 2000,
                        displayMode: 1,
                        color: "red",
                        position: "bottomCenter"
                    })
                    return;
                }

                this.progressRunning = true;
                let url = `${cloudurl}/users/createaccountbyks`;
                try {
                    let result = await axios({
                        method: "POST",
                        url: url,
                        data: {
                            password: this.password,
                        }
                    });

                    setTimeout(()=>{
                        ksCreateSuccess();
                    },2000)


                    function ksCreateSuccess() {
                        _vuethis.progressRunning = false;
                        iziToast.success({
                            title: "OK",
                            message: "钱包创建成功 !",
                            timeout: 2000,
                            position: "bottomCenter"
                        });
                        let ksfile = result.data.info.fileName
                        _vuethis.$refs.downlink.href = `keystore/${ksfile}`;
                        _vuethis.downable = true;
                        let downLink = _vuethis.$refs.downlink;
                        iziToast.warning({
                            // message: "下载并保存好keystore ! ",
                            timeout: 10000,
                            position: "center",
                            image: "https://i.loli.net/2019/03/13/5c87e0e3dc02c.png",
                            imageWidth: 55,
                            displayMode: 2,
                            resetOnHover: true,
                            progressBarColor: 'rgb(0, 255, 184)',
                            transitionIn: 'flipInX',
                            transitionOut: 'flipOutX',
                            color: 'grey',
                            theme: "dark",
                            buttons: [
                                ['<button><b>下载KeyStore</b></button>', (instance,toast) => {
                                    //downLink.click();
                                    instance.hide({},toast);
                                }]
                            ],
                            onClosing: () => {
                                downLink.click();
                            }
                        })

                        let accAddr = result.data.info.account.address;
                        _vuethis.$store.commit('setAccountAddr', accAddr);

                        let accPrivatekey = result.data.info.account.privateKey;
                        _vuethis.$store.state.globalPrivatekey = accPrivatekey;
                        _vuethis.$store.state.accountBalance = "0.00";

                    }

                } catch (err) {
                    //Toast创建失败
                    console.log(err);
                    iziToast.info({
                        title:"Error",
                        message: "钱包创建失败 !",
                        color: "red",
                        timeout: 2000
                    })
                }
            },

            async createAccountByPrivatekey() {

                if(this.privatekey==""){
                    iziToast.warning({
                        message: "请先生成私钥 !",
                        timeout: 1500
                    })
                    return;
                }

                this.cpkProgressColor = "rgb(0,255,184)"
                this.progressRunning = true;
                let url = `${cloudurl}/users/createaccountbypk`;
                try {
                    let result = await axios({
                        method: "POST",
                        url: url,
                        data: {
                            privatekey: this.privatekey,
                        }
                    });
                    console.log('createAccountSuccess', result.data.info);
                    setTimeout(()=>{
                        this.progressRunning = false;
                        iziToast.success({
                            title: "OK",
                            message: "钱包创建成功 !",
                            timeout: 1250,
                            position: "bottomCenter"
                        });

                    },2000)

                    let accAddr = result.data.info.account.address;
                    this.$store.commit('setAccountAddr', accAddr);

                    let accPrivatekey = result.data.info.account.privateKey;
                    this.$store.state.globalPrivatekey = accPrivatekey;
                    this.$store.state.accountBalance = "0.00";
                    setTimeout(()=>{
                        iziToast.show({
                            message: "稍后自动跳转至首页,请尽快保存私钥 !",
                            timeout: 20000,
                            position: "bottomCenter",
                            buttons: [
                                ['<button><b>点击跳转</b></button>', function (instance, toast) {
                                    instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
                                }]
                            ],
                            displayMode:2,
                            theme: "dark",
                            onClosing: ()=>{
                                console.log('this指向',this);
                                let headerTabs = this.$store.state.headerTabs;
                                console.log(headerTabs);
                                headerTabs[0].click();
                            }
                        })
                    },3000)

                } catch (err) {
                    this.progressRunning = false;
                    iziToast.info({
                        title:"Error",
                        message: "钱包创建失败 !",
                        color: "red",
                        timeout: 2000
                    })
                }
            }
        }
    }
</script>

<style scoped lang="scss">





    .container {
        min-width: 600px;
    }

    .dice {
        width: 5rem;
        height: 5rem;
    }



    .kscard, .pkcard {
        flex: .4;
        max-width: 380px;
        max-height: 445px;
        padding: 2rem 1.5rem;
        background: white;
        color: #6EC3A8;
        box-shadow: 2px 4px 8px 0 rgba(46, 61, 73, .2);
        transform: translate(0, 0);
        transition: background .3s linear,
        box-shadow .15s linear,
        transform .3s linear;
        cursor: pointer;

        img {
            width: 100%;
        }
        h2 {
            margin-top: 1rem;
        }
        &:hover {
            background: #6EC3A8;
            box-shadow: 10px 10px 14px 0 rgba(46, 61, 73, .15);
            transform: translate(-1px, -1px);
        }
        &:hover h2 {
            color: white;
        }
    }

    .downlink {
        text-decoration: none;
        button {
            height: 3rem;
        }
    }

    .backbtn {
        position: absolute;
        left: 10%;
        margin-top: 2rem;
    }

    .v-text-field {
        font-size: 1.4rem !important;
    }
    .pkWrap {
        position: relative;
        width: 90%;
        .cpkProgress {
            position: absolute;
            width: 99.5%;
            height: 4px!important;
            left: 2px;
            bottom: 1.1rem;
            border-radius: 2px;
        }
    }
    .ksWrap {
        position: relative;
        width: 90%;
        .cksProgress {
            position: absolute;
            width: 99.5%;
            height: 4px!important;
            left: 2px;
            bottom: 1.1rem;
            border-radius: 2px;
        }
    }



    .ibig {
        font-size: 2.5rem;
    }



    .layout {
        margin: 2rem auto;
        width: 80%;
    }

    .v-btn {
        margin-top: -1px;
    }

    input {
        border-bottom: none !important;
    }
</style>