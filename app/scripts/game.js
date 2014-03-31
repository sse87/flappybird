
window.Game = (function() {
	'use strict';

	/**
	 * Main game class.
	 * @param {Element} el jQuery element containing the game.
	 * @constructor
	 */
	
	// All these constants are in em's, multiply by 10 pixels
	// for 1024x576px canvas.
	var SPEED = 30; // * 10 pixels per second
	
	var Game = function(el) {
		this.el = el;
		this.backgroundEl = this.el.find('.Background');
		this.sidewalkEl = this.el.find('.Sidewalk');
		this.spoonsEl = el.find('.Spoons');
		this.scoreEl = this.el.find('.DisplayScore');
		this.player = new window.Player(this.el.find('.Player'), this);
		this.isPlaying = false;
		this.backgroundPos = 0;
		this.sidewalkPos = 0;
		this.isMuted = false;
		this.Controls = window.Controls;

		// Toggle music
		var audio = document.getElementById('music');
		$('#mute').click(function () {
			audio.muted = !audio.muted;
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
		
		// Animate each obstacle/spoon
		this.forEachSpoon(function (s) {
			s.updateX( s.rect.x - (delta * SPEED) );
		});
		
		// Animate sidewalk
		this.sidewalkPos -= delta * SPEED;
		if (this.sidewalkPos <= -36.1) { this.sidewalkPos += 36.1; }
		this.sidewalkEl.css('transform', 'translate(' + this.sidewalkPos + 'em, 0)');
		
		// Parallax background
		this.backgroundPos -= delta;
		this.backgroundEl.css('transform', 'translate(' + this.backgroundPos + 'em, 0)');
		
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
		
		this.spoons = [];
		this.spoonsEl.html('');
		this.addSpoon(new window.Spoon({ x: 100, y: 0, width: 6.8, height: 17.0 }));
		this.addSpoon(new window.Spoon({ x: 133, y: 0, width: 6.8, height: 17.0 }));
		
		this.currentScore = 0;
		this.backgroundPos = 0;
		$('#Current-Score').text(this.currentScore);
	};

	/**
	 * Signals that the game is over.
	 */
	Game.prototype.gameover = function() {
		this.isPlaying = false;

		$('.death').get(0).load(); 
		$('.death').get(0).play();

		// Should be refactored into a Scoreboard class.
		var that = this;
		var scoreboardEl = this.el.find('.Scoreboard');
		scoreboardEl
			.addClass('is-visible')
			.find('.Scoreboard-restart')
				.one('click', function() {
					scoreboardEl.removeClass('is-visible');
					that.start();
				});

		// Make fun of player if he has a low score
		if(this.currentScore < 2) {
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

	Game.prototype.highScore = 0;
	Game.prototype.currentScore = 0;

	return Game;
})();


