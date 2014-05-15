Pixfinder is a JavaScript library for object detection.

## How it works

Pixfinder analyzes image and extracts coordinates of each object. Objects should be detected by several criteria, the most important of which is the color.

For example we have aerial shot of planes and want to know how many planes at the airport right now:

<img src="https://raw.githubusercontent.com/AndreyGeonya/pixfinder/master/examples/planes/img.jpg" />

To solve this problem we need to write several lines of code and Pixfinder will find all planes on image:

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
            
        for (var i = 0; i < e.objects.length; i++) {
            ctx.fillStyle = '000000';
            ctx.beginPath();
            for (var j = 0; j < e.objects[i].length; j++) {
                ctx.fillRect(e.objects[i][j].x, e.objects[i][j].y, 1, 1);   
            };
            ctx.fill();
            ctx.closePath();
        }

        document.getElementById('count').innerHTML = e.objects.length;
    }

Result:
<img src="https://raw.githubusercontent.com/AndreyGeonya/pixfinder/master/examples/planes/screenshot.png" />

Full code of this example available [here](https://github.com/AndreyGeonya/pixfinder/blob/master/examples/planes/index.html).

## Changelog

### 0.0.1 &mdash; 16.05.2014

* First Pixfinder release (unstable alpha version)