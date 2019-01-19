# svg-elem

Generic animatable svg elements.

## Examples

1. Some [circles](https://pitchdropobserver.github.io/svg-elem/circle.html).

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
        'stroke-width': '2px',
    },
    attr: {
        'cx': 250,
        'cy': 250,
        'r': 50,
    },
})
```





