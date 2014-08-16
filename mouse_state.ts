class MouseState {

    private x = 0;
    private y = 0;
    private buttons = 0;

    public constructor(elm: HTMLCanvasElement) {
        elm.addEventListener('mousemove', (e: MouseEvent): void => {
            // ref: http://cpplover.blogspot.com/2009/06/dom-level-3.html
            var elm = <HTMLElement>e.target;
            var logicalWidth  = elm.clientWidth;
            var logicalHeight = elm.clientHeight;
            var clientRect = elm.getBoundingClientRect();
            var realWidth  = clientRect.width
            var realHeight = clientRect.height;
            var scaleX = realWidth  / logicalWidth;
            var scaleY = realHeight / logicalHeight;
            this.x = Math.floor((e.clientX - clientRect.left) / scaleX);
            this.y = Math.floor((e.clientY - clientRect.top)  / scaleY);
            this.buttons = e.which;
        }, false);
        elm.addEventListener('mouseup', (e: MouseEvent): void => {
            this.buttons = 0;
        }, false);
        elm.addEventListener('mousedown', (e: MouseEvent): void => {
            this.buttons = e.which;
        }, false);
        elm.addEventListener('mouseout', (e: MouseEvent): void => {
            this.buttons = 0;
        }, false);
    }

    public getState(mouseState) {
        var buttonState = 0;
        if (mouseState !== null && this.buttons !== 0) {
            buttonState = mouseState.buttonState + 1;
        }
        return {
            x: this.x,
            y: this.y,
            buttonState: buttonState,
        };
    }

}
