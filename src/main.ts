function main()
{
	if (typeof ui !== "undefined")
	{
		ui.registerMenuItem("Guest Statistics", showStats)
	}
};

const windowId = "guest-stats";

function showStats()
{
	const window = ui.getWindow(windowId);
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
			height: 236,
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
					onClick: refresh,
				},
				{
					name: "stat-display",
					type: "custom",
					x: 2,
					y: 31,
					width: 258,
					height: 203,
					onDraw: drawStats,
				}
			],
		};
		ui.openWindow(windowDesc);
		refresh();
	}
}

let stats: number[];
let scaleX: number;
let width: number | undefined;

function refresh()
{
	const window = ui.getWindow(windowId);
	const statType = window.findWidget<DropdownWidget>("stat-type");
	let statFun: (g: Guest) => number;
	scaleX = 1;
	width = 256;
	switch (statType.selectedIndex)
	{
		case 0:
			statFun = g => g.happiness;
			break;
		case 1:
			statFun = g => g.energy - 32;
			scaleX = 3;
			width = 291;
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
			break;
		case 7:
			statFun = g => g.mass - 45;
			scaleX = 8;
			width = 256;
			break;
	}
	makeStats(getGuests().map(statFun));
	
	if (width === undefined)
	{
		width = stats.length * scaleX;
	}
	window.maxWidth = width + 7;
	window.minWidth = width + 7;
	window.findWidget<CustomWidget>("stat-display").width = width + 2;
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
	for (let i = 0; i < stats.length; i++)
	{
		stats[i] = Math.ceil((stats[i] || 0) * 200 / max);
	}
}

function drawStats(this: CustomWidget, g: GraphicsContext)
{
	g.fill = 21;
	g.well(0, 0, width + 2, 203);

	for (let x = 0; x < stats.length; x++)
	{
		g.rect(x * scaleX + 1, 201 - stats[x], scaleX, stats[x]);
	}
}

export default main;
