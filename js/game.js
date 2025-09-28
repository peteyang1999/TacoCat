// TacoCat - Adventure RPG Game with Menu System
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Game state management
        this.gameState = 'menu'; // 'menu' or 'playing'
        this.gameInstance = null;
        
        // UI elements
        this.startMenu = document.getElementById('startMenu');
        this.gameScreen = document.getElementById('gameScreen');
        this.saveStatus = document.getElementById('saveStatus');
        
        // Menu buttons
        this.newGameBtn = document.getElementById('newGameBtn');
        this.continueBtn = document.getElementById('continueBtn');
        this.quitBtn = document.getElementById('quitBtn');
        this.saveBtn = document.getElementById('saveBtn');
        this.menuBtn = document.getElementById('menuBtn');
        
        // Setup event listeners
        this.setupMenuEventListeners();
        
        // Check for existing save
        this.checkForSave();
    }
    
    setupMenuEventListeners() {
        this.newGameBtn.addEventListener('click', () => this.startNewGame());
        this.continueBtn.addEventListener('click', () => this.continueGame());
        this.quitBtn.addEventListener('click', () => this.quitGame());
        this.saveBtn.addEventListener('click', () => this.saveGame());
        this.menuBtn.addEventListener('click', () => this.returnToMenu());
    }
    
    checkForSave() {
        const saveData = localStorage.getItem('tacoCatSave');
        if (saveData) {
            this.saveStatus.textContent = '💾 Save file found - Continue available!';
            this.continueBtn.disabled = false;
        } else {
            this.saveStatus.textContent = 'No save file found';
            this.continueBtn.disabled = true;
        }
    }
    
    startNewGame() {
        // Clear any existing save
        localStorage.removeItem('tacoCatSave');
        
        // Initialize new game
        this.gameInstance = new GameInstance();
        
        // Switch to game screen
        this.switchToGame();
    }
    
    continueGame() {
        const saveData = localStorage.getItem('tacoCatSave');
        if (saveData) {
            try {
                const data = JSON.parse(saveData);
                this.gameInstance = new GameInstance(data);
                this.switchToGame();
            } catch (error) {
                console.error('Error loading save:', error);
                this.saveStatus.textContent = '❌ Error loading save file';
            }
        }
    }
    
    saveGame() {
        if (this.gameInstance) {
            const saveData = this.gameInstance.getSaveData();
            localStorage.setItem('tacoCatSave', JSON.stringify(saveData));
            
            // Show feedback in game UI
            const saveFeedback = document.getElementById('saveFeedback');
            saveFeedback.textContent = 'Your progress has been saved';
            saveFeedback.classList.add('show');
            
            // Hide feedback after 2 seconds
            setTimeout(() => {
                saveFeedback.classList.remove('show');
            }, 2000);
            
            // Also update menu save status
            this.saveStatus.textContent = '✅ Game saved successfully!';
            setTimeout(() => {
                this.saveStatus.textContent = '';
            }, 2000);
        }
    }
    
    returnToMenu() {
        this.gameState = 'menu';
        this.startMenu.style.display = 'block';
        this.gameScreen.style.display = 'none';
        
        // Stop the game loop
        if (this.gameInstance) {
            this.gameInstance.stop();
        }
        
        // Update save status
        this.checkForSave();
    }
    
    switchToGame() {
        this.gameState = 'playing';
        this.startMenu.style.display = 'none';
        this.gameScreen.style.display = 'block';
        
        // Start the game loop
        if (this.gameInstance) {
            this.gameInstance.start();
        }
    }
    
    quitGame() {
        if (confirm('Are you sure you want to quit TacoCat Adventure?')) {
            window.close();
        }
    }
}

// Game Instance class - handles actual gameplay
class GameInstance {
    constructor(saveData = null) {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Initialize game objects
        this.player = new Player(400, 300);
        this.coins = [];
        this.tacoCat = new TacoCat(100, 100);
        this.quests = new QuestSystem();
        this.maxCoins = 15;
        this.lastCoinSpawn = 0;
        this.nextSpawnTime = this.getRandomSpawnTime();
        this.lastFrameTime = 0;
        
        // Load save data if provided
        if (saveData) {
            this.loadSaveData(saveData);
        } else {
            // Spawn initial coins for new game
            this.spawnCoins(3);
        }
        
        // Input handling
        this.keys = {};
        this.setupEventListeners();
        
        // Game loop control
        this.isRunning = false;
        this.animationId = null;
    }
    
    loadSaveData(saveData) {
        // Load player data
        this.player.coins = saveData.player.coins || 0;
        this.player.health = saveData.player.health || 100;
        this.player.food = saveData.player.food || 100;
        this.player.x = saveData.player.x || 400;
        this.player.y = saveData.player.y || 300;
        
        // Load TacoCat data
        this.tacoCat.totalCoinsReceived = saveData.tacoCat.totalCoinsReceived || 0;
        this.tacoCat.happinessLevel = saveData.tacoCat.happinessLevel || 0;
        this.tacoCat.coinsForNextLevel = saveData.tacoCat.coinsForNextLevel || 10;
        this.tacoCat.coinsGivenToThisLevel = saveData.tacoCat.coinsGivenToThisLevel || 0;
        
        // Load coins (spawn some if none saved)
        if (saveData.coins && saveData.coins.length > 0) {
            this.coins = saveData.coins.map(coinData => new Coin(coinData.x, coinData.y));
        } else {
            this.spawnCoins(3);
        }
    }
    
    getSaveData() {
        return {
            player: {
                coins: this.player.coins,
                health: this.player.health,
                food: this.player.food,
                x: this.player.x,
                y: this.player.y
            },
            tacoCat: {
                totalCoinsReceived: this.tacoCat.totalCoinsReceived,
                happinessLevel: this.tacoCat.happinessLevel,
                coinsForNextLevel: this.tacoCat.coinsForNextLevel,
                coinsGivenToThisLevel: this.tacoCat.coinsGivenToThisLevel
            },
            coins: this.coins.map(coin => ({ x: coin.x, y: coin.y })),
            timestamp: Date.now()
        };
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }
    
    spawnCoins(count) {
        for (let i = 0; i < count; i++) {
            if (this.coins.length < this.maxCoins) {
                this.coins.push(new Coin(
                    Math.random() * (this.width - 20),
                    Math.random() * (this.height - 20)
                ));
            }
        }
    }
    
    getRandomSpawnTime() {
        return Math.random() * 4000 + 1000; // Random between 1-5 seconds (1000-5000ms)
    }
    
    spawnSingleCoin() {
        if (this.coins.length < this.maxCoins) {
            this.coins.push(new Coin(
                Math.random() * (this.width - 20),
                Math.random() * (this.height - 20)
            ));
        }
    }
    
    update(deltaTime) {
        // Update player
        this.player.update(this.keys);
        
        // Update coin spawning timer
        this.lastCoinSpawn += deltaTime;
        if (this.lastCoinSpawn >= this.nextSpawnTime && this.coins.length < this.maxCoins) {
            this.spawnSingleCoin();
            this.lastCoinSpawn = 0;
            this.nextSpawnTime = this.getRandomSpawnTime();
        }
        
        // Check coin collection
        this.coins = this.coins.filter(coin => {
            if (this.checkCollision(this.player, coin)) {
                this.player.collectCoin();
                this.updateUI();
                return false; // Remove coin
            }
            return true;
        });
        
        // Check if player wants to give coins to TacoCat
        if (this.keys[' '] && this.checkCollision(this.player, this.tacoCat)) {
            this.tacoCat.giveCoins(this.player.coins);
            this.player.giveAllCoins();
            this.updateUI();
            this.keys[' '] = false; // Prevent continuous giving
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#27ae60';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw grass pattern
        this.drawGrass();
        
        // Draw coins
        this.coins.forEach(coin => coin.render(this.ctx));
        
        // Draw TacoCat
        this.tacoCat.render(this.ctx);
        
        // Draw player
        this.player.render(this.ctx);
        
        // Draw instructions
        this.drawInstructions();
    }
    
    drawGrass() {
        this.ctx.fillStyle = '#2ecc71';
        for (let x = 0; x < this.width; x += 20) {
            for (let y = 0; y < this.height; y += 20) {
                if (Math.random() > 0.7) {
                    this.ctx.fillRect(x, y, 2, 2);
                }
            }
        }
    }
    
    drawInstructions() {
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.font = '14px Arial';
        this.ctx.fillText('Use WASD or Arrow Keys to move', 10, this.height - 60);
        this.ctx.fillText('Collect coins (💰) and give them to TacoCat (🐱)', 10, this.height - 40);
        this.ctx.fillText('Press SPACE near TacoCat to give coins', 10, this.height - 20);
    }
    
    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    updateUI() {
        document.getElementById('coinCount').textContent = this.player.coins;
        document.getElementById('healthCount').textContent = this.player.health;
        document.getElementById('foodCount').textContent = this.player.food;
        document.getElementById('questText').textContent = this.quests.getCurrentQuest();
    }
    
    gameLoop(currentTime = 0) {
        if (!this.isRunning) return;
        
        const deltaTime = currentTime - (this.lastFrameTime || 0);
        this.lastFrameTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    start() {
        this.isRunning = true;
        this.updateUI();
        this.gameLoop();
    }
    
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// Player class
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.speed = 3;
        this.coins = 0;
        this.health = 100;
        this.food = 100;
    }
    
    update(keys) {
        // Movement
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
            this.x -= this.speed;
        }
        if (keys['ArrowRight'] || keys['d'] || keys['D']) {
            this.x += this.speed;
        }
        if (keys['ArrowUp'] || keys['w'] || keys['W']) {
            this.y -= this.speed;
        }
        if (keys['ArrowDown'] || keys['s'] || keys['S']) {
            this.y += this.speed;
        }
        
        // Keep player on screen
        this.x = Math.max(0, Math.min(this.x, 800 - this.width));
        this.y = Math.max(0, Math.min(this.y, 600 - this.height));
    }
    
    render(ctx) {
        // Draw cat body
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw cat ears
        ctx.fillStyle = '#e67e22';
        ctx.fillRect(this.x + 2, this.y - 5, 6, 8);
        ctx.fillRect(this.x + 12, this.y - 5, 6, 8);
        
        // Draw cat face
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(this.x + 6, this.y + 4, 2, 2); // Left eye
        ctx.fillRect(this.x + 12, this.y + 4, 2, 2); // Right eye
        ctx.fillRect(this.x + 8, this.y + 8, 4, 2); // Nose
    }
    
    collectCoin() {
        this.coins++;
    }
    
    giveAllCoins() {
        this.coins = 0;
    }
}

// Coin class
class Coin {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 15;
        this.height = 15;
        this.rotation = 0;
    }
    
    render(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.rotate(this.rotation);
        
        // Draw coin
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        
        // Draw coin details
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(-this.width/2 + 2, -this.height/2 + 2, this.width - 4, this.height - 4);
        
        ctx.restore();
        
        // Rotate coin
        this.rotation += 0.05;
    }
}

// TacoCat NPC class
class TacoCat {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.totalCoinsReceived = 0;
        this.happinessLevel = 0;
        this.coinsForNextLevel = 10; // First level requires 10 coins
        this.coinsGivenToThisLevel = 0;
    }
    
    render(ctx) {
        // Draw TacoCat body
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw TacoCat face
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(this.x + 6, this.y + 6, 3, 3); // Left eye
        ctx.fillRect(this.x + 21, this.y + 6, 3, 3); // Right eye
        ctx.fillRect(this.x + 12, this.y + 15, 6, 3); // Mouth
        
        // Draw taco shell
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(this.x - 5, this.y + 10, 10, 15);
        ctx.fillRect(this.x + 25, this.y + 10, 10, 15);
        
        // Draw text above
        ctx.fillStyle = '#2c3e50';
        ctx.font = '12px Arial';
        ctx.fillText('TacoCat', this.x - 10, this.y - 10);
        
        // Draw happiness level indicator
        ctx.fillStyle = '#f1c40f';
        ctx.font = '10px Arial';
        ctx.fillText(`😊 Happiness ${this.happinessLevel}`, this.x - 5, this.y + this.height + 15);
        
        // Draw coin counter
        ctx.fillStyle = '#f1c40f';
        ctx.font = '10px Arial';
        ctx.fillText(`💰 ${this.totalCoinsReceived} coins`, this.x - 5, this.y + this.height + 30);
        
        // Draw progress to next level
        if (this.happinessLevel > 0 || this.coinsGivenToThisLevel > 0) {
            ctx.fillStyle = '#27ae60';
            ctx.font = '9px Arial';
            ctx.fillText(`Next: ${this.coinsForNextLevel - this.coinsGivenToThisLevel} more`, this.x - 5, this.y + this.height + 45);
        }
    }
    
    giveCoins(amount) {
        this.totalCoinsReceived += amount;
        this.coinsGivenToThisLevel += amount;
        
        // Check if we can level up
        while (this.coinsGivenToThisLevel >= this.coinsForNextLevel) {
            this.coinsGivenToThisLevel -= this.coinsForNextLevel;
            this.happinessLevel++;
            this.coinsForNextLevel = 10 + (this.happinessLevel * 5); // 10, 15, 20, 25, etc.
            console.log(`🎉 TacoCat reached happiness level ${this.happinessLevel}! Next level needs ${this.coinsForNextLevel} coins.`);
        }
        
        console.log(`TacoCat received ${amount} coins! Total: ${this.totalCoinsReceived}, Level: ${this.happinessLevel}`);
    }
}

// Quest system
class QuestSystem {
    constructor() {
        this.currentQuest = "Find and collect coins to give to TacoCat!";
    }
    
    getCurrentQuest() {
        return this.currentQuest;
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    new Game();
});