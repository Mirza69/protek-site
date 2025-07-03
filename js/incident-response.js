// Animate metric numbers
function animateMetrics() {
	const metrics = document.querySelectorAll('.metric-number');
	metrics.forEach(metric => {
		const target = parseInt(metric.getAttribute('data-target'));
		const duration = 2000;
		let start = 0;
		const increment = target / (duration / 16);

		const timer = setInterval(() => {
			start += increment;
			metric.textContent = Math.floor(start);
			if (start >= target) {
				clearInterval(timer);
				metric.textContent = target;
			}
		}, 16);
	});
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
	animateMetrics();

	// Make sure status indicators are visible
	document.querySelectorAll('.status-indicator').forEach(indicator => {
		indicator.style.display = 'inline-block';
	});
});
