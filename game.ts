class Game {

    private static clone(obj) {
        // ref: http://keithdevens.com/weblog/archive/2007/Jun/07/javascript.clone
        if (obj === null ||
            typeof(obj) !== 'object' ||
            obj.constructor !== Object) {
            return obj;
        }
        var newObj = new obj.constructor();
        for (var key in obj) {
            newObj[key] = Game.clone(obj[key]);
        }
        return newObj;
    }

    public static update(obj, pairs) {
        var newObj = Game.clone(obj);
        for (var key in pairs) {
            var objToUpdate = newObj;
            var keys = key.split('/');
            for (var i = 0; i < keys.length - 1; i++) {
                objToUpdate = objToUpdate[keys[i]];
            }
            objToUpdate[keys[keys.length - 1]] = pairs[keys];
        }
        return newObj;
    }

    private newImageLoader(filenames) {
        var images = {};
        for (var key in filenames) {
            images[key] = {loaded: false};//{state: 'loading'};
            ((key) => {
                var imageElm;
                imageElm = new Image;
                imageElm.src = filenames[key];
                imageElm.onload = () => {
                    images[key].loaded = true;
                    images[key].element = imageElm;
                };
            })(key);
        }
        function getImages() {
            return images;
        }
        return {
            get getImages() { return getImages; },
        };
    }

    private mainLoop(canvas: HTMLCanvasElement, context, imageLoader, mouseStateEnv, mouseState, state, update, draw): void {
        var canvasSize = {
            width:  canvas.width,
            height: canvas.height,
        };
        var nextMouseState = mouseStateEnv.getState(mouseState);
        var images = imageLoader.getImages();
        var newState = update.update(canvasSize, images, nextMouseState, state);
        context.clearRect(0, 0, canvasSize.width, canvasSize.height);
        context.save();
        draw.draw(canvas, context, images, newState);
        context.restore();
        window.requestAnimationFrame(() => {
            this.mainLoop(canvas, context, imageLoader, mouseStateEnv, nextMouseState,
                          newState, update, draw);
        });
    }

    public run(canvas: HTMLCanvasElement, imageFilenames, state, update, draw): void {
        var context = canvas.getContext('2d');
        var imageLoader = this.newImageLoader(imageFilenames);
        var mouseState = new MouseState(canvas);
        this.mainLoop(canvas, context, imageLoader, mouseState, null, state, update, draw);
    }
}
