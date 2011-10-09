'use strict';

var hajimehoshiGameBlocks = (function () {
    var result = {};
    var key, value;
    var modes = ['MODE_INIT', 'MODE_TITLE', 'MODE_GAME'];
    for (key in modes) {
        value = modes[key]
        result[value] = value;
    }
    var modeGames = ['MODE_GAME_START', 'MODE_GAME_PLAYING', 'MODE_GAME_GAMEOVER'];
    for (key in modeGames) {
        value = modeGames[key]
        result[value] = value;
    }

    result.TRANSITION_TIME = 40;
    result.TRANSITION_HALF_TIME = result.TRANSITION_TIME / 2;

    return result;
})();
