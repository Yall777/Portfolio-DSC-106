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
let selectedIndex = -1;

function renderChart(filteredProjects) {
  const rolledData = d3.rollups(filteredProjects, v => v.length, d => d.year)
    .sort((a, b) => b[0] - a[0]);
  const pieData = rolledData.map(([year, count]) => ({ label: year, value: count }));
  const arcData = sliceGenerator(pieData);

  svg.selectAll('path').remove();
  arcData.forEach((d, i) => {
    svg.append('path')
      .attr('d', arcGenerator(d))
      .attr('style', `--color: ${colors(i)}`)
      .attr('stroke', 'white')
      .attr('stroke-width', 0.5)
      .classed('selected', i === selectedIndex)
      .on('click', () => {
        selectedIndex = selectedIndex === i ? -1 : i;
        svg.selectAll('path').classed('selected', (_, idx) => idx === selectedIndex);
        legend.selectAll('li').classed('selected', (_, idx) => idx === selectedIndex);
        const displayed = selectedIndex !== -1
          ? filteredProjects.filter(p => p.year === pieData[selectedIndex].label)
          : filteredProjects;
        renderProjects(displayed, projectsContainer, 'h2');
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
        selectedIndex = selectedIndex === i ? -1 : i;
        svg.selectAll('path').classed('selected', (_, idx) => idx === selectedIndex);
        legend.selectAll('li').classed('selected', (_, idx) => idx === selectedIndex);
        const displayed = selectedIndex !== -1
          ? filteredProjects.filter(p => p.year === pieData[selectedIndex].label)
          : filteredProjects;
        renderProjects(displayed, projectsContainer, 'h2');
      });
  });
}

function applyFilters() {
  selectedIndex = -1;
  const searchFiltered = projects.filter((project) => {
    const values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
  renderProjects(searchFiltered, projectsContainer, 'h2');
  renderChart(searchFiltered);
}

applyFilters();

const searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('input', (event) => {
  query = event.target.value;
  applyFilters();
});
