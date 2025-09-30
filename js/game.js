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
        
        // Character naming modal
        this.characterModal = document.getElementById('characterModal');
        this.characterNameInput = document.getElementById('characterNameInput');
        this.confirmNameBtn = document.getElementById('confirmNameBtn');
        this.cancelNameBtn = document.getElementById('cancelNameBtn');
        
        // Audio system
        this.audioManager = new AudioManager();
        this.audioToggle = document.getElementById('audioToggle');
        
        // Credits modal
        this.creditsBtn = document.getElementById('creditsBtn');
        this.creditsModal = document.getElementById('creditsModal');
        this.closeCreditsBtn = document.getElementById('closeCreditsBtn');
        
        // Setup event listeners
        this.setupMenuEventListeners();
        
        // Check for existing save
        this.checkForSave();
    }
    
    setupMenuEventListeners() {
        this.newGameBtn.addEventListener('click', () => {
            this.audioManager.playButtonClick();
            this.showCharacterNaming();
        });
        this.continueBtn.addEventListener('click', () => {
            this.audioManager.playButtonClick();
            this.continueGame();
        });
        this.quitBtn.addEventListener('click', () => {
            this.audioManager.playButtonClick();
            this.quitGame();
        });
        this.creditsBtn.addEventListener('click', () => {
            this.audioManager.playButtonClick();
            this.showCredits();
        });
        this.saveBtn.addEventListener('click', () => {
            this.audioManager.playButtonClick();
            this.saveGame();
        });
        this.menuBtn.addEventListener('click', () => {
            this.audioManager.playButtonClick();
            this.returnToMenu();
        });
        
        // Character naming modal events
        this.confirmNameBtn.addEventListener('click', () => {
            this.audioManager.playButtonClick();
            this.confirmCharacterName();
        });
        this.cancelNameBtn.addEventListener('click', () => {
            this.audioManager.playButtonClick();
            this.cancelCharacterNaming();
        });
        this.characterNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.audioManager.playButtonClick();
                this.confirmCharacterName();
            }
        });
        
        // Audio toggle event
        this.audioToggle.addEventListener('click', () => this.toggleAudio());
        
        // Credits modal events
        this.closeCreditsBtn.addEventListener('click', () => {
            this.audioManager.playButtonClick();
            this.hideCredits();
        });
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
    
    showCharacterNaming() {
        // Show the character naming modal
        this.characterModal.style.display = 'flex';
        this.characterNameInput.value = '';
        this.characterNameInput.focus();
    }
    
    confirmCharacterName() {
        const name = this.characterNameInput.value.trim();
        if (name.length === 0) {
            this.characterNameInput.placeholder = 'Please enter a name!';
            this.characterNameInput.style.borderColor = '#e74c3c';
            return;
        }
        
        // Hide modal
        this.characterModal.style.display = 'none';
        
        // Start new game with character name
        this.startNewGame(name);
    }
    
    cancelCharacterNaming() {
        this.characterModal.style.display = 'none';
        this.characterNameInput.style.borderColor = '#3498db';
        this.characterNameInput.placeholder = 'Enter cat name...';
    }
    
    startNewGame(characterName = 'Cat') {
        // Clear any existing save
        localStorage.removeItem('tacoCatSave');
        
        // Initialize new game with character name
        this.gameInstance = new GameInstance(null, characterName);
        
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
            
            // Play save success sound
            this.audioManager.playSaveSuccess();
            
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
        
        // Stop ambient music
        this.audioManager.stopAmbient();
        
        // Stop the game loop
        if (this.gameInstance) {
            this.gameInstance.stop();
        }
        
        // Update save status
        this.checkForSave();
    }
    
    toggleAudio() {
        const isMuted = this.audioManager.toggleMute();
        this.audioToggle.textContent = isMuted ? '🔇 Sound' : '🔊 Sound';
    }
    
    showCredits() {
        this.creditsModal.style.display = 'flex';
    }
    
    hideCredits() {
        this.creditsModal.style.display = 'none';
    }
    
    switchToGame() {
        this.gameState = 'playing';
        this.startMenu.style.display = 'none';
        this.gameScreen.style.display = 'block';
        
        // Start ambient music
        this.audioManager.playAmbient();
        
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
    constructor(saveData = null, characterName = 'Cat') {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Store character name
        this.characterName = characterName;
        
        // Initialize game objects
        this.player = new Player(400, 300);
        this.coins = [];
        this.tacoCat = new TacoCat(100, 100);
        this.home = new Home(650, 100);
        this.quests = new QuestSystem();
        this.maxCoins = 15;
        this.lastCoinSpawn = 0;
        this.nextSpawnTime = this.getRandomSpawnTime();
        this.lastFrameTime = 0;
        this.levelUpNotification = null;
        this.interactionPrompt = null;
        this.currentMap = 'world'; // 'world' or 'home'
        this.homeInterior = new HomeInterior();
        this.environmentObjects = this.generateEnvironmentObjects();
        this.grassPattern = this.generateGrassPattern();
        
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
        // Load character name
        this.characterName = saveData.characterName || 'Cat';
        
        // Load player data
        this.player.coins = saveData.player.coins || 0;
        this.player.health = saveData.player.health || 100;
        this.player.food = saveData.player.food || 100;
        this.player.experience = saveData.player.experience || 0;
        this.player.level = saveData.player.level || 1;
        this.player.expToNextLevel = saveData.player.expToNextLevel || 100;
        this.player.x = saveData.player.x || 400;
        this.player.y = saveData.player.y || 300;
        
        // Load TacoCat data
        this.tacoCat.totalCoinsReceived = saveData.tacoCat.totalCoinsReceived || 0;
        this.tacoCat.happinessLevel = saveData.tacoCat.happinessLevel || 0;
        this.tacoCat.coinsForNextLevel = saveData.tacoCat.coinsForNextLevel || 10;
        this.tacoCat.coinsGivenToThisLevel = saveData.tacoCat.coinsGivenToThisLevel || 0;
        
        // Load home data
        this.home.x = saveData.home ? saveData.home.x : 650;
        this.home.y = saveData.home ? saveData.home.y : 100;
        
        // Load coins (spawn some if none saved)
        if (saveData.coins && saveData.coins.length > 0) {
            this.coins = saveData.coins.map(coinData => new Coin(coinData.x, coinData.y));
        } else {
            this.spawnCoins(3);
        }
    }
    
    getSaveData() {
        return {
            characterName: this.characterName,
            player: {
                coins: this.player.coins,
                health: this.player.health,
                food: this.player.food,
                experience: this.player.experience,
                level: this.player.level,
                expToNextLevel: this.player.expToNextLevel,
                x: this.player.x,
                y: this.player.y
            },
            tacoCat: {
                totalCoinsReceived: this.tacoCat.totalCoinsReceived,
                happinessLevel: this.tacoCat.happinessLevel,
                coinsForNextLevel: this.tacoCat.coinsForNextLevel,
                coinsGivenToThisLevel: this.tacoCat.coinsGivenToThisLevel
            },
            home: {
                x: this.home.x,
                y: this.home.y
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
                let coin = this.createValidCoin();
                if (coin) {
                    this.coins.push(coin);
                }
            }
        }
    }
    
    getRandomSpawnTime() {
        return Math.random() * 4000 + 1000; // Random between 1-5 seconds (1000-5000ms)
    }
    
    spawnSingleCoin() {
        if (this.coins.length < this.maxCoins) {
            let coin = this.createValidCoin();
            if (coin) {
                this.coins.push(coin);
            }
        }
    }
    
    createValidCoin() {
        let attempts = 0;
        const maxAttempts = 50; // Prevent infinite loop
        
        while (attempts < maxAttempts) {
            const x = Math.random() * (this.width - 20);
            const y = Math.random() * (this.height - 20);
            const coin = new Coin(x, y);
            
            // Check if coin is too close to home
            if (!this.isCoinTooCloseToHome(coin)) {
                return coin;
            }
            
            attempts++;
        }
        
        // If we can't find a valid spot, return null
        return null;
    }
    
    isCoinTooCloseToHome(coin) {
        // Define home area with some padding
        const homeLeft = this.home.x - 15;
        const homeRight = this.home.x + this.home.width + 15;
        const homeTop = this.home.y - 15;
        const homeBottom = this.home.y + this.home.height + 15;
        
        // Check if coin overlaps with home area
        return coin.x < homeRight && 
               coin.x + coin.width > homeLeft && 
               coin.y < homeBottom && 
               coin.y + coin.height > homeTop;
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
                // Play coin collection sound
                if (window.game && window.game.audioManager) {
                    window.game.audioManager.playCoinCollect();
                }
                return false; // Remove coin
            }
            return true;
        });
        
        // Check for interactions and handle spacebar
        this.checkInteractions();
        if (this.keys[' ']) {
            this.handleInteraction();
            this.keys[' '] = false; // Prevent continuous interaction
        }
    }
    
    checkInteractions() {
        this.interactionPrompt = null;
        
        if (this.currentMap === 'world') {
            // Check TacoCat interaction
            if (this.checkCollision(this.player, this.tacoCat)) {
                if (this.player.coins > 0) {
                    this.interactionPrompt = {
                        text: "Press SPACE to give coins to TacoCat",
                        x: this.player.x,
                        y: this.player.y - 30
                    };
                } else {
                    this.interactionPrompt = {
                        text: "Find coins to give to TacoCat!",
                        x: this.player.x,
                        y: this.player.y - 30
                    };
                }
            }
            // Check Home interaction
            else if (this.home.checkInteraction(this.player)) {
                this.interactionPrompt = {
                    text: "Press SPACE to enter home",
                    x: this.player.x,
                    y: this.player.y - 30
                };
                // Update home animation when near
                this.home.animationOffset += 0.05;
            }
        } else if (this.currentMap === 'home') {
            // Check door interaction in home interior
            if (this.homeInterior.checkDoorInteraction(this.player)) {
                this.interactionPrompt = {
                    text: "Press SPACE to exit home",
                    x: this.player.x,
                    y: this.player.y - 30
                };
            }
        }
    }
    
    handleInteraction() {
        if (this.currentMap === 'world') {
            // Check TacoCat interaction
            if (this.checkCollision(this.player, this.tacoCat) && this.player.coins > 0) {
            this.tacoCat.giveCoins(this.player.coins);
            this.player.giveAllCoins();
            this.updateUI();
                // Play TacoCat happy sound
                if (window.game && window.game.audioManager) {
                    window.game.audioManager.playTacoCatHappy();
                }
            }
            // Check Home interaction
            else if (this.home.checkInteraction(this.player)) {
                this.enterHome();
            }
        } else if (this.currentMap === 'home') {
            // Check door interaction in home interior
            if (this.homeInterior.checkDoorInteraction(this.player)) {
                this.exitHome();
            }
        }
    }
    
    enterHome() {
        // Switch to home interior map
        this.currentMap = 'home';
        
        // Position player in home interior
        this.player.x = 400; // Center of home interior
        this.player.y = 300;
        
        // Play button click sound for interaction
        if (window.game && window.game.audioManager) {
            window.game.audioManager.playButtonClick();
        }
        
        // Show transition message
        this.showEnterHomeNotification();
    }
    
    exitHome() {
        // Switch back to world map
        this.currentMap = 'world';
        
        // Position player outside home
        this.player.x = 650; // Near the home entrance
        this.player.y = 120;
        
        // Play button click sound
        if (window.game && window.game.audioManager) {
            window.game.audioManager.playButtonClick();
        }
        
        // Show transition message
        this.showExitHomeNotification();
    }
    
    showEnterHomeNotification() {
        this.showNotification('🏠 Entering home...', '#3498db');
    }
    
    showExitHomeNotification() {
        this.showNotification('🚪 Exiting home...', '#3498db');
    }
    
    showNotification(message, color = '#27ae60') {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${color};
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            font-family: Arial, sans-serif;
            font-size: 16px;
            z-index: 1000;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 2 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 2000);
    }
    
    render() {
        if (this.currentMap === 'world') {
            this.renderWorld();
        } else if (this.currentMap === 'home') {
            this.renderHomeInterior();
        }
        
        // Draw level up notification (appears on all maps)
        if (this.levelUpNotification) {
            this.drawLevelUpNotification();
        }
        
        // Draw interaction prompt (appears on all maps)
        if (this.interactionPrompt) {
            this.drawInteractionPrompt();
        }
    }
    
    renderWorld() {
        // Clear canvas
        this.ctx.fillStyle = '#27ae60';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw grass pattern
        this.drawGrass();
        
        // Draw environment objects (trees, rocks, bushes)
        this.drawEnvironmentObjects();
        
        // Draw coins
        this.coins.forEach(coin => coin.render(this.ctx));
        
        // Draw TacoCat
        this.tacoCat.render(this.ctx);
        
        // Draw home
        this.home.render(this.ctx);
        
        // Draw player
        this.player.render(this.ctx);
        
        // Draw instructions
        this.drawInstructions();
    }
    
    renderHomeInterior() {
        // Render home interior
        this.homeInterior.render(this.ctx);
        
        // Draw player
        this.player.render(this.ctx);
        
        // Draw home interior instructions
        this.drawHomeInstructions();
    }
    
    generateGrassPattern() {
        const grassPattern = [];
        const grassColors = ['#2ecc71', '#27ae60', '#229954', '#1e8449'];
        
        // Use a fixed seed for consistent random generation
        let seed = 12345;
        function seededRandom() {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        }
        
        for (let x = 0; x < this.width; x += 8) {
            for (let y = 0; y < this.height; y += 8) {
                // Generate grass patches using seeded random
                if (seededRandom() > 0.6) {
                    const color = grassColors[Math.floor(seededRandom() * grassColors.length)];
                    const grassBlades = [];
                    
                    // Generate 3 grass blades per patch
                    for (let i = 0; i < 3; i++) {
                        grassBlades.push({
                            x: x + seededRandom() * 6,
                            y: y + seededRandom() * 6,
                            width: 1,
                            height: 2 + seededRandom() * 2,
                            color: color
                        });
                    }
                    
                    grassPattern.push({
                        x: x,
                        y: y,
                        blades: grassBlades
                    });
                }
            }
        }
        
        // Generate flowers with seeded random
        const flowers = [];
        for (let i = 0; i < 20; i++) {
            flowers.push({
                x: seededRandom() * this.width,
                y: seededRandom() * this.height,
                color: seededRandom() > 0.5 ? '#f39c12' : '#e74c3c'
            });
        }
        
        return {
            grassPatches: grassPattern,
            flowers: flowers
        };
    }
    
    generateEnvironmentObjects() {
        const objects = [];
        
        // Add some trees
        const treePositions = [
            {x: 50, y: 50}, {x: 200, y: 80}, {x: 350, y: 120},
            {x: 500, y: 60}, {x: 700, y: 200}, {x: 150, y: 300},
            {x: 600, y: 350}, {x: 300, y: 450}, {x: 750, y: 500}
        ];
        
        treePositions.forEach(pos => {
            objects.push({
                type: 'tree',
                x: pos.x,
                y: pos.y,
                width: 30,
                height: 40
            });
        });
        
        // Add some rocks
        const rockPositions = [
            {x: 100, y: 200}, {x: 450, y: 250}, {x: 650, y: 400},
            {x: 250, y: 350}, {x: 550, y: 150}, {x: 150, y: 500}
        ];
        
        rockPositions.forEach(pos => {
            objects.push({
                type: 'rock',
                x: pos.x,
                y: pos.y,
                width: 20,
                height: 15
            });
        });
        
        // Add some bushes
        const bushPositions = [
            {x: 300, y: 200}, {x: 500, y: 400}, {x: 100, y: 400},
            {x: 700, y: 300}, {x: 400, y: 500}
        ];
        
        bushPositions.forEach(pos => {
            objects.push({
                type: 'bush',
                x: pos.x,
                y: pos.y,
                width: 25,
                height: 20
            });
        });
        
        return objects;
    }
    
    drawEnvironmentObjects() {
        this.environmentObjects.forEach(obj => {
            if (obj.type === 'tree') {
                this.drawTree(obj.x, obj.y);
            } else if (obj.type === 'rock') {
                this.drawRock(obj.x, obj.y);
            } else if (obj.type === 'bush') {
                this.drawBush(obj.x, obj.y);
            }
        });
    }
    
    drawTree(x, y) {
        // Tree trunk
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(x + 12, y + 25, 6, 15);
        
        // Tree leaves
        this.ctx.fillStyle = '#228B22';
        this.ctx.beginPath();
        this.ctx.arc(x + 15, y + 20, 12, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Tree highlight
        this.ctx.fillStyle = '#32CD32';
        this.ctx.beginPath();
        this.ctx.arc(x + 12, y + 18, 8, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawRock(x, y) {
        // Rock shadow
        this.ctx.fillStyle = '#696969';
        this.ctx.fillRect(x, y + 3, 20, 12);
        
        // Rock main color
        this.ctx.fillStyle = '#A9A9A9';
        this.ctx.fillRect(x, y, 20, 12);
        
        // Rock highlight
        this.ctx.fillStyle = '#D3D3D3';
        this.ctx.fillRect(x + 2, y + 1, 8, 6);
    }
    
    drawBush(x, y) {
        // Bush base
        this.ctx.fillStyle = '#006400';
        this.ctx.fillRect(x, y + 15, 25, 5);
        
        // Bush leaves
        this.ctx.fillStyle = '#228B22';
        this.ctx.beginPath();
        this.ctx.arc(x + 5, y + 12, 6, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(x + 12, y + 10, 7, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(x + 18, y + 12, 6, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Bush highlight
        this.ctx.fillStyle = '#32CD32';
        this.ctx.beginPath();
        this.ctx.arc(x + 10, y + 8, 4, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawGrass() {
        // Base grass color
        this.ctx.fillStyle = '#27ae60';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw static grass patches
        this.grassPattern.grassPatches.forEach(patch => {
            patch.blades.forEach(blade => {
                this.ctx.fillStyle = blade.color;
                this.ctx.fillRect(blade.x, blade.y, blade.width, blade.height);
            });
        });
        
        // Draw static flowers
        this.grassPattern.flowers.forEach(flower => {
            this.ctx.fillStyle = flower.color;
            this.ctx.fillRect(flower.x, flower.y, 2, 2);
        });
    }
    
    drawInstructions() {
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.font = '14px Arial';
        this.ctx.fillText('Use WASD or Arrow Keys to move', 10, this.height - 60);
        this.ctx.fillText('Collect coins (💰) and give them to TacoCat (🐱)', 10, this.height - 40);
        this.ctx.fillText('Press SPACE to interact with characters and objects', 10, this.height - 20);
    }
    
    drawHomeInstructions() {
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.font = '14px Arial';
        this.ctx.fillText('🏠 Welcome to your home!', 10, this.height - 60);
        this.ctx.fillText('Use WASD or Arrow Keys to move around', 10, this.height - 40);
        this.ctx.fillText('Press SPACE near the door to exit', 10, this.height - 20);
    }
    
    drawLevelUpNotification() {
        const notification = this.levelUpNotification;
        const timeElapsed = Date.now() - notification.startTime;
        
        if (timeElapsed < notification.duration) {
            // Fade in/out effect
            let alpha = 1;
            if (timeElapsed < 300) {
                alpha = timeElapsed / 300; // Fade in
            } else if (timeElapsed > notification.duration - 300) {
                alpha = (notification.duration - timeElapsed) / 300; // Fade out
            }
            
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            
            // Smaller background
            this.ctx.fillStyle = '#27ae60';
            this.ctx.fillRect(320, 150, 160, 50);
            
            // Smaller border
            this.ctx.strokeStyle = '#2ecc71';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(320, 150, 160, 50);
            
            // Smaller text
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('🎉 LEVEL UP!', 400, 170);
            
            this.ctx.font = '14px Arial';
            this.ctx.fillText(`Level ${notification.level}`, 400, 190);
            
            this.ctx.restore();
        } else {
            this.levelUpNotification = null;
        }
    }
    
    drawInteractionPrompt() {
        const prompt = this.interactionPrompt;
        
        // Draw background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(prompt.x - 10, prompt.y - 25, prompt.text.length * 8 + 20, 30);
        
        // Draw border
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(prompt.x - 10, prompt.y - 25, prompt.text.length * 8 + 20, 30);
        
        // Draw text
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(prompt.text, prompt.x + (prompt.text.length * 4), prompt.y - 5);
        
        // Reset text alignment
        this.ctx.textAlign = 'left';
    }
    
    showLevelUpNotification(level) {
        this.levelUpNotification = {
            level: level,
            startTime: Date.now(),
            duration: 3000 // 3 seconds
        };
    }
    
    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    updateUI() {
        document.getElementById('characterName').textContent = this.characterName;
        document.getElementById('playerLevel').textContent = this.player.level;
        document.getElementById('coinCount').textContent = this.player.coins;
        document.getElementById('healthCount').textContent = this.player.health;
        document.getElementById('foodCount').textContent = this.player.food;
        document.getElementById('questText').textContent = this.quests.getCurrentQuest();
        
        // Update experience bar
        const expProgress = this.player.getExpProgress();
        const expBarFill = document.getElementById('expBarFill');
        const expText = document.getElementById('expText');
        
        expBarFill.style.width = expProgress.percentage + '%';
        expText.textContent = `${expProgress.current} / ${expProgress.needed}`;
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
        this.experience = 0;
        this.level = 1;
        this.expToNextLevel = 100;
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
        this.gainExperience(10); // Gain 10 EXP per coin
    }
    
    giveAllCoins() {
        this.coins = 0;
    }
    
    gainExperience(amount) {
        this.experience += amount;
        
        // Check for level up
        if (this.experience >= this.expToNextLevel) {
            this.levelUp();
        }
    }
    
    levelUp() {
        this.level++;
        this.experience -= this.expToNextLevel;
        this.expToNextLevel = Math.floor(this.expToNextLevel * 1.2); // 20% more EXP needed each level
        
        // Gain some benefits on level up
        this.health = Math.min(100, this.health + 10); // Restore some health
        this.food = Math.min(100, this.food + 10); // Restore some food
        
        console.log(`🎉 Level up! You are now level ${this.level}!`);
        
        // Play level up sound
        if (window.game && window.game.audioManager) {
            window.game.audioManager.playLevelUp();
        }
        
        // Show level up notification in game
        if (window.game && window.game.gameInstance) {
            window.game.gameInstance.showLevelUpNotification(this.level);
        }
    }
    
    getExpProgress() {
        return {
            current: this.experience,
            needed: this.expToNextLevel,
            percentage: (this.experience / this.expToNextLevel) * 100
        };
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

// Home class
class Home {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 35;
        this.animationOffset = 0;
    }
    
    render(ctx) {
        // Draw house body
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x, this.y + 10, this.width, this.height - 10);
        
        // Draw roof
        ctx.fillStyle = '#654321';
        ctx.beginPath();
        ctx.moveTo(this.x - 5, this.y + 10);
        ctx.lineTo(this.x + this.width/2, this.y - 5);
        ctx.lineTo(this.x + this.width + 5, this.y + 10);
        ctx.closePath();
        ctx.fill();
        
        // Draw door
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(this.x + 15, this.y + 25, 10, 15);
        
        // Draw window
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(this.x + 8, this.y + 15, 8, 8);
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x + 8, this.y + 15, 8, 8);
        
        // Draw chimney with smoke animation
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(this.x + 30, this.y - 2, 6, 12);
        
        // Animated smoke
        ctx.fillStyle = 'rgba(200, 200, 200, 0.6)';
        this.animationOffset += 0.02;
        for (let i = 0; i < 3; i++) {
            const smokeX = this.x + 33 + Math.sin(this.animationOffset + i) * 2;
            const smokeY = this.y - 8 - i * 3 + Math.cos(this.animationOffset + i * 0.5) * 1;
            ctx.beginPath();
            ctx.arc(smokeX, smokeY, 2 + i, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw text above
        ctx.fillStyle = '#2c3e50';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🏠 Home', this.x + this.width/2, this.y - 10);
        ctx.textAlign = 'left'; // Reset text alignment
    }
    
    checkInteraction(player) {
        // Check if player is near the home
        return Math.abs(player.x - (this.x + this.width/2)) < 30 && 
               Math.abs(player.y - (this.y + this.height/2)) < 30;
    }
}

// Home Interior class
class HomeInterior {
    constructor() {
        this.door = {
            x: 350,
            y: 500,
            width: 100,
            height: 80
        };
    }
    
    render(ctx) {
        // Draw wooden floor
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, 0, 800, 600);
        
        // Draw wooden floor planks
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        for (let x = 0; x < 800; x += 80) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 600);
            ctx.stroke();
        }
        for (let y = 0; y < 600; y += 60) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(800, y);
            ctx.stroke();
        }
        
        // Draw walls
        ctx.fillStyle = '#F5DEB3';
        ctx.fillRect(0, 0, 800, 60); // Top wall
        ctx.fillRect(0, 0, 60, 600); // Left wall
        ctx.fillRect(740, 0, 60, 600); // Right wall
        ctx.fillRect(0, 540, 800, 60); // Bottom wall
        
        // Draw door
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.door.x, this.door.y, this.door.width, this.door.height);
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 3;
        ctx.strokeRect(this.door.x, this.door.y, this.door.width, this.door.height);
        
        // Draw door handle
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(this.door.x + this.door.width - 15, this.door.y + this.door.height/2, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw window
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(100, 100, 120, 80);
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 4;
        ctx.strokeRect(100, 100, 120, 80);
        
        // Draw window cross
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(160, 100);
        ctx.lineTo(160, 180);
        ctx.moveTo(100, 140);
        ctx.lineTo(220, 140);
        ctx.stroke();
        
        // Draw fireplace
        ctx.fillStyle = '#696969';
        ctx.fillRect(600, 200, 120, 150);
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.strokeRect(600, 200, 120, 150);
        
        // Draw fireplace opening
        ctx.fillStyle = '#000000';
        ctx.fillRect(620, 220, 80, 110);
        
        // Draw fire
        ctx.fillStyle = '#FF4500';
        ctx.beginPath();
        ctx.moveTo(620, 330);
        ctx.lineTo(660, 300);
        ctx.lineTo(700, 330);
        ctx.lineTo(680, 310);
        ctx.lineTo(640, 290);
        ctx.lineTo(620, 330);
        ctx.fill();
        
        // Draw bed
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(200, 350, 150, 100);
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.strokeRect(200, 350, 150, 100);
        
        // Draw pillow
        ctx.fillStyle = '#FFB6C1';
        ctx.fillRect(210, 360, 40, 30);
        ctx.strokeStyle = '#FF69B4';
        ctx.lineWidth = 1;
        ctx.strokeRect(210, 360, 40, 30);
        
        // Draw table
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(450, 300, 100, 60);
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.strokeRect(450, 300, 100, 60);
        
        // Draw table legs
        ctx.fillStyle = '#654321';
        ctx.fillRect(460, 360, 10, 40);
        ctx.fillRect(490, 360, 10, 40);
        ctx.fillRect(530, 360, 10, 40);
        ctx.fillRect(560, 360, 10, 40);
        
        // Draw chair
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(480, 380, 40, 60);
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.strokeRect(480, 380, 40, 60);
        
        // Draw chair back
        ctx.fillRect(480, 380, 40, 20);
        ctx.strokeRect(480, 380, 40, 20);
        
        // Draw "Exit" text above door
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🚪 Exit', this.door.x + this.door.width/2, this.door.y - 10);
        ctx.textAlign = 'left';
    }
    
    checkDoorInteraction(player) {
        // Check if player is near the door
        return Math.abs(player.x - (this.door.x + this.door.width/2)) < 50 && 
               Math.abs(player.y - (this.door.y + this.door.height/2)) < 50;
    }
}
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
    window.game = new Game();
});