'use strict';

var hajimehoshiGameBlocks = (function () {
    var consts = {};
    var iota;
    iota = 0;
    consts.MODE_INIT  = iota++;
    consts.MODE_TITLE = iota++;
    consts.MODE_GAME  = iota++;

    iota = 0;
    consts.MODE_GAME_START    = iota++;
    consts.MODE_GAME_PLAYING  = iota++;
    consts.MODE_GAME_GAMEOVER = iota++;

    consts.TRANSITION_TIME = 40;
    consts.TRANSITION_HALF_TIME = consts.TRANSITION_TIME / 2;
    
    return {consts: consts};
})();
