<template>
    <div class="upload-field">
        <input type="file" class="upload-input" ref="uploadInput" @change="uploadFile">
        <v-btn class="uploadBtn" color="#6EC3A8">
            <span>File&nbsp;&nbsp;</span>
            <i class="material-icons upico">backup</i>
        </v-btn>
        <input readonly class="upload-filetip" type="text" ref="uploadTip" placeholder="click or drag file here">
    </div>
</template>

<script>
    export default {
        name: "v-upload",
        data(){
            return {
            }
        },
        methods:{
            uploadFile(){
                console.log(this.$refs);
                let upFileObj = this.$refs.uploadInput.files[0];

                this.$store.state.globalKeystore = upFileObj;

                let upFileTip = this.$refs.uploadTip;
                upFileTip.value = upFileObj.name;
            }
        }
    }
</script>

<style scoped lang="scss">

    .upload-field{
        position: relative;
        cursor: pointer;
    }
    .upload-input {
        outline: none;
        opacity: 0;
        width: 24rem;
        height: 3rem;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 2;
        cursor: pointer;
        &:hover ~.btn{
            background: lightgrey;
        }
    }
    .uploadBtn {
        position: absolute;
        top: 0;
        left: 0;
        margin: 0;
        height: 3rem;
        width: 8rem;
        cursor: pointer;
        color: white;
    }
    .upload-filetip {
        position: absolute;
        left: 9rem;
        height: 3rem;
        width: 100%;
        line-height: 3rem;
        font-size: 1.1rem;
        outline: none;
        cursor: pointer;
        color: #3f51b5;
        font-weight: 400;
        &::placeholder {
            font-size: 1.4rem;
            font-weight: bold
        }
    }

</style>