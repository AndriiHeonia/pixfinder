Pixfinder is a JavaScript library for object detection.

## How it works

Pixfinder analyzes image and extracts coordinates of each object. Objects should be detected by several criteria, the most important of which is the color.

For example we have aerial shot of planes and want to know how many planes at the airport right now:

<img src="https://raw.githubusercontent.com/AndreyGeonya/pixfinder/master/examples/planes/img.jpg" />

To solve this problem we need to write several lines of code and Pixfinder will find all planes in the image:

    var myImg = document.getElementById('myImg');
    pixfinder({
        img: myImg,
        colors: ['eff1f0'],
        clearNoise: 50,
        onload: draw
    });

The callback function draw() takes one parameter that contains the coordinates of each aircraft and shows their count:

    function draw(e) {
        document.getElementById('count').innerHTML = e.objects.length;
    }

For clarity, let's add some code to draw() function and show the contours of planes that have been identified by Pixfinder:

    function draw(e) {
        var c = document.getElementById("canv"),
            ctx = c.getContext("2d");

        ctx.fillStyle = '000000';
        ctx.beginPath();
        for (var i = 0; i < e.objects.length; i++) {
            for (var j = 0; j < e.objects[i].length; j++) {
                ctx.fillRect(e.objects[i][j].x, e.objects[i][j].y, 1, 1);   
            };
        }
        ctx.closePath();

        document.getElementById('count').innerHTML = e.objects.length;
    }

Result:
<img src="https://raw.githubusercontent.com/AndreyGeonya/pixfinder/master/examples/planes/screenshot.png" />

Full code of this example available [here](https://github.com/AndreyGeonya/pixfinder/blob/master/examples/planes/index.html).

## API

### pixfinder

The main function that detects objects in the image.

#### Function

<table>
    <thead>
        <tr>
            <th>Function</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>
                <code>
                    pixfinder(&lt;Object&gt; options)
                </code>
            </td>
            <td>
                Detects objects by given options.
            </td>
        </tr>
    </tbody>
</table>

#### Options

<table>
    <thead>
        <tr>
            <th>Option</th>
            <th>Type</th>
            <th>Default</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>img</td>
            <td>HTMLImageElement | String</td>
            <td></td>
            <td>Image element (or its id) which has to be analyzed.</td>
        </tr>
        <tr>
            <td>colors</td>
            <td>Array</td>
            <td></td>
            <td>Colors of the objects that should be found.</td>
        </tr>
        <tr>
            <td>tolerance</td>
            <td>Number</td>
            <td>50</td>
            <td>Permissible variation of the color (number of shades). Helps to detect objects not only by strict colors ("colors" option), but by their shades too.</td>
        </tr>
        <tr>
            <td>accuracy</td>
            <td>Number</td>
            <td>2</td>
            <td>If accuracy = 1 then Pixfinder analyzes each pixel of the image, if accuracy = 2 then Pixfinder analyzes each 2nd pixel, etc. Large number for better performance and worse quality and vice versa. Number should be positive integer.</td>
        </tr>
        <tr>
            <td>distance</td>
            <td>Number</td>
            <td>10</td>
            <td>Distance between objects (in pixels). During image analysis Pixfinder detects all pixels according to specified colors and then splits them to several objects by distance. If distance between two pixels lesser then this option then pixels belong to the same object.</td>
        </tr>
        <tr>
            <td>fill</td>
            <td>Boolean</td>
            <td>false</td>
            <td>If "false" then objects will contain only their borders, else objects will be filled by all pixels.</td>
        </tr>
        <tr>
            <td>clearNoise</td>
            <td>Boolean | Number</td>
            <td>false</td>
            <td>Removes all small objects after image analysis. If "false" then noise clearing is disabled, else if number is setted then all objects that contains less than specified number of pixels will be removed.</td>
        </tr>
        <tr>
            <td>onload</td>
            <td>Function</td>
            <td></td>
            <td>Callback that have to be called after image loading and analysis. Accepts event that contains all objects extracted from image. All objects are saved in "event.objects" property, each of them is Pixel object with 'x' and 'y' properties.</td>
        </tr>        
    </tbody>
</table>

### Util.Color

Various color utility functions, used by Pixfinder internally.

<table>
    <thead>
        <tr>
            <th>Method</th>
            <th>Returns</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><b>toRGB</b>(&lt;String&gt; color)</code></td>
            <td>Array</td>
            <td>Transforms hex color to RGB components.</td>
        </tr>
        <tr>
            <td><b>toHex</b>(&lt;Array&gt; rgb)</code></td>
            <td>String</td>
            <td>Transforms RGB components to hex color.</td>
        </tr>
        <tr>
            <td><b>areSimilar</b>( &lt;Array&gt; rgb1, &lt;Array&gt; rgb2, &lt;Number&gt; tolerance)</code></td>
            <td>Boolean</td>
            <td>Checks or colors are similar. Parameter "tolerance" is number of shades used during the checking.</td>
        </tr>
    </tbody>
</table>

### Util.Math

Various math utility functions, used by Pixfinder internally.

<table>
    <thead>
        <tr>
            <th>Method</th>
            <th>Returns</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><b>getDistance</b>(&lt;Pixel&gt; px1, &lt;Pixel&gt; px2)</code></td>
            <td>Number</td>
            <td>Returns distance between two pixels.</td>
        </tr>
    </tbody>
</table>

### Pixel

Contains information about one pixel.

<table>
    <thead>
        <tr>
            <th>Property</th>
            <th>Type</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>x</td>
            <td>Number</td>
            <td>The x coordinate.</td>
        </tr>
        <tr>
            <td>y</td>
            <td>Number</td>
            <td>The y coordinate.</td>
        </tr>
    </tbody>
</table>

## Changelog

### 0.0.1 &mdash; 16.05.2014

* First Pixfinder release (unstable alpha version)