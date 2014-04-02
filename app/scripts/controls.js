
window.Controls = (function() {
    'use strict';

    /**
     * Key codes we're interested in.
     */
    var KEYS = {
        32: 'space'
    };

    /**
     * A singleton class which abstracts all player input,
     * should hide complexity of dealing with keyboard, mouse
     * and touch devices.
     * @constructor
     */
    var Controls = function() {
        this._didJump = false;
        this._hasAnyKeyPressed = false;
        this.keys = {};
        $(window)
            .on('click', this._onMouseDown.bind(this))
            .on('keydown', this._onKeyDown.bind(this))
            .on('keyup', this._onKeyUp.bind(this));
    };
    
    Controls.prototype.reset = function() {
        this._didJump = false;
        this._hasAnyKeyPressed = false;
        this.keys = {};
    };
    
    Controls.prototype._onMouseDown = function(e) {
        // Only support mouse when it's inside of game
        if (e.screenX !== 0 && e.screenX !== 0 && $(e.target).is('div.Background')) {
            // Support floating at start of each game
            if (this._hasAnyKeyPressed === false) {
                this._hasAnyKeyPressed = true;
            }
            
            this._didJump = true;
        }
    };
    
    Controls.prototype._onKeyDown = function(e) {
        // Support floating at start of each game
        if (this._hasAnyKeyPressed === false && e.keyCode === 32) {
            this._hasAnyKeyPressed = true;
        }
        
        // Only jump if space wasn't pressed.
        if (e.keyCode === 32 && !this.keys.space) {
            this._didJump = true;
        }

        // Remember that this button is down.
        if (e.keyCode in KEYS) {
            var keyName = KEYS[e.keyCode];
            this.keys[keyName] = true;
            return false;
        }
    };

    Controls.prototype._onKeyUp = function(e) {
        if (e.keyCode in KEYS) {
            var keyName = KEYS[e.keyCode];
            this.keys[keyName] = false;
            return false;
        }
    };

    /**
     * Only answers true once until a key is pressed again.
     */
    Controls.prototype.didJump = function() {
        var answer = this._didJump;
        this._didJump = false;
        return answer;
    };
    /**
     * Waits for anykey when the game starts
     */
    Controls.prototype.anyKeyPressed = function () {
        return this._hasAnyKeyPressed;
    };
    Controls.prototype.resetAnyKey = function () {
        this._hasAnyKeyPressed = false;
    };
    
    // Export singleton.
    return new Controls();
})();
