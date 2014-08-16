class ImageDataCache {

    private canvas: HTMLCanvasElement;
    private cache: { [path: string]: ImageData } = {};

    public constructor() {
        this.canvas = document.createElement('canvas');
    }

    public get(img: HTMLImageElement): ImageData {
        if (img.src in this.cache) {
            return this.cache[img.src];
        }
        this.canvas.width  = img.width;
        this.canvas.height = img.height;
        var context = this.canvas.getContext('2d');
        context.drawImage(img, 0, 0);
        var imageData = context.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.cache[img.src] = imageData;
        return imageData;
    }
}
