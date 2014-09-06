module Blocks {

    export class Game {

        private static newImageLoader(filenames: Object) {
            var images = {};
            for (var key in filenames) {
                ((key: string): void => {
                    images[key] = {loaded: false};
                    var imageElm = new Image;
                    imageElm.src = filenames[key];
                    imageElm.addEventListener('load', (e): void => {
                        images[key].loaded = true;
                        images[key].element = imageElm;
                    });
                })(key);
            }
            function getImages() {
                return images;
            }
            return {
                get getImages() { return getImages; },
            };
        }

        private static isLoading(images): boolean {
            var key;
            for (key in images) {
                if (!images[key].loaded) {
                    return true;
                }
            }
            return false;
        }

        private mouseState: MouseState;
        private canvas: HTMLCanvasElement;
        private imageLoader: any;
        private sceneManager = new SceneManager(new TitleScene);

        public constructor(canvas: HTMLCanvasElement, imageFilenames: Object) {
            this.mouseState = new MouseState(canvas);
            this.canvas = canvas;
            this.imageLoader = Game.newImageLoader(imageFilenames);
        }

        public run(): void {
            this.mainLoop();
        }

        private mainLoop(): void {
            this.doMainLoop();
            window.requestAnimationFrame((): void => {
                this.mainLoop();
            });
        }

        private doMainLoop(): void {
            this.mouseState.update();
            var images = this.imageLoader.getImages();
            if (Game.isLoading(images)) {
                return;
            }
            this.sceneManager.update(this.mouseState);
            this.sceneManager.draw(this.canvas, images);
        }

    }

}
