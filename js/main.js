// Bugs:
//    • remove cursor from phone screen
//    • can't see full text of HomePage on phone in landscape
//    • things look pretty small in the phones screen
//    • tapping on answers isn't working well, might he related to cursor issue

// [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[|]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]
// [[[[[[[[[[[[[[[[[[[[[[[[[[ Variable Initialization ]]]]]]]]]]]]]]]]]]]]]]]]]]
// [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[|]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]

let touch = false,
	currentLoc = '',
	scoreMeterVal= [0,0];

const lsVersion = 0.3;

// Load the questions.json file which contains all the questions & answers
let getQs = $.getJSON( "js/questions.json", function() {})
	.done(function() {
		questList = JSON.parse(getQs.responseText).questions;
	})
	.fail( function(d, textStatus, error) {
		console.error("getJSON for questions.json failed, status: " + textStatus + ", error: "+error)
	})


// [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[|]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]
// [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[ Listeners ]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]
// [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[|]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]

// things to run when DOM is ready
$(document).ready(function() {
	// Sets link functionality
	$('a').click(function(e) {
		// Stops normal link functionality
		e.preventDefault();

		// Get link address

		// Executes navigation
		changePage($(this));
	});

	// Detect touchscreen device
	detectTouch(function() {
		// When returned, removes touch listener
		$('html').off();
	});

	// Detects if localstorage is setup & has correct version
	storageSetup();

	// Loads the homepage
	changePage($('#sitelogo'));

	// Adds cursor functionality to a links in header/footer
	setFanciness($('a'));
})



// [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[|]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]
// [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[ Functions ]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]
// [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[|]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]

// Runs when a touchscreen device is detected
function applyTouch() {

	// Remove the desktop custom cursor
	$('#cursor').remove();

	// Remove the mouse movement listener
	$(document).unbind();

	// Set content elements to remain motionless and resets their rotation to 0
	$('.content').css({
		'-webkit-transform': 'rotateX('+ 0 +'deg) rotateY('+0 +'deg)',
		'-moz-transform': 'rotateX('+ 0 +'deg) rotateY('+0 +'deg)',
		'-ms-transform': 'rotateX('+ 0 +'deg) rotateY('+0 +'deg)',
		'transform': 'rotateX('+ 0 +'deg) rotateY('+0 +'deg)'
	});
	// console.log('touch device detected');
}

// Detects if the decive is a touchscreen device by listening for a touch input on html
function detectTouch(callback) {
	// console.log('detect touch');

	// Adds touch listener to html to detect a touchscreen device
	$('html').on('touchstart', function() {
		// console.log('touch');
		touch = true;

		// Runs apply touch which turns some features on/off
		applyTouch();
		callback();
	});

	// Adds click listener to detect a desktop device
	$('html').on('click', function() {
		// console.log('click');
		touch = false;
		callback();
	});
	// Returns the touch variable as bool
	return touch;
}

// If on desktop, sets listeners & anaimtion for desktop cursor
function setFanciness(int) {
	let hoverables = int;

	let delay = 0,
			c = $('#cursor');

	// Sets various listeners for when cursor interacts with something
	$(hoverables)
		.on('mouseenter', function(e){
			c.addClass('hover')
			delay = 200;
			setTimeout(function(){
				delay = 0
			}, 300)
		})
		.on('mouseleave', function(e){
			c.removeClass('hover mousedown mouseRefuse');
		})
		.on('mousedown', function(e){
			($(e.target).hasClass('active')||$(e.target).parents('a').hasClass('active'))?c.addClass('mouseRefuse'):c.addClass('mousedown');
			delay = 200;
			setTimeout(function(){
				delay = 0
			}, 300)
		})
		.on('mouseup',function(e){
			setTimeout(function(){
				c.removeClass('mousedown mouseRefuse')
			}, delay)
		})

	// Listens for mouse movement and moves the custom cursor to the pointer position
	$(document).bind('mousemove', function(e){

		// initializes variables
		let w, h, x, y, xd, yd, mbor;

		// Gets window dimensions
		w = $(window).width();
		h = $(window).height();

		// gets position of pointer in window
		x = e.pageX;
		y = e.pageY;

		// Sets the position of the cursor
		$('#cursor').css({
			'left' : x - 3,
			'top' : y - 3
		});

		// calculates the pointer's distance from the center using the given measurements above.
		// Units are normalized from 0 – 15.
		// ie when cursor is in middle, coordinates are (0,0)
		// when cursor is fully top-left, coordinates are (15,15)
		yd = -(15 - 30*(x/w));
		xd = 15 - 30*(y/h);

		// Sets maximum rotation for y rotation (to aid in readability)
		let maxY = 12;

		// Calculates the easing for the y rotation (looks like square root curve)
		let calcY = (Math.abs(yd)/yd)*(Math.min(Math.abs(yd)**(1/2),maxY));

		// determines the css properties for the shadow color for the body (based on score status)
		let shadCol = $('body').hasClass('status-meh')?'rgba(82, 0, 210, 0.15)':($('body').hasClass('status-de')?'rgba(0, 183, 226, 0.15)':'rgba(255, 0, 98, 0.15)');

		// Concatonates the string for the box-shadow property of body
		let bodyShad = String((-10*yd+'px '+10*xd+'px 180px -60px '+shadCol+' inset'));

		// Sets rotation of .content elements
		$('.content').css({
			'-webkit-transform': 'rotateX('+ xd +'deg) rotateY('+ calcY +'deg)',
			'-moz-transform': 'rotateX('+ xd +'deg) rotateY('+ calcY +'deg)',
			'-ms-transform': 'rotateX('+ xd +'deg) rotateY('+ calcY +'deg)',
			'transform': 'rotateX('+ xd +'deg) rotateY('+ calcY +'deg)'
		});

		// Sets the box-shadow of the body
		$('body').css({
			'box-shadow': bodyShad
		});
	})
}

// Detects status of & sets up localStorage
function storageSetup() {
	// localStorage will contain a key: Qprogress that stores stringified JSON data with the answers users have provided. This data will be used to determine the user's score, allow them to change their answers, and prevent questions from appearing more than once.

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

// Opens the answer element when interacted with
function openAns(q) {

	let ans = q.find('.answer'),
		blnk = q.find('.blank');

	if (touch) {
		// Sets listeners when touch is true
		setTimeout(function () {
			ans
				.on('touchstart', function() {
					ans.removeClass('selected');
					q.addClass('selectionMade');
					$(this).addClass('selected');
				})
				.on('touchend', function() {
					closeAns(q)
				});

			blnk.on('touchstart', function() {
				ans.removeClass('selected');
				q.removeClass('selectionMade');
			});
		}, 150);
	} else {
		// Sets listeners when touch is false
		ans
			.on('mouseenter', function() {
				ans.removeClass('selected');
				q.addClass('selectionMade');
				$(this).addClass('selected');
			})
			.on('click', function() {
				closeAns(q)
			});

		blnk.on('click', function() {
			ans.removeClass('selected');
			q.removeClass('selectionMade');
		});
	};
};

// Closes the answer element and removes its listeners when executed
function closeAns(q) {

	let ans = q.find('.answer'),
		blnk = q.find('.blank');

	q.removeClass('open');
	ans.off();
	blnk.off()
}

// Sets interactivity listeners for elements inside .content elements
// This is executed every time .content changes
function usrInteraction() {

	// When the answers elements are touched or entered into with mouse
	$('.content .card .select').on(touch?'touchstart':'mouseenter', function(event) {

		// prevents lower element from being interacted with
		event.stopPropagation();
		$(this).addClass('open');
		openAns($(this));
	});

	// When mouse leaves answers elements
	$('.content .card .select').on('mouseleave', function() {
		closeAns($(this));
	});

	// If touch is false, apply fanciness to button elements
	touch?'':setFanciness($('button'));
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

function calcScore(ls,callback=function(){}) {

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
	let fin = score/(ansCount+5);
	// Sets status class on body element to apply relevant styling
	$('body')
		.removeClass()
		.addClass(Math.abs(fin)<0.1?'status-meh':(score>0?'status-pre':'status-de'));

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
	qs > 0?btn.removeClass('inactive'):btn.addClass('inactive');

	// Calculates the score & time
	let pos = calcScore(ls);

	// Calculates anim time based on how many questions have been answered since last time seeing score
	let t = Math.abs((pos-scoreMeterVal[0])*4000);

	setTimeout(function () {
		// Sets previous positon of indicator, then animates it and the value to the new position
		$('#indicator')
			.css('margin-left',scoreMeterVal[0]*50+"%")
			.show()
			.animate({'margin-left': pos*50+"%"}, t, 'easeInOutCubic')
			.addClass('set');
		animateValue('indicatorVal', scoreMeterVal[1], qs, t);

		// Sets the current position & no. of quesitons to be used next time score is visited
		scoreMeterVal = [pos,qs];
	}, 300);
}

function nextQ(move=true,start=false) {

	let ls = JSON.parse(localStorage.getItem('Qprogress'));

	// Generate random integer to select from list of questions
	let randQ = Math.floor((Math.random()*Object.keys(questList).length)+1);

	// If randQ is already in users answered Qs
	if ($.inArray(randQ, ls.QIDs) !== -1) {
		// randQ IS in users Qs, see If ALL questions have been answered
		if (ls.QIDs.length >= Object.keys(questList).length) {
			// All available questions have been answered, go to score page
			changePage($('#score'));
			$('.menu a:first-child').addClass('active')
		} else {
			// Unanswered questions exists, try again with a new random number
			nextQ();
		}
	} else {
		// randQ IS NOT in users Qs, generate next card
		let cont = $('#main .content').eq(0);

		let lastQ = Object.keys(questList).length==ls.QIDs.length+1;

		let randP = [Math.floor(2*Math.random()),Math.floor(2*Math.random())];

		let randNo = 2*Math.floor(1000*Math.random());


		if (questList['q'+randQ].text3) {
			// console.log(randNo,randP);
			let cardInfo = {
				qID: questList['q'+randQ].ID,
				qCount: lastQ?'Last Question':'Question '+(ls.QIDs.length+1),
				qText1: questList['q'+randQ].text1,
				qText2: questList['q'+randQ].text2,
				q1AnsTop: questList['q'+randQ].option1[randP[0]?'pre':'de'],
				q1AnsBot: questList['q'+randQ].option1[randP[0]?'de':'pre'],
				qText3: questList['q'+randQ].text3,
				q2AnsTop: questList['q'+randQ].option2[randP[1]?'pre':'de'],
				q2AnsBot: questList['q'+randQ].option2[randP[1]?'de':'pre']
			};

			let nextCard = '<div class="content"><div class="card" id="q-'+cardInfo.qID+
				'"><p class="qCount">'+cardInfo.qCount+
				'</p><span>'+cardInfo.qText1+
				'</span><div class="select"><div name="'+('a-'+(randNo+randP[0]))+
				'" class="answer topAns">'+cardInfo.q1AnsTop+
				'</div><div class="blank">×</div><div name="'+('a-'+(randNo+randP[0]))+
				'" class="answer botAns">'+cardInfo.q1AnsBot+
				'</div></div><span>'+cardInfo.qText2+
				'</span><div class="select"><div name="'+('a-'+(randNo+randP[1]))+
				'" class="answer topAns">'+cardInfo.q2AnsTop+
				'</div><div class="blank">×</div><div name="'+('a-'+(randNo+randP[1]))+
				'" class="answer botAns">'+cardInfo.q2AnsBot+
				'</div></div><span>'+cardInfo.qText3+
				'</span><button class="qBnt" onclick="recordQ()">'+(lastQ?'See Your Score':'Next')+
				'</button></div></div>';
				cont.after(nextCard);


		} else {
			// console.log(randNo,randP[0]);
			let cardInfo = {
				qID: questList['q'+randQ].ID,
				qCount: lastQ?'Last Question':'Question '+(ls.QIDs.length+1),
				qText1: questList['q'+randQ].text1,
				qText2: questList['q'+randQ].text2,
				qAnsTop: questList['q'+randQ].option1[randP[0]?'pre':'de'],
				qAnsBot: questList['q'+randQ].option1[randP[0]?'de':'pre']
			};

			let nextCard = '<div class="content"><div class="card" id="q-'+cardInfo.qID+
				'"><p class="qCount">'+cardInfo.qCount+
				'</p><span>'+cardInfo.qText1+
				'</span><div class="select"><div name="'+('a-'+(randNo+randP[0]))+
				'" class="answer topAns">'+cardInfo.qAnsTop+
				'</div><div class="blank">×</div><div name="'+('a-'+(randNo+randP[0]))+
				'" class="answer botAns">'+cardInfo.qAnsBot+
				'</div></div><span>'+cardInfo.qText2+
				'</span><button class="qBnt" onclick="recordQ()">'+(lastQ?'See Your Score':'Next')+
				'</button></div></div>';
				cont.after(nextCard);

		}


		if (move) {
			let conts = $('#main .content');

			conts.animate({left:'-100%'}, 500, 'easeInOutBack');

			setTimeout(function () {
				cont.remove();
				conts.css('left', '0%');
				usrInteraction();
				// console.log(ls);
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

		//			0	|	1
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

let changePage = (lnk) => {

	let main = $('#main');

	l = lnk.attr('href');

	// Checks if link is external
	// indexOf returns -1 if 'http' is not in string
	if (l.indexOf('http') > (-1)) {

		// Link is external -> Opens in new window
		window.open(l, '_blank');

	} else if (!main.hasClass(l)) {

		if (!lnk.hasClass('active')) {
			// Toggles class for clicked lick
			$('a').removeClass('active');
			lnk.addClass('active');
		}

		let t = 500;

		// Checks to see if user is already on the page
		// Shows loader if necessary *******
		// $('#loader').addClass('loading');

		// Removes current content if it exists
		ctn = main.find('.content').length > 0;

		let sign = l=='home'?-1:1;

		main.animate({top: -sign*200, opacity: 0}, ctn?t:0, 'easeInCubic', function(){
			main.animate({top: sign*200}, 50, function() {
				main.load(l + '.html', function(response, status) {
					if (status == 'error') {
						main.load('404.html');
						main.addClass('class_name')
					}
					main.animate({top: 0, opacity: 1}, t, 'easeOutCubic');
					main.removeClass();
					main.addClass(l)
					usrInteraction();
					setFanciness();
				});
			});
		});
	}
}


// [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]
// [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[ TEST SCRIPTS ]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]
// [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]
