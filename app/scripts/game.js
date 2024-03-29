
window.Game = (function() {
	'use strict';

	/**
	 * Main game class.
	 * @param {Element} el jQuery element containing the game.
	 * @constructor
	 */

	// All these constants are in em's, multiply by 10 pixels
	var SPEED = 30; // * 10 pixels per second

	var Game = function(el) {
		this.Controls = window.Controls;
		this.el = el;
		this.backgroundEl = this.el.find('.Background');
		this.sidewalkEl = this.el.find('.Sidewalk');
		this.spoonsEl = this.el.find('.Spoons');
		this.scoreEl = this.el.find('.DisplayScore');
		this.scoreboardEl = this.el.find('.Scoreboard');
		
		this.player = new window.Player(this.el.find('.Player'), this);
		this.isPlaying = false;
		
		this.backgroundPos = 0;
		this.sidewalkPos = 0;
		this.highScore = 0;
		this.currentScore = 0;
		this.killReason = 0;
		this.isSound = true;

		// Toggle music
		var music = document.getElementById('music');
		$('#musicMuteToggle').click(function () {
			music.muted = !music.muted;
			$('#musicMuteToggle span').html('Music ' + (music.muted ? 'on' : 'off'));
		});

		// Toggle sound
		$('#soundMuteToggle').click(function () {
			// Actually mute every audio element with the class sound
			$('audio.sound').each(function () {
				// 'this' as in this audio.sound element it's looking at
				this.muted = !this.muted;
			});
			this.isSound = !this.isSound;
			$('#soundMuteToggle span').html('Sound ' + (this.isSound ? 'on' : 'off'));
		});
		
		// Should be refactored into a Scoreboard class.
		var that = this;
		this.scoreboardEl.find('.Scoreboard-restart')
		.on('click', function() {
			if (that.isPlaying === false) {
				that.scoreboardEl.removeClass('is-visible');
				that.start();
			}
		});
		$(window).on('keydown', function(e) {
			if (that.isPlaying === false && e.keyCode === 32) {
				that.scoreboardEl.removeClass('is-visible');
				that.start();
			}
		});
		
		// Submit score
		$('#scoreSubmit').click(function() {
			
			var inputName = prompt('Please enter your name', 'anonymouse');
			
			var playerName = (inputName !== null ? inputName : '');
			var playerScore = that.currentScore;
			var killReason = that.killReason;
			var gameVersion = '1.0.0';
			var securityHash = '';//Maybe later
			
			if (playerName !== '')
			{
				$.ajax({
					type: 'POST',
					url: '/flappy/scores/submitScore.php',
					data: {
						name: playerName,
						score: playerScore,
						killmsg: killReason,
						version: gameVersion,
						hash: securityHash
					}
				}).done(function (response) {
					if (response === '0') {
						window.location = 'http://sse87.1984.is/flappy/scores/';
					}
					else {
						console.log('ajax error: ' + response);
					}
				});
			}
			
		});

		// Cache a bound onFrame since we need it each frame.
		this.onFrame = this.onFrame.bind(this);
	};
	
	Game.prototype.addSpoon = function(spoon) {
		this.spoons.push(spoon);
		this.spoonsEl.append(spoon.el);
	};
	// Getter function to access this.boxes array
	Game.prototype.forEachSpoon = function (handler) {
		this.spoons.forEach(handler);
	};
	
	/**
	 * Runs every frame. Calculates a delta and allows each game
	 * entity to update itself.
	 */
	Game.prototype.onFrame = function() {
		// Check if the game loop should stop.
		if (!this.isPlaying) {
			return;
		}

		// Calculate how long since last frame in seconds.
		var now = +new Date() / 1000,
				delta = now - this.lastFrame;
		this.lastFrame = now;

		// Update game entities.
		this.player.onFrame(delta);

		if (this.Controls.anyKeyPressed()) {
			// Animate each obstacle/spoon
			this.forEachSpoon(function (s) {
				s.updateX( s.rect.x - (delta * SPEED) );
			});
		}

		// Animate sidewalk
		this.sidewalkPos -= delta * SPEED;
		if (this.sidewalkPos <= -36.1) { this.sidewalkPos += 36.1; }
		this.sidewalkEl.css('transform', 'translate3d(' + this.sidewalkPos + 'em, 0, 0)');

		// Parallax background
		this.backgroundPos -= delta;
		this.backgroundEl.css('transform', 'translate3d(' + this.backgroundPos + 'em, 0, 0)');

		// Request next frame.
		window.requestAnimationFrame(this.onFrame);
	};

	/**
	 * Starts a new game.
	 */
	Game.prototype.start = function() {
		this.reset();

		// Restart the onFrame loop
		this.lastFrame = +new Date() / 1000;
		window.requestAnimationFrame(this.onFrame);
		this.isPlaying = true;
	};

	/**
	 * Resets the state of the game so a new game can be started.
	 */
	Game.prototype.reset = function() {
		this.player.reset();
		this.Controls.reset();

		this.spoons = [];
		this.spoonsEl.html('');
		// If y is zero then the Spoon class will randomize it
		this.addSpoon(new window.Spoon({ x: 100, y: 0, width: 6.8, height: 18.0 }));
		this.addSpoon(new window.Spoon({ x: 133, y: 0, width: 6.8, height: 18.0 }));

		this.backgroundPos = 0;
		this.currentScore = 0;
		$('#Current-Score').text(this.currentScore);
	};

	/**
	 * Signals that the game is over.
	 */
	Game.prototype.gameover = function() {
		this.isPlaying = false;
		this.scoreboardEl.addClass('is-visible');

		$('.death').get(0).load();
		$('.death').get(0).play();

		// Make fun of player if he has a low score
		if (this.currentScore < 2) {
			setTimeout (function() {
				$('.kidding').get(0).load();
				$('.kidding').get(0).play();
			}, 500);
		}
	};

	/**
	* Increment player score when he gets past a spoon
	*/
	Game.prototype.scorePoint = function(score) {
		this.currentScore += score;

		if (this.currentScore > this.highScore) {
			this.highScore = this.currentScore;
		}
		$('#High-Score').text(this.highScore);
		$('#Current-Score').text(this.currentScore);
		if (score === 1) { this.displayScore(); }
	};
	/**
	* Displays score on screen when player scores a point
	*/
	Game.prototype.displayScore = function() {
		$('.DisplayScore').text(this.currentScore);
		$('.DisplayScore').fadeIn('fast', function() {
			$('.DisplayScore').fadeOut('slow');
		});

		var rand = Math.floor((Math.random() * 4) + 1);

		if (rand === 1) { $('.haha1').get(0).load(); $('.haha1').get(0).play(); }
		if (rand === 2) { $('.haha2').get(0).load(); $('.haha2').get(0).play(); }
		if (rand === 3) { $('.haha3').get(0).load(); $('.haha3').get(0).play(); }
		if (rand === 4) { $('.haha4').get(0).load(); $('.haha4').get(0).play(); }
	};
	/**
	* Some shared constants.
	*/
	Game.prototype.WORLD_WIDTH = 48.0;
	Game.prototype.WORLD_HEIGHT = 64.0;

	return Game;

})();
