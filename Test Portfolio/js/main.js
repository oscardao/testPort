let canvas;
let canvasContex;
let games = [];
let fps = 60;
let spawnAreaX = 50;
let spawnAreaY = 50;

let collisionForce = 100;

$(document).ready(function () {
    canvas = document.getElementById("canvas");
    canvasContex = canvas.getContext("2d");

    refreshCanvas();
    $(window).resize(function () { refreshCanvas(); });

    $.getJSON("js/games.json", function (json) {
        //console.log(json);
        for (var i = 0; i < json.length; i++) {
            let gameDisplay = createGameDisplay(json[i]);
            games.push(gameDisplay);
        }
        setInterval(function () { update(); }, 1000 / fps);
    });

    fetch("http://api.openweathermap.org/data/2.5/weather?q=Odense,dk&units=metric&APPID=632716eda556591da435a894db656108")
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                $('#weather').text('Odense, Denmark');
                throw new Error('Something went wrong');
            }
        })
        .then(data => {
            //console.log(data);
            let degrees = Math.round(data.main.temp);
            let weather = data.weather[0].main;
            let degreeSymbol = '\xB0';
            $('#weather').text(`${weather} and ${degrees}${degreeSymbol}C in Odense, Denmark`);
        })
        .catch(err => console.log(err));

});

function update() {
    canvasContex.clearRect(0, 0, canvas.width, canvas.height);

    games.forEach(element => {
        element.handleCollision();
        element.draw();
    });
}

function refreshCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - $('#info').outerHeight(true) - $('#title').outerHeight(true) - 10;
    canvasContex.clearRect(0, 0, canvas.width, canvas.height);
}

function createGameDisplay(data) {
    let x = getRandomInt(spawnAreaX) + canvas.width * 0.5;
    let y = getRandomInt(spawnAreaY) + canvas.height * 0.5;

    return new Display(data.name, data.radius, data.color, x, y);
}

class Display {
    constructor(name, radius, color, x, y) {
        this.name = name;
        this.radius = radius;
        this.color = color;
        this.point = new Point(x, y);
    }

    handleCollision() {
        for (var i = 0; i < games.length; i++) {
            let other = games[i];

            if (JSON.stringify(this) === JSON.stringify(other)) {
                continue;
            }

            let deltaX = other.point.x - this.point.x;
            let deltaY = other.point.y - this.point.y;
            let distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if (distance < this.radius + other.radius) {
                this.isMoving = true;
                other.isMoving = true;

                let length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                let step = this.radius + other.radius - length;

                if (step > 0) {
                    deltaX /= length; deltaY /= length;

                    this.point.x -= deltaX * step / 2; this.point.y -= deltaY * step / 2;
                    other.point.x += deltaX * step / 2; other.point.y += deltaY * step / 2;
                }
            }

        }
    }

    draw() {
        canvasContex.save();

        canvasContex.beginPath();
        canvasContex.arc(this.point.x, this.point.y, this.radius, 0, 2 * Math.PI, false);
        canvasContex.closePath();
        canvasContex.fillStyle = this.color;
        canvasContex.fill();

        canvasContex.fillStyle = '#ffffff';
        canvasContex.font = "30px mini-wakuwaku";
        canvasContex.textAlign = "center";
        canvasContex.textBaseline = "middle";

        let size = this.radius * 2;

        canvasContex.fillText(this.name, this.point.x, this.point.y);
    }
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

}


function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}