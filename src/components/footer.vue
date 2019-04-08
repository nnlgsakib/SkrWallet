<template>
    <div id="myfooter">
        <v-progress-linear class="bottomProgress" :indeterminate="true" color="rgb(0, 255, 255)"></v-progress-linear>
        <div class="bottominfo">
            <a href="#top" class="footerlogo">SKR</a>
            <div class="work-info">
                <p>Made with ❤️by <a target="_blank" @click="goBlog" @mouseover="toastMe"><span>superman285</span></a></p>
                <p>Front-end framework: <span>Vue</span></p>
                <p>Back-end framework: <span>Koa2</span></p>
            </div>
        </div>

    </div>
</template>

<script>

    import iziToast from "izitoast/dist/js/iziToast.min.js";
    import "izitoast/dist/css/iziToast.min.css";

    export default {
        name: "myfooter",
        methods:{
            toastMe(){
                iziToast.show({
                    image: "https://i.loli.net/2019/03/12/5c87d728dc685.png",
                    displayMode: 1,
                    imageWidth: 55,
                    message: "Welcome to My GitHub !",
                    theme: "dark",
                    timeout: 3000,
                    position: "bottomCenter",
                    progressBarColor: 'rgb(0, 255, 184)',
                    transitionIn: 'flipInX',
                    transitionOut: 'flipOutX',
                    layout:1,
                    overlay: true,
                    buttons: [
                        ['<button style="border-radius:15px"><b>GO</b></button>',()=> {
                            this.goBlog();
                        }]
                    ],
                })
            },
            goBlog(){
                window.open("https://skr.dog");
            }
        }
    }
</script>

<style scoped lang="scss">

    .footerlogo {
        text-decoration: none;
        color: white;
        margin-left: 1rem;
        font-weight: 100;
        font-size: 3rem;
        font-family: Modak, sans-serif;
        text-shadow: 2px 2px 4px mediumspringgreen, -2px 2px 4px mediumspringgreen, 2px -2px 4px mediumspringgreen, -2px -2px 4px mediumspringgreen, 0 0.5rem 1.5rem mediumspringgreen
    }

    #myfooter {
        width: 100%;
        .divide {
            height: 4px;
            background: dodgerblue;
        }
        .bottomProgress {
            margin: 0;
            background: rgb(105, 255, 155);
            height: 6px!important;
        }
        .bottominfo {
            padding: 1rem 0 0.5rem;
            text-align: left;
            img {
                margin-left: 1rem;
                height: 3.2rem;
            }
        }
        .work-info {
            margin-left: 1rem;
            color: darkblue;
            a {
                text-decoration: none;
            }
            p{
                margin: .1rem;
            }
            span {
                font-weight: bold;
                color: #24cac1;
            }
        }

    }

</style>