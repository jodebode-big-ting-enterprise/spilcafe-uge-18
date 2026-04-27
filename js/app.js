"use strict";

document.addEventListener("DOMContentLoaded", initApp);

const GAMES_URL =
  "https://raw.githubusercontent.com/cederdorff/race/refs/heads/master/data/games.json";

let allGames = [];

// DOM
let gameList, genreSelect, searchInput, sortSelect, gameCount;

function initApp() {
  gameList = document.querySelector("#movie-list");
  genreSelect = document.querySelector("#genre-select");
  searchInput = document.querySelector("#search-input");
  sortSelect = document.querySelector("#sort-select");
  gameCount = document.querySelector("#movie-count");

  genreSelect.addEventListener("change", applyFilters);
  searchInput.addEventListener("input", applyFilters);
  sortSelect.addEventListener("change", applyFilters);

  fetchGames();
}

/* ---------------- FETCH ---------------- */

async function fetchGames() {
  try {
    const res = await fetch(GAMES_URL);
    allGames = await res.json();

    buildGenres();
    applyFilters();
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

/* ---------------- HELPERS ---------------- */

function getGenres(game) {
  return game.genre ? [game.genre] : [];
}

function safeText(value, fallback = "—") {
  return value ?? fallback;
}

/* ---------------- GENRES ---------------- */

function buildGenres() {
  const genres = new Set();

  allGames.forEach((g) => {
    getGenres(g).forEach((c) => genres.add(c));
  });

  genreSelect.innerHTML = `<option value="all">Alle kategorier</option>`;

  [...genres]
    .sort((a, b) => a.localeCompare(b))
    .forEach((genre) => {
      genreSelect.insertAdjacentHTML(
        "beforeend",
        `<option value="${genre}">${genre}</option>`
      );
    });
}

/* ---------------- FILTERS ---------------- */

function applyFilters() {
  const search = searchInput.value.toLowerCase().trim();
  const selectedGenre = genreSelect.value;
  const sortOption = sortSelect.value;

  let filtered = allGames.filter((g) => {
    const title = (g.title || "").toLowerCase();
    const desc = (g.description || "").toLowerCase();

    const matchSearch =
      title.includes(search) || desc.includes(search);

    const matchGenre =
      selectedGenre === "all" || g.genre === selectedGenre;

    return matchSearch && matchGenre;
  });

  /* SORTING */
  if (sortOption === "title") {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  }

  if (sortOption === "players") {
    filtered.sort((a, b) => b.players.max - a.players.max);
  }

  if (sortOption === "weight") {
    filtered.sort((a, b) => (a.difficulty?.length || 0) - (b.difficulty?.length || 0));
  }

  render(filtered);
}

/* ---------------- RENDER ---------------- */

function render(games) {
  gameList.innerHTML = "";

  gameCount.textContent = `Viser ${games.length} ud af ${allGames.length} spil`;

  if (!games.length) {
    gameList.innerHTML = `<p class="empty">Ingen spil matcher din søgning</p>`;
    return;
  }

  games.forEach(renderCard);
}

/* ---------------- CARD ---------------- */

function renderCard(game) {
  const card = `
    <article class="movie-card">

      <img src="${game.image}" alt="${game.title}" class="movie-image">

      <div class="movie-info">

        <div class="title-row">
          <h2>${game.title}</h2>
          <span class="year-badge">
            ${game.players.min}-${game.players.max} 👥
          </span>
        </div>

        <p class="genre">${game.genre}</p>

        <p class="movie-rating">⭐ ${game.rating}</p>

        <p class="director-line">
          ⏱ ${game.playtime} min • 🎯 ${game.difficulty}
        </p>

        <p class="meta">
          🔞 ${game.age}+ • 🌍 ${game.language}
        </p>

      </div>
    </article>
  `;

  gameList.insertAdjacentHTML("beforeend", card);

  gameList.lastElementChild.addEventListener("click", () => {
    openDialog(game);
  });
}

/* ---------------- DIALOG ---------------- */

function openDialog(game) {
  const dialog = document.querySelector("#movie-dialog");
  const content = document.querySelector("#dialog-content");

  content.innerHTML = `
    <div class="dialog-grid">

      <img src="${game.image}" class="dialog-image" alt="${game.title}">

      <div class="dialog-details">

        <h2>${game.title}</h2>

        <p class="tagline">
          ${game.genre} • ${game.language}
        </p>

        <p>${game.description}</p>

        <div class="info-grid">
          <p><strong>Spillere:</strong> ${game.players.min}-${game.players.max}</p>
          <p><strong>Spilletid:</strong> ${game.playtime} min</p>
          <p><strong>Alder:</strong> ${game.age}+</p>
          <p><strong>Sværhedsgrad:</strong> ${game.difficulty}</p>
          <p><strong>Rating:</strong> ⭐ ${game.rating}</p>
        </div>

        <div class="meta-box">
          <p>📍 ${game.location}</p>
          <p>📦 Hylde: ${game.shelf}</p>
          <p>${game.available ? "🟢 Tilgængelig" : "🔴 Udsolgt"}</p>
        </div>

        <div class="rules">
          <h3>Regler</h3>
          <p>${game.rules}</p>
        </div>

      </div>
    </div>
  `;

  dialog.showModal();
}