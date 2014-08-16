class ImageLoader {

    private images: { [filename: string]: HTMLImageElement } = {};

    /*public constructor(filenames: { [filename : string]: string }) {
        for (var key in filenames) {
            images[key] = {state: 'loading'};
            var imageElm;
            imageElm = new Image();
            imageElm.src = filenames[key];
            imageElm.onload = () => {
                var diff = {};
                diff[key] = {state: 'loaded', element: imageElm};
                images = this.update(images, diff);
            };
        }
    }

    public get(filename: string):HTMLImageElement {
        
    }*/

}
