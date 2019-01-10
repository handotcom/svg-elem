import TWEEN from 'tween.js'

class ClockPoll {
	constructor(){
		this.isRunning = false
		this.animFrameUpdate = this.animFrameUpdate.bind(this)
		this.start()
	}

	isActive(){
		return this.isRunning
	}

	stop() {
		this.isRunning = false
	}

	start() {
		this.isRunning = true
		this.animFrameUpdate()
	}

	animFrameUpdate(timeStamp) {
		TWEEN.update(timeStamp)
		// animateItemsInQueue(timeStamp) //TEMP: to be removed
		if (this.isRunning) {
			requestAnimationFrame(this.animFrameUpdate)
		}
	}
}

export default new ClockPoll()
