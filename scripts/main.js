/*
* Memory Match Project - LearningFuze - Version 2.0.0
* Author - Brian Ji
*/

// need to refactor better abstraction to set up smash controller
// ask about when to declare prototypes inside constructors vs outside
// figure out what's causing accuracy rendering bug
	// seems to catch on .99999

'use strict';
var superMemory = (function() {
	var self = {
		transition: 750,
	};

	var cards = [
		'batman',
		'captainamerica',
		'flash',
		'greenlantern',
		'ironman',
		'robin',
		'spiderman',
		'superman',
		'wolverine',
	];

	var usedCards = cards;
	
	function WindowController() {
		this.load = function() {
			self.resetController.loadCards();
			self.landingAnimationController = new LandingAnimationController();
		};
	
		WindowController.prototype.handleEvent = function(e) {
			this[e.type](e);
		};

		WindowController.prototype.activate = function(el, event, fn) {
			el.addEventListener(event, fn, false);
		};

		WindowController.prototype.deactivate = function(el, event, fn) {
			el.removeEventListener(event, fn, false);
		}
	
		for (var key in this) {
			window.addEventListener(key, this, false);
		}
	}
	
	function ResetController() {
		ResetController.prototype.click = function() {
			var _this = this;

			self.landingAnimationController.clear();

			if (self.timerController) {
				self.timerController.clear();
			};

			if ($('.card-wrapper').hasClass('flipped')) {
				$('.flipped').removeClass('flipped');
				setTimeout(function() {
					_this.reset();
				}, self.transition);
			} else {
				$('.flipped').removeClass('flipped');
				this.reset();
			}
		};

		ResetController.prototype.reset = function() {
			var _this = this;
			usedCards = cards;

			self.landingAnimationController.clear();
			$('#cards-container').html('');
			_this.loadCards();
			$('#reset-button').html('reset');
			setTimeout(function() {
				_this.revealCards();
				setTimeout(function() {
					_this.hideCards();
					self.gameplayController = new GameplayController();
					self.accuracyModel.set('stat', 0);
					self.triesModel.set('stat', 0);
				}, 100)
			}, 100)
		};
	
		ResetController.prototype.loadCards = function() {
			var tmpl = usedCards.concat(usedCards),
				i = 0,
				len = tmpl.length;
	
			while (len > 0) {
				var rand = Math.ceil(Math.random() * (len - 1));
		
				$('#cards-container').append($('#' + tmpl[rand] + '-tmpl').html());
				tmpl.splice(rand, 1);
				len--;
			}
		};
	
		ResetController.prototype.revealCards = function() {
			$('.card-wrapper').addClass('flipped');
		};
	
		ResetController.prototype.hideCards = function() {
			setTimeout(function() {
				$('.flipped').removeClass('flipped');
				self.gameplayController.activateCards();
				self.xrayController.deactivate();
				self.smashController.deactivate();
			}, this.getTimer());
		};
	
		ResetController.prototype.getTimer = function() {
			switch ($('#difficulty').val()) {
				case 'Sidekick':
					return 5000;
					break;
				case 'Hero':
					return 3000;
					break;
				case 'Superhero':
					return 1500;
					break;
			}
		};

	
		$('#reset-button').get().addEventListener('click', this, false);
	}
	
	ResetController.prototype = WindowController.prototype;
	
	function GameplayController() {
		this.first = {
			id: '',
			el: '',
		};

		this.second = {
			id: '',
			el: '',
		};

		this.match = 0;
		
		this.click = function(e) {
	
			$(e.currentTarget).toggleClass('flipped');
	
			this.setSelected(e);
	
		
			if (this.first.id !== '' && this.second.id !== ''){
					this.success();
					this.fail();
					self.triesModel.set('stat', ++self.triesModel.stat);
					self.accuracyModel.set('stat', this.match / self.triesModel.stat);
			}
	
			if (this.match === cards.length) {
				this.win();
			}
		};

		GameplayController.prototype.win = function() {
			alert('Congrats! You finished in ' + self.timerController.min + ' minutes and ' + self.timerController.sec + ' seconds');
			self.timerController.clear();
		};

		GameplayController.prototype.success = function() {
			var _this = this;

			if (this.first.id === this.second.id) {
				usedCards = usedCards.filter(function(item) {
					if (item !== _this.first.id) {
						return item;
					}
				})

				$(this.first.el).addClass('matched').get().removeEventListener('click', this, false);
				$(this.second.el).addClass('matched').get().removeEventListener('click', this, false);
				this.clearSelected();
				this.match++;
			} 
		};
		
		GameplayController.prototype.fail = function() {
			var _this = this;

			if (this.first.id !== this.second.id) {
				setTimeout(function() {
					$(_this.first.el).removeClass('flipped');
					$(_this.second.el).removeClass('flipped');	
					_this.clearSelected();
				}, self.transition);
			}
		};
	
		GameplayController.prototype.setSelected = function(e) {
			//second second
			if (this.first.id !== '' & this.second.id === '') {
				this.second.id = e.currentTarget.getAttribute('data-id');
				this.second.el = e.currentTarget;
			}
			
			//first click
			if (this.first.id === '' && this.second.id === '') {
				this.first.id = e.currentTarget.getAttribute('data-id');
				this.first.el = e.currentTarget;
			}
		}
	
		GameplayController.prototype.clearSelected = function() {
				this.first.id = '';
				this.second.id = '';
				this.first.el = '';
				this.second.el = '';	
		};
	
		GameplayController.prototype.activateCards = function() {
			var cards = $('.card-wrapper').get();
			for (var i = 0, len = cards.length; i < len; i++) {
				cards[i].addEventListener('click', this, false);
			}

			if (self.timerController) {
				self.timerController.clear();
				self.timerController.reset();
			}

			self.timerController = new TimerController();
		};

	}
		
	GameplayController.prototype = WindowController.prototype;
	
	
	function XrayController() {
		this.el = '#x-ray-button';
	
		this.click = function() {
			this.activate();
			$('.card-front').addClass('x-ray');
			setTimeout(function() {
				$('.card-front').removeClass('x-ray');
			}, self.resetController.getTimer());
		}
	
		XrayController.prototype.activate = function() {
			$(this.el).get().removeEventListener('click', this, false);
			$(this.el).addClass('dead');
		};
	
		XrayController.prototype.deactivate = function() {
			$(this.el).get().addEventListener('click', this, false);
			$(this.el).removeClass('dead');
		};

	}
	
	XrayController.prototype = WindowController.prototype;

	function SmashController() {
		this.el = '#smash-button';

		this.click = function() {
			this.activate();
			this.smash();
		};

		this.smash = function() {
			var rand = Math.ceil(Math.random() * (usedCards.length - 1));
			var smashed = $('.' + usedCards[rand]);

			smashed.addClass('flipped');
			self.gameplayController.match++;

			if (self.gameplayController.match === cards.length) {
				self.gameplayController.win();
			}
		}			

	}

	SmashController.prototype = XrayController.prototype;

	function TriesModel() {
		this.stat = 0;
		this.el = '#tries-stat';

		this.render = function() {
			$(this.el).html(this.stat);
		};
	
		TriesModel.prototype.set = function(prop, val) {
			this[prop] = val;
			this.render();
		}
	}
	
	function AccuracyModel() {
		this.accuracy = '';
		this.el = '#accuracy-stat';

		this.render = function() {
			if (self.gameplayController.match === 0) {
				$(this.el).html('0%');
			} else {
				$(this.el).html(this.stat.toFixed(2) * 100 + '%');
			}
		}
	
		AccuracyModel.prototype.set = TriesModel.prototype.set;
	}

	function TimerController() {
		var _this = this;
		// reference point 
		this.sec = 0,
		this.min = 0;
	
		var timer = setInterval(function() {
			_this.sec++;		
	
			if (_this.sec === 60) {
				_this.min++;
				_this.sec = 0;
			}
	
			$('#time-stat').html(_this.min + 'm' + ' ' + _this.sec + 's');
		}, 1000)
	
		this.clear = function() {
			clearInterval(timer);
		};

		this.reset = function() {
			this.sec = 0;
			this.min = 0;
		};
	}
	
	self.windowController = new WindowController();
	self.resetController = new ResetController();
	self.xrayController = new XrayController();
	self.smashController = new SmashController();
	self.triesModel = new TriesModel();
	self.accuracyModel = new AccuracyModel();
	
	
	/* for fun */
	function LandingAnimationController() {
		var animation = setInterval(function() {
				var cards = $('.card-wrapper').get();
	
				$(cards[Math.ceil(Math.random() * (cards.length - 1))]).toggleClass('flipped');
				
				setTimeout(function() {
					$(cards[Math.ceil(Math.random() * (cards.length - 1))]).toggleClass('flipped');
				}, Math.ceil(Math.random() * 1000));
			}, 1000)
	
		this.clear = function() {
			clearInterval(animation);
		}
	}
	
	return self
})();




