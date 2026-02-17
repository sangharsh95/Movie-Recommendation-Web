const API_KEY = "956a86";

const input = document.getElementById("movieInput");
const searchBtn = document.getElementById("searchBtn");
const suggestionsBox = document.getElementById("suggestions");
const movieContainer = document.getElementById("movie-container");
const recommendContainer = document.getElementById("recommend-container");
const recommendTitle = document.getElementById("recommend-title");

const nowPlayingContainer = document.getElementById("now-playing");
const indiaMoviesContainer = document.getElementById("india-movies");
const topImdbContainer = document.getElementById("top-imdb");

const nowPlayingTitle = document.getElementById("now-playing-title");
const indiaTitle = document.getElementById("india-title");
const topImdbTitle = document.getElementById("top-imdb-title");

let debounceTimer;

/* Page load */
window.addEventListener("load", () => {
    showHomeSections();
    loadDefaultRecommendations();
    loadNowPlaying();
    loadIndianMovies();
    loadTopIMDb();
});

/* Visibility */
function hideHomeSections() {
    [nowPlayingContainer, indiaMoviesContainer, topImdbContainer].forEach(c => c.style.display = "none");
    [nowPlayingTitle, indiaTitle, topImdbTitle].forEach(t => t.style.display = "none");
}

function showHomeSections() {
    [nowPlayingContainer, indiaMoviesContainer, topImdbContainer].forEach(c => c.style.display = "flex");
    [nowPlayingTitle, indiaTitle, topImdbTitle].forEach(t => t.style.display = "block");
}

/* Load sections */
function loadDefaultRecommendations() {
    fetchMovies("Avengers", recommendContainer, 8, "Recommended Movies");
}

function loadNowPlaying() {
    ["2024", "2023", "Marvel", "DC"].forEach(k => fetchMovies(k, nowPlayingContainer, 3));
}

function loadIndianMovies() {
    ["Bollywood", "Hindi", "Telugu", "Tamil"].forEach(k => fetchMovies(k, indiaMoviesContainer, 3));
}

function loadTopIMDb() {
    ["The Shawshank Redemption", "The Godfather", "The Dark Knight", "Dangal", "3 Idiots"]
        .forEach(title => {
            fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&t=${title}`)
                .then(res => res.json())
                .then(m => m.Response !== "False" && createCard(m, topImdbContainer, true));
        });
}

/* Search (debounced) */
input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    const q = input.value.trim();
    if (q.length < 2) {
        suggestionsBox.innerHTML = "";
        return;
    }

    debounceTimer = setTimeout(() => {
        fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${q}`)
            .then(res => res.json())
            .then(data => {
                if (data.Response === "False") return;
                suggestionsBox.innerHTML = "";
                data.Search.forEach(m => {
                    const d = document.createElement("div");
                    d.className = "suggestion-item";
                    d.innerText = m.Title;
                    d.onclick = () => loadMovie(m.Title);
                    suggestionsBox.appendChild(d);
                });
            });
    }, 300);
});

searchBtn.onclick = () => loadMovie(input.value);
input.addEventListener("keydown", e => e.key === "Enter" && loadMovie(input.value));

/* Load movie */
function loadMovie(title) {
    if (!title) return;
    hideHomeSections();

    fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&t=${title}`)
        .then(res => res.json())
        .then(m => {
            if (m.Response === "False") return;

            movieContainer.innerHTML = `
                <div class="movie-card">
                    <img src="${m.Poster}">
                    <h2>${m.Title}</h2>
                    <p><strong>Genre:</strong> ${m.Genre}</p>
                    <p class="rating">⭐ IMDb: ${m.imdbRating}</p>
                    <p>${m.Plot}</p>
                </div>
            `;

            fetchMovies(m.Genre.split(",")[0], recommendContainer, 8, `Recommended ${m.Genre.split(",")[0]} Movies`);
        });
}

/* Helpers */
function fetchMovies(keyword, container, limit, titleText) {
    if (titleText) recommendTitle.innerText = titleText;
    container.innerHTML = "";

    fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${keyword}`)
        .then(res => res.json())
        .then(data => {
            if (data.Response === "False") return;
            data.Search.slice(0, limit).forEach(m => createCard(m, container));
        });
}

function createCard(movie, container, showRating = false) {
    const d = document.createElement("div");
    d.className = "recommend-card";
    d.innerHTML = `
        <img src="${movie.Poster}">
        <p>${movie.Title}</p>
        ${showRating ? `<p class="rating">⭐ ${movie.imdbRating}</p>` : ""}
    `;
    d.onclick = () => loadMovie(movie.Title);
    container.appendChild(d);
}

/* Carousel scroll */
function scrollLeft(id) {
    document.getElementById(id).scrollLeft -= 300;
}

function scrollRight(id) {
    document.getElementById(id).scrollLeft += 300;
}
