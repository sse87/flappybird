window.Spoon = (function() {
	'use strict';
	
	var Spoon = function(rect) {
		
		this.rect = rect;
		if (this.rect.y === 0)
			this.rect.y = this.getRandomInt(10, 35);
		
		this.el = $('<div class="Spoons">');
		
		this.topSpoonEl = $('<div class="spoon top">');
		this.topSpoonEl.css({ width: '100%', height: rect.y + 'em' });
		this.el.append(this.topSpoonEl);
		
		this.gapEl = $('<div class="gap">');
		this.gapEl.css({ width: rect.width + 'em', height: rect.height + 'em' });
		this.el.append(this.gapEl);
		
		this.bottomSpoonEl = $('<div class="spoon bottom">');
		this.bottomSpoonEl.css({ width: '100%', height: '50em' });// Multiply by 2 just to make sure
		this.el.append(this.bottomSpoonEl);
		
		this.el.css({
			transform: 'translate(' + rect.x + 'em, 0)', 
			left: '0em', 
			top: '0',
			width: rect.width + 'em', 
			height: '100%'
		});
	};
	
	Spoon.prototype.updateX = function(newX) {
		this.rect.x = newX;
		if (this.rect.x < -10) {
			this.rect.x = 58;
			this.setRandomGap();
		}
		this.el.css('transform', 'translate(' + this.rect.x + 'em, 0)');
	};
	
	Spoon.prototype.setRandomGap = function() {
		this.rect.y = this.getRandomInt(10, 35);
		this.topSpoonEl.css('height', this.rect.y + 'em');
	};
	
	Spoon.prototype.getRandomInt = function(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	};
	
	return Spoon;
	
})();
