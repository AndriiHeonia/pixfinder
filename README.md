Pixfinder is a JavaScript library for object detection.

## How it works

Pixfinder analyzes image and extracts coordinates of each object. Objects should be detected by several criteria, the most important of which is the color.

For example we have a photo from airport camera and want to know how many planes at the airport right now:

<img src="https://raw.githubusercontent.com/AndreyGeonya/pixfinder/master/examples/planes/img.jpg" />

To solve this problem we need to write several lines of code and Pixfinder will find all planes on image:

    var myImg = document.getElementById('myImg');
    var p = pixfinder({
        img: myImg,
        colors: ['eff1f0'],
        clearNoise: 50,
        onload: draw
    });

Callback function draw takes one parameter that contains coordinates of each plane and should display count of planes:

    function draw(e) {
        document.getElementById('count').innerHTML = e.objects.length;
    }

For clarity, let's draw the contours of planes that have been identified by Pixfinder:

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

Version: 0.0.1

