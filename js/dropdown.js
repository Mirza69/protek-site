// Force-hide Risk Assessment section even if JS or animations override static CSS 
document.addEventListener("DOMContentLoaded", function () {
	const riskSection = document.getElementById("risk-assessment");
	if (riskSection) {
		riskSection.style.display = "none";
	}
});

document.addEventListener("DOMContentLoaded", function () {
	const riskSection = document.getElementById("risk-assessment");
	if (riskSection) {
		riskSection.remove(); // Destroys JS overwrite completely if injected
	}
});

document.getElementById('nav-toggle').addEventListener('click', function () {
	document.getElementById('nav-menu').classList.toggle('hidden');
});

// Toggle dropdowns individually
document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
	toggle.addEventListener('click', function (e) {
		e.stopPropagation();
		const dropdown = this.nextElementSibling;
		dropdown.classList.toggle('hidden');

		// Close other open dropdowns
		document.querySelectorAll('.dropdown').forEach(d => {
			if (d !== dropdown) d.classList.add('hidden');
		});
	});
});

// Close all dropdowns when clicking outside
document.addEventListener('click', function (e) {
	if (!e.target.closest('.group')) {
		document.querySelectorAll('.dropdown').forEach(dropdown => {
			dropdown.classList.add('hidden');
		});
	}
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
	anchor.addEventListener('click', function (e) {
		e.preventDefault();
		const targetId = this.getAttribute('href');
		const targetElement = document.querySelector(targetId);
		if (targetElement) {
			targetElement.scrollIntoView({
				behavior: 'smooth'
			});
		}
	});
});
