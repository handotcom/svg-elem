import { 
	divCircByNumSeg,
	arrPtsToSvgPointsAttr,
	reMapToUnitInterval,
	capBtw,
} from 'brodash'
import SvgElem from '../../src'
import './style.css'

const WIN_W = window.innerWidth
const WIN_H = window.innerHeight
const SMALLEST_WIN_DIM = Math.min(WIN_W, WIN_H)
const WIN_CEN = {x: WIN_W / 2, y: WIN_H / 2}
const SVG_CONTAINER_ELEM = document.getElementById('root')
const MIN_SIDES = 3 // minimum number of sides allowed on polygon
const MAX_SIDES = 30 // max number of sides allowed on polygon
const MIN_RADIUS =  100
const svgContainer = new SvgElem({
	parentDom: SVG_CONTAINER_ELEM,
	tag: 'svg',
	attr: {
		'width': WIN_W,
		'height': WIN_H,
	},
})

const polygon = new SvgElem({
	parentDom: svgContainer.elem,
	tag: 'polygon',
	style: {
		'fill': 'none',
		'stroke': 'white',
		'stroke-width': '5px',
		'stroke-linejoin': 'round',
		'cursor': 'pointer',
	},
	attr: {
		'points': arrPtsToSvgPointsAttr(
			divCircByNumSeg(WIN_CEN, MIN_RADIUS, 3)
		),
	},
})

document.body.addEventListener('mousemove', ({ clientX }) => {
	const xDistToWinCen = clientX - WIN_CEN.x
	const absDist = Math.abs(xDistToWinCen)
	const scaleFactor = reMapToUnitInterval(absDist, SMALLEST_WIN_DIM * 0.1, SMALLEST_WIN_DIM)
	const numPgonSides = MIN_SIDES + Math.floor(scaleFactor * (MAX_SIDES - MIN_SIDES))
	const offset = xDistToWinCen * 0.01
	const radius = capBtw(MIN_RADIUS, absDist, WIN_W)
	const strPgonPts = arrPtsToSvgPointsAttr(
		divCircByNumSeg(WIN_CEN, radius, numPgonSides, offset)
	)
	polygon.setAttr({
		'points': strPgonPts
	})
})

