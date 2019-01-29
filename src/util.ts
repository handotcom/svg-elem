import Tween, { ITweenState } from 'inbtwn'
import {
	XMLNS_XLINK,
	XMLNS_SVG,
} from 'brodash'

export interface IAttr {
	id?: string | number
	class?: string
	points?: string
	[key: string]: number | string
}

export interface IStyle {
	[key: string]: string
}

export interface IProps {
	parentDom: Element
	tag: string
	style?: IStyle
	attr?: IAttr
	text?: TText
	listeners?: object
}

export interface IAnim {
	dur: number
	ease?: string
	delay?: number
}

export type TText = string | number | string[]


export function createSvgElement(tag: string, parentDom: Element): SVGSVGElement {
	const elem = <SVGSVGElement>document.createElementNS(XMLNS_SVG, tag)
	parentDom.appendChild(elem)
	return elem
}

function plinePtConvert(pointsAttr: string): number[] {
	return pointsAttr.split(/[\s,]+/).map(str => Number(str))
}



export function collectChanges<T>(existing: T, updated: T, callback?: Function): T | undefined {
	let changedProps: T,
		key: PropertyKey
	for (key in updated) {
		if (
			updated[key] !== undefined
			&& updated[key] !== existing[key] // if value changed...
		) {
			if (changedProps === undefined) changedProps = <T>{}
			changedProps[key] = updated[key]
			if (callback !== undefined) callback(key)
		}
	}
	return changedProps
}

export function setAttrDirectly(elem: SVGSVGElement, attr: IAttr): void {
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

export function setAttrAnimated(elem: SVGSVGElement, oldAttr: IAttr, newAttr: IAttr, anim: IAnim): Promise<void> {
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

export function setAttrPolylinePoints(polylineElem: SVGSVGElement, oldPts: string, newPts: string, anim: IAnim): Promise<void> {
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

export function setTSpans(parentTextElem: SVGSVGElement, textElemTSpans: SVGSVGElement[], textVals: string[], xPos: number, textLineHeight?: number): number{
	// NOTE: 'alignment-baseline' does not work on tspans
	// <tspan dx="50,10,10,0,5" dy="50,10,10,10">SVG 2</tspan>
	let tspan: SVGSVGElement, 
		dy: number = textLineHeight 
	for (let i = 0; i < textVals.length; i++) {
		if (textElemTSpans[i] === undefined) { // if tspan do not exist...
			// create new tspan
			tspan = createSvgElement('tspan', parentTextElem)
			textElemTSpans.push(tspan)
		} else { // if tspan already exist...			
			// point to exsiting tspan
			tspan = textElemTSpans[i] 
		}
		tspan.textContent = textVals[i] // must set text content before querying tspan height		
		if (dy === undefined) { 
			// NOTE: calling getBBox() on a <tspan/> returns the height the <text/> element that contains it.  eg. if text contains 5 tspans, then calling arrTspans[i].getBBox() will always yield the overall dimension of the text element and NOT the dimension of the individual tspan.
			dy = parentTextElem.getBBox().height / textElemTSpans.length // calc & record character height if not yet determined...
		}
		// set tspan parameters...
		tspan.setAttributeNS(null, 'x', String(xPos))
		tspan.setAttributeNS(null, 'dy', String(dy))
	}
	// remove tspans no longer in use...
	const legacyTSpanCount = textElemTSpans.length - textVals.length
	if (legacyTSpanCount > 0) { // if new items fewer than already created...
		for (let i = 0; i < legacyTSpanCount; i++) {
			parentTextElem.removeChild(textElemTSpans.pop())
		}
	}

	return dy
}
