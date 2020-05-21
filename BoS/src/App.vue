<template>
    <div id="app">
        <top-bar />
        <Home msg="Hello" />
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import Home from './components/Home.vue';
    import TopBar from './components/TopBar.vue'

    @Component({
        components: {
            Home,
            TopBar
        }        
    })
    export default class App extends Vue { }
</script>

<style>
</style>
