// [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[|]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]
// [[[[[[[[[[[[[[[[[[[[[[[[[[ Variable Initialization ]]]]]]]]]]]]]]]]]]]]]]]]]]
// [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[|]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]

// Checks to see if user has reduced motion preference setting in browser
const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

let touch = false,
	mot = mediaQuery.matches?0:1,
	cur = 1,
	per = .501,
	snd = 1,
	unlockedAudio = 0,
	currentLoc = '',
	scoreMeterVal= [0,0];

let mdnSound,
		invSound,
		mupSound,
		hovSound,
		unkSound;

const lsVersion = 0.3;

// Load the questions.json file which contains all the questions & answers
let getQs = $.getJSON( "js/questions.json", function() {})
	.done(function() {
		questList = JSON.parse(getQs.responseText).questions;
	})
	.fail( function(d, textStatus, error) {
		console.error("getJSON for questions.json failed, status: " + textStatus + ", error: "+error)
	});


// [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[|]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]
// [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[ Listeners ]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]
// [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[|]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]

// things to run when DOM is ready
$(document).ready(function() {

	// finds & sets motion prefs based on local storage. If no local storage, adds it.
	!localStorage.getItem('motion')
		? localStorage.setItem('motion', mot)
		: mot = parseInt(localStorage.getItem('motion'));

	!localStorage.getItem('cursor')
		? localStorage.setItem('cursor', cur)
		: cur = parseInt(localStorage.getItem('cursor'));

	!localStorage.getItem('perspective')
		? localStorage.setItem('perspective', per)
		: per = parseInt(localStorage.getItem('perspective'));

	!localStorage.getItem('sound')
		? localStorage.setItem('sound', snd)
		: snd = parseInt(localStorage.getItem('sound'));

	// Sets link functionality
	$('body').on('click', 'a', function(e) {
		// Stops normal link functionality
		e.preventDefault();
		// Executes navigation
		changePage($(this).attr('href'));

		e.target.blur();
	});

	// Makes sure the buttons dont stay focused after being clicked
	$('body').on('click', 'button', function(e) {
		e.target.blur();
	});

	// Unlocks the audio permission when user touches or clicks body
	$('html').on('mousedown touchstart', !unlockedAudio?unlockAudio:'');


	// /‾‾  /‾‾‾\ |   | |\  | |‾‾‾\
	// \--\ |   | |   | | \ | |   |
	// ___/ \___/ \___/ |  \| |___/

	mdnSound = new Audio('/audio/glug-mousedown.mp3'),
	invSound = new Audio('/audio/glug-invalid.mp3'),
	mupSound = new Audio('/audio/glug-mouseout-mouseup.mp3'),
	hovSound = new Audio('/audio/glug-mouseover.mp3'),
	unkSound = new Audio('/audio/glug-unknown.mp3');

	// Detect touchscreen device
	touch = detectTouch();

	// /‾‾‾ |   | |‾‾\ /‾‾  /‾‾‾\ |‾‾\
	// |    |   | |__/ \--\ |   | |__/
	// \___ \___/ |  \ ___/ \___/ |  \

	$('body')
		// When mouse enters an input or textarea
		.on('mouseenter', 'input, textarea', () => {
			$('#cursor').addClass('inputHover');
			if (snd && unlockedAudio) hovSound.play();
		})
		// When mouse enters a link or button
		.on('mouseenter', 'a, button', e => {
			$('#cursor').addClass('hover');
			if (snd && unlockedAudio) hovSound.play();
			if ($(e.target).attr('href')) {
				if (!$(e.target).attr('href').indexOf('http')) {
					$('#cursor').addClass('link');
				}
			}
		})
		// When mouse leaves an input, textarea, link, or button
		.on('mouseleave', 'a, button, input, textarea', () => {
			$('#cursor').removeClass('link hover mousedown mouseRefuse inputHover');
			if (snd && unlockedAudio) mupSound.play();
		})
		// When mouse clicks down on an input, textarea, link, or button
		.on('mousedown', 'a, button, input, textarea', e => {
			// If the LINK in the menu has the class of 'active', is in: it's the current page
			if ($(e.target).hasClass('active')||$(e.target).parents('a').hasClass('active')) {
				$('#cursor').addClass('mouseRefuse');
				if (snd && unlockedAudio) invSound.play();
			} else {
				$('#cursor').addClass('mousedown');
				if (snd && unlockedAudio) mdnSound.play();
			}
		})
		// When mouse realeases click on an input, textarea, link, or button
		.on('mouseup', 'a, button, input, textarea', () => {
			$('#cursor').removeClass('mousedown mouseRefuse')
			if (snd && unlockedAudio) mupSound.play();
		});

	$('header, footer')
		// When the cursor enters the header or footer
		.on('mouseenter', () => {
			if (cur && mot) $('#cursor').addClass('noTransform');
		})
		// When the cursor leaves the header or footer
		.on('mouseleave', () => {
			if (cur && mot) $('#cursor').removeClass('noTransform');
		})

	//   /\   |\  | /‾‾  |    | |‾‾‾ |‾‾\ /‾‾
	//  /__\  | \ | \--\ | /\ | |--  |__/ \--\
	// /    \ |  \| ___/ |/  \| |___ |  \ ___/

	// mouse controls for select elements
	$('main')
		// When mouse enters a select element
		.on('mouseenter', '.select', function() {
			$(this).focus();
		})
		.on('focusin', '.select', function() {
			openAns($(this));
			if (snd && unlockedAudio) hovSound.play();
		})
		// When mouse leaves or releases click on select element
		.on('mouseleave focusout', '.select', function() {
			closeAns($(this));
			if (snd && unlockedAudio) mupSound.play();
		});

	// Keyboard controls for select elements
	$('main')
		// When key is pressed down
		.on('keydown', '.select', function(e) {
			// console.log(e.which);
			e.stopPropagation();

			console.log(e.which);

			let t = $(this);

			switch (e.which) {
				// Up arrow
				case 38:
				// W
				case 87:
					openAns(t);
					t.find('.answer').removeClass('selected');
					t.find('.topAns').addClass('selected');
					break;
				// Down arrow
				case 40:
				// S
				case 83:
					openAns(t);
					t.find('.answer').removeClass('selected');
					t.find('.botAns').addClass('selected');
					break;
				// Escape
				case 27:
					t.find('.answer').removeClass('selected');
					closeAns(t);
					break;
				// Enter
				case 13:
				// Space
				case 32:
					e.preventDefault();
					if (t.hasClass('open') && t.find('.selected').length) {
						closeAns(t);
						t.nextAll('.select, .qBtn').eq(0).focus();
					} else {
						openAns(t);
					}
					break;
				// Right arrow
				case 39:
				// D
				case 68:
					e.preventDefault();

					if (t.nextAll('.select').length) {
						if (t.hasClass('open')) {
							closeAns(t);
						}
						t.nextAll('.select').eq(0)
							.focus()
							.addClass('open');
					}
					break;
				// Left arrow
				case 37:
				// A
				case 65:
					e.preventDefault();

					if (t.prevAll('.select').length) {
						if (t.hasClass('open')) {
							closeAns(t);
						}
						t.prevAll('.select').eq(0)
							.focus()
							.addClass('open');
					}
					break;
			}
		})
		// When key is released
		.on('focusout keyup', '.select', function(e) {
			// Prevents enter key from automatically activating next button
			if (e.which === 13) {
				e.preventDefault();
			}
		});

	// mouse controls answer elements
	$('main')
		// When mouse enters an answer element
		.on('mouseenter', '.answer', function() {
			$(this).siblings('.answer').removeClass('selected');
			$(this).addClass('selected');
			$(this).parents('.select').addClass('selectionMade');
		})
		.on('mouseup', '.answer', function() {
			$(this).addClass('selected');
			closeAns($(this).parents('.select'));
		})
		// When mouse moves inside an answer element (motion effects)
		.on('mousemove', '.answer', e => {
			if (mot) {
				let a = $(e.target);

				let s = a.parents('.select');

				let x = e.pageX,
					y = e.pageY,
					ex = s.offset().left,
					ey = s.offset().top,
					ew = s.outerWidth(),
					eh = 32,
					diff = a.hasClass('topAns')?0:64;

				let cx = ex+(ew/2),
					cy = ey+diff+(eh/2);

				let calcX = (Math.abs(x-cx)/(x-cx))*(Math.abs(x-cx)**(1/2)),
					calcY = (Math.abs(y-cy)/(y-cy))*(Math.abs(y-cy)**(1/2));

				a.css({
					'-webkit-transform': 'translate('+calcX+'px,'+calcY+'px)',
					'-moz-transform': 'translate('+calcX+'px,'+calcY+'px)',
					'-ms-transform': 'translate('+calcX+'px,'+calcY+'px)',
					'transform': 'translate('+calcX+'px,'+calcY+'px)'
				});
			}
		})
		// When mouse leaves an answer element (reset motion effects)
		.on('mouseleave', '.answer', () => {
			if (mot) {
				$('.answer').css({
					'-webkit-transform': 'translate(0px,0px)',
					'-moz-transform': 'translate(0px,0px)',
					'-ms-transform': 'translate(0px,0px)',
					'transform': 'translate(0px,0px)'
				});
			}
		});

	$('main')
		// When blank is clicked (clears selected answers)
		.on('mouseup', '.blank', function() {
			$(this).parents('.select').removeClass('selectionMade');
			$(this).siblings('.answer').removeClass('selected');
		});

	$('main').on('mouseup touchend', '.qBtn', e => {
		if ($(e.target).prop('disabled') || !$(e.target).parents('.selectionMade').length) {
			recordQ();
		}
	})

	// If on desktop sets cursor element to follow mouse & apply motion effects to cursor & main
	if (!touch) {
		// Listens for mouse movement and moves the custom cursor to the pointer position
		$(document).bind('mousemove', e => {

			if (mot || cur) {

				// initializes variables
				let w, h, x, y, xd, yd, mbor;

				// Gets window dimensions
				w = $(window).width();
				h = $(window).height();

				// gets position of pointer in window
				x = e.pageX;
				y = e.pageY;

				// Sets the position of the cursor
				if (cur) {
					$('#cursor').css({
						'left' : x - 3,
						'top' : y - 3
					});
				}

				// Sets rotation of main elements if motion effects are on
				if (mot) {

					// calculates the pointer's distance from the center using the given measurements above.
					// Units are normalized.
					// ie when cursor is in middle, coordinates are (0,0)
					// when cursor is fully top-left, coordinates are (15,15)
					yd = -(5 - 10*(x/w));
					xd = 5 - 10*(y/h);

					// Calculates the easing for the y rotation (looks like 2/3 root curve)
					let calcY = (Math.abs(yd)/yd)*(Math.abs(yd)**(2/3));

					// determines the css properties for the shadow color for the body (based on score status)
					let shadCol = $('body').hasClass('status-meh')?'rgba(82, 0, 210, 0.15)':($('body').hasClass('status-de')?'rgba(0, 183, 226, 0.15)':'rgba(255, 0, 98, 0.15)');

					// Concatonates the string for the box-shadow property of body
					let bodyShad = String((-10*yd+'px '+10*xd+'px 180px -60px '+shadCol+' inset'));



					$('main').css({
						'-webkit-transform': `rotateX(${per*(xd-2)}deg) rotateY(${per*calcY}deg) translate(${9*per*calcY}px,${-9*per*xd+10}px)`,
						'-moz-transform': `rotateX(${per*(xd-2)}deg) rotateY(${per*calcY}deg) translate(${9*per*calcY}px,${-9*per*xd+10}px)`,
						'-ms-transform': `rotateX(${per*(xd-2)}deg) rotateY(${per*calcY}deg) translate(${9*per*calcY}px,${-9*per*xd+10}px)`,
						'transform': `rotateX(${per*(xd-2)}deg) rotateY(${per*calcY}deg translate(${9*per*calcY}px,${-9*per*xd+10}px)`
					});
					// Sets the box-shadow of the body
					$('body').css({
						'box-shadow': bodyShad
					});
					if (cur) {
						$('#cursor').css({
							'-webkit-transform': 'rotateX('+ xd +'deg) rotateY('+ calcY +'deg)',
							'-moz-transform': 'rotateX('+ xd +'deg) rotateY('+ calcY +'deg)',
							'-ms-transform': 'rotateX('+ xd +'deg) rotateY('+ calcY +'deg)',
							'transform': 'rotateX('+ xd +'deg) rotateY('+ calcY +'deg)'
						});
					}
				}
			}
		});
	} else {

		// ‾‾|‾‾ /‾‾‾\ |   | /‾‾‾ |   |
		//   |   |   | |   | |    |---|
		//   |   \___/ \___/ \___ |   |

		$('body').addClass('touch');

		$('main').off();
		$('body').off();

		$('.touch')
			.on('touchstart', '.open .answer', function() {
				$(this).siblings('.answer').removeClass('selected');
				$(this).addClass('selected');
			});

		$('.touch')
			.on('touchend', '.select', function() {
				$(this).hasClass('open')
					? closeAns($(this))
					: openAns($(this));
			});
	}


	// /‾‾  |‾‾‾ ‾‾|‾‾ ‾‾|‾‾ ‾‾|‾‾ |\  | /‾‾  /‾‾
	// \--\ |--    |     |     |   | \ | |  - \--\
	// ___/ |___   |     |   __|__ |  \| \__/ ___/

	$('main')
		// When reset score button is clicked
		.on('click','#scoreMeter+button', () => {
			localStorage.removeItem('Qprogress');
			storageSetup();
			scoreMeter();
			$('#cursor').removeClass('hover');
		})
		// toggles settings when buttons are clicked on about page
		.on('click', '#motionToggle', () => {
			if (mot) {
				$('body').addClass('noMotion');
				localStorage.setItem('motion',0);
				mot = 0;
				$('main, #cursor').css({
					'-webkit-transform': 'none',
					'-moz-transform': 'none',
					'-ms-transform': 'none',
					'transform': 'none'
				});
				$('#motionToggle').html('Turn on motion');
				$('#perspectiveSetting').prop('disabled', true);
			} else {
				$('body').removeClass('noMotion');
				localStorage.setItem('motion',1);
				mot = 1;
				$('#motionToggle').html('Turn off motion');
				$('#perspectiveSetting').prop('disabled', false);
				perspectiveSet($('#perspectiveSetting'), per);
			}
		})
		.on('click', '#cursorToggle', () => {
			if (cur) {
				localStorage.setItem('cursor',0);
				cur = 0;
				$('body').removeClass('custCursOn');
				$('#cursorToggle').html('Turn on cursor');
			} else {
				localStorage.setItem('cursor',1);
				cur = 1;
				$('body').addClass('custCursOn');
				$('#cursorToggle').html('Turn off cursor');
			}
		})
		.on('click touch', '#soundToggle', () => {
			if (snd) {
				localStorage.setItem('sound',0);
				snd = 0;
				$('#soundToggle').html('Turn on sound');
			} else {
				localStorage.setItem('sound',1);
				snd = 1;
				$('#soundToggle').html('Turn off sound');
			}
		})
		// Sets the perspective to change the Tilt of the motion
		.on('mousedown', '#perspectiveSetting', e => {
			$('#cursor').addClass('hidden');
			let btn = $(e.target);

			btn.addClass('clicked');

			$('#perspectiveSetting').on('mousemove', e => {
				let x = xAlongElem(e);
				perspectiveSet(btn,1.15 * x - .06);
			});
		})
		.on('mouseup mouseleave', '#perspectiveSetting', e => {
			$('#perspectiveSetting').off('mousemove');
			$('#cursor').removeClass('hidden');

			if ($('#perspectiveSetting').hasClass('clicked')) {

				$(e.target).removeClass('clicked');

				let x = xAlongElem(e);

				let min = 200,
						max = 4000;

				let adjusted = 1.1 * (1-x) - 0.05;
				let curved = (adjusted**3);
				let scaledAndOffset = ((max - min) * curved + min);
				let clamped = Math.min(Math.max(scaledAndOffset, min), max);

				$('body').animate({
					'perspective': parseInt(clamped)
				}, 300, 'swing');
			}

			$(e.target).removeClass('clicked');
			$(e.target).blur();
		})
		.on('focusin', '#perspectiveSetting', e => {
			// $(e.target).addClass('focused');
		})
		.on('keydown', '#perspectiveSetting', function(e) {
			// e.stopPropagation();

			let key = e.which,
					delta = 0;

			switch (key) {
				case 37:
				case 40:
					delta = -5;
					e.preventDefault();
					break;
				case 38:
				case 39:
					delta = 5;
					e.preventDefault();
					break;
				default:
			};

			perspectiveSet($(this), per, delta);

		})
		.on('keyup', '#perspectiveSetting', function(e) {
			e.preventDefault();
			e.stopPropagation();
		});

	if (!cur || touch) {
		$('body').removeClass('custCursOn');
	}

	if (!mot) {
		$('body').addClass('noMotion');
	}

	// Detects if localstorage is setup & has correct version
	storageSetup();

	calcScore(JSON.parse(localStorage.getItem('Qprogress')));

	// Loads the homepage
	changePage(localStorage.getItem('page')||'home');
})

// [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[|]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]
// [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[ Functions ]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]
// [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[|]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]

// Runs when a touchscreen device is detected
function applyTouch() {

	// Remove the desktop custom cursor
	$('#cursor').hide();
	localStorage.setItem('cursor',0);
	cur = 0;

	// Set content elements to remain motionless and resets their rotation to 0
	localStorage.setItem('motion',0);
	mot = 0;
	// $('main').css({
	// 	'-webkit-transform': 'none',
	// 	'-moz-transform': 'none',
	// 	'-ms-transform': 'none',
	// 	'transform': 'none'
	// });

	// $('body').css({'box-shadow': 'none'});
}

// Detects if the decive is a touchscreen device by listening for a touch input on html
function detectTouch() {
	try {
    document.createEvent("TouchEvent");
    return true;
  } catch (e) {
    return false;
  }
};

// Detects status of & sets up localStorage
function storageSetup() {
	// localStorage contains a key: Qprogress that stores stringified JSON data with the answers users have provided. This data will be used to determine the user's score, allow them to change their answers, and prevent questions from appearing more than once.

	// Gets the item from localStorage
	let ls = JSON.parse(localStorage.getItem('Qprogress'));

	// Default localStorage setup for new users
	let storSetup = { ver: lsVersion, QIDs: [], ans: [], curScore: 0.0 };

	// Checks if user has Qprogress item already
	if (ls == null) {
		// NEW USER

		// console.log('No previous data detected, setting up new user.');

		// Initializes localStorage
		localStorage.setItem('Qprogress',JSON.stringify(storSetup));

		ls = storSetup;

	} else {
		// RETURNING USER

		// Checks version of local storage
		if (ls.ver == lsVersion) {
			// Correct version of Qprogress detected

			// console.log('all is good');

		} else {
			// Qprogress out of date
			// console.log('Data is old, updating to new format...');

			// Update stuff
			let newStor = storSetup;

			localStorage.setItem('Qprogress',JSON.stringify(newStor));
		}
	}
}

function unlockAudio() {
	if (snd) {
		let unlockSound = new Audio('/audio/_blank.mp3');

		// console.log('audio');

		unlockSound.play();
		unlockSound.currentTime = 0;

		unlockedAudio = 1;

		$('html').off('mouseover touchstart', unlockAudio);
	}
}

// Opens the answer element when interacted with
function openAns(q) {

	q.addClass('open');

	if (!touch) {
		$('#cursor').addClass('hidden');
	}
};

function closeAns(q) {

	q.removeClass('open');

	$('#cursor').removeClass('hidden');

	// Checks if an answer has been selected
	if (q.find('.selected').length) {

		q.addClass('selectionMade');

		// Checks of all select elements have selected answers
		if ($('.card').find('.select').length === $('.card').find('.selectionMade').length) {

			// Enables the next button
			$('.qBtn').prop('disabled', false);
		}
	} else {

		// Disables the next button
		q.removeClass('selectionMade');
		$('.qBtn').prop('disabled', true);
	}
}

// Animates text value containing numbers over a certain time period
// Slightly modified from user jfriend00 on stackoverflow:
// https://stackoverflow.com/a/16994725/7308144
function animateValue(id, start, end, duration) {
	// assumes integer values for start and end

	// console.log('id: '+id+' | start: '+start+' | end: '+end+' | duration: '+duration);

	var obj = $('#' + id);
	var range = end - start;
	// no timer shorter than 50ms (not really visible any way)
	var minTimer = 50;
	// calc step time to show all interediate values
	var stepTime = Math.abs(Math.floor(duration / range));

	// never go below minTimer
	stepTime = Math.max(stepTime, minTimer);

	// get current time and calculate desired end time
	var startTime = new Date().getTime();
	var endTime = startTime + duration;
	var timer;

	function run() {
		var now = new Date().getTime();
		var remaining = Math.max((endTime - now) / duration, 0);
		var value = Math.round(end - (remaining * range));
		obj.text(value);
		if (value == end) {
			clearInterval(timer);
		}
	}

	timer = setInterval(run, stepTime);
	run();
}

function calcScore(ls=JSON.parse(localStorage.getItem('Qprogress')),callback=function(){}) {

	// Sets initial vairable values
	let score = 0,
		mehMargin = 0.2,
		ansCount = ls.ans.length;

	// Counts the pres and des in the ans property
	for (let i of ls.ans) {
		for (let j of i) {
			score += j=='pre'?1:(-1);
		}
	}

	// Calculates the final scoring value
	let fin = score/(Math.max(ansCount+1, 6));
	// Sets status class on body element to apply relevant styling
	$('body')
		.removeClass('status-meh status-pre status-de')
		.addClass(Math.abs(fin)<0.2?'status-meh':(score>0?'status-pre':'status-de'));

	ls.curScore = fin;

	// Updates the localStorage items
	localStorage.setItem('Qprogress',JSON.stringify(ls));

	callback();

	// returns the score as a float
	return (fin);
}

// Applies animation to Score Meter on Score page
function scoreMeter() {
	// Gets Qprogress item from local storage
	let ls = JSON.parse(localStorage.getItem('Qprogress'));

	// Gets the number of ansered questions
	let qs = ls.QIDs.length;

	// Gets the reset button
	let btn = $('#scoreMeter+button');

	// Sets the reset button class to inactive if no questions have been answered
	// Removes incactive class if any questions have eben answered
	if (qs) {
		btn.removeClass('inactive')
			 .prop('disabled', false);
	} else {
		btn.addClass('inactive')
			 .prop('disabled', true);
	}

	// Calculates the score & time
	let pos = calcScore(ls);

	for (i = 0; i < ls.QIDs.length; i++) {


		// console.log(ls.QIDs[i]);
	}

	// Calculates anim time based on how many questions have been answered since last time seeing score
	let t = Math.max(Math.abs((pos-scoreMeterVal[0])*2000), 1000);

	// console.log(pos);

	setTimeout(function () {
		// Sets previous positon of indicator, then animates it and the value to the new position
		$('#indicator')
			.css('margin-left',scoreMeterVal[0]*50+"%")
			.show()
			.animate({'margin-left': pos*50+"%"}, t, 'easeInOutCubic')
			.addClass('set');
		animateValue('qNum', parseInt($('#qNum').html()), Object.keys(questList).length, t);
		animateValue('indicatorVal', scoreMeterVal[1], qs, t);

		// Sets the current position & no. of quesitons to be used next time score is visited
		scoreMeterVal = [pos,qs];

		$('#encouragement').html('I&apos;m loaded');
	}, 300);
}

let xAlongElem = event => {
	let x = event.pageX,
			ex = $(event.target).offset().left,
			ew = $(event.target).outerWidth();

	let normalized = (x-ex)/ew;

	return normalized;
}

function perspectiveSet(e,x=(localStorage.getItem('perspective') || per),delta=0) {

	// console.log(x);

	let width = e.outerWidth();

	let clamped = Math.min(Math.max(x + (delta/100), 0), 1);

	let shad = -(width*(1-(.9*clamped + .1)));

	// console.log(clamped, shad);

	per = parseFloat((Math.max(Math.min(clamped,1),0)).toFixed(2));

	e
		.html('Tilt: '+parseInt(per*100)+'%')
		.css({
			'box-shadow': shad + 'px 0 0 0 black inset'
		});

		localStorage.setItem('perspective', per);
}

function nextQ(move=true,start=false) {

	let ls = JSON.parse(localStorage.getItem('Qprogress'));

	if (start) {
		$('a').removeClass('active');
		$('main').removeClass('home');
		$('main').addClass('quiz');
	}

	// Generate random integer to select from list of questions
	let randQ = Math.floor((Math.random()*Object.keys(questList).length)+1);

	// If randQ is already in users answered Qs
	if ($.inArray(randQ, ls.QIDs) !== -1) {
		// randQ IS in users Qs, see If ALL questions have been answered
		if (ls.QIDs.length >= Object.keys(questList).length) {
			// All available questions have been answered, go to score page
			changePage('score');
		} else {
			// Unanswered questions exists, try again with a new random number
			nextQ();
		}
	} else {
		// randQ IS NOT in users Qs, generate next card
		let cont = $('main .content').eq(0);

		let lastQ = Object.keys(questList).length==ls.QIDs.length+1;

		let randP = [Math.floor(2*Math.random()),Math.floor(2*Math.random())];

		let randNo = 2*Math.floor(1000*Math.random());

		let qID = 'q'+randQ;


		if (questList[qID].text3) {
			// console.log(randNo,randP);
			let cardInfo = {
				qID: questList[qID].ID,
				qCount: lastQ?'Last Question':'Question '+(ls.QIDs.length+1),
				qText1: questList[qID].text1,
				qText2: questList[qID].text2,
				q1AnsTop: questList[qID].option1[randP[0]?'pre':'de'],
				q1AnsBot: questList[qID].option1[randP[0]?'de':'pre'],
				qText3: questList[qID].text3,
				q2AnsTop: questList[qID].option2[randP[1]?'pre':'de'],
				q2AnsBot: questList[qID].option2[randP[1]?'de':'pre'],
				qRule: questList[qID].rule
			};

			let nextCard = '<div class="content"><div class="card" id="q-'+cardInfo.qID+
				'"><p class="qInfo">'+cardInfo.qCount+
				'</p><span>'+cardInfo.qText1+
				'</span><div class="select" tabindex="0"><div name="'+('a-'+(randNo+randP[0]))+
				'" class="answer topAns">'+cardInfo.q1AnsTop+
				'</div><div class="blank">×</div><div name="'+('a-'+(randNo+randP[0]))+
				'" class="answer botAns">'+cardInfo.q1AnsBot+
				'</div></div><span>'+cardInfo.qText2+
				'</span><div class="select" tabindex="0"><div name="'+('a-'+(randNo+randP[1]))+
				'" class="answer topAns">'+cardInfo.q2AnsTop+
				'</div><div class="blank">×</div><div name="'+('a-'+(randNo+randP[1]))+
				'" class="answer botAns">'+cardInfo.q2AnsBot+
				'</div></div><span>'+cardInfo.qText3+
				'</span><button disabled class="qBtn full-width">'+(lastQ?'See Your Score':'Next')+
				'</button><p class="qRule"><a target="_blank" href="'+cardInfo.qRule+'">More Info</a></p></div></div>';
				cont.after(nextCard);


		} else {
			// console.log(randNo,randP[0]);
			let cardInfo = {
				qID: questList[qID].ID,
				qCount: lastQ?'Last Question':'Question '+(ls.QIDs.length+1),
				qText1: questList[qID].text1,
				qText2: questList[qID].text2,
				qAnsTop: questList[qID].option1[randP[0]?'pre':'de'],
				qAnsBot: questList[qID].option1[randP[0]?'de':'pre'],
				qRule: questList[qID].rule
			};

			let nextCard = '<div class="content"><div class="card" id="q-'+cardInfo.qID+
				'"><p class="qInfo">'+cardInfo.qCount+
				'</p><span>'+cardInfo.qText1+
				'</span><div class="select" tabindex="0"><div name="'+('a-'+(randNo+randP[0]))+
				'" class="answer topAns">'+cardInfo.qAnsTop+
				'</div><div class="blank">×</div><div name="'+('a-'+(randNo+randP[0]))+
				'" class="answer botAns">'+cardInfo.qAnsBot+
				'</div></div><span>'+cardInfo.qText2+
				'</span><button class="qBtn full-width">'+(lastQ?'See Your Score':'Next')+
				'</button><p class="qRule"><a target="_blank" href="'+cardInfo.qRule+'">More Info</a></p></div></div>';
				cont.after(nextCard);

		}


		if (move) {
			let conts = $('main .content');

			mot
				? conts.animate({left:'-100%'}, 500, 'easeInOutBack')
				: conts.fadeOut(500);

			setTimeout(function () {
				cont.remove();
				mot
					? conts.css('left', '0%')
					: conts.fadeIn(500);
			}, 550);
		}
	}
}

function recordQ() {

	// Get list of questions from questions.json
	let ls = JSON.parse(localStorage.getItem('Qprogress'));

	// Get .select elements
	let ans = $('.selected');

	// find the parent card ID and set the ansSels variable
	let q = ans.parents('.card').attr('id'),
		ansSels = [];

	// Push answers into ansSels variable
	ans.each((iter, i) => {
		let ident = $(i).attr('name');

		let identNo = ident.slice(2,ident.length);

		let flipped = identNo%2;

		//					0		|		1
		//       | flip | noFlip
		//       | -------------
		// 1 top |	de	|	pre
		//       | -------------
		// 0 bot |	pre	|	de

		if ($(i).hasClass('topAns')) {
			// Top ans is selected
			ansSels.push((flipped)?'pre':'de');
		} else {
			ansSels.push((flipped)?'de':'pre');
		}

	});

	// console.log(q,": ",ansSels);

	ls.QIDs.push(parseInt(q.slice(2, q.length)));
	ls.ans.push(ansSels);

	calcScore(ls, function(){nextQ()});
};

function targetId(target='#') {

	target = target.split('#');

	// console.log(target);

	let trg = target.length>2?target.slice(1).join(''):(target[1] || target[0]);

	// console.log(trg);

	setTimeout(function() {
		let scroll = $(`#${trg}`).offset().top;
		$('main').animate({
			scrollTop: scroll - 100
		}, 800, 'swing', () => {
			$('#motionToggle').focus();
		});
	}, 300);
}


let changePage = (l='home', hist=true) => {

	let main = $('main');
	let [pg,trg=0] = l.split('#');

	// console.log(pg,trg);


	// Checks if link is external
	// indexOf returns -1 if 'http' is not in string
	if (l.indexOf('http') > (-1)) {

		// Link is external -> Opens in new window
		window.open(l, '_blank');

	} else if (!main.hasClass(pg)) {

		if (hist) window.history.pushState({}, l, l==='home'?'/':l);
		if (!$(`a[href=${pg}]`).hasClass('active')) {
			// Toggles class for clicked lick
			$('a').removeClass('active');
			$(`a[href=${pg}]`).addClass('active');
		}

		let t = 500;

		// Checks to see if user is already on the page
		// Shows loader if necessary *******
		// $('#loader').addClass('loading');

		// Removes current content if it exists
		ctn = main.find('.content').length > 0;

		let sign = pg=='home'?-1:1;

		main.animate({top: -sign*mot*200, opacity: 0}, ctn?t:0, 'easeInCubic', function(){
			main.animate({top: sign*mot*200}, 50, function() {
				main.load(pg + '.html', function(response, status) {
					if (status == 'error') {
						main.load('404.html', function(response, status) {
							if (status == 'error') {
								$('main').html('<div id="404" class="content"><div class="card"><p class="qInfo">That&apos;s a 404...</p><p>Sorry, that didn&apos;t work</p><a href="home" id="dat404">Go Home</a><!-- <button id="refreshButton">Or Try Refreshing</button> --></div></div>');
							}
							main.removeClass();
							main.addClass('fourOhfour');
						});
					} else {
						main.removeClass();
						main.addClass(pg);
						localStorage.setItem('page',pg);
						if (trg) targetId(trg);
					}
					main.animate({top: 0, opacity: 1}, t, 'easeOutCubic');
				});
			});
		});
	}
}

// [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]
// [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[ TEST SCRIPTS ]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]
// [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]
