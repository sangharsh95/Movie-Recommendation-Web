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
let recommendationKeyword = ""; // 🔒 LOCKED KEYWORD

/* ================= PAGE LOAD ================= */
window.addEventListener("load", () => {
    showHomeSections();
    loadDefaultRecommendations();
    loadNowPlaying();
    loadIndianMovies();
    loadTopIMDb();
});

/* ================= VISIBILITY ================= */
function hideHomeSections() {
    [nowPlayingContainer, indiaMoviesContainer, topImdbContainer].forEach(c => c.style.display = "none");
    [nowPlayingTitle, indiaTitle, topImdbTitle].forEach(t => t.style.display = "none");
}

function showHomeSections() {
    [nowPlayingContainer, indiaMoviesContainer, topImdbContainer].forEach(c => c.style.display = "flex");
    [nowPlayingTitle, indiaTitle, topImdbTitle].forEach(t => t.style.display = "block");
}

/* ================= SEARCH (DEBOUNCE) ================= */
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
                    const div = document.createElement("div");
                    div.className = "suggestion-item";
                    div.innerText = m.Title;
                    div.onclick = () => {
                        input.value = m.Title;
                        suggestionsBox.innerHTML = "";
                        searchMovie(q, m.Title);
                    };
                    suggestionsBox.appendChild(div);
                });
            });
    }, 300);
});

searchBtn.onclick = () => searchMovie(input.value, input.value);
input.addEventListener("keydown", e => {
    if (e.key === "Enter") searchMovie(input.value, input.value);
});

/* ================= SEARCH MOVIE ================= */
function searchMovie(keyword, title) {
    if (!keyword) return;

    recommendationKeyword = keyword.toLowerCase(); // 🔒 SET ONCE
    loadMovie(title);
}

/* ================= LOAD MOVIE ================= */
function loadMovie(title) {
    hideHomeSections();

    fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&t=${title}`)
        .then(res => res.json())
        .then(movie => {
            if (movie.Response === "False") return;

            movieContainer.innerHTML = `
                <div class="movie-card">
                    <img src="${movie.Poster}">
                    <h2>${movie.Title}</h2>
                    <p><strong>Genre:</strong> ${movie.Genre}</p>
                    <p class="rating">⭐ IMDb: ${movie.imdbRating}</p>
                    <p>${movie.Plot}</p>
                </div>
            `;

            showRecommendations();
        });
}

/* ================= RECOMMENDATIONS ================= */
function showRecommendations() {
    recommendTitle.innerText = `Recommended "${capitalize(recommendationKeyword)}" Movies`;
    recommendContainer.innerHTML = "";

    fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${recommendationKeyword}`)
        .then(res => res.json())
        .then(data => {
            if (data.Response === "False") return;

            const seen = new Set();

            data.Search.forEach(movie => {
                if (seen.has(movie.Title)) return;
                seen.add(movie.Title);

                const card = document.createElement("div");
                card.className = "recommend-card";
                card.innerHTML = `
                    <img src="${movie.Poster}">
                    <p>${movie.Title}</p>
                `;
                card.onclick = () => loadMovie(movie.Title);
                recommendContainer.appendChild(card);
            });
        });
}

/* ================= HELPERS ================= */
function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

/* ================= HOME DATA ================= */
function loadDefaultRecommendations() {
    fetchMovies("Avengers", recommendContainer, 8, "Recommended Movies");
}

function loadNowPlaying() {
    ["2024", "2023", "Marvel", "DC"].forEach(k =>
        fetchMovies(k, nowPlayingContainer, 3)
    );
}

function loadIndianMovies() {
    ["Bollywood", "Hindi", "Telugu", "Tamil"].forEach(k =>
        fetchMovies(k, indiaMoviesContainer, 3)
    );
}

function loadTopIMDb() {
    ["The Shawshank Redemption", "The Godfather", "The Dark Knight", "Dangal", "3 Idiots"]
        .forEach(title => {
            fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&t=${title}`)
                .then(res => res.json())
                .then(m => m.Response !== "False" && createCard(m, topImdbContainer, true));
        });
}

function fetchMovies(keyword, container, limit, titleText = "") {
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
    d.onclick = () => searchMovie(recommendationKeyword || movie.Title, movie.Title);
    container.appendChild(d);
}
