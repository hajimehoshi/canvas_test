'use strict';

/*
 * font.png:
 *   Arcade
 *   http://9031.com/
 */

(function () {
    var iota = 0;
    var MODE_INIT  = iota++;
    var MODE_TITLE = iota++;
    var MODE_GAME  = iota++;
    var TRANSITION_TIME = 40;
    var TRANSITION_HALF_TIME = TRANSITION_TIME / 2;
    function isLoading(images) {
        var key;
        for (key in images) {
            if (images[key].state !== 'loaded') {
                return true;
            }
        }
        return false;
    }
    function update(canvasSize, images, mouseState, state) {
        var hhg = hajimehoshiGame;
        //console.log(mouseState.x, mouseState.y, mouseState.isClicked);
        if (isLoading(images)) {
            return state;
        }
        if ('transition' in state && state.transition !== 0) {
            return (function () {
                var nextTransition;
                nextTransition = state.transition - 1;
                if (nextTransition === 0) {
                    return state.nextState;
                } else {
                    return hhg.update(state, {
                        transition: nextTransition
                    });
                }
            })();
        }
        if (state.mode === MODE_INIT) {
            return {mode: MODE_TITLE};
        }
        if (state.mode === MODE_TITLE) {
            if (mouseState.isClicked) {
                return hhg.update(state, {
                    transition: TRANSITION_TIME,
                    nextState: {mode: MODE_GAME},
                });
            }
        }
        // 変化なし?
        return state;
    }
    var draw = (function () {
        var iota = 0;
        var TRANSITION_TYPE_NONE = iota++;
        var TRANSITION_TYPE_PREV = iota++;
        var TRANSITION_TYPE_NEXT = iota++;
        var imageToImageData = (function () {
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
        function drawText(context, fontImageData, str, x, y, color) {
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
        function getTransitionType(transition) {
            if (TRANSITION_HALF_TIME < transition && transition <= TRANSITION_TIME) {
                return TRANSITION_TYPE_PREV;
            } else if (0 < transition && transition <= TRANSITION_HALF_TIME) {
                return TRANSITION_TYPE_NEXT;
            } else {
                return TRANSITION_TYPE_NONE;
            }
        }
        function getStateToDraw(transitionType, state) {
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
        function drawTransition(context, canvas, transitionType, transition) {
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
        return function (canvas, context, images, state) {
            /*console.log($(canvas).width(), $(canvas).height());
              console.log(canvas.offsetWidth, canvas.offsetHeight);*/
            var hhg = hajimehoshiGame;
            var backgroundImage;
            var blocksImage;
            var fontImage;
            var fontImageData;
            var transition;
            var transitionType;
            var stateToDraw;
            var title;
            var x, y;
            if (isLoading(images)) {
                context.fillStyle = '#cccccc';
                context.fillRect(0, 0, canvas.width, canvas.height);
                return;
            }
            blocksImage = images['blocks'].element;
            fontImage = images['font'].element;
            fontImageData = imageToImageData(fontImage);
            if ('transition' in state) {
                transition = state.transition;
            } else {
                transition = 0;
            }
            transitionType = getTransitionType(transition);
            stateToDraw = getStateToDraw(transitionType, state);
            if (stateToDraw.mode === MODE_INIT) {
                return;
            }
            if (stateToDraw.mode === MODE_TITLE) {
                context.fillStyle = '#cccccc';
                context.fillRect(0, 0, canvas.width, canvas.height);
                title = "BLOCKS";
                x = (canvas.width - title.length * 8) / 2;
                y = canvas.height / 2 - 8;
                drawText(context, fontImageData, title, x, y, [0x66, 0x66, 0x66]);
            }
            if (stateToDraw.mode === MODE_GAME) {
                backgroundImage = images['background'].element;
                context.drawImage(backgroundImage, 0, 0, 320, 240);
            }
            drawTransition(context, canvas, transitionType, transition);
            return;
        }
    })();
    window.addEventListener('load', function () {
        var canvas = document.getElementById('mainCanvas');
        var imageFilenames = {
            background: 'background.png',
            blocks:     'blocks.png',
            font:       'font.png',
        };
        hajimehoshiGame.run(canvas, imageFilenames, {mode: MODE_INIT}, update, draw);
    });
})();

