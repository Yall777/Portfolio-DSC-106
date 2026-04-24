console.log('IT\'S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "/"
  : "/Portfolio-DSC-106/";

let pages = [
  { url: '', title: 'Home' },
  { url: 'Projects/', title: 'Projects' },
  { url: 'resume/', title: 'Resume' },
  { url: 'contact/', title: 'Contact' },
  { url: 'https://github.com/Yall777/Portfolio-DSC-106', title: 'GitHub' },
];

document.body.insertAdjacentHTML('afterbegin', `
  <label class="color-scheme">
    Theme:
    <select>
      <option value="light dark">Automatic</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>
`);

const select = document.querySelector('.color-scheme select');

function setColorScheme(colorScheme) {
  document.documentElement.style.setProperty('color-scheme', colorScheme);
  select.value = colorScheme;
}

if ('colorScheme' in localStorage) {
  setColorScheme(localStorage.colorScheme);
}

select.addEventListener('input', function (event) {
  localStorage.colorScheme = event.target.value;
  setColorScheme(event.target.value);
});

const form = document.querySelector('form');
form?.addEventListener('submit', function (event) {
  event.preventDefault();
  const data = new FormData(form);
  let url = form.action + '?';
  for (let [name, value] of data) {
    url += `${name}=${encodeURIComponent(value)}&`;
  }
  url = url.slice(0, -1);
  location.href = url;
});

export async function fetchGithubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}

export function renderProjects(project, containerElement, headingLevel = 'h2') {
  containerElement.innerHTML = '';
  for (const p of project) {
    const article = document.createElement('article');
    article.innerHTML = `
      <${headingLevel}>${p.title}</${headingLevel}>
      <img src="${p.image}" alt="${p.title}">
      <p>${p.description}</p>
      ${p.year ? `<footer class="project-year">c. ${p.year}</footer>` : ''}
    `;
    containerElement.appendChild(article);
  }
}

export async function fetchJSON(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
  }
}

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;
  let title = p.title;
  url = !url.startsWith('http') ? BASE_PATH + url : url;

  let a = document.createElement('a');
  a.href = url;
  a.textContent = title;
  a.classList.toggle('current', a.host === location.host && a.pathname === location.pathname);
  a.toggleAttribute('target', a.host !== location.host);
  nav.append(a);
}
