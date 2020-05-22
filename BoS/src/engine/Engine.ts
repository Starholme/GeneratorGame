//import Vue from 'vue';
import { Config } from './Config'
import Vue  from 'vue';


export class Engine {

	private tick = 0;
	private tickSpeed = 0;

	public state = Vue.observable({
		tick: 0,
		tickSpeedName:'Normal'
	});

    constructor() {
        window.onload = () => {
            this.init();
        };
    }

	private init() {
		console.log('Engine init');
		this.tickSpeed = Config.TickSpeeds['Normal'];
		this.gameLoop();
    }

	private gameLoop() {
		const tickTime = Date.now();
		this.tick++;
		this.state.tick++;

		/*for (var i = 0; i < data.regions.length; i++) {
			processRegion(data.regions[i]);
		}
		*/
		//Schedule next tick
		if (this.tickSpeed > Config.TickSpeeds.Stopped) {
			setTimeout(() => this.gameLoop(), this.tickSpeed);
		}
		if (window.DEBUG) { console.log("tick end: " + this.tick + " " + (Date.now() - tickTime) + "ms"); }
	};

	public setTickSpeed(tickSpeedName: string): void {
		const newTickSpeed = Config.TickSpeeds[tickSpeedName];
		const wasStopped = this.tickSpeed === Config.TickSpeeds.Stopped;
		this.tickSpeed = newTickSpeed;
		this.state.tickSpeedName = tickSpeedName;
		if (wasStopped) {
			this.gameLoop();
        }
    }
}