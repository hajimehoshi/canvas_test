'use strict';

(function (hhg, hhgb) {
    function isLoading(images) {
        var key;
        for (key in images) {
            if (images[key].state !== 'loaded') {
                return true;
            }
        }
        return false;
    }
    function update_MODE_INIT(canvasSize, images, mouseState, state) {
        return {mode: hhgb.MODE_TITLE};
    }
    function update_MODE_TITLE(canvasSize, images, mouseState, state) {
        if (mouseState.isClicked) {
            return hhg.update(state, {
                transition: hhgb.TRANSITION_TIME,
                nextState: {mode: hhgb.MODE_GAME},
            });
        }
        return state;
    }
    function update_MODE_GAME(canvasSize, images, mouseState, state) {
        return state;
    }
    function update(canvasSize, images, mouseState, state) {
        //console.log(mouseState.x, mouseState.y, mouseState.isClicked);
        var updateFunc;
        if (state === null) {
            return update(canvasSize, images, mouseState, {mode: hhgb.MODE_INIT});
        }
        if (isLoading(images)) {
            return state;
        }
        if ('transition' in state && state.transition !== 0) {
            return (function () {
                var nextTransition;
                nextTransition = state.transition - 1;
                if (nextTransition === 0) {
                    return state.nextState;
                }
                return hhg.update(state, {
                    transition: nextTransition
                });
            })();
        }
        updateFunc = eval('update_' + state.mode);
        return updateFunc(canvasSize, images, mouseState, state);
    }
    hhgb.update = update;
})(hajimehoshiGame, hajimehoshiGameBlocks);
