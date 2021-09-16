function main()
{
	if (typeof ui !== "undefined")
	{
		ui.registerMenuItem("Guest Statistics", showStats)
	}
};

const windowId = "guest-stats";

function getWindow(): Window
{
	return ui.getWindow(windowId);
}

function showStats()
{
	const window = getWindow();
	if (window !== null)
	{
		window.bringToFront();
	}
	else
	{
		const windowDesc: WindowDesc =
		{
			classification: windowId,
			width: 263,
			height: 251,
			title: "Guest Statistics",
			widgets:
			[
				{
					name: "stat-type",
					type: "dropdown",
					x: 2,
					y: 16,
					width: 100,
					height: 13,
					items: ["Happiness", "Energy", "Hunger", "Thirst", "Nausea", "Toilet", "Cash", "Mass"],
					selectedIndex: 0,
					onChange: refresh,
				},
				{
					type: "button",
					x: 104,
					y: 16,
					width: 60,
					height: 13,
					text: "Refresh",
					onClick: refreshStats,
				},
				{
					name: "stat-display",
					type: "custom",
					x: 2,
					y: 31,
					width: 258,
					height: 203,
					onDraw: drawStats,
				},
				{
					name: "range-min",
					type: "spinner",
					x: 2,
					y: 235,
					width: 100,
					height: 13,
					onDecrement: decMin,
					onIncrement: incMin,
				},
				{
					name: "range-max",
					type: "spinner",
					x: 160,
					y: 235,
					width: 100,
					height: 13,
					onDecrement: decMax,
					onIncrement: incMax,
				}
			],
		};
		ui.openWindow(windowDesc);
		refresh();
	}
}

let statFun: (g: Guest) => number;
let stats: number[];
let rangeMin: number | undefined;
let rangeMax: number | undefined;
let show: (stat: number) => string;
let scaleX: number;
let scaleY: number;
let width: number | undefined;

function refresh()
{
	const window = getWindow();
	const statType = window.findWidget<DropdownWidget>("stat-type");
	scaleX = 1;
	width = 256;
	rangeMin = undefined;
	rangeMax = undefined;
	show = x => x.toString();
	switch (statType.selectedIndex)
	{
		case 0:
			statFun = g => g.happiness;
			break;
		case 1:
			statFun = g => g.energy - 32;
			scaleX = 3;
			width = 291;
			show = x => (x + 32).toString();
			break;
		case 2:
			statFun = g => 255 - g.hunger;
			break;
		case 3:
			statFun = g => 255 - g.thirst;
			break;
		case 4:
			statFun = g => g.nausea;
			break;
		case 5:
			statFun = g => g.toilet;
			break;
		case 6:
			statFun = g => g.cash;
			width = undefined;
			show = x => "$" + (x / 10).toFixed(2);
			break;
		case 7:
			statFun = g => g.mass - 45;
			scaleX = 8;
			width = 256;
			show = x => (x + 45).toString() + "kg";
			break;
	}
	refreshStats();
}

function refreshStats()
{
	makeStats(getGuests().map(statFun));
	
	if (width === undefined)
	{
		width = stats.length * scaleX;
	}

	if (rangeMin === undefined)
	{
		rangeMin = 0;
	}

	if (rangeMax === undefined)
	{
		rangeMax = width / scaleX - 1;
	}

	refreshUI();
}

function refreshUI()
{
	const window = getWindow();
	window.maxWidth = width + 7;
	window.minWidth = width + 7;
	window.findWidget<CustomWidget>("stat-display").width = width + 2;
	window.findWidget<SpinnerWidget>("range-min").text = show(rangeMin);
	window.findWidget<SpinnerWidget>("range-max").text = show(rangeMax);
	window.findWidget<SpinnerWidget>("range-max").x = width - 96;
}

function decMin()
{
	rangeMin = Math.max(0, rangeMin - 1);
	refreshUI();
}

function incMin()
{
	rangeMin = Math.min(width / scaleX - 1, rangeMin + 1);
	rangeMax = Math.max(rangeMin, rangeMax);
	refreshUI();
}

function decMax()
{
	rangeMax = Math.max(0, rangeMax - 1);
	rangeMin = Math.min(rangeMin, rangeMax);
	refreshUI();
}

function incMax()
{
	rangeMax = Math.min(width / scaleX - 1, rangeMax + 1);
	refreshUI();
}

function getGuests(): Guest[]
{
	return map.getAllEntities("peep").filter(p => p.peepType === "guest") as Guest[];
}

function makeStats(data: number[])
{
	stats = [];
	let max = 0;

	// Make a histogram
	for (const datum of data)
	{
		stats[datum] = (stats[datum] || 0) + 1;
		max = Math.max(max, stats[datum]);
	}

	// Scale it to fit 200 pixels high
	scaleY = 200 / max;
}

function drawStats(this: CustomWidget, g: GraphicsContext)
{
	g.fill = 21;
	g.well(0, 0, width + 2, 203);

	for (let x = 0; x < stats.length; x++)
	{
		const height = Math.ceil(stats[x] * scaleY);
		g.rect(x * scaleX + 1, 201 - height, scaleX, height);
	}
}

export default main;
