declare module "quickchart-js" {
    import { ChartConfiguration } from "chart.js";

    export default class QuickChart {
        /**
         * **You must set this before generating a URL!**
         * ---
         * Use this config to customize the Chart.js config object that defines your chart.
         */
        public setConfig(chartConfig: ChartConfiguration): this;

        /**
         * Sets the width of the chart in pixels.
         * @param width Defaults to `500`
         */
        public setWidth(width: number): this;

        /**
         * Sets the height of the chart in pixels.
         * @param height Defaults to `300`
         */
        public setHeight(height: number): this;

        /**
         * Sets the format of the chart.
         * @param format Defaults to `png`, `svg` is also valid.
         */
        public setFormat(format: string): this;
        
        /**
         * Sets the background color of the chart.
         * Any valid HTML color works.
         * @param color Defaults to `#ffffff` (white). Also takes rgb, rgba, and hsl values.
         */
        public setBackgroundColor(color: string): this;
        
        /**
         * Sets the device pixel ratio of the chart.
         * This will multiply the number of pixels by the value.
         * This is usually used for retina displays.
         * @param ratio Defaults to `1.0`
         */
        public setDevicePixelRatio(ratio: number): this;
        
        /**
         * Returns a `URL` that will display the chart image when loaded.
         */
        public getUrl(): string;

        /**
         * Uses the `quickchart.io` web service to create a fixed-length chart `URL` that displays the chart image.
         * The Promise resolves with a `URL` such as https://quickchart.io/chart/render/f-a1d3e804-dfea-442c-88b0-9801b9808401.
         * ---
         * **Note that short URLs expire after a few days for users of the free service.
         * You can subscribe to keep them around longer.**
         */
        public getShortUrl(): Promise<string>;

        /**
         * Creates a binary buffer that contains your chart image.
         */
        public toBinary(): Promise<Buffer>;

        /**
         * Returns a base 64 data URL beginning with data:image/png;base64.
         */
        public toDataUrl(): string;
        
        /**
         * Creates a file containing your chart image.
         * @param pathOrDescriptor 
         */
        public toFile(pathOrDescriptor: string): Promise<File>;
    }
}