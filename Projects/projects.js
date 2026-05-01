import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

const projectsTitle = document.querySelector('.projects-title');
projectsTitle.textContent = `${projects.length} Projects`;

// Build year → count map
const rolledData = d3.rollups(projects, v => v.length, d => d.year)
  .sort((a, b) => b[0] - a[0]);
const pieData = rolledData.map(([year, count]) => ({ label: year, value: count }));

const colors = d3.scaleOrdinal()
  .domain(pieData.map(d => d.label))
  .range(d3.schemeTableau10);

const sliceGenerator = d3.pie().value(d => d.value);
const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
const arcData = sliceGenerator(pieData);

const svg = d3.select('#projects-pie-plot');
arcData.forEach(d => {
  svg.append('path')
    .attr('d', arcGenerator(d))
    .attr('fill', colors(d.data.label))
    .attr('stroke', 'white')
    .attr('stroke-width', 0.5);
});

// Legend
const legend = d3.select('#projects-legend');
pieData.forEach(d => {
  legend.append('li')
    .attr('style', `--color: ${colors(d.label)}`)
    .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
});
