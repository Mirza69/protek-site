// threatMap.js

function updateMapSize() {
	const container = document.querySelector('#chartdiv');
	const parent = container.parentElement;
	const width = parent.clientWidth || 960;
	const isSmallScreen = window.innerWidth < 640;
	const height = parent.clientHeight || (isSmallScreen ? width * 0.55 : width * 0.625);


	d3.select("#chartdiv")
		.attr("width", width)
		.attr("height", height)
		.attr("viewBox", `0 0 ${width} ${height}`);

	return { width, height };
}

let { width, height } = updateMapSize();

const svg = d3.select("#chartdiv")
	.attr("style", "border:1px solid #333; width: 100%; height: auto; max-width: 100%; background: radial-gradient(circle at center, #1a1a1a 0%, #111 100%)")
	.attr("preserveAspectRatio", "xMidYMid meet")
	.attr("width", width)
	.attr("height", height)
	.attr("viewBox", `0 0 ${width} ${height}`);

d3.select("#chartdiv")
	.style("display", "block")
	.style("width", "100%")
	.style("height", "auto")
	.style("position", "relative")
	.style("overflow", "hidden");

// Fixed hexagon tile background
const hexGroup = svg.append("g").lower();
let hexRadius = width < 600 ? 30 : 20; // Bigger tiles on small screens
const hexHeight = Math.sqrt(3) * hexRadius;
const hexWidth = 2 * hexRadius;
const vertSpacing = hexHeight;
const horizSpacing = 1.5 * hexRadius;

function drawHexes() {
	hexGroup.selectAll("path").remove();
	const buffer = 2 * hexHeight;
	for (let row = -2; row * vertSpacing < height + buffer; row++) {
		for (let col = -2; col * horizSpacing < width + hexWidth * 2; col++) {
			const cx = col * horizSpacing;
			const cy = row * vertSpacing + (col % 2 ? vertSpacing / 2 : 0);
			const fill = Math.random() > 0.25 ? "#0a192f" : "#0c213c"; //#0a192f
			const hex = d3.path();
			for (let i = 0; i < 6; i++) {
				const angle = Math.PI / 3 * i;
				const x = cx + hexRadius * Math.cos(angle);
				const y = cy + hexRadius * Math.sin(angle);
				if (i === 0) hex.moveTo(x, y);
				else hex.lineTo(x, y);
			}
			hex.closePath();
			hexGroup.append("path")
				.attr("d", hex.toString())
				.attr("fill", fill)
				.attr("stroke", "#333")
				.attr("stroke-width", 0.3);
		}
	}
}

drawHexes();

let projection = d3.geoNaturalEarth1();
let pathGenerator = d3.geoPath().projection(projection);

const gMap = svg.append("g");
const threatLayer = svg.append("g");

d3.json("https://d3js.org/world-110m.v1.json").then(worldData => {
	const pathGen = d3.geoPath();
	const countries = topojson.feature(worldData, worldData.objects.countries).features.filter(f => {
		const bounds = pathGen.bounds(f);
		const height = bounds[1][1] - bounds[0][1];
		return height < 200 && f.id !== "010"; // Exclude Antarctica
	});

	// Adjust scale for small screens
	const isSmallScreen = width < 600;
	projection.fitExtent(
		isSmallScreen
			? [[-30, -30], [width + 30, height + 30]]
			: [[-20, -20], [width + 20, height + 20]], // Zoomed out more for large screens
		{
			type: "FeatureCollection",
			features: countries
		});

	pathGenerator = d3.geoPath().projection(projection);

	gMap.selectAll("path")
		.data(countries)
		.join("path")
		.attr("d", pathGenerator)
		.attr("fill", "#04d939")
		.attr("stroke", "#fff")
		.attr("stroke-width", 0.5)
		.on("mouseover", function () {
			d3.select(this).attr("fill", "#039c2c");
		})
		.on("mouseout", function () {
			d3.select(this).attr("fill", "#04d939");
		});

	drawThreats();
});

const attacks = [
	{ from: "New York", to: "London", threat: "Malware", coords: [[-74.006, 40.7128], [-0.1276, 51.5074]] },
	{ from: "Tokyo", to: "Sydney", threat: "DDoS", coords: [[139.6917, 35.6895], [151.2093, -33.8688]] },
	{ from: "Moscow", to: "Beijing", threat: "Ransomware", coords: [[37.6173, 55.7558], [116.4074, 39.9042]] },
	{ from: "Sao Paulo", to: "Cape Town", threat: "Phishing", coords: [[-46.6333, -23.5505], [18.4241, -33.9249]] },
	{ from: "Los Angeles", to: "Seoul", threat: "Exploit", coords: [[-118.2437, 34.0522], [126.978, 37.5665]] }
];

function getRandomNeonColor() {
	const colors = ["#39ff14", "#00ffff", "#ff073a", "#ff8c00", "#ff00ff"];
	return colors[Math.floor(Math.random() * colors.length)];
}

function drawThreats() {
	attacks.forEach(({ from, to, threat, coords }) => {
		const [sourceLonLat, targetLonLat] = coords;

		function animateAttack() {
			const source = projection(sourceLonLat);
			const target = projection(targetLonLat);
			if (!source || !target) return;

			const color = getRandomNeonColor();
			const mid = [(source[0] + target[0]) / 2, (source[1] + target[1]) / 2 - 50];
			const curve = d3.path();
			curve.moveTo(...source);
			curve.quadraticCurveTo(...mid, ...target);

			const pathEl = threatLayer.append("path")
				.attr("d", curve.toString())
				.attr("fill", "none")
				.attr("stroke", color)
				.attr("stroke-width", 2)
				.attr("stroke-linecap", "round");

			const totalLength = pathEl.node().getTotalLength();
			pathEl
				.attr("stroke-dasharray", totalLength)
				.attr("stroke-dashoffset", totalLength)
				.transition().duration(1500).ease(d3.easeCubicOut).attr("stroke-dashoffset", 0)
				.transition().duration(2000).attr("stroke-dasharray", totalLength + "," + totalLength).attr("stroke-dashoffset", -totalLength).style("opacity", 0).remove();

			// Origin blob and ring
			threatLayer.append("circle")
				.attr("r", 0)
				.attr("fill", color)
				.attr("cx", source[0])
				.attr("cy", source[1])
				.transition().duration(700).attr("r", 5)
				.transition().duration(1000).attr("r", 0).remove();

			threatLayer.append("circle")
				.attr("r", 5)
				.attr("stroke", color)
				.attr("fill", "none")
				.attr("stroke-width", 2)
				.attr("cx", source[0])
				.attr("cy", source[1])
				.transition().duration(1500).attr("r", 20).style("opacity", 0).remove();

			// Destination blob and ring
			threatLayer.append("circle")
				.attr("r", 0)
				.attr("fill", color)
				.attr("cx", target[0])
				.attr("cy", target[1])
				.transition().delay(1500).duration(700).attr("r", 5)
				.transition().duration(1000).attr("r", 0).remove();

			threatLayer.append("circle")
				.attr("r", 5)
				.attr("stroke", color)
				.attr("fill", "none")
				.attr("stroke-width", 2)
				.attr("cx", target[0])
				.attr("cy", target[1])
				.transition().delay(1500).duration(1500).attr("r", 20).style("opacity", 0).remove();

			threatLayer.append("text")
				.attr("x", source[0])
				.attr("y", source[1] - 12)
				.text(from)
				.attr("fill", "white")
				.attr("font-size", 12)
				.transition().delay(1700).duration(800).style("opacity", 0).remove();

			threatLayer.append("text")
				.attr("x", target[0])
				.attr("y", target[1] - 12)
				.text(to)
				.attr("fill", "white")
				.attr("font-size", 12)
				.transition().delay(3000).duration(500).style("opacity", 0).remove();
		}

		setTimeout(() => {
			animateAttack();
			setInterval(animateAttack, 5000 + Math.random() * 3000);
		}, Math.random() * 3000);
	});
}

svg.call(d3.zoom()
	.scaleExtent([1, 4])
	.on("zoom", (event) => {
		gMap.attr("transform", event.transform);
		threatLayer.attr("transform", event.transform);
	})
);

window.addEventListener("resize", () => {
	({ width, height } = updateMapSize());
	svg.attr("width", width).attr("height", height).attr("viewBox", `0 0 ${width} ${height}`);
	projection.fitExtent([[-100, -100], [width + 100, height + 100]], {
		type: "FeatureCollection",
		features: gMap.selectAll("path").data()
	});
	pathGenerator = d3.geoPath().projection(projection);
	drawHexes();
	gMap.selectAll("path").attr("d", pathGenerator);
});
