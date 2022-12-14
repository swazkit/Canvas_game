const canvas = document.querySelector('canvas')
const c = canvas.getContext("2d")

canvas.width = innerWidth
canvas.height = innerHeight

const scoreEl = document.querySelector("#score")

const startButton = document.querySelector("#start")

const model = document.querySelector("#modelEl")

const bigScoreEl = document.querySelector("#bigScoreEl")

class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
        c.fillStyle = this.color
        c.fill();
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
        c.fillStyle = this.color
        c.fill();
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}
class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
        c.fillStyle = this.color
        c.fill();
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

const friction = 0.99
class Particles {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }

    draw() {
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
        c.fillStyle = this.color
        c.fill();
        c.restore()
    }

    update() {
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }
}

const x = canvas.width / 2
const y = canvas.height / 2

let player = new Player(x, y, 10, '#FFFFFF')


let projectiles = []
let particles = []
let enemies = []
let score = 0

function init() {
    player = new Player(x, y, 10, '#FFFFFF')
    projectiles = []
    particles = []
    enemies = []
    score = 0
    scoreEl.innerHTML = score
    bigScoreEl.innerHTML = score
    startButton.innerHTML = "Restart"
}

function spawnEnemies() {
    setInterval(() => {
        const radius = Math.random() * (30 - 6) + 4
        let x
        let y
        if(Math.random() < 0.5){
        x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
        y = Math.random() * canvas.height
        } else {
        x = Math.random() * canvas.width
        y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
        }
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`
        const angle  = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        enemies.push(new Enemy(x, y, radius, color, velocity))
    }, 1000);
}

let animationId
function animate() {
    animationId = requestAnimationFrame(animate)
    c.fillStyle = "rgba(0, 0, 0, 0.1)"
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.draw()
    particles.forEach(particle => {
        if(particle.alpha > 0){
            particle.update()
        }
    })
    projectiles.forEach((projectile, index) => 
        {
            projectile.update()

            if (projectile.x + projectile.radius < 0 ||
                projectile.x - projectile.radius > canvas.width ||
                projectile.y + projectile.radius < 0 ||
                projectile.y - projectile.radius > canvas.height
                ) {
                setTimeout(() => {
                    projectiles.splice(index, 1)
                }, 0)
            }
        })

    enemies.forEach((enemy, index) => {
        enemy.update()

        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
        if (dist - enemy.radius - player.radius < 1) {
            cancelAnimationFrame(animationId)
            model.style.display = "flex"
            bigScoreEl.innerHTML = score
        }

        projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

            //When projectiles touch enemy
            if (dist - enemy.radius - projectile.radius < 1)
             {
                for(let i = 0; i < enemy.radius * 2; i++){
                    particles.push(new Particles (projectile.x, projectile.y, Math.random() * 2, enemy.color, {x: (Math.random() - 0.5) * 8, y: (Math.random() - 0.5) * 8}))
                }
                if(enemy.radius - 10 > 10) {
                    score += 100
                    scoreEl.innerHTML = score
                    gsap.to(enemy, {
                        radius:enemy.radius - 10
                    })
                    setTimeout(() => {
                        projectiles.splice(projectileIndex, 1)
                    }, 0)
                } else {
                score += 250
                scoreEl.innerHTML = score
                setTimeout(() => {
                    enemies.splice(index, 1)
                    projectiles.splice(projectileIndex, 1)
                }, 0)

                }
            }
        })
    })
}

addEventListener('click', (event) => {
    const angle  = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2)
    const velocity = {
        x: Math.cos(angle) * 8,
        y: Math.sin(angle) * 8
    }
    projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, "#FFFFFF", velocity))
})


startButton.addEventListener('click', () => {
    init()
    animate()
    spawnEnemies()
    model.style.display = "none"
})