//import Vue from 'vue';
import { Config } from './Config'
import Vue  from 'vue';
import { Network } from './Network';


export class Engine {

	private tickSpeed = 0;
	private nextId = 0;

	public state = Vue.observable({
		tick: 0,
		tickSpeedName:'Normal'
	});

	private network = new Network(this.getNextId(), 'first', Config.Resources.Oil);

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
		this.state.tick++;

		this.network.Update();
		
		//Schedule next tick
		if (this.tickSpeed > Config.TickSpeeds.Stopped) {
			setTimeout(() => this.gameLoop(), this.tickSpeed);
		}
		if (window.DEBUG) { console.log("tick end: " + this.state.tick + " " + (Date.now() - tickTime) + "ms"); }
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

	public getNextId(): number {
		return this.nextId++;
	}

	public getNetwork(): Network {
		return this.network;
    }
}