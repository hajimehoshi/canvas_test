module Blocks {

    var WIDTH = 320;
    var HEIGHT = 240;

    export class TitleScene implements Scene {

        private nextScene_: Scene = null;
        private imageDataCache = new ImageDataCache;

        public update(sceneManager: SceneManager, mouseState: MouseState): void {
            if (mouseState.buttonState === 1) {
                sceneManager.setNextScene(new GameScene, 0);
            }
        }

        public draw(context: CanvasRenderingContext2D, images): void {
            var fontImage = images['font'].element;
            var fontImageData = this.imageDataCache.get(fontImage);

            context.fillStyle = '#cccccc';
            context.fillRect(0, 0, WIDTH, HEIGHT);
            var title = "BLOCKS";
            var x = (WIDTH - title.length * 8) / 2;
            var y = HEIGHT / 2 - 8;
            TmpScene.drawText(context, fontImageData, title, x, y, [0x66, 0x66, 0x66]);
        }

        public get nextScene() {
            return this.nextScene_;
        }

    }

}
