import Tween, { ITweenState } from 'inbtwn'
import {
	XMLNS_XLINK,
} from 'brodash'

export interface IAttr {
	id: string | number
	class: string
	points: string
	[key: string]: number | string
}

export interface IProps {
	parentDom: HTMLElement
	tag: string
	style: any
	attr: IAttr
	text?: string | Array<string>
	listeners?: object
}

export interface IAnim {
	dur: number
	ease?: string
	delay?: number
}

function plinePtConvert(pointsAttr: string): number[] {
	return pointsAttr.split(/[\s,]+/).map(str => Number(str))
}

export function collectChanges<T>(existing: T, updated: T): T | undefined {
	let changedProps: T,
		key: PropertyKey
	for (key in updated) {
		if (
			updated[key] !== undefined
			&& updated[key] !== existing[key] // if value changed...
		) {
			if (changedProps === undefined) changedProps = <T>{}
			changedProps[key] = updated[key]
		}
	}
	return changedProps
}

export function setAttrDirectly(elem: HTMLElement, attr: IAttr): void {
	let key: string, val: number | string
	for(key in attr) {
		val = String(attr[key])
		switch (key) {
			case 'xlink:href':
				elem.setAttributeNS(XMLNS_XLINK, 'href', val) // must set as 'href' and NOT 'xlink:href'
				break;
			default:
				elem.setAttributeNS(null, key, val)
		}
	}
}

export function setAttrAnimated(elem: HTMLElement, oldAttr: IAttr, newAttr: IAttr, anim: IAnim): Promise<void> {
	const { dur, ease, delay } = anim
	let current: ITweenState,
		endState: ITweenState,
		key: string
	for (key in newAttr) {
		if (typeof newAttr[key] === 'number'){ // only tween numberic attributes...
			if (current === undefined) current = <ITweenState>{}
			current[key] = Number(oldAttr[key])
			endState[key] = Number(newAttr[key])
		}
	}
	return current === undefined ? 
		Promise.resolve()
			: new Promise(resolve => {
				new Tween(current)
					.to(endState, dur)
					.delay(delay)
					.easing(ease)
					.onUpdate(() => {
						elem.setAttributeNS(null, key, String(current[key]))
					})
					.onComplete(() => {
						resolve()
					})
					.start()
			})
}

export function setAttrPolylinePoints(polylineElem: HTMLElement, oldPts: string, newPts: string, anim: IAnim): Promise<void> {
	const { dur, ease, delay } = anim
	const current: ITweenState = { pct: 0.0 }
	const endState: ITweenState = { pct: 1.0 }
	const ptsStart: number[] = plinePtConvert(oldPts)
	const ptsEnd: number[] = plinePtConvert(newPts)
	const ptsDelta: number[] = ptsEnd.map((num, i) => num - ptsStart[i])

	return new Promise(resolve => {
		new Tween(current)
			.to(endState, dur)
			.delay(delay)
			.easing(ease)
			.onUpdate(() => {
				const { pct } = current
				const pts = ptsStart.map((num, i) => num + ptsDelta[i] * pct)
				// transform from coordinates array back into attribute string
				polylineElem.setAttributeNS(null, 'points', pts.join(','))
			})
			.onComplete(() => {
				resolve()
			})
			.start()
	})
}

