
let touch = false;
function detectTouch() {
	$('body').on('touchstart', function() {
		touch = true;
		$('.content .card .select').touch();
		$('.content .card .select .answer').touch();
		$('.content .card .select .blank').touch();
		console.log('touch device');
	});
	return touch;
}

function saveQ(q) {
	console.log(q);
}

function openAns(q) {

	let ans = q.find('.answer'),
		blnk = q.find('.blank');

		console.log('open');

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
$('.content .card .select').eq(0).on(touch?'tap':'mouseenter', function(event) {
	event.stopPropagation();
	$(this).addClass('open');
	openAns($(this));
});

$('.content .card .select').eq(0).on('mouseleave', function() {
	closeAns($(this));
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
