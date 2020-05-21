//import Vue from 'vue';
import { Config, TickSpeed } from './Config'
import Vue  from 'vue';


export class Engine {

	private tick = 0;
	private tickSpeed = 0;

	public state = Vue.observable({
		tick : 0
	});

    constructor() {
        window.onload = () => {
            this.init();
        };
    }

	private init() {
		console.log('Engine init');
		this.tickSpeed = TickSpeed.normal;
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
		if (this.tickSpeed > TickSpeed.stopped) {
			setTimeout(() => this.gameLoop(), 1000);
		}
		if (window.DEBUG) { console.log("tick end: " + this.tick + " " + (Date.now() - tickTime) + "ms"); }
	};

	public setTickSpeed(tickSpeed: TickSpeed): void {
		const wasStopped = this.tickSpeed === TickSpeed.stopped;
		this.tickSpeed = tickSpeed;
		if (wasStopped) {
			this.gameLoop();
        }
    }
}