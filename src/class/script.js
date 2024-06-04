const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const ghostImage = new Image();
ghostImage.src = '/images/fantome1.png';

const newGhostImage = new Image();
newGhostImage.src = '/images/fantome1_naz.png'; // Remplacer par le chemin correct

const playerMissileImage = new Image();
playerMissileImage.src = '/images/shurik.png'; // Remplacer par le chemin correct

const newPlayerImage = new Image();
newPlayerImage.src = '/images/bra_naz.png'; // Remplacer par le chemin correct

const bossimage = new Image();
bossimage.src = '/images/ninjaboss.png'; // Remplacer par le chemin correct

const newBossImage = new Image();
newBossImage.src = '/images/hitler.png'; // Remplacer par le chemin correct

const enemyMissileImage1 = '/images/boulenrj.png'; // Image par défaut des missiles ennemis
const enemyMissileImage2 = '/images/boulenrj_naz.png'; // Nouvelle image des missiles ennemis
let currentEnemyMissileImage = enemyMissileImage1; // Image actuelle des missiles ennemis


// Charger les images

class Player {
    constructor() {
        this.points = 0;
        this.x = canvas.width / 1.4;
        this.y = canvas.height - 200;
        this.size = 30;
        this.speed = 5;
        this.direction = { x: 0, y: 0 };
        this.missiles = [];
        this.health = 2500;
        this.maxHealth = 2500;
        this.fireRate = 700;
        this.lastFired = Date.now();
        this.baseSize = 200;
        this.image = new Image();
        this.image.src = '/images/bra_sam.png';
        this.offsetX = -100; // Valeur constante pour décaler l'image vers la gauche
        this.offsetY = -100; // Valeur constante pour décaler l'image vers le bas

        this.image.onload = () => {
            this.aspectRatio = this.image.width / this.image.height;
        };
    }
    move() {
        this.x += this.direction.x * this.speed;
        this.y += this.direction.y * this.speed;
    
        // Limite de hauteur minimale pour le joueur (la moitié haute de la hauteur du canvas)
        const minAllowedHeight = canvas.height / 2;
        if (this.y < minAllowedHeight) this.y = minAllowedHeight; // Limite minimale à la moitié haute de la hauteur du canvas
    
        // Limite de largeur pour le joueur (déjà présent dans votre code)
        if (this.x < 0) this.x = 0;
        if (this.x > canvas.width - this.size) this.x = canvas.width - this.size;
    }
    
    

    fireMissile() {
        const currentTime = Date.now();
        if (currentTime - this.lastFired > this.fireRate) {
            const newMissile = new Missile(this.x + this.size / 2, this.y, { x: 0, y: -1 }, 'player');
            newMissile.image = playerMissileImage; // Utiliser la nouvelle image pour le missile du joueur
            this.missiles.push(newMissile);
            this.lastFired = currentTime;
        }
    }
    

    draw() {

        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillText('Points: ' + this.points, 680, 820); // Afficher les points en haut à gauche du canvas
        // Calculer la taille en fonction de la position verticale
        const size = this.baseSize + this.y + this.offsetY * 0.16;

        const width = size * this.aspectRatio;
        const height = size;

        ctx.drawImage(this.image, this.x + this.offsetX, this.y + this.offsetY, width, height);
        ctx.fillStyle = 'rgba(255, 100, 0, 0.5)';
        ctx.fillRect(600, 840, (this.health / this.maxHealth) * 200, 20);
    }

    checkCollisions(enemies) {
        this.missiles.forEach((missile, missileIndex) => {
            enemies.forEach((enemy, enemyIndex) => {
                if (
                    missile.x < enemy.x + enemy.size &&
                    missile.x + missile.size > enemy.x &&
                    missile.y < enemy.y + enemy.size &&
                    missile.y + missile.size > enemy.y
                ) {
                    enemy.health -= missile.damage;
                    if (enemy.health <= 0) {
                        enemies.splice(enemyIndex, 1); 
                        // Incrémenter les points du joueur lorsqu'un ennemi meurt
                        if (enemy instanceof BossEnemy) {
                            this.points += 500; // 500 points pour le BossEnemy
                            showPopup(); // Afficher le popup
                            gameRunning = false; // Arrêter le jeu
                        } else {
                            this.points += 100; // 100 points pour les ennemis normaux
                        }
                    }
                    this.missiles.splice(missileIndex, 1);
                }
            });
        });
    }
}



class Enemy {
    constructor(x, y, size, speed, health, fireRate) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed; // Utiliser la vitesse passée en paramètre
        this.health = health;
        this.maxHealth = health;
        this.fireRate = fireRate;
        this.lastFired = Date.now();
        this.missiles = [];
        this.baseSize = -60;
        this.horizontalCoefficient = 0.102; // Coefficient pour ajuster la position horizontale
        this.sizeCoefficient = 0.52; // Coefficient pour ajuster la taille
    }

    move() {
        if (this.y < canvas.height / 2) { // Arrêtez les ennemis avant le milieu (canvas.height / 2)
            this.y += this.speed;
        } else {
            // Déplacez l'ennemi de manière aléatoire sur l'axe horizontal
            this.x += (Math.random() - 0.5) * canvas.width * 0.001;

            if (this.x < 0) this.x = 0;
            if (this.x > canvas.width - this.size) this.x = canvas.width - this.size;
        }
        
        this.size = this.baseSize + this.y * this.sizeCoefficient;
    }

    fireMissile() {
        const currentTime = Date.now();
        if (currentTime - this.lastFired > this.fireRate) {
            const middleMissile = new Missile(this.x + this.size / 20, this.y + this.size, { x: 0, y: 0.7 }, 'enemy');
            middleMissile.image.src = currentEnemyMissileImage;
            this.missiles.push(middleMissile);
            this.lastFired = currentTime;
        }
    }

    draw() {
        ctx.drawImage(ghostImage, this.x, this.y, this.size, this.size);
    }

    checkCollisions(player) {
        this.missiles.forEach((missile, missileIndex) => {
            if (
                missile.x < player.x + player.size &&
                missile.x + missile.size > player.x &&
                missile.y < player.y + player.size &&
                missile.y + missile.size > player.y
            ) {
                player.health -= missile.damage;
                this.missiles.splice(missileIndex, 1);
            }
        });
    }
}


class BossEnemy extends Enemy {
    constructor(x, y) {
        super(x, y, 300, 0.3, 5000, 1500);
        
    }
    

    draw() {
        const bosssize = 50 + this.y * this.sizeCoefficient;
        const xOffset = 80; // Ajustez cette valeur pour décaler le BossEnemy vers la gauche
        ctx.drawImage(bossimage, this.x - xOffset, this.y, bosssize, bosssize); // Décalez le BossEnemy vers la gauche
        
        // Dessiner la barre de vie
        ctx.fillStyle = 'black';
        ctx.fillRect(this.x -20, this.y - 10, this.size, 5); // Décalez la barre de vie vers la gauche
        
        const healthPercentage = this.health / this.maxHealth;
        const barWidth = this.size * healthPercentage;
        ctx.fillStyle = 'orange'; 
        ctx.fillRect(this.x -20, this.y - 10, barWidth, 5); // Décalez la barre de vie orange vers la gauche
    }
    

    move() {
        
        if (this.y < (canvas.height / 2.3) - this.size / 2) {
            this.y += this.speed;
        } else {
            
            this.x += (Math.random() - 0.5) * this.speed * 10;

            
            if (this.x < 0) this.x = 0;
            if (this.x > canvas.width - this.size) this.x = canvas.width - this.size;
        }

        
        this.size = this.baseSize + this.y * this.sizeCoefficient;
    }
}



class Missile {
    constructor(x, y, direction, owner) {
        this.x = x;
        this.y = y;
        this.speed = 5;
        this.size = owner === 'player' ? 50 : 80; // Taille différente pour les missiles du joueur et des ennemis
        this.damage = owner === 'player' ? 300 : 100;
        this.direction = direction;
        this.owner = owner;
        this.image = new Image();
        this.rotation = 0; // Angle de rotation initial
        this.rotationSpeed = owner === 'player' ? 0.1 : 0; // Vitesse de rotation seulement pour les missiles du joueur
        if (owner !== 'player') {
            this.image.src = currentEnemyMissileImage; 
        }
    }

    move() { 
        // Déplacer le missile
        this.y += this.direction.y * this.speed;

        // Appliquer la rotation uniquement pour les missiles du joueur
        if (this.owner === 'player') {
            this.rotation += this.rotationSpeed;
        }
    }

    draw() {
        ctx.save(); // Sauvegarder le contexte de dessin actuel
        ctx.translate(this.x + this.size / 2, this.y + this.size / 2); // Déplacer l'origine au centre du missile
        ctx.rotate(this.rotation); // Appliquer la rotation
        ctx.translate(-(this.x + this.size / 2), -(this.y + this.size / 2)); // Déplacer l'origine à sa position d'origine
        ctx.drawImage(this.image, this.x, this.y, this.size, this.size);
        ctx.restore(); // Restaurer le contexte de dessin précédent
    }
}


const player = new Player();
let enemies = [];
let eliminatedBasicEnemies = 0; 

document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

function keyDownHandler(e) {
    if (e.key === 'ArrowRight' || e.key === 'Right') {
        player.direction.x = 1;
    } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
        player.direction.x = -1;
    } else if (e.key === 'ArrowUp' || e.key === 'Up') {
        player.direction.y = -1;
    } else if (e.key === 'ArrowDown' || e.key === 'Down') {
        player.direction.y = 1;
    }
}

function keyUpHandler(e) {
    if (e.key === 'ArrowRight' || e.key === 'Right' || e.key === 'ArrowLeft' || e.key === 'Left') {
        player.direction.x = 0;
    } else if (e.key === 'ArrowUp' || e.key === 'Up' || e.key === 'ArrowDown' || e.key === 'Down') {
        player.direction.y = 0;
    }
}

function movePlayer() {
    player.move();
}

function moveEnemies() {
    enemies.forEach(enemy => {
        enemy.move();
    });

    if (enemies.length < 2) {
        const minSpawnX = canvas.width * 0.35;
        const maxSpawnX = canvas.width * 0.6;
        const newEnemyX = minSpawnX + Math.random() * (maxSpawnX - minSpawnX);
        const newEnemyY = canvas.height * 0.25;
        const newEnemy = new Enemy(newEnemyX, newEnemyY, 30, 1, 200, 1000); 
        enemies.push(newEnemy);
    }
}


function createMissile(x, y, direction, owner) {}

function moveMissiles() {
    player.missiles.forEach(missile => {
        missile.move();
    });

    enemies.forEach(enemy => {
        enemy.missiles.forEach(missile => {
            missile.move();
        });
    });
}

function fireMissiles() {
    player.fireMissile();
    enemies.forEach(enemy => {
        enemy.fireMissile();
    });
}

function drawPlayer() {
    player.draw();
}

function drawMissiles() {
    player.missiles.forEach(missile => {
        missile.draw();
    });

    enemies.forEach(enemy => {
        enemy.missiles.forEach(missile => {
            missile.draw();
        });
    });
}

function drawEnemies() {
    enemies.forEach(enemy => {
        if (enemy instanceof BossEnemy) {
            enemy.draw();
        } else {
            enemy.draw(); // Dessiner d'autres types d'ennemis si nécessaire
        }
    });
    // Trier les ennemis en fonction de leur position y
    enemies.sort((a, b) => a.y - b.y);

    enemies.forEach(enemy => {
        enemy.draw();
    });
}


function showPopup() {
    const popup = document.getElementById('popup');
    popup.style.display = 'block'; // Afficher le popup
}

function closePopup() {
    const popup = document.getElementById('popup');
    popup.style.display = 'none'; // Masquer le popup
    gameRunning = true;
    updateGame();
}

    // Optionnel : Relancer le jeu après avoir fermé le popup
    // gameRunning = true;
    // updateGame();

function showPopup2() {
    const popup2 = document.getElementById('popup2');
    popup2.style.display = 'block'; // Afficher le popup
}

function closePopup2() {
    const popup2 = document.getElementById('popup2');
    popup2.style.display = 'none'; // Masquer le popup
    gameRunning = true;
    updateGame();
}



let gameRunning = true;

function updateGame() {
    if (!gameRunning) return; 

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    movePlayer();
    moveEnemies();
    moveMissiles();
    fireMissiles();
    drawMissiles();
    drawEnemies();
    drawPlayer();

    // Vérifier si le joueur est mort
    if (player.health <= 0) {
       showPopup2();
         gameRunning = false; // Arrêter le jeu
    }

    // Vérifier les collisions entre les joueurs et les ennemis
    player.checkCollisions(enemies);

    // Vérifier les collisions entre les missiles des ennemis et le joueur
    enemies.forEach(enemy => {
        enemy.checkCollisions(player);
    });

    // Gérer les explosions et la suppression des ennemis
    enemies.forEach((enemy, index) => {
        if (enemy.health <= 0) {
            enemies.splice(index, 1);

            // Vérifiez si le BossEnemy est mort
            if (enemy instanceof BossEnemy) {
                // Afficher le popup lorsque le BossEnemy meurt
                showPopup();
                gameRunning = false; // Arrêter le jeu
            }
        }
    });

    // Vérifier si le joueur a atteint 2000 points et s'il n'y a pas de BossEnemy sur la carte
    if (player.points >= 500 && !enemies.some(enemy => enemy instanceof BossEnemy)) {

        const boss = new BossEnemy(canvas.width / 2, canvas.height / 5); // Définir la position initiale du boss
        enemies.push(boss); // Ajouter le BossEnemy à la liste des ennemis
    }

    requestAnimationFrame(updateGame);
}

updateGame(); // Commence le jeu après le chargement des frames d'explosion


const button_naz = document.getElementById('button_naz');
button_naz.addEventListener('click', () => {
    if (ghostImage.src.includes('fantome1_naz.png')) {
        ghostImage.src = '/images/fantome1.png';
    } else {
        ghostImage.src = '/images/fantome1_naz.png';
    }
    
    if (player.image.src.includes('bra_naz.png')) {
        player.image.src = '/images/bra_sam.png';
    } else {
        player.image.src = '/images/bra_naz.png';
    }

    if (bossimage.src.includes('hitler.png')) {
        bossimage.src = '/images/ninjaboss.png';
    } else {
        bossimage.src = '/images/hitler.png';
    }


    currentEnemyMissileImage = currentEnemyMissileImage === enemyMissileImage1 ? enemyMissileImage2 : enemyMissileImage1;

    // Mettre à jour l'image des missiles ennemis existants
    enemies.forEach(enemy => {
        enemy.missiles.forEach(missile => {
            if (missile.owner !== 'player') {
                missile.image.src = currentEnemyMissileImage;
            }
        });
    });
});


