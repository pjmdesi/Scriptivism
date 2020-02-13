
let touch = false;
function detectTouch() {
	$('body').on('touchstart', function() {
		touch = true;
		$('.content .card .select').touch();
		$('.content .card .select .answer').touch();
		$('.content .card .select .blank').touch();
		console.log('touch device');
		$(this).css({background:'blue'})
	});
	return touch;
}

function saveQ(q) {
	console.log(q);
}

// When select is touched or hovered
$('.content .card .select').eq(0).on(touch?'tap tapAndHold':'mouseenter', function() {
	let q = $(this);

	let ans = q.find('.answer'),
		blnk = q.find('.blank');

	q.addClass('open');

	$('body').css({background:'green'})
	console.log('opened');

	// When finger or mouse leaves select

	// When mouse or finger moves over an answer or is clicked
	ans.on(touch?'dragEnter':'mouseenter', function() {;
		ans.removeClass('selected');
		q.addClass('selectionMade');
		$(this).addClass('selected');
		console.log('selection made');
	});

	// When finger leaves screen or mouse finishes clicking
	ans.on(touch?'dragLeave touchend':'mouseup', function() {
		if (q.hasClass('open')) {
			ans.removeClass('selected');
			$(this).addClass('selected');
			q.addClass('selectionMade');
			q.removeClass('open');
			console.log('closed');
		}
	});
	blnk.on(touch?'tap':'mousedown', function() {
		ans.removeClass('selected');
		q.removeClass('selectionMade');
		console.log('cleared');
	});
});

$('.content .card .select').eq(0).on(touch?'dragLeave':'mouseleave', function() {
	$(this).removeClass('open');
	$(this)find('.blank').off('tap mousedown')
	console.log('closed');
});

function moveQs(callback) {
	callback();
}

function nextQ(move=true) {
	let cont = $('#main .content');

	let curr = cont.eq(0),
		next = cont.eq(1);

	// load json and prep vars for next card

	let nextCard = '<div class="card"><p class="qCount">q1</p><p>I<div class="select"><div class="answer"></div><div class="answer"></div><div class="answer"></div></div>gotten over it.</p><button class="qBnt" onclick="nextQ()">Next</button></div>';

	let nextNext = next.clone().html(nextCard);

	next.after(nextNext);

	console.log('next');
	if (move) {
		moveQs(function() {
			let cont = $('#main .content');

			let curr = cont.eq(0);

			cont.animate({left:'-100%'}, 500, 'easeInOutBack');
			setTimeout(function () {
				curr.remove();
				cont.css('left', '0%');
			}, 550);
		});
	}
}


let changePage = (l) => {

	//checks if link is external
	if (l.indexOf('http')) {
		l = l.split('/')[1]?l.split('/')[1]:l;
		console.log(l);
	} else {
		window.open(l, '_blank');
	}
}

// things to run when DOM is ready
$(document).ready(function() {
	detectTouch()
})

$('a').click(function(e) {
	let href = $(this).attr('href');

	e.preventDefault();

	changePage(href)
});

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
