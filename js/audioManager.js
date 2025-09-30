// Audio Manager for TacoCat
class AudioManager {
    constructor() {
        this.sounds = {};
        this.isMuted = false;
        this.ambientVolume = 0.3; // 30% volume for ambient sounds
        this.effectVolume = 0.5; // 50% volume for sound effects
        
        // Initialize audio elements
        this.initializeAudio();
    }
    
    initializeAudio() {
        // Create audio elements for different sounds
        this.sounds.ambient = new Audio('audio/320506__benpm__ambient-piano-music-1.wav');
        this.sounds.coin = new Audio('audio/276143__littlerobotsoundfactory__coins_single_04.wav');
        this.sounds.button = new Audio('audio/button_click.wav');
        this.sounds.happy = new Audio('audio/taco_cat_happy.wav');
        this.sounds.save = new Audio('audio/save_success.wav');
        // Level up sounds array - will be populated with random sounds
        this.levelUpSounds = [
            new Audio('audio/LevelUp/Alright.wav'),
            new Audio('audio/LevelUp/Alright2.wav'),
            new Audio('audio/LevelUp/WeDidIt.wav'),
            new Audio('audio/LevelUp/Woohoo1.wav'),
            new Audio('audio/LevelUp/Woohoo2.wav'),
            new Audio('audio/LevelUp/WooHooYeah.wav')
        ];
        
        // Configure ambient music
        this.sounds.ambient.loop = true;
        this.sounds.ambient.volume = this.ambientVolume;
        
        // Configure sound effects
        Object.keys(this.sounds).forEach(key => {
            if (key !== 'ambient') {
                this.sounds[key].volume = this.effectVolume;
                this.sounds[key].preload = 'auto';
            }
        });
        
        // Configure level up sounds
        this.levelUpSounds.forEach(sound => {
            sound.volume = this.effectVolume;
            sound.preload = 'auto';
        });
        
        // Set up error handling
        this.setupErrorHandling();
    }
    
    setupErrorHandling() {
        // Handle missing audio files gracefully
        Object.keys(this.sounds).forEach(key => {
            this.sounds[key].addEventListener('error', (e) => {
                console.log(`Audio file not found: ${key} - game will continue without this sound`);
            });
        });
        
        // Handle missing level up sounds
        this.levelUpSounds.forEach((sound, index) => {
            sound.addEventListener('error', (e) => {
                console.log(`Level up sound ${index + 1} not found - game will continue without this sound`);
            });
        });
    }
    
    playAmbient() {
        if (!this.isMuted && this.sounds.ambient) {
            this.sounds.ambient.play().catch(e => {
                console.log('Could not play ambient music:', e);
            });
        }
    }
    
    stopAmbient() {
        if (this.sounds.ambient) {
            this.sounds.ambient.pause();
            this.sounds.ambient.currentTime = 0;
        }
    }
    
    playSound(soundName) {
        if (!this.isMuted && this.sounds[soundName]) {
            // Reset sound to beginning and play
            this.sounds[soundName].currentTime = 0;
            this.sounds[soundName].play().catch(e => {
                console.log(`Could not play sound: ${soundName}`, e);
            });
        }
    }
    
    playCoinCollect() {
        this.playSound('coin');
    }
    
    playButtonClick() {
        this.playSound('button');
    }
    
    playTacoCatHappy() {
        this.playSound('happy');
    }
    
    playSaveSuccess() {
        this.playSound('save');
    }
    
    playLevelUp() {
        if (!this.isMuted && this.levelUpSounds.length > 0) {
            // Randomly select a level up sound
            const randomIndex = Math.floor(Math.random() * this.levelUpSounds.length);
            const selectedSound = this.levelUpSounds[randomIndex];
            
            // Reset sound to beginning and play
            selectedSound.currentTime = 0;
            selectedSound.play().catch(e => {
                console.log(`Could not play level up sound ${randomIndex + 1}:`, e);
            });
        }
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            this.stopAmbient();
        } else {
            this.playAmbient();
        }
        
        return this.isMuted;
    }
    
    setMuted(muted) {
        this.isMuted = muted;
        
        if (this.isMuted) {
            this.stopAmbient();
        } else {
            this.playAmbient();
        }
    }
    
    updateVolume(ambientVol = this.ambientVolume, effectVol = this.effectVolume) {
        this.ambientVolume = Math.max(0, Math.min(1, ambientVol));
        this.effectVolume = Math.max(0, Math.min(1, effectVol));
        
        if (this.sounds.ambient) {
            this.sounds.ambient.volume = this.ambientVolume;
        }
        
        Object.keys(this.sounds).forEach(key => {
            if (key !== 'ambient' && this.sounds[key]) {
                this.sounds[key].volume = this.effectVolume;
            }
        });
        
        // Update level up sounds volume
        this.levelUpSounds.forEach(sound => {
            if (sound) {
                sound.volume = this.effectVolume;
            }
        });
    }
}
