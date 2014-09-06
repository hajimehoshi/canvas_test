module Blocks {

    export class SceneManager {

        private currentScene: Scene = null;
        private nextScene: Scene = null;
        private transitionTime = 0;
        private transitionTimeMax = 0;
        private offscreen: HTMLCanvasElement;

        public constructor(scene: Scene) {
            this.currentScene = scene;
            this.offscreen = document.createElement('canvas');
        }

        public setNextScene(nextScene: Scene, transitionTime: number): void {
            if (transitionTime === 0) {
                this.currentScene = nextScene;
                return;
            }
            this.nextScene = nextScene;
            this.transitionTime = transitionTime;
            this.transitionTimeMax = transitionTime;
        }

        public update(mouseState: MouseState): void {
            if (0 < this.transitionTime) {
                this.transitionTime--;
                if (this.transitionTime === 0) {
                    this.currentScene = this.nextScene;
                    this.nextScene = null;
                }
                return;
            }
            this.currentScene.update(this, mouseState);
        }

        public draw(canvas: HTMLCanvasElement, images): void {
            this.offscreen.width = canvas.width;
            this.offscreen.height = canvas.height;
            
            var context = this.offscreen.getContext('2d');
            context.clearRect(0, 0, this.offscreen.width, this.offscreen.height);
            context.save();
            this.currentScene.draw(context, images);
            context.restore();

            context = canvas.getContext('2d');
            context.drawImage(this.offscreen, 0, 0);
        }

    }

}
