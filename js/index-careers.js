window.addEventListener('message', function (event) {
	if (event.data === 'scroll-to-open-positions') {
		document.getElementById('open-positions')?.scrollIntoView({ behavior: 'smooth' });
	}
	if (event.data === 'scroll-to-why-protek-cyber') {
		document.getElementById('why-protek-cyber')?.scrollIntoView({ behavior: 'smooth' });
	}
});
