export const XMLNS_SVG = 'http://www.w3.org/2000/svg'
export const XMLNS_XLINK = 'http://www.w3.org/1999/xlink'


export function getHash() {
	return Math.random().toString(36).substring(2, 15)
}

export function getUniqueHashOnObj(obj) {
	const hashKey = getHash()
	return obj.hasOwnProperty(hashKey) ?
		getUniqueHashOnObj(obj) // try again on collision
		: hashKey
}

export function createSvgElement(tag, parentDom) {
	const elem = document.createElementNS(XMLNS_SVG, tag)
	parentDom.appendChild(elem)
	return elem
}


/**
 * Purge object's own keys
 * @param {Object} obj - An object
 */
export function purgeOwnKeys(obj, shouldDelete) {
	let key
	for (key in obj) { // purge own keys
		if (obj.hasOwnProperty(key)) {
			if(shouldDelete){ // delete ref and key...
				Reflect.deleteProperty(obj, key)
			} else { // release reference...
				obj[key] = undefined 
			}
		}
	}
}

/**
 * Convert a svg points string to an array of values
 * @param {string} pointsAttr - Array of string
 * @return {Array} - Array of numeric values 
 */
export function plinePtConvert(pointsAttr) {
	if (Array.isArray(pointsAttr)) return pointsAttr		
	if (typeof pointsAttr === 'string') {
		return pointsAttr.split(/[\s,]+/).map(str => Number(str))
	}
}


export const EASE = {
	// no easing, no acceleration
	Linear: (t) => t,
	// accelerating from zero velocity
	InQuad: (t) => t * t,
	// decelerating to zero velocity
	OutQuad: (t) => t * (2 - t),
	// acceleration util halfway, then deceleration
	InOutQuad: (t) => t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
	// accelerating from zero velocity
	InCubic: (t) => t * t * t,
	// decelerating to zero velocity
	OutCubic: (t) => (-t) * t * t + 1,
	// acceleration util halfway, then deceleration
	InOutCubic: (t) => t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
	// accelerating from zero velocity
	InQuart: (t) => t * t * t * t,
	// decelerating to zero velocity
	OutQuart: (t) => 1 - (-t) * t * t * t,
	// acceleration util halfway, then deceleration
	InOutQuart: (t) => t < .5 ? 8 * t * t * t * t : 1 - 8 * (-t) * t * t * t,
	// accelerating from zero velocity
	InQuint: (t) => t * t * t * t * t,
	// decelerating to zero velocity
	OutQuint: (t) => 1 + (-t) * t * t * t * t,
	// acceleration util halfway, then deceleration
	InOutQuint: (t) => t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (-t) * t * t * t * t
}
