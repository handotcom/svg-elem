import { 
	EASE,
	getUniqueHashOnObj,
	purgeOwnKeys
} from './util'


export interface iAnimStateObj {
	[index: string]: number
}

class TweenSingle {
	private id: string 
	private startState: iAnimStateObj 
	private userStateObj: iAnimStateObj 
	private stateDeltas: iAnimStateObj 
	private endState: iAnimStateObj 

	private onUpdateCallback: Function 
	private onCompleteCallback: Function 
	private tStart: number
	private animDur: number 
	private easingFunction: Function = EASE.InOutCubic

	constructor(userStateObj: iAnimStateObj){
		this.startState = Object.assign({}, userStateObj)
		this.userStateObj = userStateObj
		return this
	}

	public to(endState: iAnimStateObj, animDur: number): TweenSingle {
		const { startState } = this
		this.endState = endState
		this.animDur = animDur
		this.stateDeltas = Object.keys(startState).reduce((prev, key)=>{
			prev[key] = (endState[key] - startState[key]) 
			return prev
		},{})
		return this
	}
	
	public easing(easeType: string): TweenSingle {
		this.easingFunction = EASE[easeType]
		return this
	}

	public onUpdate(callback: Function): TweenSingle {
		this.onUpdateCallback = callback
		return this
	}
	
	public onComplete(callback: Function): TweenSingle {
		this.onCompleteCallback = callback
		return this
	}
	
	public start(): TweenSingle {
		const hashKey = getUniqueHashOnObj(this)
		this.id = hashKey
		TWEEN_COLLECTION[hashKey] = this 
		return this
	}

	public update(timestamp: DOMHighResTimeStamp): void {
		const { tStart, animDur, easingFunction, userStateObj, startState, stateDeltas: deltas } = this
		if (tStart === undefined) {
			this.tStart = timestamp
			return
		}
		const pctTimeElapsed = Math.min((timestamp - tStart) / animDur, 1.0)
		// console.log('pctTimeElapsed', pctTimeElapsed)
		Object.keys(userStateObj).forEach((key) => {
			userStateObj[key] = startState[key] + (deltas[key] * easingFunction(pctTimeElapsed))
		})

		this.onUpdateCallback()

		// on animation complete...
		if (pctTimeElapsed === 1.0) {
			const { onCompleteCallback } = this
			if (onCompleteCallback !== undefined) {
				onCompleteCallback()
			}
			this.destroy()
		}
	}

	private destroy(): void {
		const { id } = this
		delete TWEEN_COLLECTION[id]
		purgeOwnKeys(this)
	}
}

const TWEEN_COLLECTION: { [index: string]: TweenSingle } = {};

module TWEEN {
	export const Tween = TweenSingle
	export function update(timestamp: DOMHighResTimeStamp): void {
		Object.keys(TWEEN_COLLECTION).forEach((key)=>{
			const tween: TweenSingle = TWEEN_COLLECTION[key]
			tween.update(timestamp)
		})
	}
}

export default TWEEN