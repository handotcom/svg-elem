import TWEEN from './Tween'

class ClockPoll {

	private isRunning: boolean = false

	constructor(){
		this.animFrameUpdate = this.animFrameUpdate.bind(this)
	}

	public isActive(): boolean {
		return this.isRunning
	}

	public stop(): void {
		this.isRunning = false
	}

	public start(): void {
		this.isRunning = true
		requestAnimationFrame(this.animFrameUpdate)
	}
	
	private animFrameUpdate(timeStamp: DOMHighResTimeStamp): void {
		// https://developer.mozilla.org/en-US/docs/Web/API/DOMHighResTimeStamp
		if (this.isRunning) {
			TWEEN.update(timeStamp)
			requestAnimationFrame(this.animFrameUpdate)
		}
	}
}

export default new ClockPoll()
