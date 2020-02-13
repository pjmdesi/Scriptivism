
let touch = false;
function detectTouch() {
	$('body').on('touchstart', function() {
		touch = true;
	});
	return touch;
}

function saveQ(q) {
	console.log(q);
}

$('.content .card .select').eq(0).on(touch?'touchstart':'mouseenter', function() {
	let q = $(this);

	let ans = q.find('.answer'),
		blnk = q.find('.blank');

	q.addClass('open');

	console.log('opened');

	ans.on(touch?'dragOver':'mouseenter', function() {
		ans.removeClass('selected');
		q.addClass('selectionMade');
		$(this).addClass('selected');
	});
	ans.on(touch?'touchend':'mouseup', function() {
		if (q.hasClass('open')) {
			ans.removeClass('selected');
			$(this).addClass('selected');
			q.addClass('selectionMade');
			q.removeClass('open');
			console.log('selection made');
		}
	});
	blnk.on(touch?'touchend':'mousedown', function() {
		if (q.height() == 88) {
			ans.removeClass('selected');
			q.removeClass('selectionMade');
			console.log('cleared');
		}
	});
});

$('.content .card .select').eq(0).on(touch?'touchend':'mouseleave', function() {
	$(this).removeClass('open');
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
