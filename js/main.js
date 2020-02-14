

// [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[|]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]
// [[[[[[[[[[[[[[[[[[[[[[[[[[ Variable Initialization ]]]]]]]]]]]]]]]]]]]]]]]]]]
// [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[|]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]

let touch = false;
let currentLoc = '';

const lsVersion = 0.1;


function detectTouch() {
	$('body').on('touchstart', function() {
		touch = true;
		$('.content .card .select').touch();
		$('.content .card .select .answer').touch();
		$('.content .card .select .blank').touch();
	});
	return touch;
}

let getQs = $.getJSON( "js/questions.json", function() {})
	.done(function() {
		questList = JSON.parse(getQs.responseText).questions;
		nextQ(false);
	})
	.fail( function(d, textStatus, error) {
		console.error("getJSON for questions.json failed, status: " + textStatus + ", error: "+error)
	})

function storageSetup() {

	// localStorage will contain a key Qprogress that stores stringified JSON data with the answers users have provided. This data will be used to determine the user's score, allow them to change their answers, and prevent questions from appearing more than once.

	let ls = JSON.parse(localStorage.getItem('Qprogress'));

	// Default localStorage setup for new users
	let storSetup = { ver: 0.1, QIDs: [] };

	// Checks if user has Qprogress item already
	if (ls == null) {
		// NEW USER

		console.log('No previous data detected, setting up new user.');

		// Initializes localStorage
		localStorage.setItem('Qprogress',JSON.stringify(storSetup));

		ls = storSetup;

	} else {
		// RETURNING USER

		// Checks version of local storage
		if (ls.ver == lsVersion) {
			// Correct version of Qprogress detected

			console.log('all is good');

			return ls;

			// Do stuff

		} else {
			// Qprogress out of date

			// Update stuff
			let newStor = ls;

			// Finally, update ls version number
			newStor.ver = lsVersion;

			localStorage.setItem('Qprogress',JSON.stringify(newStor));

			// Do stuff
		}
	}
}

function saveQ(q) {

}

function openAns(q) {

	let ans = q.find('.answer'),
		blnk = q.find('.blank');

	if (touch) {
		// when answer is tapped
		ans.on('tap', function() {
			ans.removeClass('selected');
			q.addClass('selectionMade');
			$(this).addClass('selected');
			closeAns(q)
		});

		// when clear is tapped
		blnk.on('tap', function() {
			ans.removeClass('selected');
			q.removeClass('selectionMade');
		});
	} else {
		// when answer is hovered over
		ans.on('mouseenter', function() {
			ans.removeClass('selected');
			q.addClass('selectionMade');
			$(this).addClass('selected');
		});

		// when answer is clicked
		ans.on('click', function() {
			closeAns(q)
		});

		// when clear is clicked
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
	ans.off('tap click mouseenter');
	blnk.off('tap click')
}

// When select is tapped or hovered over

function usrInteraction() {

	$('.content a').click(function(e) {
		let href = $(this).attr('href');

		// Stops normal link functionality
		e.preventDefault();
		changePage(href);
	});

	$('.content .card .select').eq(0).on(touch?'tap':'mouseenter', function(event) {
		event.stopPropagation();
		$(this).addClass('open');
		openAns($(this));
	});

	$('.content .card .select').eq(0).on('mouseleave', function() {
		closeAns($(this));
	});
}

function moveQs(callback) {
	callback();
}

function nextQ(move=true) {
	let ls = JSON.parse(localStorage.getItem('Qprogress'));

	let randQ = Math.floor((Math.random()*Object.keys(questList).length)+1);
	// load json and prep vars for next card

	if ($.inArray(randQ, ls.QIDs) !== -1) {
		if (ls.QIDs.length == Object.keys(questList).length) {
			changePage('score');
		} else {
			nextQ();
		}
	} else {
		console.log(ls);

		let cont = $('#main .content').eq(0);

		let cardInfo = {
			qCount: ls.QIDs.length,
			qText1: questList['q'+randQ].text1,
			qText2: questList['q'+randQ].text2,
			qAnsTop: questList['q'+randQ].options['pre'],
			qAnsBot: questList['q'+randQ].options['de']
		};

		let nextCard = '<div class="content"><div class="card"><p class="qCount">q'+cardInfo.qCount+
		'</p><span>'+cardInfo.qText1+
		' </span><div class="select"><div class="answer topAns">'+cardInfo.qAnsTop+
		'</div><div class="blank">×</div><div class="answer botAns">'+cardInfo.qAnsBot+
		'</div></div><span>'+cardInfo.qText2+
		'</span><button class="qBnt" onclick="nextQ()">Next</button></div></div>';

		cont.after(nextCard);

		if (move) {
			moveQs(function() {
				let cont = $('#main .content');
				let curr = cont.eq(0);

				cont.animate({left:'-100%'}, 500, 'easeInOutBack', function() {
					curr.remove();
					cont.css('left', '0%');
					ls.QIDs.push(randQ);
					localStorage.setItem('Qprogress',JSON.stringify(ls));
					usrInteraction();
				});
			});
		}

	}
}

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
				});
			});
		});
	}
}

// things to run when DOM is ready
$(document).ready(function() {
	$('a').click(function(e) {
		let href = $(this).attr('href');

		// Stops normal link functionality
		e.preventDefault();
		changePage(href);
	});
	detectTouch();
	storageSetup();
	changePage('home');
})

// Manages what links do on this website

// [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]
// [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[ TEST SCRIPTS ]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]
// [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]

// Allows switching scriptivism state by clicking the indicator in the header
$('#statusCont').click(function(event) {
	let stat = $('body');
	if (stat.hasClass('status-meh')) {
		stat
			.removeClass('status-meh')
			.addClass('status-pre');
	}	else if (stat.hasClass('status-pre')) {
		stat
			.removeClass('status-pre')
			.addClass('status-de');
	} else {
		stat
			.removeClass('status-de')
			.addClass('status-meh');
	}
});
