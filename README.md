Pixfinder is a JavaScript library for object detection.

## Table of Contents

- [How it works](#how-it-works)
- [API](#api)
    - [findAll](#findall)
    - [find](#find)
- [Development](#development)
- [Changelog](#changelog)

## How it works

Pixfinder analyzes image and extracts coordinates of each object. Objects should be detected by several criteria, the most important of which is the color.

For example we have aerial shot of planes and want to know how many planes at the airport right now:

<img src="https://raw.githubusercontent.com/AndreyGeonya/pixfinder/bfs/readme-imgs/planes.jpg" />

To solve this problem we need to write several lines of code and pixfinder will find all planes in the image. So, let's find all planes and draw them all on canvas:

    var img = document.getElementById('img');

    pix.util.dom.onload(img, function() {
        var planes = pix.findAll({
            img: img,
            distance: 5,
            colors: ['eff1f0'],
            clearNoise: 50
        });
        document.getElementById('count').innerHTML = planes.length;
        planes.forEach(draw);
    });

    function draw(plane) {
        var ctx = document.getElementById("canv").getContext("2d");
        ctx.beginPath();
        plane.forEach(function(point) {
            ctx.arc(point.x, point.y, 1, 0, 2 * Math.PI);
        });
        ctx.stroke();
        ctx.closePath();
    }

Result:
<img src="https://raw.githubusercontent.com/AndreyGeonya/pixfinder/bfs/readme-imgs/planes-result.png" />

## API

### findAll

Search all objects in image.

<table>
    <thead>
        <tr>
            <th>Function</th>
            <th>Return</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>
                <code>pix.findAll(&lt;Object&gt; options)</code>
            </td>
            <td>
                Array
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
            <td>HTMLImageElement | HTMLCanvasElement</td>
            <td></td>
            <td>Loaded image or canvas element which has to be analyzed.</td>
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
            <td>If accuracy = 1 then Pixfinder analyzes each pixel of the image, if accuracy = 2 then each 2nd pixel, etc. Large number for better performance and worse quality and vice versa. Number should be positive integer.</td>
        </tr>
        <tr>
            <td>distance</td>
            <td>Number</td>
            <td>10</td>
            <td>Distance between objects (in pixels). During image analysis Pixfinder detects all pixels according to specified colors and then splits them to several objects by distance. If distance between two pixels lesser then this option then pixels belong to the same object.</td>
        </tr>
        <tr>
            <td>clearNoise</td>
            <td>Boolean | Number</td>
            <td>false</td>
            <td>Removes all small objects after image analysis. If "false" then noise clearing is disabled, else if number is setted then all objects that contains less than specified number of pixels will be removed.</td>
        </tr>       
    </tbody>
</table>

### find

Starts searching from start point and returns object that belongs to it. This method should be useful for example if you want to highlight building under the mouse cursor.

<table>
    <thead>
        <tr>
            <th>Function</th>
            <th>Return</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>
                <code>pix.find(&lt;Object&gt; options)</code>
            </td>
            <td>
                Array
            </td>
            <td>
                Returns points of the object that belongs to the startPoint.
            </td>
        </tr>
    </tbody>
</table>

## Development

    npm install     # install dependencies
    npm gulp build  # check the code with JSHint, run tests and build dist
    npm gulp        # run `build` and watch for source changes

## Changelog

### 0.2.0 &mdash; 27.10.2014
* API changes without backward compatibility

### 0.1.0 &mdash; 16.05.2014

* First Pixfinder release (unstable alpha version)