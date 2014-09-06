module Blocks {
    export class Main {
        public static main(): void {
            var canvas = <HTMLCanvasElement>document.getElementById('mainCanvas');
            var imageFilenames = {
                background: 'background.png',
                blocks:     'blocks.png',
                font:       'font.png',
            };

            var game = new Game(canvas, imageFilenames);
            game.run();
        }
    }
}

window.addEventListener('load', Blocks.Main.main);
