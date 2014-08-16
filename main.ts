function main() {
    window.addEventListener('load', function () {
        var game = new Game;
        var draw = new Blocks.Draw;
        var update = new Blocks.Update(game);
        var canvas = document.getElementById('mainCanvas');
        var imageFilenames = {
            background: 'background.png',
            blocks:     'blocks.png',
            font:       'font.png',
        };
        game.run(canvas, imageFilenames, null, update, draw);
    });
}

main();
