# svg-elem

Generic animatable svg elements.

## Installation

```bash
npm i -S svg-elem
```

## Usage

```js
import SvgElem from 'svg-elem'

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
        'stroke-width': '2px',
    },
    attr: {
        'cx': 250,
        'cy': 250,
        'r': 50,
    },
})
```

## Examples

Some [circles](https://pitchdropobserver.github.io/svg-elem/).



