import SvgElem from '../../src'


const rootElem = document.getElementById('root')


const svg = new SvgElem({
	parentDom: rootElem,
	tag: 'svg',
	style: {
		'background': '#eee',
	},
	attr: {
		'width': 500,
		'height': 500,
	},
})

new SvgElem({
	parentDom: svg.elem,
	tag: 'circle',
	style: {
		'fill': 'white',
		'stroke': 'black',
		'stroke-width': '2px',
		'cursor': 'pointer',
	},
	attr: {
		'cx': 150,
		'cy': 150,
		'r': 50,
	},
})