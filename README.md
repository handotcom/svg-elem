# svg-elem

Generic animatable svg elements.

## Examples

1. Some [circles](https://pitchdropobserver.github.io/svg-elem/circles.html).
2. A [polygon](https://pitchdropobserver.github.io/svg-elem/polygon.html).

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





