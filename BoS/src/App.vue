<template>
    <div id="app">
        <top-bar />
        <network id="1" />
        <Home msg="Hello" />
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import Home from './components/Home.vue';
    import Network from './components/Network.vue';
    import TopBar from './components/TopBar.vue'

    @Component({
        components: {
            Home,
            TopBar,
            Network
        }        
    })
    export default class App extends Vue { }
</script>

<style>
</style>
