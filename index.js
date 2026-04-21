import * as d3 from 'd3'

d3.csv('./data/athlete_events.csv', d3.autoType)
.then(athletes => {
    console.log(athletes);
    const attributes = Object.keys(athletes[0]);
    console.log(attributes);
    
    // Question: Which teams are best at athletics?
    const medalsByTeam = d3.rollup(
        athletes,
        v => v.filter(d => d.Medal !== null).length,
        d => d.Team
    );

    const sortedTeams = Array.from(medalsByTeam, ([team, count]) => ({ team, count }))
        .sort((a, b) => d3.descending(a.count, b.count));
    console.log("Teams", sortedTeams);

    const medalsByTeamYear = d3.rollup(
        athletes,
        v => v.filter(d => d.Medal !== null).length,
        d => d.Year,
        d => d.Team
    );

    const medalsByTeamYearClean = Array.from(medalsByTeamYear, ([year, teams]) => {
        const sorted = Array.from(teams, ([team, count]) => ({ team, count }))
            .sort((a, b) => d3.descending(a.count, b.count));
        return { year, topTeam: sorted[0] };
    });
    console.log(medalsByTeamYearClean.slice(0, 10));

    const medalsByNationYear = d3.rollup(
        athletes,
        v => v.filter(d => d.Medal && d.Medal !== "NA").length,
        d => d.NOC,
        d => d.Year
    );
    console.log(medalsByNationYear);

    // ── Bar charts: top 3 teams by total medals, broken down by year ──────────

    const top3Teams = sortedTeams.slice(0, 3).map(d => d.team);
    const colors = { 
        [top3Teams[0]]: '#238ADD', 
        [top3Teams[1]]: '#D4537E', 
        [top3Teams[2]]: '#639922' 
    };

    const margin = { top: 40, right: 20, bottom: 50, left: 60 };
    const width  = 800 - margin.left - margin.right;
    const height = 280 - margin.top  - margin.bottom;

    top3Teams.forEach(team => {
        // Get this team's medals per year from medalsByTeamYear
        // medalsByTeamYear is keyed [year][team], so we need to invert
        const data = [];
        medalsByTeamYear.forEach((teamsMap, year) => {
            const count = teamsMap.get(team) ?? 0;
            data.push({ year, count });
        });
        data.sort((a, b) => d3.ascending(a.year, b.year));

        // Create a container div per chart
        const container = d3.select('body')
            .append('div')
            .style('margin-bottom', '2rem');

        const svg = container.append('svg')
            .attr('width',  width  + margin.left + margin.right)
            .attr('height', height + margin.top  + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Title
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', -15)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .style('font-weight', '500')
            .text(`${team} — Olympic Medals by Year`);

        // X scale
        const x = d3.scaleBand()
            .domain(data.map(d => d.year))
            .range([0, width])
            .padding(0.2);

        // Y scale
        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.count)])
            .nice()
            .range([height, 0]);

        // X axis
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).tickValues(
                // Only show every 4th year label to avoid crowding
                x.domain().filter((_, i) => i % 4 === 0)
            ))
            .selectAll('text')
            .attr('transform', 'rotate(-40)')
            .style('text-anchor', 'end');

        // Y axis
        svg.append('g')
            .call(d3.axisLeft(y).ticks(5));

        // Y axis label
        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2)
            .attr('y', -45)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .text('Medals');

        // Bars
        svg.selectAll('rect')
            .data(data)
            .join('rect')
            .attr('x', d => x(d.year))
            .attr('y', d => y(d.count))
            .attr('width', x.bandwidth())
            .attr('height', d => height - y(d.count))
            .attr('fill', colors[team])
            .attr('rx', 2);
    });

    
})