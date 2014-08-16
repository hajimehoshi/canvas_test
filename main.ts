class Main {
    static main() {
        var game = new Game;
        var draw = new Blocks.Draw
        var update = new Blocks.Update(game)
        var canvas = <HTMLCanvasElement>document.getElementById('mainCanvas');
        var imageFilenames = {
            background: 'background.png',
            blocks:     'blocks.png',
            font:       'font.png',
        };
        game.run(canvas, imageFilenames, null, update, draw);
    }
}

window.addEventListener('load', Main.main);
