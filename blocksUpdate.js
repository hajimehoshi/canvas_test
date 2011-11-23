'use strict';

hajimehoshiGameBlocks.update = (function (hhg, consts) {
    function isLoading(images) {
        var key;
        for (key in images) {
            if (images[key].state !== 'loaded') {
                return true;
            }
        }
        return false;
    }
    function newField() {
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
    function putPiece(field, piece, x, y, angle, b) {
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
    function flushField(field) {
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
    var updates = {};
    updates[consts.MODE_INIT] = function (canvasSize, images, mouseState, state) {
        return {mode: consts.MODE_TITLE};
    };
    updates[consts.MODE_TITLE] = function (canvasSize, images, mouseState, state) {
        if (mouseState.buttonState === 1) {
            return hhg.update(state, {
                transition: consts.TRANSITION_TIME,
                nextState: {mode: consts.MODE_GAME},
            });
        }
        return state;
    };
    updates[consts.MODE_GAME] = function (canvasSize, images, mouseState, state) {
        if (!('field' in state)) {
            hhg.update(state, {
                field: newField(),
                score: 0,
            });
        }
        return state;
    };
    function update(canvasSize, images, mouseState, state) {
        //console.log(mouseState.x, mouseState.y, mouseState.isClicked);
        var nextTransition;
        if (state === null) {
            return update(canvasSize, images, mouseState, {mode: consts.MODE_INIT});
        }
        if (isLoading(images)) {
            return state;
        }
        if ('transition' in state && state.transition !== 0) {
            nextTransition = state.transition - 1;
            if (nextTransition === 0) {
                return state.nextState;
            }
            return hhg.update(state, {
                transition: nextTransition
            });
        }
        return updates[state.mode](canvasSize, images, mouseState, state);
    }
    return update;
})(hajimehoshiGame, hajimehoshiGameBlocks.consts);
