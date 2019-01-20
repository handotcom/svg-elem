# svg-elem

Generic animatable svg elements.

## Examples

1. some [circles](https://pitchdropobserver.github.io/svg-elem/circles.html).
2. a [polygon](https://pitchdropobserver.github.io/svg-elem/polygon.html).

## Installation

```bash
npm i svg-elem
```

## Usage

```js
import SvgElem from 'svg-elem'

const svg = new SvgElem({
    parentDom: document.getElementById('root'),
    tag: 'svg',
    attr: {
        'width': 500,
        'height': 500,
    },
    style: {
        'background': '#eee',
    },
})

const circle = new SvgElem({
    parentDom: svg.elem,
    tag: 'circle',
    attr: {
        'cx': 250,
        'cy': 250,
        'r': 50,
    },
    style: {
        'fill': 'white',
        'stroke': 'black',
        'stroke-width': '2px',
    },
})
```

## Required Props

Props you must specify:

* `parentDom` - the DOM element that contains your element
* `tag` - element name of the SVG

## Optional Props

Props you can optionally specify:

* `attr` - SVG element attributes
* `style` - SVG element styles
* `text` - text content for svg texts

## Methods 

Methods you can specify:

* `setAttr(oParam, shouldAnimate)` - updates SVG's attributes
* `setStyle(oParam, shouldAnimate)` - updates SVG's styles

