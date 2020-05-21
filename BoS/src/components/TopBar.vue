<template>
    <div>
        <div>
            <span>{{ tick }} {{gameTime}}</span>
            <span id="gamestate">Paused</span>
            <button id="toggleGamestate">toggle</button>
        </div>
        <div>Money: $<span id="money"></span></div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import { Component } from 'vue-property-decorator';

    @Component({
        name: 'top-bar',
        components: {

        },
        data: function () {
            return {
                tick: window.Engine.state.tick
            };
        },

        computed: {
            gameTime: function (): string {
                var hour = window.Engine.state.tick % 24;
                var day = ((window.Engine.state.tick - hour) / 24) % 365;
                var year = ((window.Engine.state.tick - hour - (day * 24)) / 365);

                return "Hour:" + hour + " Day:" + day + " Year:" + year;
            }
        }
    })
    export default class TopBar extends Vue {
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
