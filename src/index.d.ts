interface iProps {
    parentDom: HTMLElement;
    tag: string;
    style: any;
    attr: any;
    text?: string | Array<string>;
    listeners?: object;
}
interface iAnim {
    dur: number;
    ease?: string;
}
declare class SvgElem {
    private nextProps;
    private props;
    elem: HTMLElement;
    private arrTSpan;
    private current;
    private endState;
    private plineAttrPoint;
    private textLineHeight;
    constructor(op: iProps);
    private init;
    private createElement;
    destroy(): void;
    private removeFromDom;
    getId(): void;
    on(eventType: string, handler: EventListenerOrEventListenerObject): void;
    private initAttrStyle;
    updateProps(op: any): void;
    private attachEventListeners;
    private removeEventListeners;
    setAttr(attr: object, anim?: iAnim): Promise<void>;
    private animateAttr;
    setText(val: any): void;
    setStyle(style: object, anim?: iAnim): void;
}
export default SvgElem;
