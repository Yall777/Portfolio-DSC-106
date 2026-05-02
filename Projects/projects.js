import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');

const projectsTitle = document.querySelector('.projects-title');
projectsTitle.textContent = `${projects.length} Projects`;

const colors = d3.scaleOrdinal(d3.schemeTableau10);
const sliceGenerator = d3.pie().value(d => d.value);
const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

const svg = d3.select('#projects-pie-plot');
const legend = d3.select('#projects-legend');

let query = '';
let selectedYear = null;  // persistent across both search and click

function renderChart(filteredProjects) {
  const rolledData = d3.rollups(filteredProjects, v => v.length, d => d.year)
    .sort((a, b) => b[0] - a[0]);
  const pieData = rolledData.map(([year, count]) => ({ label: year, value: count }));
  const arcData = sliceGenerator(pieData);

  // derive index from the persistent year each time we render
  const selectedIndex = selectedYear !== null
    ? pieData.findIndex(d => d.label === selectedYear)
    : -1;

  svg.selectAll('path').remove();
  arcData.forEach((d, i) => {
    svg.append('path')
      .attr('d', arcGenerator(d))
      .attr('style', `--color: ${colors(i)}`)
      .attr('stroke', 'white')
      .attr('stroke-width', 0.5)
      .classed('selected', i === selectedIndex)
      .on('click', () => {
        selectedYear = selectedYear === pieData[i].label ? null : pieData[i].label;
        applyFilters();
      });
  });

  legend.selectAll('li').remove();
  pieData.forEach((d, i) => {
    legend.append('li')
      .attr('style', `--color: ${colors(i)}`)
      .classed('legend-item', true)
      .classed('selected', i === selectedIndex)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
      .on('click', () => {
        selectedYear = selectedYear === d.label ? null : d.label;
        applyFilters();
      });
  });
}

function applyFilters() {
  const searchFiltered = projects.filter((project) => {
    const values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });

  const displayed = selectedYear !== null
    ? searchFiltered.filter(p => p.year === selectedYear)
    : searchFiltered;

  renderProjects(displayed, projectsContainer, 'h2');
  renderChart(searchFiltered);
}

applyFilters();

const searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('input', (event) => {
  query = event.target.value;
  applyFilters();
});
