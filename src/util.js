export const XMLNS_SVG = 'http://www.w3.org/2000/svg'
export const XMLNS_XLINK = 'http://www.w3.org/1999/xlink'

export function createSvgElement(tag, parentDom) {
	const elem = document.createElementNS(XMLNS_SVG, tag)
	parentDom.appendChild(elem)
	return elem
}

export function purgeOwnKeys(obj) {
	for (let key in obj) { // purge own keys
		if (obj.hasOwnProperty(key)) {
			Reflect.deleteProperty(obj, key)
		}
	}
}
