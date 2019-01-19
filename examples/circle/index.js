import SvgElem from '../../src'
import { getDist2Pts } from 'brodash'
const SVG_CONTAINER_ELEM = document.getElementById('root')
const SVG_W = 600
const SVG_H = 600
const CIRC_R = 25
const SVG_PAD_W = 50
const SVG_PAD_H = 50
const arrCircles = []
const LONGEST_DIST_IN_SVG = getDist2Pts(
	{ x: SVG_W, y: SVG_H},
	{ x: 0, y: 0 },
)

const svgContainer = new SvgElem({
	parentDom: SVG_CONTAINER_ELEM,
	tag: 'svg',
	style: {
		'background': '#eee',
	},
	attr: {
		'width': SVG_W,
		'height': SVG_H,
	},
	listeners:{
		'mousemove': (e) => {
			const { clientX, clientY } = e
			arrCircles.forEach(circle => {
				const { cx, cy } = circle.getAttr()
				const distToPt = getDist2Pts(
					{ x: clientX, y: clientY },
					{ x: cx, y: cy },
				)
				const pctMaxDist = Math.max(distToPt, 0.01) / LONGEST_DIST_IN_SVG // distance to pt as a percent of largest possible relative distance in svg space
				const scaleFactor = 1 - pctMaxDist
				// console.log('scaleFactor', scaleFactor)
				circle.setAttr({
					'r': scaleFactor * CIRC_R
				})
			})
		}
	},
})

class Grid {
	constructor(x, y, w, h, nx, ny) {
		this.arrPts = []
		const cell_w = w / nx
		const cell_h = h / ny
		let i, j
		for (i = 0; i < nx; i++) {
			for (j = 0; j < ny; j++) {
				this.arrPts.push({
					x: x + cell_w * i,
					y: y + cell_h * j,
				})
			}
		}
	}
	getPts() {
		return this.arrPts
	}
}


const grid = new Grid(
	CIRC_R + SVG_PAD_W / 2, 
	CIRC_R + SVG_PAD_H / 2,
	SVG_W - SVG_PAD_W,
	SVG_H - SVG_PAD_H,
	10, 
	10,
)

grid.getPts().forEach(pt => {
	arrCircles.push(
		new SvgElem({
			parentDom: svgContainer.elem,
			tag: 'circle',
			style: {
				'fill': 'white',
				'stroke': 'none',
				// 'stroke-width': '2px',
				'cursor': 'pointer',
			},
			attr: {
				'cx': pt.x,
				'cy': pt.y,
				'r': CIRC_R,
			},
		})
	)
})


// circle.setAttr({
// 	'r': 100,
// },{
// 	dur: 2000,
// })