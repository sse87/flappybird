window.Player = (function() {
	'use strict';

	// All these constants are in em's, multiply by 10 pixels
	var WIDTH = 7.35;
	var HEIGHT = 6.15;
	var INITIAL_POSITION_X = 15;
	var INITIAL_POSITION_Y = 25;
	var GRAVITY = 275;
	var JUMP_VELOCITY = 75;
	
	var Player = function(el, game) {
		this.el = el;
		this.game = game;
		this.pos = { x: INITIAL_POSITION_X, y: INITIAL_POSITION_Y };
		this.floatingTimer = 0;
		
		this.el.css({ 'width': WIDTH + 'em', 'height': HEIGHT + 'em' });
	};

	/**
	 * Resets the state of the player for a new game.
	 */
	Player.prototype.reset = function() {
		this.pos.x = INITIAL_POSITION_X;
		this.pos.y = INITIAL_POSITION_Y;
		this.vel = { x: 0, y: 0 };
	};

	Player.prototype.onFrame = function(delta) {
		
		// Gravity
		if (this.game.Controls.anyKeyPressed()) {
			this.vel.y += GRAVITY * delta;
		}
		else {
			this.floatingTimer += delta;
			if (this.floatingTimer > 1) {
				this.floatingTimer -= 1;
				this.vel.y = (this.vel.y < 0 ? 2 : -2);
			}
		}
		
		// Prevent endless jumping so holding down space bar does not work
		if (this.game.Controls.didJump()) {
			this.jump(JUMP_VELOCITY);
		}
		
		// Calculating falling distance
		this.pos.y += delta * this.vel.y;
		
		// Collision detection
		this.checkCollisionWithGound();
		this.checkCollisionWithSpoons();
		
		// Update UI
		this.el.toggleClass('falling', (this.vel.y > 0));
		var rotation = (this.vel.y > 90 ? 90 : (this.vel.y < -25 ? -25 : this.vel.y));
		this.el.css('transform', 'translate3d(' + this.pos.x + 'em, ' + this.pos.y + 'em, 0) rotate(' + rotation + 'deg)');
	};

	Player.prototype.jump = function (force) {
		var rand = Math.floor((Math.random() * 4) + 1);

		if (rand === 1) { $('.chip1').get(0).load(); $('.chip1').get(0).play(); }
		if (rand === 2) { $('.chip2').get(0).load(); $('.chip2').get(0).play(); }
		if (rand === 3) { $('.chip3').get(0).load(); $('.chip3').get(0).play(); }
		if (rand === 4) { $('.chip4').get(0).load(); $('.chip4').get(0).play(); }

		this.vel.y = -force;
	};

	Player.prototype.checkCollisionWithGound = function() {
		if (this.pos.y + HEIGHT > this.game.WORLD_HEIGHT - 5) {
			this.game.killReason = 'Roadkill';
			return this.game.gameover();
		}
	};
	
	Player.prototype.checkCollisionWithSpoons = function() {
		
		var johnnyRect = {};
		johnnyRect.x = this.pos.x + 0.5;
		johnnyRect.y = this.pos.y + 0.5;
		johnnyRect.width = WIDTH - 0.5;
		johnnyRect.height = HEIGHT - 0.5;
		
		johnnyRect.right = this.pos.x + johnnyRect.width;
		johnnyRect.bottom = this.pos.y + johnnyRect.height;
		
		var johnny = this;
		this.game.forEachSpoon(function (s) {
			
			// Only check for one spoon at a time
			if (s.rect.x > 8 && s.rect.x < 24) {
				
				// Vertical collision detection
				if ((s.rect.x + 2.4) < johnnyRect.right &&
					(s.rect.right - 2.4) > johnnyRect.x) {
					
					// Gap collision detection
					if (s.rect.y < johnnyRect.y &&
						s.rect.bottom > johnnyRect.bottom) {
						
						johnny.game.scorePoint(s.getPoints());
					}
					else {
						johnny.game.killReason = 'Spooned';
						johnny.game.gameover();
					}
				}
			}
		});
	};

	return Player;

})();
