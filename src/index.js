// import TWEEN from 'tween.js'
import { 
	XMLNS_XLINK,
	createSvgElement, 
	purgeOwnKeys,
} from './util'


function SvgElem(op) {
    this.nextProps = Object.assign({}, op)
    this.props = {
        attr: {},
        style: {},
        text: [],
    }
    this.elem = null
    this.arrTSpan = []

    // animation helpers
    this.current = null
    this.endState = null

    // special attributes
    this.plineAttrPoint = {} // initial value of 'points' attribute for <polyline>, used as ref value for tweening...

    this.textLineHeight = null
    this.init() // initialize using nextProps...
}

SvgElem.prototype.init = function () {
    const { tag, parentDom, listeners } = this.nextProps
    this.createElement(tag, parentDom)
    this.initAttrStyle()
    this.attachEventListeners(listeners)
    Object.assign(this.props, this.nextProps)
}

SvgElem.prototype.createElement = function (tag, parentDom) {
    this.elem = createSvgElement(tag, parentDom)
}

SvgElem.prototype.destroy = function () {
    this.removeFromDom()
    purgeOwnKeys(this)
}

SvgElem.prototype.removeFromDom = function () {
    const { elem, props, text } = this
    props.parentDom.removeChild(elem)
    this.removeEventListeners()
    // NOTE: after staics lines are added, something calls removeElement..???
    // this.elem = undefined
    // this.props = undefined
}

// for convenience
SvgElem.prototype.getId = function () {
    return this.props.attr.id
}

SvgElem.prototype.on = function (eventType, handler) {
    const { elem } = this
    elem.addEventListener(eventType, handler)
}

SvgElem.prototype.initAttrStyle = function () {
    const { attr, style, tag, text } = this.nextProps
    this.setAttr(attr)
    this.setStyle(style)

    if (tag === 'text' && text !== undefined) {
        this.setText(text)
    }
}

SvgElem.prototype.updateProps = function (op) {
    const { attr, style, text, anim } = op
    if (attr) this.setAttr(attr, anim)
    if (style) this.setStyle(style, anim)
    if (text) this.setText(text)
}

SvgElem.prototype.attachEventListeners = function (listeners) {
    if (listeners !== undefined) {
        for (let eventType in listeners) {
            if (listeners.hasOwnProperty(eventType)) {
                this.elem.addEventListener(eventType, listeners[eventType])
            }
        }
    }
}

SvgElem.prototype.removeEventListeners = function () {
    const { listeners } = this.props
    if (listeners !== undefined) {
        for (let eventType in listeners) {
            if (listeners.hasOwnProperty(eventType)) {
                this.elem.removeEventListener(eventType, listeners[eventType])
            }
        }
    }
}

// return array 2D
function plinePtConvert(pointsAttr) {
    if (typeof pointsAttr === 'string') {
        return pointsAttr.split(/[\s,]+/).map(str => +str)
    }
    if (Array.isArray(pointsAttr)) {
        return pointsAttr
        // return pointsAttr.map(function(str){
        // 	return str.split(',')
        // })
    }
}

SvgElem.prototype.setAttr = function (attr, anim) {
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
        // eg. <polyline points="20,20 40,25"/>
        let plineAttrPoint = {}

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

SvgElem.prototype.animateAttr = function (dur, easing) {
    const { current, endState, elem } = this
    return new Promise((resolve) => {
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

SvgElem.prototype.setText = function (val) {
    const { elem, arrTSpan, textLineHeight, props } = this

    switch (typeof val) {
        case 'string':
        case 'number': {  // single text item...
            elem.textContent = val
        } break
        case 'object': { // array of text items...
            if (val instanceof Array) {
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
                    if (textLineHeight === null) {
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

SvgElem.prototype.setStyle = function (style, anim) {
    const { elem, props } = this
    let key, val, shouldRerenderText = false
    for (key in style) {
        val = style[key]
        if (
            style.hasOwnProperty(key)
            && val !== props.style[key] // if value changed...
        ) {

            if (props.tag === 'text') {
                if (key === 'font-family' || key === 'font-size') {
                    this.textLineHeight = null // reset line height on font change
                    shouldRerenderText = true
                }
            }
            elem.style[key] = val
        }
    }

    Object.assign(props.style, style) // overwrite props with nextProps

    if (shouldRerenderText) {
        this.setText(this.props.text)
    }

}



export default SvgElem
