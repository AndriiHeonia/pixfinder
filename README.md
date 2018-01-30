Pixfinder is an experimental JavaScript library for object detection.

## Table of Contents

- [Demos](#demos)
- [How it works](#how-it-works)
- [API](#api)
    - [findAll](#findall)
    - [find](#find)
    - [util.dom](#utildom)
    - [Point](#point)
- [Development](#development)
- [Changelog](#changelog)

## Demos

See live demos here:
- <a href="http://andriiheonia.github.io/pixfinder/planes" target="_blank">Airplanes counter</a>;
- <a href="http://andriiheonia.github.io/pixfinder/beach" target="_blank">Dry coast area calculation</a>.

## How it works

Pixfinder analyzes image (in a quite naive way) and extracts coordinates of each object. It detects objects by several criterias, the most important criteria is color.

For example we have an aerial shot of planes and we want to know how many planes at the airport right now:

<img src="https://raw.githubusercontent.com/AndriiHeonia/pixfinder/master/readme-imgs/planes.jpg" />

To solve this problem we need to write several lines of code and Pixfinder will find all planes on the image. So let's find all planes and draw them all on the canvas:

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
<img src="https://raw.githubusercontent.com/AndriiHeonia/pixfinder/master/readme-imgs/planes-result.png" />

## API

### findAll

Search all objects on the image.

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
                <code>pix.findAll(&lt;Object&gt;&nbsp;options)</code>
            </td>
            <td>
                Array
            </td>
            <td>
                Detects objects by the given options.
            </td>
        </tr>
    </tbody>
</table>

#### options

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
            <td>Loaded image or canvas element that has to be analyzed.</td>
        </tr>
        <tr>
            <td>colors</td>
            <td>Array</td>
            <td></td>
            <td>Colors of objects to find.</td>
        </tr>
        <tr>
            <td>tolerance</td>
            <td>Number</td>
            <td>50</td>
            <td>Color variation (number of shades). Helps to detect objects not only by strict colors (<code>colors</code> option), but by their shades too.</td>
        </tr>
        <tr>
            <td>accuracy</td>
            <td>Number</td>
            <td>2</td>
            <td>If accuracy = 1 then Pixfinder analyzes each pixel of the image, if accuracy = 2 then each 2nd pixel, and so on. Large number for better performance and worse quality and vice versa. The number should be a positive integer.</td>
        </tr>
        <tr>
            <td>distance</td>
            <td>Number</td>
            <td>10</td>
            <td>Distance between objects (in pixels). During the image analysis Pixfinder detects all pixels according to specified colors and then splits them into several objects by distance. If distance between two pixels is shorter than this option then pixels belong to the same object.</td>
        </tr>
        <tr>
            <td>clearNoise</td>
            <td>Boolean | Number</td>
            <td>false</td>
            <td>Removes all small objects after the image analysis. If <code>false</code> then noise clearing is disabled. If number is set then all objects that contain less than specified number of pixels will be removed.</td>
        </tr>       
    </tbody>
</table>

### find

Starts searching from the start point and returns one object that belongs to this point. This method should be useful for example if you want to highlight object under the mouse cursor.

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
                <code>pix.find(&lt;Object&gt;&nbsp;options)</code>
            </td>
            <td>
                Array
            </td>
            <td>
                Returns points of the object which belongs to the startPoint.
            </td>
        </tr>
    </tbody>
</table>

#### options

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
            <td>Loaded image or canvas element that has to be analyzed.</td>
        </tr>
        <tr>
            <td>colors</td>
            <td>Array</td>
            <td></td>
            <td>Colors of objects to find.</td>
        </tr>
        <tr>
            <td>startPoint</td>
            <td>Point</td>
            <td></td>
            <td>Point from which to start the object pixels search.</td>
        </tr>
        <tr>
            <td>tolerance</td>
            <td>Number</td>
            <td>50</td>
            <td>Color variation (number of shades). Helps to detect objects not only by strict colors (<code>colors</code> option), but by their shades too.</td>
        </tr>
        <tr>
            <td>distance</td>
            <td>Number</td>
            <td>10</td>
            <td>Distance between objects (in pixels). If distance between two pixels is shorter than this option then Pixfinder decides that pixels belong to the same object.</td>
        </tr>
    </tbody>
</table>

### util.dom

Various DOM utility functions.

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
            <td>onload(&lt;HTMLImageElement&gt; img, &lt;Function&gt; func)</code></td>
            <td></td>
            <td>Calls <code>func</code> function when <code>img</code> image is loaded.</td>
        </tr>
        <tr>
            <td>loaded(&lt;HTMLImageElement&gt; img)</code></td>
            <td>Boolean</td>
            <td>Checks whether <code>img</code> image has been loaded.</td>
        </tr>
    </tbody>
</table>

### Point

Contains information about point.

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

## To-do

* write more demos;
* improve performance;
* make concavity param optional;
* think about configurable color comparison function;
* check and ensure that behaviour with distance 1px is correct;
* write tests.

## Development

    npm install     # install dependencies
    gulp build      # check the code with JSHint, run tests and build dist
    gulp            # build and watch for the src changes

## Changelog

### 0.2.4 &mdash; 30.03.2015
* Minor package.json and copyright fixes

### 0.2.3 &mdash; 04.02.2015
* Minor package.json fixes

### 0.2.2 &mdash; 04.02.2015
* Minor package.json fixes

### 0.2.1 &mdash; 27.10.2014
* Readme fixes

### 0.2.0 &mdash; 27.10.2014
* API changes without backward compatibility

### 0.1.0 &mdash; 16.05.2014

* First Pixfinder release (unstable alpha version)
