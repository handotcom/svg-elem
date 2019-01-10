export const XMLNS_SVG = 'http://www.w3.org/2000/svg'
export const XMLNS_XLINK = 'http://www.w3.org/1999/xlink'

export function createSvgElement(tag, parentDom) {
	const elem = document.createElementNS(XMLNS_SVG, tag)
	parentDom.appendChild(elem)
	return elem
}


/**
 * Purge object's own keys
 * @param {Object} obj - An object
 */
export function purgeOwnKeys(obj) {
	let key
	for (key in obj) { // purge own keys
		if (obj.hasOwnProperty(key)) {
			Reflect.deleteProperty(obj, key)
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


