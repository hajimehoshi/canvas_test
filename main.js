'use strict';

/*
 * font.png:
 *   Arcade
 *   http://9031.com/
 */

(function () {
    window.addEventListener('load', function () {
        var hhg = hajimehoshiGame;
        var hhgb = hajimehoshiGameBlocks;
        var canvas = document.getElementById('mainCanvas');
        var imageFilenames = {
            background: 'background.png',
            blocks:     'blocks.png',
            font:       'font.png',
        };
        hhg.run(canvas, imageFilenames, null,
                hhgb.update, hhgb.draw);
    });
})();
