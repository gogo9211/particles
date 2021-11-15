(function () {
    var canvas;
    var ctx;

    var particles = [];
    var particlesCount = 0;

    const maxParticles = 100;
    const particleSize = 8;

    var mouseX = -500;
    var mouseY = -500;

    onmousemove = function(e) { 
        var rect = canvas.getBoundingClientRect();

        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    }

    function getRandomVelocity() {
        return Math.random() * 2 - 1;
    }

    function getRandomPosition() {
        var x = Math.random() * canvas.width;
        var y = Math.random() * canvas.height;

        for (var i = 0; i < particles.length; ++i) {
            var particle = particles[i];
  
            if (x < particleSize || x > canvas.width - particleSize)
                x = Math.random() * canvas.width;

            if (y < particleSize || y > canvas.height - particleSize)
                y = Math.random() * canvas.height;

            if (Math.abs(x - particle.x) < particleSize * 2 && Math.abs(y - particle.y) < particleSize * 2)
                return getRandomPosition();
        }

        return [x, y];
    }

    function init() {
        canvas = document.getElementById("particles");
        ctx = canvas.getContext("2d");
    
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
        
        particlesCount = Math.floor(canvas.width * canvas.height / (particleSize * particleSize * 100)) / 4;
        
        if (particlesCount > maxParticles) {
            particlesCount = maxParticles;
        }
    
        for (var i = 0; i <= 3; ++i)
            particles[i] = [];

        for (var i = 0; i < particlesCount; ++i) {
            const position = getRandomPosition();

            particles[0][i] = position[0];
            particles[1][i] = position[1];

            particles[2][i] = getRandomVelocity();
            particles[3][i] = getRandomVelocity();
        }

        main();
    }

    function drawLine(fromX, fromY, toX, toY) {
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();
        ctx.closePath();
    }

    function drawParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = "green";

        for (var i = 0; i < particlesCount; ++i) {
            ctx.beginPath();
            ctx.arc(particles[0][i], particles[1][i], particleSize, 0, 2 * Math.PI, false);
            ctx.fill();
            ctx.closePath();
        }
    }
        
    //draw lines to particles that are close to each other
    function drawLines() {
        ctx.strokeStyle = "green";
        ctx.lineWidth = 2;

        for (var i = 0; i < particlesCount; ++i) {
            //draw line when mouse is close to particle
            if (Math.abs(particles[0][i] - mouseX) < 100 && Math.abs(particles[1][i] - mouseY) < 100)
                drawLine(particles[0][i], particles[1][i], mouseX, mouseY);

            //draw line when particle is close to another particle
            for (var j = i + 1; j < particlesCount; ++j)
                if (Math.abs(particles[0][i] - particles[0][j]) < 100 && Math.abs(particles[1][i] - particles[1][j]) < 100)
                    drawLine(particles[0][i], particles[1][i], particles[0][j], particles[1][j]);
        }
    }

    function applyVelocity() {
        for (var i = 0; i < particlesCount; ++i) {
            particles[0][i] += particles[2][i];
            particles[1][i] += particles[3][i];
        }
    }

    function DoParticlesColide(p1x, p1y, r1, p2x, p2y, r2) {
        var a;
        var x;
        var y;
      
        a = r1 + r2 - 1.5;
        x = p1x - p2x;
        y = p1y - p2y;
      
        if (a > Math.sqrt((x * x) + (y * y)))
            return true;
        else
            return false;
    }

    function checkCollision() {
        //check if particles collide with map borders
        for (var i = 0; i < particlesCount; ++i) {
            if (particles[0][i] + particleSize >= canvas.width || particles[0][i] - particleSize <= 0)
                particles[2][i] = -particles[2][i];

            if (particles[1][i] + particleSize >= canvas.height || particles[1][i] - particleSize <= 0)
                particles[3][i] = -particles[3][i];
        }

        //check if particles collide with each other
        for (var i = 0; i < particlesCount; ++i) {
            for (var j = i + 1; j < particlesCount; ++j) {
                if (DoParticlesColide(particles[0][i], particles[1][i], particleSize, particles[0][j], particles[1][j], particleSize)) {
                    particles[2][i] = -particles[2][i]; particles[3][i] = -particles[3][i];

                    particles[2][j] = -particles[2][j]; particles[3][j] = -particles[3][j];

                    //apply velocity to temp particles to check if they collide with each other again to prevent them from colliding forever
                    var tempParticles = particles;

                    tempParticles[0][i] += particles[2][i]; tempParticles[1][i] += particles[3][i];
                    tempParticles[0][j] += particles[2][j]; tempParticles[1][j] += particles[3][j];

                    if (DoParticlesColide(tempParticles[0][i], tempParticles[1][i], particleSize, tempParticles[0][j], tempParticles[1][j], particleSize)) {
                        const pos0 = getRandomPosition(); const pos1 = getRandomPosition();

                        particles[0][i] = pos0[0]; particles[1][i] = pos0[1];
                        particles[0][j] = pos1[0]; particles[1][j] = pos1[0];
                    }
                }
            }
        }
    }

    function main() {
        checkCollision();
        applyVelocity();
        drawParticles();
        drawLines();

        requestAnimationFrame(main);
    }

    init();
}());