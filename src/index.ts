import { 
	purgeOwnKeys,
	createSvgElement,
} from 'brodash'
import {
	collectChanges,
	setAttrDirectly,
	setAttrAnimated,
	setAttrPolylinePoints,
} from './util'
import {
	IProps,
	IAttr,
	IAnim,
} from './util'



class SvgElem {

	private nextProps: IProps = null
	public props: IProps = {
		parentDom: null,
		tag: '',
		attr: <IAttr>{},
		style: {},
	}
	public elem: HTMLElement = null
	private arrTSpan: Array<HTMLElement>
	private textLineHeight: number = 0

	constructor(op: IProps){
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
		this.elem = <HTMLElement>createSvgElement(tag, parentDom)
	}

	public destroy(): void {
		this.removeFromDom()
		purgeOwnKeys(this, true)
	}
	
	public getAttr(): object {
		return Object.assign({}, this.props.attr)
	}

	public getStyle(): object {
		return Object.assign({}, this.props.style)
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
	public getId(): string|number|undefined {
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

	private attachEventListeners(listeners: Object): void {
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

	public setAttr(attr: IAttr, anim?: IAnim): Promise<void> | undefined {
		const { elem, props } = this
		const changedAttr = collectChanges<IAttr>(props.attr, attr)
		if (changedAttr !== undefined){ // has changes...
			const oldAttr: IAttr = Object.assign({}, props.attr)
			Object.assign(props.attr, changedAttr) // overwrite existing props
			if (anim !== undefined) { // if anim option provided...
				// custom tween methods for certain attributes...
				if (changedAttr['points'] !== undefined) { 
					// for <polyline/> & <polygon/>
					// developer.mozilla.org/en-US/docs/Web/SVG/Attribute/points
					return setAttrPolylinePoints(elem, oldAttr.points, changedAttr.points, anim)
				} else { // all other directly tweenable svg attributes
					return setAttrAnimated(elem, oldAttr, changedAttr, anim)
				}				
			} else {
				
				setAttrDirectly(elem, changedAttr)
			}
		}	
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

	public setStyle(style: object, anim?: IAnim): void {
		const { elem, props } = this
		let key: string,
			changeCount: number = 0
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
