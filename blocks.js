'use strict';

var hajimehoshiGameBlocks = (function () {
    var iota = 0;
    var MODE_INIT  = iota++;
    var MODE_TITLE = iota++;
    var MODE_GAME  = iota++;
    var TRANSITION_TIME = 40;
    var TRANSITION_HALF_TIME = TRANSITION_TIME / 2;
    return {
        MODE_INIT:  MODE_INIT,
        MODE_TITLE: MODE_TITLE,
        MODE_GAME:  MODE_GAME,
        TRANSITION_TIME: TRANSITION_TIME,
        TRANSITION_HALF_TIME: TRANSITION_HALF_TIME,
    };
})();
