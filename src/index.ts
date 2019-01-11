import TWEEN from 'tween.js'
import ClockPoll from './ClockPoll'
import { 
	XMLNS_XLINK,
	createSvgElement, 
	purgeOwnKeys,
	plinePtConvert,
} from './util'


interface iProps {
	parentDom: HTMLElement
	tag: string
	style: any
	attr: any
	text?: string | Array<string>
	listeners?: object
}

interface iAnim {
	dur: number
	ease?: string
}

interface iPlineAttrPoint {
	start: Array<number>
	end: Array<number>
	delta: Array<number>
}

class SvgElem {

	private nextProps: iProps = null
	private props: iProps = {
		parentDom: null,
		tag: '',
		attr: {},
		style: {},
	}
	public elem: HTMLElement = null
	private arrTSpan: Array<HTMLElement>
	// animation helpers
	private current: object = null
	private endState: object = null
	// special attributes
	private plineAttrPoint: iPlineAttrPoint = {
		start:[],
		end:[],
		delta:[],
	} // initial value of 'points' attribute for <polyline>, used as ref value for tweening...
	private textLineHeight: number = 0

	constructor(op: iProps){
		this.nextProps = Object.assign({}, op)
		this.init() // initialize using nextProps...
	}

	private init(): void {
		const { tag, parentDom, listeners } = this.nextProps
		this.createElement(tag, parentDom)
		this.initAttrStyle()
		this.attachEventListeners(listeners)
		Object.assign(this.props, this.nextProps)
	}

	private createElement(tag: string, parentDom: HTMLElement): void {
		this.elem = createSvgElement(tag, parentDom)
	}

	public destroy(): void {
		this.removeFromDom()
		purgeOwnKeys(this)
	}

	private removeFromDom(): void {
		const { elem, props } = this
		props.parentDom.removeChild(elem)
		this.removeEventListeners()
		// NOTE: after staics lines are added, something calls removeElement..???
		// this.elem = undefined
		// this.props = undefined
	}

	// for convenience
	public getId(): void {
		return this.props.attr.id
	}

	public on(eventType: string, handler: EventListenerOrEventListenerObject): void {
		const { elem } = this
		elem.addEventListener(eventType, handler)
	}

	private initAttrStyle(): void {
		const { attr, style, tag, text } = this.nextProps
		this.setAttr(attr)
		this.setStyle(style)

		if (tag === 'text' && text !== undefined) {
			this.setText(text)
		}
	}

	public updateProps(op): void {
		const { attr, style, text, anim } = op
		if (attr) this.setAttr(attr, anim)
		if (style) this.setStyle(style, anim)
		if (text) this.setText(text)
	}

	private attachEventListeners(listeners): void {
		if (listeners !== undefined) {
			for (let eventType in listeners) {
				if (listeners.hasOwnProperty(eventType)) {
					this.elem.addEventListener(eventType, listeners[eventType])
				}
			}
		}
	}

	private removeEventListeners(): void {
		const { listeners } = this.props
		if (listeners !== undefined) {
			for (let eventType in listeners) {
				if (listeners.hasOwnProperty(eventType)) {
					this.elem.removeEventListener(eventType, listeners[eventType])
				}
			}
		}
	}

	public setAttr(attr: object, anim?: iAnim): Promise<void> {
		const { elem, props } = this
		if (anim) { // animate to new attributes...
			const { dur, ease } = anim
			this.current = null // clear states
			this.endState = null

			let easing
			switch (ease) {
				case 'linear': easing = TWEEN.Easing.Linear.None; break
				default: easing = TWEEN.Easing.Cubic.InOut
			}
		
			let current, endState
			let plineAttrPoint = {} // eg. <polyline points="20,20 40,25"/>

			for (let key in attr) {
				if (
					attr.hasOwnProperty(key)
					&& attr[key] !== props.attr[key] // if value changed...
					// && typeof attr[key] !== 'function'
				) {
					if (this.current === null) {
						this.current = {}
						this.endState = {}
					}

					switch (key) {
						case 'points': { // for <polyline>...
							const { plineAttrPoint } = this
							// start & end must have same number of points
							plineAttrPoint.start = plinePtConvert(elem.getAttribute(key))
							plineAttrPoint.end = plinePtConvert(attr[key])
							plineAttrPoint.delta = plineAttrPoint.end.map(function (num, i) {
								return num - plineAttrPoint.start[i]
							})
							this.current[key] = 0.0
							this.endState[key] = 1.0
						} break;
						case 'class':
						case 'id':
							break
						default: // all other directly tweenable attributes
							this.current[key] = Number(elem.getAttribute(key))
							this.endState[key] = attr[key]
					}
				}
			}

			if (this.current !== null) {
				return this.animateAttr(dur, easing).then(() => {
					Object.assign(this.props.attr, attr) // overwrite props after animation has finished...
				})
			} else {
				Object.assign(props.attr, attr)
				return Promise.resolve()
			}

		} else { // set without animation...
			let key, val
			for (key in attr) {
				val = attr[key]
				if (
					attr.hasOwnProperty(key) // if key exists...
					&& val !== props.attr[key] // if value changed...
					&& typeof val !== 'function'
				) {
					switch (key) {
						case 'xlink:href':
							elem.setAttributeNS(XMLNS_XLINK, 'href', val) // must set as 'href' and NOT 'xlink:href'
							break;
						default:
							elem.setAttributeNS(null, key, val)
					}
				}
			}
			Object.assign(props.attr, attr) // overwrite props with nextProps
		}
	}

	private animateAttr(dur: number, easing: string): Promise<void> {
		const { current, endState, elem } = this
		return new Promise((resolve) => {
			if(!ClockPoll.isActive()) ClockPoll.start()

			// console.log('current -> end', current, {val:attr[key]})
			new TWEEN.Tween(current)
				.to(endState, dur)
				.easing(easing)
				.onUpdate(() => {
					for (let key in current) {
						// eg. <polyline points="20,20 40,25"/>
						switch (key) {
							case 'points': { // for <polyline>...
								const { start, delta } = this.plineAttrPoint
								const ratio = current[key] // percentage indicating tweening progress...
								// transform from coordinates back into attribute string
								const strAttr = start.map((num, i) => {
									return num + delta[i] * ratio
								}).join(',')
								elem.setAttributeNS(null, key, strAttr)
							} break;
							default: // all other directly tweenable attributes
								elem.setAttributeNS(null, key, current[key])
						}
					}
				})
				.onComplete(() => {
					resolve()
				})
				.start()
		})
	}

	public setText(val: any): void {
		const { elem, arrTSpan, textLineHeight, props } = this

		switch (typeof val) {
			case 'string':
			case 'number': {  // single text item...
				elem.textContent = String(val)
			} break
			case 'object': { // array of text items...
				if (Array.isArray(val)) {
					// NOTE: 'alignment-baseline' does not work on tspans
					// <tspan dx="50,10,10,0,5" dy="50,10,10,10">SVG 2</tspan>
					const { x } = props.attr

					let tspan, exstTspan, dy
					for (let i = 0; i < val.length; i++) {
						if (arrTSpan[i] === undefined) { // if tspan do not exist...
							tspan = createSvgElement('tspan', elem) // create new element
							arrTSpan.push(tspan)
						} else {  // if tspan already exist...
							tspan = arrTSpan[i] // reference exsiting element
						}

						tspan.textContent = val[i]
						// calc & record character height if not yet determined...
						if (!textLineHeight) {
							this.textLineHeight = tspan.getBBox().height
						}
						tspan.setAttributeNS(null, 'x', x)
						tspan.setAttributeNS(null, 'dy', this.textLineHeight)
					}

					// purge legacy tspans no longer used...
					const deltaListLen = arrTSpan.length - val.length
					if (deltaListLen > 0) { // if new items fewer than already created...
						for (let i = 0; i < deltaListLen; i++) {
							elem.removeChild(arrTSpan.pop())
						}
					}
				}
			} break
		}
		props.text = val // overwrite props with nextProps
	}

	public setStyle(style: object, anim?: iAnim): void {
		const { elem, props } = this
		let key,
			changeCount = 0
		for (key in style) {
			if (
				style.hasOwnProperty(key)
				&& style[key] !== props.style[key] // if value changed...
			) {
				elem.style[key] = style[key]
				changeCount += 1
				if (props.tag === 'text') {
					if (key === 'font-family' || key === 'font-size') {
						this.textLineHeight = null // reset line height on font change			
						this.setText(props.text)
					}
				}
			}
		}

		if (changeCount > 0){
			Object.assign(props.style, style) // overwrite props with nextProps
		}    
	}

}

export default SvgElem
