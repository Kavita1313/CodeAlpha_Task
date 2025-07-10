// script.js

// --- Theme Toggle (remains mostly the same) ---
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

// --- Player Management ---
// A class or factory function to manage each individual player
class MusicPlayer {
    constructor(playerId) {
        this.id = playerId;
        this.audio = document.getElementById(`audioPlayer${playerId}`);
        this.currentTrackTitleElem = document.getElementById(`currentTrackTitle${playerId}`);
        this.currentTrackArtistElem = document.getElementById(`currentTrackArtist${playerId}`);
        this.currentTrackImageElem = document.getElementById(`currentSongImage${playerId}`); // New: Get image element
        this.playPauseBtn = document.querySelector(`.playPauseBtn[data-player-id="${playerId}"]`);
        this.prevBtn = document.querySelector(`.prevBtn[data-player-id="${playerId}"]`);
        this.nextBtn = document.querySelector(`.nextBtn[data-player-id="${playerId}"]`);
        this.volumeControl = document.querySelector(`.volumeControl[data-player-id="${playerId}"]`);
        this.addMusicFileInstance = document.querySelector(`.addMusicFileInstance[data-player-id="${playerId}"]`);
        this.playerPlaylistElem = document.getElementById(`playerPlaylist${playerId}`);

        this.playlist = []; // Array to hold track objects {src, title, artist, img}
        this.currentTrackIndex = 0;
        this.isPlaying = false;

        this.initEventListeners();
        this.loadInitialPlaylist(); // Load songs initially present in HTML
    }

    loadInitialPlaylist() {
        const initialItems = this.playerPlaylistElem.querySelectorAll('li');
        initialItems.forEach(item => {
            this.playlist.push({
                src: item.dataset.src,
                title: item.dataset.title || item.textContent.trim(), // Use data-title if available
                artist: item.dataset.artist || 'Unknown Artist', // Use data-artist
                img: item.dataset.img || 'https://via.placeholder.com/150?text=No+Image' // Use data-img or placeholder
            });
        });
        if (this.playlist.length > 0) {
            this.loadTrack(0);
        }
    }

    initEventListeners() {
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.prevBtn.addEventListener('click', () => this.playPrevious());
        this.nextBtn.addEventListener('click', () => this.playNext());
        this.volumeControl.addEventListener('input', (e) => this.setVolume(e.target.value));
        this.audio.addEventListener('ended', () => this.playNext());
        this.addMusicFileInstance.addEventListener('change', (e) => this.addLocalFiles(e.target.files));

        this.playerPlaylistElem.addEventListener('click', (e) => {
            if (e.target.tagName === 'LI') {
                const index = Array.from(this.playerPlaylistElem.children).indexOf(e.target);
                if (index !== -1) {
                    this.loadTrack(index);
                    this.play();
                }
            }
        });
    }

    loadTrack(index) {
        if (index >= 0 && index < this.playlist.length) {
            this.currentTrackIndex = index;
            const track = this.playlist[this.currentTrackIndex];
            this.audio.src = track.src;
            this.currentTrackTitleElem.textContent = track.title || 'Unknown Title';
            this.currentTrackArtistElem.textContent = track.artist || 'Unknown Artist';
            this.currentTrackImageElem.src = track.img || 'https://via.placeholder.com/150?text=No+Image'; // Update image
            this.audio.load(); // Load the new audio source
            this.updatePlaylistUI();
        }
    }

    play() {
        if (this.playlist.length === 0) {
            console.warn("No songs in the playlist to play.");
            return;
        }
        this.audio.play();
        this.isPlaying = true;
        this.playPauseBtn.textContent = 'Pause';
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.playPauseBtn.textContent = 'Play';
    }

    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    playPrevious() {
        if (this.playlist.length === 0) return;
        this.currentTrackIndex = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length;
        this.loadTrack(this.currentTrackIndex);
        this.play();
    }

    playNext() {
        if (this.playlist.length === 0) return;
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
        this.loadTrack(this.currentTrackIndex);
        this.play();
    }

    setVolume(volume) {
        this.audio.volume = volume;
    }

    addLocalFiles(files) {
        Array.from(files).forEach(file => {
            const fileURL = URL.createObjectURL(file);
            const fileName = file.name.split('.').slice(0, -1).join('.'); // Remove extension

            const newTrack = { 
                src: fileURL, 
                title: fileName, 
                artist: 'Local File',
                img: 'https://via.placeholder.com/150?text=Local+Track' // Placeholder for local files
            };
            this.playlist.push(newTrack);

            const listItem = document.createElement('li');
            listItem.textContent = fileName;
            listItem.dataset.src = fileURL;
            listItem.dataset.title = fileName;
            listItem.dataset.artist = 'Local File';
            listItem.dataset.img = 'https://via.placeholder.com/150?text=Local+Track';
            this.playerPlaylistElem.appendChild(listItem);
        });

        // If it's the first set of files added OR the playlist was empty before
        if (this.playlist.length > 0 && this.audio.src === "") {
            this.loadTrack(0); // Load the first added track
        }
        // If music is already playing and new files are added, only update UI for new files
        this.updatePlaylistUI();
    }

    updatePlaylistUI() {
        Array.from(this.playerPlaylistElem.children).forEach((li, index) => {
            if (index === this.currentTrackIndex) {
                li.classList.add('active-track');
            } else {
                li.classList.remove('active-track');
            }
        });
    }
}

// --- Initialize Multiple Players ---
const player1 = new MusicPlayer('1');
// If you have player2 in your HTML with unique IDs for elements, uncomment this:
// const player2 = new MusicPlayer('2');

// --- Global Music Library / Playlist Logic ---
const musicLibrary = document.getElementById('musicLibrary');

// Example: Add a click listener to library items to add them to a player's playlist
musicLibrary.addEventListener('click', (e) => {
    if (e.target.tagName === 'LI' && e.target.dataset.src) {
        const track = {
            src: e.target.dataset.src,
            title: e.target.dataset.title,
            artist: e.target.dataset.artist,
            img: e.target.dataset.img || 'https://via.placeholder.com/150?text=No+Image' // Ensure image is also passed
        };

        // For demonstration, let's add to Player 1's playlist
        player1.playlist.push(track);
        const listItem = document.createElement('li');
        listItem.textContent = track.title; // Displaying only title in list for simplicity
        listItem.dataset.src = track.src;
        listItem.dataset.title = track.title;
        listItem.dataset.artist = track.artist;
        listItem.dataset.img = track.img; // Set the image data attribute

        player1.playerPlaylistElem.appendChild(listItem);

        // If player 1's playlist was empty, load and play the first added track
        if (player1.playlist.length === 1 && !player1.isPlaying) { // Only load if not already playing or playlist was empty
            player1.loadTrack(0);
            // Optionally, player1.play(); if you want it to auto-play after adding the first song
        }
        player1.updatePlaylistUI(); // Update UI to reflect new addition if current song is new
    }
});

// Further development for search, filters, global playlist creation...
// (This section would likely manage the globalPlaylist and playlistSelector)

document.addEventListener('DOMContentLoaded', () => {
    // Initial setup for Player 1 when the DOM is fully loaded
    // This ensures that if the playlist is not empty, the first track info is displayed.
    if (player1.playlist.length > 0) {
        player1.loadTrack(0); // Load the first track to show its info and image
    }
});