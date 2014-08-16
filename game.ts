class Game {

    static clone(obj) {
        // ref: http://keithdevens.com/weblog/archive/2007/Jun/07/javascript.clone
        var newObj;
        var key;
        if (obj === null ||
            typeof(obj) !== 'object' ||
            obj.constructor !== Object) {
            return obj;
        }
        newObj = new obj.constructor();
        for (key in obj) {
            newObj[key] = Game.clone(obj[key]);
        }
        return newObj;
    }

    update(obj, pairs) {
        var newObj;
        var objToUpdate;
        var key, keys;
        var i;
        newObj = Game.clone(obj);
        for (key in pairs) {
            objToUpdate = newObj;
            keys = key.split('/');
            for (i = 0; i < keys.length - 1; i++) {
                objToUpdate = objToUpdate[keys[i]];
            }
            objToUpdate[keys[keys.length - 1]] = pairs[keys];
        }
        return newObj;
    }

    newImageLoader(filenames) {
        var images = {};
        var key;
        for (key in filenames) {
            images[key] = {state: 'loading'};
            ((key) => {
                var imageElm;
                imageElm = new Image();
                imageElm.src = filenames[key];
                imageElm.onload = () => {
                    var diff = {};
                    diff[key] = {state: 'loaded', element: imageElm};
                    images = this.update(images, diff);
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

    newMouseStateEnv(elm) {
        var x = 0, y = 0;
        var buttons = 0;
        elm.addEventListener('mousemove', function (event) {
            // ref: http://cpplover.blogspot.com/2009/06/dom-level-3.html
            var elm = event.target;
            var logicalWidth  = elm.clientWidth;
            var logicalHeight = elm.clientHeight;
            var clientRect = elm.getBoundingClientRect();
            var realWidth  = clientRect.width
            var realHeight = clientRect.height;
            var scaleX = realWidth  / logicalWidth;
            var scaleY = realHeight / logicalHeight;
            x = Math.floor((event.clientX - clientRect.left) / scaleX);
            y = Math.floor((event.clientY - clientRect.top)  / scaleY);
            buttons = event.which;
        }, false);
        elm.addEventListener('mouseup', function (event) {
            buttons = 0;
        }, false);
        elm.addEventListener('mousedown', function (event) {
            buttons = event.which;
        }, false);
        elm.addEventListener('mouseout', function (event) {
            buttons = 0;
        }, false);
        function getState(mouseState) {
            var buttonState = 0;
            if (mouseState !== null && buttons !== 0) {
                buttonState = mouseState.buttonState + 1;
            }
            return {
                x: x,
                y: y,
                buttonState: buttonState,
            };
        }
        return {
            get getState() { return getState; },
        };
    }

    mainLoop(canvas, context, imageLoader, mouseStateEnv, mouseState, state, update, draw) {
        var canvasSize = {
            width:  canvas.width,
            height: canvas.height,
        };
        var nextMouseState = mouseStateEnv.getState(mouseState);
        var images = imageLoader.getImages();
        var newState;
        newState = update.update(canvasSize, images, nextMouseState, state);
        context.clearRect(0, 0, canvasSize.width, canvasSize.height);
        context.save();
        draw.draw(canvas, context, images, newState);
        context.restore();
        window.requestAnimationFrame(() => {
            this.mainLoop(canvas, context, imageLoader, mouseStateEnv, nextMouseState,
                          newState, update, draw);
        });
    }

    run(canvas, imageFilenames, state, update, draw) {
        var context = canvas.getContext('2d');
        var imageLoader   = this.newImageLoader(imageFilenames);
        var mouseStateEnv = this.newMouseStateEnv(canvas);
        this.mainLoop(canvas, context, imageLoader, mouseStateEnv, null, state, update, draw);
    }
}
