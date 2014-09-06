module Blocks {

    export class GameScene implements Scene {

        public update(sceneManager: SceneManager, mouseState: MouseState): void {
        }

        public draw(context, images): void {
            var backgroundImage = images['background'].element;
            context.drawImage(backgroundImage, 0, 0, 320, 240);
            context.fillStyle = 'rgba(0, 0, 0, 0.5)';
            context.fillRect(0, 0, 100, 100);
        }

        public get nextScene() {
            return null;
        }
    }

}
