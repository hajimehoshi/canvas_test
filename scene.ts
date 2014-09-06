module Blocks {

    export interface Scene {
        update(sceneManager: SceneManager, mouseState: MouseState): void;
        draw(context, images): void;
    }

    // TODO: Use enum
    var MODE_TITLE = 0;
    var MODE_GAME  = 1;

    var MODE_GAME_START    = 0;
    var MODE_GAME_PLAYING  = 1;
    var MODE_GAME_GAMEOVER = 2;

    var TRANSITION_TIME = 40;
    var TRANSITION_HALF_TIME = TRANSITION_TIME / 2;

    var TRANSITION_TYPE_NONE = 0;
    var TRANSITION_TYPE_PREV = 1;
    var TRANSITION_TYPE_NEXT = 2;

    export class TmpScene {

        private static newField(): Object {
            var width = 10;
            var height = 20;
            var blocks = new Array(width * height);
            var i;
            for (i = 0; i < blocks.length; i++) {
                blocks[i] = 0;
            }
            return {
                width:  width,
                height: height,
                blocks: blocks,
            };
        }

        public static drawText(context, fontImageData, str, x, y, color): void {
            var letterNumInLine = 16;
            var letterSize = fontImageData.width / letterNumInLine;
            var fontData = fontImageData.data;
            var contextImageData = context.getImageData(x, y, str.length * letterSize, letterSize);
            var contextData = contextImageData.data;
            var r = color[0];
            var g = color[1];
            var b = color[2];
            for (var i = 0; i < str.length; i++) {
                var ch = str.charCodeAt(i);
                var sx = ((ch - 32) % 16)             * letterSize;
                var sy = (Math.floor((ch - 32) / 16)) * letterSize;
                var si = (sx + sy * fontImageData.width) * 4;
                var di = i * letterSize                  * 4;
                for (var k = 0;
                     k < letterSize;
                     k++,
                     di += (contextImageData.width - letterSize) * 4,
                     si += (fontImageData.width    - letterSize) * 4) {
                    for (var j = 0;
                         j < letterSize;
                         j++, di += 4, si += 4) {
                        if (fontData[si + 3] === 255) {
                            contextData[di]     = r;
                            contextData[di + 1] = g;
                            contextData[di + 2] = b;
                            contextData[di + 3] = 255;
                        }
                    }
                }
            }
            context.putImageData(contextImageData, x, y);
        }

        private static getTransition(state) {
            if ('transition' in state) {
                return state['transition'];
            }
            return 0;
        }

        private static getTransitionType(transition) {
            if (TRANSITION_HALF_TIME < transition &&
                transition <= TRANSITION_TIME) {
                return TRANSITION_TYPE_PREV;
            }
            if (0 < transition && transition <= TRANSITION_HALF_TIME) {
                return TRANSITION_TYPE_NEXT;
            }
            return TRANSITION_TYPE_NONE;
        }

        private static getStateToDraw(transitionType, state) {
            if (transitionType === TRANSITION_TYPE_NONE) {
                return state;
            }
            if (transitionType === TRANSITION_TYPE_PREV) {
                return state;
            }
            if (transitionType === TRANSITION_TYPE_NEXT) {
                return state['nextState'];
            }
            throw 'invalid transitionType';
        }

        private static drawTransition(context, canvas, transitionType, transition) {
            if (transitionType === TRANSITION_TYPE_PREV) {
                var alpha = 1 - (transition - TRANSITION_HALF_TIME) / TRANSITION_HALF_TIME;
                context.fillStyle = 'rgba(0, 0, 0, ' + alpha + ')';
                context.fillRect(0, 0, canvas.width, canvas.height)
            }
            if (transitionType === TRANSITION_TYPE_NEXT) {
                var alpha = transition / TRANSITION_HALF_TIME;
                context.fillStyle = 'rgba(0, 0, 0, ' + alpha + ')';
                context.fillRect(0, 0, canvas.width, canvas.height)
            }
        }

        private imageDataCache: ImageDataCache = new ImageDataCache;
        private game: Game;
        private updates: any;

        public constructor() {
            this.updates = {};
            this.updates[MODE_TITLE] = (mouseState, state): void => {
                if (mouseState.buttonState === 1) {
                    state['transition'] = TRANSITION_TIME;
                    state['nextState'] = {mode: MODE_GAME};
                }
            };
            this.updates[MODE_GAME] = (mouseState, state): void => {
            };
        }

        public update(mouseState: MouseState, state: Object): void {
            if (state['mode'] === null) {
                state['mode'] = MODE_TITLE;
            }
            if ('transition' in state && state['transition'] !== 0) {
                var nextTransition = state['transition'] - 1;
                if (nextTransition === 0) {
                    return; // next state
                }
                state['transition'] = nextTransition;
            }
            this.updates[state['mode']](mouseState, state);
        }

        public draw(canvas, context, images, state) {
            var transition = TmpScene.getTransition(state);
            var transitionType = TmpScene.getTransitionType(transition);
            var stateToDraw = TmpScene.getStateToDraw(transitionType, state);
            var blocksImage = images['blocks'].element;
            var fontImage = images['font'].element;
            var fontImageData = this.imageDataCache.get(fontImage);
            if (stateToDraw.mode === MODE_TITLE) {
                context.fillStyle = '#cccccc';
                context.fillRect(0, 0, canvas.width, canvas.height);
                var title = "BLOCKS";
                var x = (canvas.width - title.length * 8) / 2;
                var y = canvas.height / 2 - 8;
                TmpScene.drawText(context, fontImageData, title, x, y, [0x66, 0x66, 0x66]);
            }
            if (stateToDraw.mode === MODE_GAME) {
                var backgroundImage = images['background'].element;
                context.drawImage(backgroundImage, 0, 0, 320, 240);
                // TODO: draw Field
                context.fillStyle = 'rgba(0, 0, 0, 0.5)';
                context.fillRect(0, 0, 100, 100);
            }
            TmpScene.drawTransition(context, canvas, transitionType, transition);
        }
    }
}
