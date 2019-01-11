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

const rect = new SvgElem({
	parentDom: svg.elem,
	tag: 'rect',
	style: {
		'fill': 'white',
		'stroke': 'black',
		'stroke-width': '2px',
		'cursor': 'pointer',
	},
	attr: {
		'x': 150,
		'y': 150,
		'width': 50,
		'height': 50,
	},
})

