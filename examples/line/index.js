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

const line = new SvgElem({
	parentDom: svg.elem,
	tag: 'circle',
	style: {
		'fill': 'none',
		'stroke': 'black',
		'stroke-width': '2px',
	},
	attr: {
		'x1': 100,
		'y1': 250,
		'x2': 400,
		'y2': 250,
	},
})


