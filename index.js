import * as d3 from 'd3'

d3.csv('./data/athlete_events.csv', d3.autoType)
.then(athletes => {
    const athleticsMedalists = athletes.filter(d => 
    d.Sport === 'Athletics' && 
    (d.Medal === 'Gold' || d.Medal === 'Silver' || d.Medal === 'Bronze')
);

    const medalsByTeam = d3.rollup(
        athleticsMedalists,
        v => v.length,
        d => d.Team
    );

    const top10Teams = Array.from(medalsByTeam, ([team, count]) => ({ team, count }))
        .sort((a, b) => d3.descending(a.count, b.count))
        .slice(0, 10);

    const width = 800; 
    const height = 500; 
    const margin = { top: 30, bottom: 100, right: 20, left: 70 }; 

    const svg = d3.select('body')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('display', 'block')
        .style('margin', 'auto'); 

    
    const x = d3.scaleBand()
        .domain(top10Teams.map(d => d.team))
        .range([margin.left, width - margin.right]) 
        .padding(0.3);

    const y = d3.scaleLinear()
        .domain([0, d3.max(top10Teams, d => d.count)])
        .nice()
        .range([height - margin.bottom, margin.top]);


    svg.append('g')
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');

    // Y-Axis
    svg.append('g')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(y));

        
    // svg.append('text')
    //     .attr('x', - height /2)
    //     . attr('transform', 'rotate(-90)')
    //     .attr('y',  -10)
    //     .attr('text-anchor', 'middle')
    //     .style('font-size', '20px')
    //     .style('font-weight', 'bold')
    //     .text('Number of Medals Won');

    // ── Draw Marks (Rectangles) ────────────────────────────────────────
    
    svg.selectAll('rect')
        .data(top10Teams)
        .join('rect')
        .attr('x', d => x(d.team))
        .attr('y', d => y(d.count))
        .attr('width', x.bandwidth())
        .attr('height', d => height - margin.bottom - y(d.count))
        .attr('fill', '#1c9286')
        .attr('rx', 4)
        .on('mouseover', function() { d3.select(this).attr('fill', '#D4537E'); })
        .on('mouseout', function() { d3.select(this).attr('fill', '#1c9286'); })

    // ── Labels ─────────────────────────────────────────────────────────
    
    svg.selectAll('.label')
        .data(top10Teams)
        .join('text')
        .attr('x', d => x(d.team) + x.bandwidth() / 2)
        .attr('y', d => y(d.count) + 15)
        .attr('text-anchor', 'middle')
        .style('fill', 'white')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('pointer-events', 'none')
        .text(d => d.count);


        svg.append('text')
        .attr('x', width / 2)
        .attr('y', margin.top / 1.5)
        .attr('text-anchor', 'middle')
        .style('font-size', '20px')
        .style('font-weight', 'bold')
        .text('Top 10 Teams: Athletics Medals');


svg.append('text')

    .attr('x', -(margin.top + (height - margin.bottom - margin.top) / 2))
    .attr('y', margin.left / 5)
    .attr('transform', 'rotate(-90)')
    .attr('text-anchor', 'middle')
    .style('font-size', '14px')
    .style('font-weight', 'bold')
    .text('Number of Medals Won');
    


svg.append('text')
    .attr('x', margin.left + (width - margin.left - margin.right) / 2)
    .attr('y', height - 12) 
    .attr('text-anchor', 'middle')
    .style('font-size', '14px')
    .style('font-weight', 'bold')
    .text('Teams');
});