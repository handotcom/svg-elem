import { getDist2Pts, Grid, capBtw } from 'brodash'
import './style.css'
import SvgElem from '../../src'
const SVG_CONTAINER_ELEM = document.getElementById('root')
const WIN_W = window.innerWidth
const WIN_H = window.innerHeight
const SMALLEST_WIN_DIM = Math.min(WIN_W, WIN_H)
const SVG_W = SMALLEST_WIN_DIM * 0.5
const SVG_H = SMALLEST_WIN_DIM * 0.5
const SVG_X = (WIN_W - SVG_W) / 2
const SVG_Y = (WIN_H - SVG_H) / 2
const CIRC_R = 15 // circle radius
const CIRC_GAP = 4 // gap size between circles
const MIN_CIRC_R_SCALE = 0.1 // smallest % of radius circles will shrink down to
const NUM_X = Math.floor(SVG_W / (CIRC_R * 2 + CIRC_GAP)) // number of circles in x direction
const NUM_Y = Math.floor(SVG_H / (CIRC_R * 2 + CIRC_GAP)) // number of circles in y direction
const arrCircles = []
const LONGEST_DIST_IN_SVG = getDist2Pts(
	{ x: SVG_W, y: SVG_H },
	{ x: 0, y: 0 },
)

document.body.addEventListener('mousemove', (e) => {
	const { clientX, clientY } = e
	arrCircles.forEach(circle => {
		const { cx, cy } = circle.getAttr()
		const distToPt = getDist2Pts(
			{ x: clientX, y: clientY },
			{ x: SVG_X + cx, y: SVG_Y + cy },
		)
		const pctMaxDist = Math.max(distToPt, 0.01) / LONGEST_DIST_IN_SVG // distance to pt as a percent of largest possible relative distance in svg space
		const scaleFactor = capBtw(MIN_CIRC_R_SCALE, 1 - pctMaxDist, 1.0)
		// console.log('scaleFactor', scaleFactor)
		circle.setAttr({
			'r': scaleFactor * CIRC_R
		})
	})
})

const svgContainer = new SvgElem({
	parentDom: SVG_CONTAINER_ELEM,
	tag: 'svg',
	style: {
		'left': SVG_X,
		'top': SVG_Y,
	},
	attr: {
		'width': SVG_W,
		'height': SVG_H,
	},
})

const grid = new Grid(CIRC_R, CIRC_R, SVG_W, SVG_H, NUM_X, NUM_Y)

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
				'r': MIN_CIRC_R_SCALE * CIRC_R,
			},
		})
	)
})

