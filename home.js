const API_KEY = 'db8e12064a5542eb774a36a5378e52c6;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';

let currentItem = null;

async function fetchCategory(endpoint) {
  const res = await fetch(
    `${BASE_URL}${endpoint}?api_key=${API_KEY}`
  );

  const data = await res.json();
  return data.results || [];
}

async function fetchTrending(type) {
  const res = await fetch(
    `${BASE_URL}/trending/${type}/week?api_key=${API_KEY}`
  );

  const data = await res.json();
  return data.results || [];
}

async function fetchTrendingAnime() {
  const res = await fetch(
    `${BASE_URL}/trending/tv/week?api_key=${API_KEY}`
  );

  const data = await res.json();

  return (data.results || []).filter(
    item =>
      item.original_language === 'ja' &&
      item.genre_ids.includes(16)
  );
}

function displayBanner(item) {
  if (!item) return;

  document.getElementById('banner').style.backgroundImage =
    `url(${IMG_URL}${item.backdrop_path})`;

  document.getElementById('banner-title').textContent =
    item.title || item.name;
}

function displayList(items, containerId) {
  const container = document.getElementById(containerId);

  if (!container) return;

  container.innerHTML = '';

  items.forEach(item => {
    if (!item.poster_path) return;

    const img = document.createElement('img');
    img.src = `${IMG_URL}${item.poster_path}`;
    img.alt = item.title || item.name;

    img.onclick = () => showDetails(item);

    container.appendChild(img);
  });
}

function showDetails(item) {
  currentItem = item;

  document.getElementById('modal-title').textContent =
    item.title || item.name;

  document.getElementById('modal-description').textContent =
    item.overview || '';

  document.getElementById('modal-image').src =
    `${IMG_URL}${item.poster_path}`;

  document.getElementById('modal').style.display = 'flex';

  changeServer();
}

function changeServer() {
  if (!currentItem) return;

  const server = document.getElementById('server').value;

  const type =
    currentItem.media_type === 'movie'
      ? 'movie'
      : 'tv';

  let embedURL = '';

  if (server === 'vidsrc.cc') {
    embedURL =
      `https://vidsrc.cc/v2/embed/${type}/${currentItem.id}`;
  } else if (server === 'vidsrc.me') {
    embedURL =
      `https://vidsrc.net/embed/${type}/?tmdb=${currentItem.id}`;
  } else {
    embedURL =
      `https://player.videasy.net/${type}/${currentItem.id}`;
  }

  document.getElementById('modal-video').src = embedURL;
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
  document.getElementById('modal-video').src = '';
}

async function searchTMDB() {
  const query =
    document.getElementById('search-input').value;

  if (!query.trim()) return;

  const res = await fetch(
    `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${query}`
  );

  const data = await res.json();

  const container =
    document.getElementById('search-results');

  container.innerHTML = '';

  data.results.forEach(item => {
    if (!item.poster_path) return;

    const img = document.createElement('img');

    img.src = `${IMG_URL}${item.poster_path}`;

    img.onclick = () => {
      showDetails(item);
    };

    container.appendChild(img);
  });
}

async function init() {
  const movies = await fetchTrending('movie');
  const tvShows = await fetchTrending('tv');
  const anime = await fetchTrendingAnime();

  displayBanner(
    movies[Math.floor(Math.random() * movies.length)]
  );

  displayList(movies, 'popular-movies');
  displayList(tvShows, 'tvshows-list');
  displayList(anime, 'anime-list');
}

init();  
