module Blocks {

    var MODE_INIT  = 0;
    var MODE_TITLE = 1;
    var MODE_GAME  = 2;

    var MODE_GAME_START    = 0;
    var MODE_GAME_PLAYING  = 1;
    var MODE_GAME_GAMEOVER = 2;

    var TRANSITION_TIME = 40;
    var TRANSITION_HALF_TIME = TRANSITION_TIME / 2;

    var TRANSITION_TYPE_NONE = 0;
    var TRANSITION_TYPE_PREV = 1;
    var TRANSITION_TYPE_NEXT = 2;

    export class Draw {

        private imageDataCache: ImageDataCache = new ImageDataCache;

        private drawText(context, fontImageData, str, x, y, color) {
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

        private getTransition(state) {
            if ('transition' in state) {
                return state.transition;
            }
            return 0;
        }

        private getTransitionType(transition) {
            if (TRANSITION_HALF_TIME < transition &&
                transition <= TRANSITION_TIME) {
                return TRANSITION_TYPE_PREV;
            }
            if (0 < transition && transition <= TRANSITION_HALF_TIME) {
                return TRANSITION_TYPE_NEXT;
            }
            return TRANSITION_TYPE_NONE;
        }

        private getStateToDraw(transitionType, state) {
            if (transitionType === TRANSITION_TYPE_NONE) {
                return state;
            }
            if (transitionType === TRANSITION_TYPE_PREV) {
                return state;
            }
            if (transitionType === TRANSITION_TYPE_NEXT) {
                return state.nextState;
            }
            throw 'invalid transitionType';
        }

        private drawTransition(context, canvas, transitionType, transition) {
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

        public draw(canvas, context, images, state) {
            var transition = this.getTransition(state);
            var transitionType = this.getTransitionType(transition);
            var stateToDraw = this.getStateToDraw(transitionType, state);
            if (stateToDraw.mode === MODE_INIT) {
                context.fillStyle = '#cccccc';
                context.fillRect(0, 0, canvas.width, canvas.height);
                return;
            }
            var blocksImage = images['blocks'].element;
            var fontImage = images['font'].element;
            var fontImageData = this.imageDataCache.get(fontImage);
            if (stateToDraw.mode === MODE_TITLE) {
                context.fillStyle = '#cccccc';
                context.fillRect(0, 0, canvas.width, canvas.height);
                var title = "BLOCKS";
                var x = (canvas.width - title.length * 8) / 2;
                var y = canvas.height / 2 - 8;
                this.drawText(context, fontImageData, title, x, y, [0x66, 0x66, 0x66]);
            }
            if (stateToDraw.mode === MODE_GAME) {
                var backgroundImage = images['background'].element;
                context.drawImage(backgroundImage, 0, 0, 320, 240);
                // TODO: draw Field
                context.fillStyle = 'rgba(0, 0, 0, 0.5)';
                context.fillRect(0, 0, 100, 100);
            }
            this.drawTransition(context, canvas, transitionType, transition);
        }
    }

    export class Update {
        game_: Game;
        updates_: any;

        public constructor(game) {
            this.game_ = game;
            this.updates_ = {};
            this.updates_[MODE_INIT] = (canvasSize, images, mouseState, state) => {
                return {mode: MODE_TITLE};
            };
            this.updates_[MODE_TITLE] = (canvasSize, images, mouseState, state) => {
                if (mouseState.buttonState === 1) {
                    return Game.update(state, {
                        transition: TRANSITION_TIME,
                        nextState: {mode: MODE_GAME},
                    });
                }
                return state;
            };
            this.updates_[MODE_GAME] = (canvasSize, images, mouseState, state) => {
                if (!('field' in state)) {
                    Game.update(state, {
                        field: this.newField(),
                        score: 0,
                    });
                }
                return state;
            };
        }

        private isLoading(images): boolean {
            var key;
            for (key in images) {
                if (!images[key].loaded) {
                    return true;
                }
            }
            return false;
        }

        private newField() {
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

        public update(canvasSize, images, mouseState, state) {
            var nextTransition;
            if (state === null) {
                return this.update(canvasSize, images, mouseState, {mode: MODE_INIT});
            }
            if (this.isLoading(images)) {
                return state;
            }
            if ('transition' in state && state.transition !== 0) {
                nextTransition = state.transition - 1;
                if (nextTransition === 0) {
                    return state.nextState;
                }
                return Game.update(state, {
                    transition: nextTransition,
                });
            }
            return this.updates_[state.mode](canvasSize, images, mouseState, state);
        }
    }
}
