// Bugs:
//    • remove cursor from phone screen
//    • can't see full text of HomePage on phone in landscape
//    • things look pretty small in the phones screen
//    • tapping on answers isn't working well, might he related to cursor issue

// [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[|]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]
// [[[[[[[[[[[[[[[[[[[[[[[[[[ Variable Initialization ]]]]]]]]]]]]]]]]]]]]]]]]]]
// [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[|]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]

let touch = false;
let currentLoc = '';

const lsVersion = 0.2;

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
	$('a').click(function(e) {
		let href = $(this).attr('href');

		// Stops normal link functionality
		e.preventDefault();
		changePage(href);
	});
	detectTouch(function() {
		$('html').off();
		// console.log('off');
	});
	storageSetup();
	changePage('home');
	setFanciness($('a'));
})



// [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[|]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]
// [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[ Functions ]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]
// [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[|]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]

function applyTouch() {
	$('#cursor').remove();
	$(document).unbind();

	$('.content').css({
		'-webkit-transform': 'rotateX('+ 0 +'deg) rotateY('+0 +'deg)',
		'-moz-transform': 'rotateX('+ 0 +'deg) rotateY('+0 +'deg)',
		'-ms-transform': 'rotateX('+ 0 +'deg) rotateY('+0 +'deg)',
		'transform': 'rotateX('+ 0 +'deg) rotateY('+0 +'deg)'
	});
	// console.log('touch device detected');
}

function detectTouch(callback) {
	// console.log('detect touch');
	$('html').on('touchstart', function() {
		// console.log('touch');
		touch = true;
		applyTouch();
		callback();
	});
	$('html').on('click', function() {
		// console.log('click');
		touch = false;
		callback();
	});


	return touch;
}

function setFanciness(int) {
	let hoverables = int;

    let delay = 0,
		c = $('#cursor');

    $(hoverables).mouseenter(function(){
        c.addClass('hover')
        delay = 200;
        setTimeout(function(){
            delay = 0
        }, 300)
    }).mouseleave(function(){
        c.removeClass('hover')
        c.removeClass('mousedown')
    })
    $(hoverables).on('mousedown', function(){
        c.addClass('mousedown')
        delay = 200;
        setTimeout(function(){
            delay = 0
        }, 300)
    }).on('mouseup',function(){
        setTimeout(function(){
            c.removeClass('mousedown')
        }, delay)
    })

	$(document).bind('mousemove', function(e){
		let w, h, x, y, xd, yd, mbor;

		w = $(window).width();
		h = $(window).height();

		x = e.pageX;
		y = e.pageY;



		// $('#')

		yd = -(15 - 30*(x/w));
		xd = 15 - 30*(y/h);

		let maxY = 12;
		let calcY = (Math.abs(yd)/yd)*(Math.min(Math.abs(yd)**(1/2),maxY));

		let shadCol = $('body').hasClass('status-meh')?'rgba(82, 0, 210, 0.15)':($('body').hasClass('status-de')?'rgba(0, 183, 226, 0.15)':'rgba(255, 0, 98, 0.15)');


		let bodyShad = String((-10*yd+'px '+10*xd+'px 180px -60px '+shadCol+' inset'))

		// console.log('y: '+String(yd).slice(0,4)+' | x: '+String(xd).slice(0,4));

		mbor = parseInt($('#cursor').css('border-width'), 10);

		$('.content').css({
			'-webkit-transform': 'rotateX('+ xd +'deg) rotateY('+ calcY +'deg)',
			'-moz-transform': 'rotateX('+ xd +'deg) rotateY('+ calcY +'deg)',
			'-ms-transform': 'rotateX('+ xd +'deg) rotateY('+ calcY +'deg)',
			'transform': 'rotateX('+ xd +'deg) rotateY('+ calcY +'deg)'
		});

		$('body').css({
			'box-shadow': bodyShad
		});

		$('#cursor').css({
			'left' : x - mbor,
			'top' : y - mbor
		})
	})
}

function storageSetup() {

	// localStorage will contain a key Qprogress that stores stringified JSON data with the answers users have provided. This data will be used to determine the user's score, allow them to change their answers, and prevent questions from appearing more than once.

	let ls = JSON.parse(localStorage.getItem('Qprogress'));

	// Default localStorage setup for new users
	let storSetup = { ver: lsVersion, QIDs: [], ans: [] };

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

function openAns(q) {

	// console.log('open');

	let ans = q.find('.answer'),
		blnk = q.find('.blank');

	if (touch) {
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
	}
}

function closeAns(q) {

	let ans = q.find('.answer'),
		blnk = q.find('.blank');

	q.removeClass('open');
	ans.off();
	blnk.off()
}

// When select is tapped or hovered over

function usrInteraction() {

	$('.content a').click(function(e) {
		let href = $(this).attr('href');

		// Stops normal link functionality
		e.preventDefault();
		changePage(href);
	});

	$('.content .card .select').on(touch?'touchstart':'mouseenter', function(event) {
		event.stopPropagation();
		$(this).addClass('open');
		openAns($(this));
	});

	$('.content .card .select').on('mouseleave', function() {
		closeAns($(this));
	});

	touch?'':setFanciness($('button'));
}

function animateValue(id, start, end, duration) {
    // assumes integer values for start and end

    var obj = document.getElementById(id);
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
        obj.innerHTML = value;
        if (value == end) {
            clearInterval(timer);
        }
    }

    timer = setInterval(run, stepTime);
    run();
}

function scoreMeter() {
	let ls = JSON.parse(localStorage.getItem('Qprogress'));

	let pos = calcScore(ls),
		t = 800;

	setTimeout(function () {
		$('#indicator')
			.animate({'margin-left': pos*100+"%"}, t, 'easeInOutCubic')
			.addClass('set');
		animateValue('indicatorVal', $('#indicatorVal').text(), ls.QIDs.length, t);
	}, 300);
}

function calcScore(ls) {

	let score = 0,
		mehMargin = 0.2,
		ansCount = ls.ans.length;

	for (let i of ls.ans) {
		score += i=='pre'?1:(-1);
	}

	// // console.log(score/(ansCount+10));

	$('body')
		.removeClass()
		.addClass(Math.abs(score/(ansCount+5))<0.1?'status-meh':(score>0?'status-pre':'status-de'));
	return (score/(ansCount+5));
}

function nextQ(move=true,start=false) {

	let ls = JSON.parse(localStorage.getItem('Qprogress'));

	// Generate random integer to select from list of questions
	let randQ = Math.floor((Math.random()*Object.keys(questList).length)+1);

	// If randQ is already in users answered Qs
	if ($.inArray(randQ, ls.QIDs) !== -1) {
		// randQ IS in users Qs, see If ALL questions have been answered
		if (ls.QIDs.length == Object.keys(questList).length) {
			// All available questions have been answered, go to score page
			changePage('score');
		} else {
			// Unanswered questions exists, try again with a new random number
			nextQ();
		}
	} else {
		// randQ IS NOT in users Qs, generate next card
		let cont = $('#main .content').eq(0);

		let lastQ = Object.keys(questList).length==ls.QIDs.length+1;

		let cardInfo = {
			qID: questList['q'+randQ].ID,
			qCount: lastQ?'Last Question':'Question '+(ls.QIDs.length+1),
			qText1: questList['q'+randQ].text1,
			qText2: questList['q'+randQ].text2,
			qAnsTop: questList['q'+randQ].options['pre'],
			qAnsBot: questList['q'+randQ].options['de']
		};

		let nextCard = '<div class="content"><div class="card" id="q-'+cardInfo.qID+
		'"><p class="qCount">'+cardInfo.qCount+
		'</p><span>'+cardInfo.qText1+
		' </span><div class="select"><div class="answer topAns">'+cardInfo.qAnsTop+
		'</div><div class="blank">×</div><div class="answer botAns">'+cardInfo.qAnsBot+
		'</div></div><span> '+cardInfo.qText2+
		'</span><button class="qBnt" onclick="recordQ()">'+(lastQ?'See Your Score':'Next')+
		'</button></div></div>';

		cont.after(nextCard);

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

	let ans = $('.selected');

	let q = ans.parents('.card').attr('id'),
		ansSel = ans.hasClass('topAns')?'pre':'de';

	// console.log(q,": ",ansSel);

	ls.QIDs.push(parseInt(q.slice(2, q.length)));
	ls.ans.push(ansSel);

	localStorage.setItem('Qprogress',JSON.stringify(ls));

	nextQ();
	calcScore(ls);
};

let changePage = (l) => {

	let main = $('#main');

	// Checks if link is external
	// indexOf returns -1 if 'http' is not in string
	if (l.indexOf('http') > (-1)) {

		// Link is external -> Opens in new window
		window.open(l, '_blank');

	} else if (!main.hasClass(l)) {

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
