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

const circle = new SvgElem({
	parentDom: svg.elem,
	tag: 'circle',
	style: {
		'fill': 'white',
		'stroke': 'black',
		'stroke-width': '10px',
		'cursor': 'pointer',
	},
	attr: {
		'cx': 150,
		'cy': 150,
		'r': 50,
	},
})


circle.setAttr({
	'r': 100,
},{
	dur: 1000,
})