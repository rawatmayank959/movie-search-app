// Full JavaScript with Pagination, Light/Dark Mode, and Favorites

const inputBox = document.getElementById("inputBox");
const movieList = document.getElementById("movieList");
const API_KEY = "573ba8f1"; // Replace with your OMDb API key

let lastSearchResults = [];
let currentPage = 1;
let totalResults = 0;
let currentSearch = "";

function searchMovie(page = 1) {
  const title = inputBox.value.trim();
  if (!title) return;
  currentSearch = title;

  fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(title)}&apikey=${API_KEY}&page=${page}`)
    .then(res => res.json())
    .then(data => {
      if (data.Response === "True") {
        lastSearchResults = data.Search;
        totalResults = parseInt(data.totalResults);
        currentPage = page;
        displayMovieCards(data.Search);
        renderPagination();
      } else {
        movieList.innerHTML = `<p>No results found.</p>`;
        document.getElementById("pagination").innerHTML = "";
      }
    });
}

function displayMovieCards(movies) {
  movieList.innerHTML = movies.map(movie => `
    <div class="movie-card" data-id="${movie.imdbID}">
      <img src="${movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/180x270?text=No+Image"}" />
      <h3>${movie.Title}</h3>
      <p>${movie.Year}</p>
    </div>
  `).join("");

  document.querySelectorAll(".movie-card").forEach(card => {
    card.addEventListener("click", () => {
      const imdbID = card.getAttribute("data-id");
      showDetailsInCard(imdbID, card);
    });
  });
}

function renderPagination() {
  const pagination = document.getElementById("pagination");
  const totalPages = Math.ceil(totalResults / 10);

  pagination.innerHTML = `
    <button onclick="searchMovie(${Math.max(currentPage - 1, 1)})" ${currentPage === 1 ? "disabled" : ""}>Prev</button>
    <span>Page ${currentPage} of ${totalPages}</span>
    <button onclick="searchMovie(${Math.min(currentPage + 1, totalPages)})" ${currentPage === totalPages ? "disabled" : ""}>Next</button>
  `;
}

function showDetailsInCard(imdbID, cardElement) {
  fetch(`https://www.omdbapi.com/?i=${imdbID}&apikey=${API_KEY}`)
    .then(res => res.json())
    .then(data => {
      if (data.Response === "True") {
        cardElement.classList.add("expanded");
        cardElement.innerHTML = `
          <img src="${data.Poster !== "N/A" ? data.Poster : "https://via.placeholder.com/180x270?text=No+Image"}" />
          <div class="details">
            <h3>${data.Title} (${data.Year})</h3>
            <p><strong>Genre:</strong> ${data.Genre}</p>
            <p><strong>Director:</strong> ${data.Director}</p>
            <p><strong>Actors:</strong> ${data.Actors}</p>
            <p><strong>Plot:</strong> ${data.Plot}</p>
            <p><strong>IMDB Rating:</strong> ${data.imdbRating}</p>
            <button class="back-btn">⬅ Back to Results</button>
            <button onclick="addToFavorites('${data.imdbID}', '${data.Title}')">❤️ Add to Favorites</button>
          </div>
        `;

        cardElement.querySelector(".back-btn").addEventListener("click", () => {
          displayMovieCards(lastSearchResults);
        });
      }
    });
}

function addToFavorites(id, title) {
  const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
  if (!favorites.find(f => f.id === id)) {
    favorites.push({ id, title });
    localStorage.setItem("favorites", JSON.stringify(favorites));
    alert(`${title} added to favorites.`);
    renderFavorites();
  }
}

function renderFavorites() {
  const favContainer = document.getElementById("favorites");
  const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

  if (favorites.length === 0) {
    favContainer.innerHTML = "<p>No favorites added yet.</p>";
    return;
  }

  favContainer.innerHTML = "<h2>Favorites</h2>" + favorites.map(fav => `
    <p>${fav.title} <button onclick="removeFavorite('${fav.id}')">Remove</button></p>
  `).join("");
}

function removeFavorite(id) {
  let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
  favorites = favorites.filter(f => f.id !== id);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderFavorites();
}

function toggleTheme() {
  const body = document.body;
  body.classList.toggle("light-mode");
  localStorage.setItem("theme", body.classList.contains("light-mode") ? "light" : "dark");
}

function applySavedTheme() {
  const theme = localStorage.getItem("theme");
  if (theme === "light") document.body.classList.add("light-mode");
}

document.addEventListener("DOMContentLoaded", () => {
  applySavedTheme();
  renderFavorites();
});
