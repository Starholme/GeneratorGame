<template>
    <div>
        <div>
            <span>{{gameTime}}</span>
            <span> {{tickSpeedName}} </span>
            <button v-on:click="toggleSpeed">toggle</button>
        </div>
        <div>Money: $<span id="money"></span></div>
    </div>
</template>

<script lang="ts">

    export default {
        name : 'top-bar',

        data : function () {
            return {
                tick: window.Engine.state.tick
            };
        },

        computed : {
            gameTime: function (): string {
                var hour = window.Engine.state.tick % 24;
                var day = ((window.Engine.state.tick - hour) / 24) % 365;
                var year = ((window.Engine.state.tick - hour - (day * 24)) / 365);

                return "Hour:" + hour + " Day:" + day + " Year:" + year;
            },
            tickSpeedName: function (): string {
                const name = window.Engine.state.tickSpeedName;
                console.log('Check tick speed name:' + name);
                return name;
            }
        },
        methods: {
            toggleSpeed: function () {
                if (window.Engine.state.tickSpeedName === 'Normal')
                    window.Engine.setTickSpeed('Stopped');
                else
                    window.Engine.setTickSpeed('Normal');
                return false;
            }
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
