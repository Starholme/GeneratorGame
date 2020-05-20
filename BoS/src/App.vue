<template>
    <div id="app">
        <Home :msg="msg" />
        <p>{{msg}} what</p>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import Home from './components/Home.vue';

    data: {  }

    @Component({
        components: {
            Home
        }, data: function () { return { msg: "testing2" }; }
        
    })
    export default class App extends Vue { }
</script>

<style>
</style>
