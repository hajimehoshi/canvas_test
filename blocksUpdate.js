'use strict';

hajimehoshiGameBlocks.update = (function () {
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
        //console.log(mouseState.x, mouseState.y, mouseState.isClicked);
        var hhg = hajimehoshiGame;
        var hhgb = hajimehoshiGameBlocks;
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
        if (state.mode === hhgb.MODE_INIT) {
            return {mode: hhgb.MODE_TITLE};
        }
        if (state.mode === hhgb.MODE_TITLE) {
            if (mouseState.isClicked) {
                return hhg.update(state, {
                    transition: hhgb.TRANSITION_TIME,
                    nextState: {mode: hhgb.MODE_GAME},
                });
            }
        }
        // 変化なし?
        return state;
    }
    return update;
})();
