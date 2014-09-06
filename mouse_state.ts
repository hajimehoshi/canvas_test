module Blocks {
    // TODO: Rename to Input?
    export class MouseState {

        private x_ = 0;
        private y_ = 0;
        private buttons_ = 0;
        private buttonState_ = 0;

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
                this.x_ = Math.floor((e.clientX - clientRect.left) / scaleX);
                this.y_ = Math.floor((e.clientY - clientRect.top)  / scaleY);
                this.buttons_ = e.which;
            });
            elm.addEventListener('mouseup', (e: MouseEvent): void => {
                this.buttons_ = 0;
            });
            elm.addEventListener('mousedown', (e: MouseEvent): void => {
                this.buttons_ = e.which;
            });
            elm.addEventListener('mouseout', (e: MouseEvent): void => {
                this.buttons_ = 0;
            });
        }

        public get x(): number {
            return this.x_;
        }

        public get y(): number {
            return this.y_;
        }

        public get buttonState(): number {
            return this.buttonState_;
        }

        public update(): void {
            if (this.buttons_ !== 0) {
                this.buttonState_++;
            } else {
                this.buttonState_ = 0;
            }
        }
    }
}
