module Blocks {

    var iota;
    iota = 0;
    var MODE_INIT  = iota++;
    var MODE_TITLE = iota++;
    var MODE_GAME  = iota++;

    iota = 0;
    var MODE_GAME_START    = iota++;
    var MODE_GAME_PLAYING  = iota++;
    var MODE_GAME_GAMEOVER = iota++;

    var TRANSITION_TIME = 40;
    var TRANSITION_HALF_TIME = TRANSITION_TIME / 2;

    iota = 0;
    var TRANSITION_TYPE_NONE = iota++;
    var TRANSITION_TYPE_PREV = iota++;
    var TRANSITION_TYPE_NEXT = iota++;

    export class Draw {
        imageToImageData = (function () {
            var cache = {};
            return function (img) {
                var canvas;
                var context;
                var imageData;
                if (img.src in cache) {
                    return cache[img.src];
                }
                canvas = document.createElement('canvas');
                canvas.width  = img.width;
                canvas.height = img.height;
                context = canvas.getContext('2d');
                context.drawImage(img, 0, 0);
                // If you use an URL which starts with 'file://', it may fail.
                imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                cache[img.src] = imageData;
                return imageData;
            }
        })();

        drawText(context, fontImageData, str, x, y, color) {
            var letterNumInLine = 16;
            var letterSize = fontImageData.width / letterNumInLine;
            var contextImageData;
            var fontData, contextData;
            var contextDataWidth;
            var r, g, b;
            var i, j, k;
            var ch;
            var sx, sy;
            var si, di;
            fontData = fontImageData.data;
            contextImageData = context.getImageData(x, y, str.length * letterSize, letterSize);
            contextData = contextImageData.data;
            r = color[0];
            g = color[1];
            b = color[2];
            for (i = 0; i < str.length; i++) {
                ch = str.charCodeAt(i);
                sx = ((ch - 32) % 16)             * letterSize;
                sy = (Math.floor((ch - 32) / 16)) * letterSize;
                si = (sx + sy * fontImageData.width) * 4;
                di = i * letterSize                  * 4;
                for (k = 0;
                     k < letterSize;
                     k++,
                     di += (contextImageData.width - letterSize) * 4,
                     si += (fontImageData.width    - letterSize) * 4) {
                    for (j = 0;
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
        getTransition(state) {
            if ('transition' in state) {
                return state.transition;
            }
            return 0;
        }
        getTransitionType(transition) {
            if (TRANSITION_HALF_TIME < transition &&
                transition <= TRANSITION_TIME) {
                return TRANSITION_TYPE_PREV;
            }
            if (0 < transition && transition <= TRANSITION_HALF_TIME) {
                return TRANSITION_TYPE_NEXT;
            }
            return TRANSITION_TYPE_NONE;
        }
        getStateToDraw(transitionType, state) {
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
        drawTransition(context, canvas, transitionType, transition) {
            var alpha;
            if (transitionType === TRANSITION_TYPE_PREV) {
                alpha = 1 - (transition - TRANSITION_HALF_TIME) / TRANSITION_HALF_TIME;
                context.fillStyle = 'rgba(0, 0, 0, ' + alpha + ')';
                context.fillRect(0, 0, canvas.width, canvas.height)
            }
            if (transitionType === TRANSITION_TYPE_NEXT) {
                alpha = transition / TRANSITION_HALF_TIME;
                context.fillStyle = 'rgba(0, 0, 0, ' + alpha + ')';
                context.fillRect(0, 0, canvas.width, canvas.height)
            }
        }
        draw(canvas, context, images, state) {
            var backgroundImage;
            var blocksImage;
            var fontImage;
            var fontImageData;
            var transition;
            var transitionType;
            var stateToDraw;
            var title;
            var x, y;
            transition = this.getTransition(state);
            transitionType = this.getTransitionType(transition);
            stateToDraw = this.getStateToDraw(transitionType, state);
            if (stateToDraw.mode === MODE_INIT) {
                context.fillStyle = '#cccccc';
                context.fillRect(0, 0, canvas.width, canvas.height);
                return;
            }
            blocksImage = images['blocks'].element;
            fontImage = images['font'].element;
            fontImageData = this.imageToImageData(fontImage);
            if (stateToDraw.mode === MODE_TITLE) {
                context.fillStyle = '#cccccc';
                context.fillRect(0, 0, canvas.width, canvas.height);
                title = "BLOCKS";
                x = (canvas.width - title.length * 8) / 2;
                y = canvas.height / 2 - 8;
                this.drawText(context, fontImageData, title, x, y, [0x66, 0x66, 0x66]);
            }
            if (stateToDraw.mode === MODE_GAME) {
                backgroundImage = images['background'].element;
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

        constructor(game) {
            this.game_ = game;
            this.updates_ = {};
            this.updates_[MODE_INIT] = (canvasSize, images, mouseState, state) => {
                return {mode: MODE_TITLE};
            };
            this.updates_[MODE_TITLE] = (canvasSize, images, mouseState, state) => {
                if (mouseState.buttonState === 1) {
                    return this.game_.update(state, {
                        transition: TRANSITION_TIME,
                        nextState: {mode: MODE_GAME},
                    });
                }
                return state;
            };
            this.updates_[MODE_GAME] = (canvasSize, images, mouseState, state) => {
                if (!('field' in state)) {
                    this.game_.update(state, {
                        field: this.newField(),
                        score: 0,
                    });
                }
                return state;
            };
        }

        isLoading(images) {
            var key;
            for (key in images) {
                if (images[key].state !== 'loaded') {
                    return true;
                }
            }
            return false;
        }
        newField() {
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
        putPiece(field, piece, x, y, angle, b) {
            var newField;
            var i, j;
            var idx;
            newField = newField();
            for (j = 0; j < field.height; j++) {
                for (i = 0; i < field.width; i++) {
                    idx = i + j * field.width;
                    if (x <= i && i < x + piece.width &&
                        x <= j && j < y + piece.height) {
                        // TODO: use angle
                        newField.blocks[idx] = b;
                    } else {
                        newField.blocks[idx] = field.blocks[idx];
                    }
                }
            }
            return newField;
        }
        flushField(field) {
            var newField;
            var i, j;
            var idx;
            newField = newField();
            for (j = 0; j < field.height; j++) {
                for (i = 0; i < field.width; i++) {
                    idx = i + j * field.width;
                    newField.blocks[idx] = field.blocks[idx];
                }
            }
            // 列数はどう返す?
            return newField;
        }

        update(canvasSize, images, mouseState, state) {
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
                return this.game_.update(state, {
                    transition: nextTransition,
                });
            }
            return this.updates_[state.mode](canvasSize, images, mouseState, state);
        }

    }
}
