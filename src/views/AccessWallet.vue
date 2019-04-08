<template>
    <div class="container">

        <h1>{{accesstitle}}</h1>

        <v-layout align-start justify-space-around class="create_wrapper">
            <div @click="ksload()" v-if="kscard" class="kscard">
                <img src="../assets/kspng.png" alt="">
                <h2>Via Keystore</h2>
            </div>

            <div @click="pkload()" v-if="pkcard" class="pkcard">
                <img src="../assets/pkpng.png" alt="">
                <h2>Via Privatekey</h2>
            </div>
        </v-layout>

        <div class="unlock-keystore" v-if="kslayout">
            <v-upload></v-upload>
            <br>
            <div class="inputWrap">
                <v-text-field
                        class="input-pwd"
                        ref="inputPwd"
                        solo
                        v-model="password"
                        prepend-inner-icon="vpn_key"
                        :append-icon="showpwd ? 'visibility' : 'visibility_off'"
                        :type="showpwd ? 'text' : 'password'"
                        name="input-10-1"
                        label="Input password to load keystore"
                        @click:append="showpwd = !showpwd"
                ></v-text-field>
                <v-progress-linear ref="aksProgress" class="aksProgress" :indeterminate="progressRunning" color="white"
                                   background-color="#1976d2"></v-progress-linear>
            </div>

            <v-btn @click="unlockWithKs" color="indigo" class="white--text upbtn">
                Next
                <v-icon right dark>cloud_upload</v-icon>
            </v-btn>
            <div class="backbtn">
                <v-btn outline fab color="indigo" @click="back">
                    <v-icon>arrow_back</v-icon>
                </v-btn>
            </div>
        </div>

        <div class="unlock-privatekey" v-if="pklayout">

            <div class="inputWrap">
            <v-text-field
                    box
                    single-line
                    prepend-inner-icon="vpn_key"
                    :append-icon="showpwd ? 'visibility' : 'visibility_off'"
                    :type="showpwd ? 'text' : 'password'"
                    @click:append="showpwd = !showpwd"
                    color="pink"
                    label="Input privatekey to access wallet"
                    @input="changePrivatekey($event)"
            ></v-text-field>
            <v-progress-linear ref="apkProgress" class="apkProgress" :indeterminate="progressRunning" color="white"
                               background-color="pink"></v-progress-linear>
            </div>

            <v-btn @click="unlockWithPk" color="pink" class="white--text upbtn">
                Next
                <v-icon right dark>cloud_upload</v-icon>
            </v-btn>
            <div class="backbtn">
                <v-btn outline fab color="indigo" @click="back">
                    <v-icon>arrow_back</v-icon>
                </v-btn>
            </div>
        </div>
    </div>
</template>

<script>

    import iziToast from "izitoast/dist/js/iziToast.min.js";
    import "izitoast/dist/css/iziToast.min.css";

    import uploadComponent from "@/components/v-upload";

    //local
    //let localurl = "http://127.0.0.1:4000";
    //cloud server
    let cloudurl = "http://154.8.215.126:4000";

    export default {
        name: "AccessWallet",
        components: {
            "v-upload": uploadComponent
        },
        data() {
            return {
                accesstitle: "Load Your Own Wallet",
                unlockMethod: "keystore",
                privatekey: "",
                showpwd: false,
                password: "",
                kscard: true,
                pkcard: true,
                pklayout: false,
                kslayout: false,
                progressRunning: false,
            }
        },
        methods: {
            look() {
                console.log(this.unlockMethod);
                console.log(this.privatekey);
            },

            ksload() {
                this.accesstitle = "Load Wallet via Keystore"
                this.pkcard = false;
                this.kscard = false;
                this.kslayout = true;
            },
            pkload() {
                this.accesstitle = "Load Wallet via Privatekey"
                this.pkcard = false;
                this.kscard = false;
                this.pklayout = true;
            },
            back() {
                console.log('back');
                this.password = "";
                this.privatekey = "";
                this.pkcard = true;
                this.kscard = true;
                this.pklayout = false;
                this.kslayout = false;
                this.progressRunning = false;
            },
            changePrivatekey(ev) {
                this.privatekey = ev
            },
            async unlockWithPk() {
                var utils = require('../../utils/myUtils');
                var web3 = utils.getweb3();
                if (this.privatekey=="") {
                    iziToast.warning({
                        message: "未填写私钥 !",
                        color: "red",
                        timeout: 1000
                    });
                    return;
                }
                if (!web3.utils.isHexStrict(this.privatekey) || this.privatekey.length != 66) {
                    iziToast.warning({
                        title: "Error",
                        message: "私钥错误 ! (别忘了以0x开头)",
                        color: "red",
                        timeout: 2000
                    });
                    return;
                }
                this.progressRunning = true;
                let url = `${cloudurl}/users/unlockwithprivatekey`;
                try {
                    let result = await axios({
                        method: "post",
                        url,
                        data: {
                            privatekey: this.privatekey
                        }
                    });

                    if (result.data.code == 0) {
                        setTimeout(()=>{
                            this.progressRunning = false;
                            iziToast.success({
                                title: "OK",
                                message: "钱包载入成功 !",
                                timeout: 1000,
                                position: "bottomCenter"
                            });
                        },1000)

                        let accAddr = result.data.info.account.address;
                        this.$store.commit('setAccountAddr', accAddr);
                        let accPrivatekey = result.data.info.account.privateKey;
                        this.$store.state.globalPrivatekey = accPrivatekey;

                        let accBalance = result.data.info.balance;
                        this.$store.commit('setAccountBalance', accBalance);
                        setTimeout(() => {
                            iziToast.show({
                                message: "即将自动跳转到首页 !",
                                timeout: 4000,
                                position: "bottomCenter",
                                buttons: [
                                    ['<button><b>点击跳转</b></button>', function (instance, toast) {
                                        instance.hide({transitionOut: 'fadeOut'}, toast, 'button');
                                    }]
                                ],
                                theme: "dark",
                                onClosing: () => {
                                    console.log('this指向', this);
                                    let headerTabs = this.$store.state.headerTabs;
                                    console.log(headerTabs);
                                    headerTabs[0].click();
                                }
                            })
                        }, 2000)

                    } else if (result.data.code == 300) {
                        this.progressRunning = false;
                        console.log('getBalance failed');
                    } else {
                        this.progressRunning = false;
                        console.log('load wallet failed');
                        iziToast.info({
                            title: "Error",
                            message: "钱包载入失败 !",
                            color: "red",
                            timeout: 2000
                        })
                    }
                } catch (err) {
                    this.progressRunning = false;
                    console.log('打印出错啦', err);
                    iziToast.info({
                        title: "Error",
                        message: "钱包载入失败 !",
                        color: "red",
                        timeout: 2000
                    })
                }
            },


            unlockWithKs() {
                var _vuethis = this;
                console.log(this.$refs);
                let upFile = this.$store.state.globalKeystore;
                console.log(upFile.name);
                let formData = new FormData();
                formData.append("file", upFile);

                if (upFile.name) {
                    let ksPwd = this.password;

                    if (ksPwd === "") {
                        //Toast提示输入密码
                        console.log('请输入ks的密码');
                        iziToast.warning({
                            message: "请输入keystore密码 !",
                            timeout: 2000
                        });
                        return;
                    }

                    var reader = new FileReader();
                    reader.readAsText(upFile);
                    reader.onload = async function () {

                        try {
                            var parseContent = JSON.parse(this.result);
                        } catch (err) {
                            iziToast.info({
                                title: "Error",
                                message: "keystore文件读取失败 !",
                                color: "red",
                                timeout: 2000
                            })
                            return;
                        }

                        _vuethis.progressRunning = true;
                        let url = `${cloudurl}/users/unlockwithkeystore`;
                        try {
                            let result = await axios({
                                method: "post",
                                url,
                                data: {
                                    password: ksPwd,
                                    keystore: parseContent
                                }
                            });
                            if (result.data.code == 0) {
                                //Toast解锁成功
                                setTimeout(()=>{
                                    iziToast.success({
                                        title: "OK",
                                        message: "钱包载入成功 !",
                                        timeout: 1000,
                                        position: "bottomCenter"
                                    });
                                    _vuethis.progressRunning = false;
                                },1000)

                                let accAddr = result.data.info.account.address;
                                _vuethis.$store.commit('setAccountAddr', accAddr);
                                let accPrivatekey = result.data.info.account.privateKey;
                                _vuethis.$store.state.globalPrivatekey = accPrivatekey;
                                console.log('全局私钥', _vuethis.$store.state.globalPrivatekey);

                                let accBalance = result.data.info.balance;
                                _vuethis.$store.commit('setAccountBalance', accBalance);
                                setTimeout(() => {
                                    iziToast.show({
                                        message: "即将自动跳转到首页 !",
                                        timeout: 4000,
                                        position: "bottomCenter",
                                        buttons: [
                                            ['<button><b>点击跳转</b></button>', function (instance, toast) {
                                                instance.hide({transitionOut: 'fadeOut'}, toast, 'button');
                                            }]
                                        ],
                                        theme: "dark",
                                        onClosing: () => {
                                            let headerTabs = _vuethis.$store.state.headerTabs;
                                            headerTabs[0].click();
                                        }
                                    })
                                }, 2000)
                            } else if (result.data.code == 300) {
                                _vuethis.progressRunning = false;
                            } else {
                                _vuethis.progressRunning = false;
                                iziToast.info({
                                    title: "Error",
                                    message: "钱包载入失败 !",
                                    color: "red",
                                    timeout: 2000
                                })
                            }
                        } catch (err) {
                            _vuethis.progressRunning = false;
                            iziToast.info({
                                title: "Error",
                                message: "钱包载入失败 !",
                                color: "red",
                                timeout: 2000
                            })
                        }

                    };
                } else {
                    _vuethis.progressRunning = false;
                    iziToast.warning({
                        message: "未选择keystore文件 !",
                        timeout: 2000
                    });
                }

            },
            async uploadFile(ev) {
                let fileObj = ev.target.files[0];

                let fileTip = this.$refs.uploadTip;
                fileTip.value = fileObj.name;

                let formData = new FormData();
                formData.append("file", fileObj);

                let url =  `${cloudurl}/users/upload`;
            },
        }
    }
</script>

<style scoped lang="scss">

    .container {
        min-width: 600px;
    }

    .layout {
        margin: 2rem auto;
        width: 80%;
    }

    .kscard, .pkcard {
        flex: .4;
        max-width: 380px;
        max-height: 445px;
        padding: 2rem 1.5rem;
        color: white;
        background: #6EC3A8;
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
            background: white;
            box-shadow: 10px 10px 14px 0 rgba(46, 61, 73, .15);
            transform: translate(-1px, -1px);
        }
        &:hover h2 {
            color: #6EC3A8;
        }
    }

    .unlock-keystore {
        width: 80%;
        margin: 0 auto;
        .inputWrap {
            position: relative;
            .aksProgress {
                position: absolute;
                height: 3px !important;
                bottom: 1rem;
            }
        }
    }

    .unlock-privatekey {
        width: 80%;
        margin: 0 auto;
        .inputWrap {
            position: relative;
            .apkProgress {
                position: absolute;
                height: 3px !important;
                bottom: 0.95rem;
            }
        }
    }

    .input-pwd {
        margin-top: 5rem;
    }

    .upbtn {
        margin-top: 2rem;
        height: 3rem;
    }

    .backbtn {
        position: absolute;
        left: 10%;
        margin-top: 2rem;
    }

</style>