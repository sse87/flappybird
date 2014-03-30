
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
		this.sidewalkEl = this.el.find('.Sidewalk');
		this.player = new window.Player(this.el.find('.Player'), this);
		this.isPlaying = false;
		this.sidewalkPos = 0;
		
		// Cache a bound onFrame since we need it each frame.
		this.onFrame = this.onFrame.bind(this);
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
		
		// Animate obstacles
		// TODO
		
		// Animate sidewalk
		this.sidewalkPos -= delta * SPEED;
		if (this.sidewalkPos <= -36.1) { this.sidewalkPos += 36.1; }
		this.sidewalkEl.css('transform', 'translate(' + this.sidewalkPos + 'em, 0)');

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
		this.CURRENT_SCORE = 0;
		$('#Current-Score').text(this.CURRENT_SCORE);
	};

	/**
	 * Signals that the game is over.
	 */
	Game.prototype.gameover = function() {
		this.isPlaying = false;

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
	};

	/**
	* Increment player score when he gets past a spoon
	*/
	Game.prototype.scorePoint = function () {
		this.CURRENT_SCORE += 1;

		if (this.CURRENT_SCORE > this.HIGH_SCORE) {
			this.HIGH_SCORE = this.CURRENT_SCORE;
		}
		$('#High-Score').text(this.HIGH_SCORE);
		$('#Current-Score').text(this.CURRENT_SCORE);
	};
	/**
	 * Some shared constants.
	 */
	Game.prototype.WORLD_WIDTH = 48.0;
	Game.prototype.WORLD_HEIGHT = 64.0;

	Game.prototype.HIGH_SCORE = 0;
	Game.prototype.CURRENT_SCORE = 0;

	return Game;
})();


