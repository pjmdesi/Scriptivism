let changePage = (l) => {

	//checks if link is external
	if (l.indexOf('http')) {
		l = l.split('/')[1];
		console.log(l);
	} else {
		window.open(l, '_blank');
	}
}

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
