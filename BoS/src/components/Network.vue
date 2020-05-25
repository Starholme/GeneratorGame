<template>
    <div>
        <p>Network: {{description}}, resource, current, max</p>

    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import { Network } from '../engine/Network';

    //let network: Network;

    export default Vue.extend({
        name: 'network',
        props: ['id'],
        data: function () {
            return { network: window.Engine.getNetwork() };
        },
        computed: {
            description: function () {
                console.log('get desc');
                return this.network.GetDescription();
            }
        },
        methods: {},
        beforeCreate: function () {
            console.log('Network before create');
            //network = window.Engine.getNetwork();
        },
        destroyed: function () {
            console.log('Network destroy');
        }
    });
</script>

<style scoped>
</style>