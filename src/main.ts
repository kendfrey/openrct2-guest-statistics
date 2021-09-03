import hello from './hello';
import {
	getPeeps,
	getStaff,
	getHandymen,
	getMechanics,
	getSecurity,
	getEntertainers,
} from './helpers';

const main = (): void => {
	console.log(`${hello()} Your plug-in has started!`);

	console.log(`In your park, there are currently ${getPeeps().length} peeps`);
	console.log(`${getStaff().length} of them is your staff.`);

	console.log('Your staff consists of:');
	console.log(`- ${getHandymen().length} handymen`);
	console.log(`- ${getMechanics().length} mechanics`);
	console.log(`- ${getSecurity().length} security`);
	console.log(`- ${getEntertainers().length} entertainers`);

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
			width: 262,
			height: 235,
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
					items: ["Happiness", "Energy", "Hunger"],
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
					height: 202,
					onDraw: drawStats,
				}
			],
		};
		ui.openWindow(windowDesc);
		refresh();
	}
}

let stats: number[];

function refresh()
{
	const window = ui.getWindow(windowId);
	const statType = window.findWidget<DropdownWidget>("stat-type");
	let statFun : (g: Guest) => number;
	switch (statType.selectedIndex)
	{
		case 0:
			statFun = g => g.happiness;
			break;
		case 1:
			statFun = g => g.energy;
			break;
		case 2:
			statFun = g => 255 - g.hunger;
			break;
	}
	stats = makeStats(getGuests().map(statFun));
	window.bringToFront(); // It doesn't redraw properly without this.
}

function getGuests(): Guest[]
{
	return map.getAllEntities("peep").filter(p => p.peepType === "guest") as Guest[];
}

function makeStats(data: number[]): number[]
{
	const stats = [];
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

	return stats;
}

function drawStats(this: CustomWidget, g: GraphicsContext)
{
	g.stroke = 21;
	g.well(0, 0, 257, 202);

	for (let x = 0; x < stats.length; x++)
	{
		g.line(x + 1, 201, x + 1, 201 - stats[x]);
	}
}

export default main;
