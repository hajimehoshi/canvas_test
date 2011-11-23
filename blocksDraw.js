'use strict';

hajimehoshiGameBlocks.draw = (function (consts) {
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
    function getTransition(state) {
        if ('transition' in state) {
            return state.transition;
        }
        return 0;
    }
    function getTransitionType(transition) {
        if (consts.TRANSITION_HALF_TIME < transition &&
            transition <= consts.TRANSITION_TIME) {
            return TRANSITION_TYPE_PREV;
        }
        if (0 < transition && transition <= consts.TRANSITION_HALF_TIME) {
            return TRANSITION_TYPE_NEXT;
        }
        return TRANSITION_TYPE_NONE;
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
            alpha = 1 - (transition - consts.TRANSITION_HALF_TIME) / consts.TRANSITION_HALF_TIME;
            context.fillStyle = 'rgba(0, 0, 0, ' + alpha + ')';
            context.fillRect(0, 0, canvas.width, canvas.height)
        }
        if (transitionType === TRANSITION_TYPE_NEXT) {
            alpha = transition / consts.TRANSITION_HALF_TIME;
            context.fillStyle = 'rgba(0, 0, 0, ' + alpha + ')';
            context.fillRect(0, 0, canvas.width, canvas.height)
        }
    }
    function draw(canvas, context, images, state) {
        /*console.log($(canvas).width(), $(canvas).height());
          console.log(canvas.offsetWidth, canvas.offsetHeight);*/
        var backgroundImage;
        var blocksImage;
        var fontImage;
        var fontImageData;
        var transition;
        var transitionType;
        var stateToDraw;
        var title;
        var x, y;
        transition = getTransition(state);
        transitionType = getTransitionType(transition);
        stateToDraw = getStateToDraw(transitionType, state);
        if (stateToDraw.mode === consts.MODE_INIT) {
            context.fillStyle = '#cccccc';
            context.fillRect(0, 0, canvas.width, canvas.height);
            return;
        }
        blocksImage = images['blocks'].element;
        fontImage = images['font'].element;
        fontImageData = imageToImageData(fontImage);
        if (stateToDraw.mode === consts.MODE_TITLE) {
            context.fillStyle = '#cccccc';
            context.fillRect(0, 0, canvas.width, canvas.height);
            title = "BLOCKS";
            x = (canvas.width - title.length * 8) / 2;
            y = canvas.height / 2 - 8;
            drawText(context, fontImageData, title, x, y, [0x66, 0x66, 0x66]);
        }
        if (stateToDraw.mode === consts.MODE_GAME) {
            backgroundImage = images['background'].element;
            context.drawImage(backgroundImage, 0, 0, 320, 240);
            // TODO: draw Field
            context.fillStyle = 'rgba(0, 0, 0, 0.5)';
            context.fillRect(0, 0, 100, 100);
        }
        drawTransition(context, canvas, transitionType, transition);
    }
    return draw;
})(hajimehoshiGameBlocks.consts);
