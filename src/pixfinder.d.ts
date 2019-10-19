
export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface FindAllOptions {
  /** If accuracy = 1 then Pixfinder analyzes each pixel of the image, if accuracy = 2 then each 2nd pixel, and so on. 
    *  Large number for better performance and worse quality and vice versa. The number should be a positive integer.
    *  Optional. (Default: 2)
    */
  accuracy: number;

  /** clearNoise: Removes all small objects after the image analysis. If false then noise clearing is disabled.
    *  If number is set then all objects that contain less than specified number of pixels will be removed.
    *  Optional. (Default: false)
    */
  clearNoise: number | boolean;

  /** colors: Colors of objects to find.
    *  Required. 
    */
  colors: string[];  // Colors of objects to find.

  /** Determines the concavity of object edges. Internally Pixfinder uses hull.js library 
    *  to build object boundary. Please see hull.js documentation for more information about this parameter.
    *  Optional. (Default: 10)
    */
  concavity: number;

  /** distance: Distance between objects (in pixels). During the image analysis Pixfinder detects all pixels
    *  according to specified colors and then splits them into several objects by distance. If distance between
    *  two pixels is shorter than this option then pixels will be grouped as part the same object.
    *  Optional. (Default: 10)
    */
  distance: number;

  /** img: A loaded image or canvas element to be analyzed by pixfinder.
    *  Required.
    */
  img: HTMLImageElement | HTMLCanvasElement;
  
  /** tolerance: Color variation (number of shades). Helps to detect objects not only by strict colors (colors option), 
    *  but by their shades too.
    *  Optional. (Default: 50)
    */
  tolerance: number;
}

export interface FindOptions {
  /** Point from which to start the object pixels search.
    *  Required.
    */
  startPoint: Point;

  /** colors: Colors of objects to find.
    *  Required.
    */
  colors: string[];  // Colors of objects to find.

  /** Determines the concavity of object edges. Internally Pixfinder uses hull.js library 
    *  to build object boundary. Please see hull.js documentation for more information about this parameter.
    *  Optional. (Default: 10)
    */
  concavity: number;

  /** distance: Distance between objects (in pixels). During the image analysis Pixfinder detects all pixels
    *  according to specified colors and then splits them into several objects by distance. If distance between
    *  two pixels is shorter than this option then pixels will be grouped as part the same object.
    *  Optional. (Default: 10)
    */
  distance: number;

  /** img: A loaded image or canvas element to be analyzed by pixfinder.
    *  Required.
    */ 
  img: HTMLImageElement | HTMLCanvasElement;
  
  /** tolerance: Color variation (number of shades). Helps to detect objects not only by strict colors (colors option), 
    *  but by their shades too.
    *  Optional. (Default: 50)
    */
  tolerance: number;
}

/** Starts searching from the start point and returns one object that belongs to this point. 
  * This method should be useful for example if you want to highlight object under the mouse cursor.
  */
export function find (options: Partial<FindOptions>): Point[];

/** Search all objects on the image.
  */ 
export function findAll (options: Partial<FindAllOptions>): Point[][];
