window.Player = (function() {
	'use strict';

	var Controls = window.Controls;

	// All these constants are in em's, multiply by 10 pixels
	// for 1024x576px canvas.
	var SPEED = 30; // * 10 pixels per second
	var WIDTH = 9.8;
	var HEIGHT = 8.2;
	var INITIAL_POSITION_X = 20;
	var INITIAL_POSITION_Y = 25;
	var GRAVITY = 275;
	var JUMP_VELOCITY = 75;

	var Player = function(el, game) {
		this.el = el;
		this.game = game;
		this.pos = { x: 0, y: 0 };
		
		this.el.css({ 'width': WIDTH + 'em', 'height': HEIGHT + 'em' });
	};

	/**
	 * Resets the state of the player for a new game.
	 */
	Player.prototype.reset = function() {
		this.pos.x = INITIAL_POSITION_X;
		this.pos.y = INITIAL_POSITION_Y;
		this.vel = { x: 0, y: 1 };
	};

	Player.prototype.onFrame = function(delta) {

		// Gravity
		this.vel.y += GRAVITY * delta;

		if (Controls.keys.space) {
			this.jump(JUMP_VELOCITY);
		}
		this.pos.y += delta * this.vel.y;

		this.checkCollisionWithBounds();

		// Update UI
		this.el.toggleClass('falling', (this.vel.y > 0));
		var rotation = (this.vel.y > 90 ? 90 : (this.vel.y < -25 ? -25 : this.vel.y));
		this.el.css('transform', 'translate(' + this.pos.x + 'em, ' + this.pos.y + 'em) rotate(' + rotation + 'deg)');
	};

	Player.prototype.jump = function (force) {
		this.vel.y = -force;
	};

	Player.prototype.checkCollisionWithBounds = function() {
		if (this.pos.x < 0 ||
			this.pos.x + WIDTH > this.game.WORLD_WIDTH ||
			this.pos.y < 0 ||
			this.pos.y + HEIGHT > this.game.WORLD_HEIGHT) {
			return this.game.gameover();
		}
	};

	return Player;

})();
