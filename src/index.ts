import { 
	purgeOwnKeys,
	// createSvgElement,
} from 'brodash'
import {
	collectChanges,
	setAttrDirectly,
	setAttrAnimated,
	setAttrPolylinePoints,
	setTSpans,
} from './util'
import {
	IProps,
	IAttr,
	IStyle,
	IAnim,
	TText,
	createSvgElement, // TODO: remove on next brodash release
} from './util'



class SvgElem {

	private nextProps: IProps = null
	public props: IProps = {
		parentDom: null,
		tag: '',
		attr: <IAttr>{},
		style: <IStyle>{},
	}
	public elem: SVGSVGElement = null
	private textElemTSpans: Array<SVGSVGElement> = []

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

	private createElement(tag: string, parentDom: Element): void {
		this.elem = createSvgElement(tag, parentDom)
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

	public setStyle(style: IStyle, anim?: IAnim): void {
		const { elem, props } = this
		const changedStyle = collectChanges<IStyle>(props.style, style)
		if (changedStyle !== undefined){
			Object.assign(props.style, changedStyle) // update props...
			const isTextElem = props.tag === 'text'
			let key: string,
				shouldResetText: boolean = false
			for (key in changedStyle) {
				elem.style[key] = changedStyle[key] // update DOM
				if (isTextElem) {
					switch (key) {
						case 'font-family':
						case 'font-size':							
							// certain style change requires re-calculation of line height, which is done by re-setting text content
							shouldResetText = true
							break;
					}						
				}
			}
			if(shouldResetText) this.setText(props.text)
		}
	}

	public setText(val: TText): void {
		const { elem, textElemTSpans, props } = this
		switch (typeof val) {
			case 'string':
			case 'number': // single text item...
				elem.textContent = String(val)
				props.text = val // update props
				break
			case 'object':
				if (Array.isArray(val)) { // if array of text items...
					setTSpans(elem, textElemTSpans, val, +props.attr.x)
					props.text = val // update props
				}
				break
		}
	}

}

export default SvgElem
