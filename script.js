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

/* PAGE LOAD */
window.addEventListener("load", () => {
    showHomeSections();
    loadDefaultRecommendations();
    loadNowPlaying();
    loadIndianMovies();
    loadTopIMDb();
});

/* VISIBILITY */
function hideHomeSections() {
    nowPlayingContainer.style.display = "none";
    indiaMoviesContainer.style.display = "none";
    topImdbContainer.style.display = "none";

    nowPlayingTitle.style.display = "none";
    indiaTitle.style.display = "none";
    topImdbTitle.style.display = "none";
}

function showHomeSections() {
    nowPlayingContainer.style.display = "flex";
    indiaMoviesContainer.style.display = "flex";
    topImdbContainer.style.display = "flex";

    nowPlayingTitle.style.display = "block";
    indiaTitle.style.display = "block";
    topImdbTitle.style.display = "block";
}

/* HOME DATA */
function loadDefaultRecommendations() {
    fetchMovies("Avengers", recommendContainer, 6, "Recommended Movies");
}

function loadNowPlaying() {
    ["2024", "2023", "Marvel", "DC"].forEach(k =>
        fetchMovies(k, nowPlayingContainer, 2)
    );
}

function loadIndianMovies() {
    ["Bollywood", "Hindi", "Telugu", "Tamil"].forEach(k =>
        fetchMovies(k, indiaMoviesContainer, 2)
    );
}

function loadTopIMDb() {
    [
        "The Shawshank Redemption",
        "The Godfather",
        "The Dark Knight",
        "12 Angry Men",
        "Schindler's List",
        "Inception",
        "Dangal",
        "3 Idiots"
    ].forEach(title => {
        fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&t=${title}`)
            .then(res => res.json())
            .then(movie => {
                if (movie.Response === "False") return;
                createCard(movie, topImdbContainer, true);
            });
    });
}

/* FAST SEARCH */
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
                        loadMovie(m.Title);
                    };
                    suggestionsBox.appendChild(div);
                });
            });
    }, 300);
});

searchBtn.addEventListener("click", () => loadMovie(input.value));
input.addEventListener("keydown", e => {
    if (e.key === "Enter") loadMovie(input.value);
});

/* MOVIE DETAILS */
function loadMovie(title) {
    if (!title) return;

    hideHomeSections();

    fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&t=${title}`)
        .then(res => res.json())
        .then(data => {
            if (data.Response === "False") return;

            movieContainer.innerHTML = `
                <div class="movie-card">
                    <img src="${data.Poster}">
                    <h2>${data.Title}</h2>
                    <p><strong>Genre:</strong> ${data.Genre}</p>
                    <p class="rating">⭐ IMDb: ${data.imdbRating}</p>
                    <p>${data.Plot}</p>
                </div>
            `;

            fetchMovies(
                data.Genre.split(",")[0],
                recommendContainer,
                6,
                `Recommended ${data.Genre.split(",")[0]} Movies`
            );
        });
}

/* HELPERS */
function fetchMovies(keyword, container, limit = 6, titleText = "") {
    if (titleText) recommendTitle.innerText = titleText;
    container.innerHTML = "";

    fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${keyword}`)
        .then(res => res.json())
        .then(data => {
            if (data.Response === "False") return;
            data.Search.slice(0, limit).forEach(m =>
                createCard(m, container)
            );
        });
}

function createCard(movie, container, showRating = false) {
    const div = document.createElement("div");
    div.className = "recommend-card";
    div.innerHTML = `
        <img src="${movie.Poster}">
        <p>${movie.Title}</p>
        ${showRating ? `<p class="rating">⭐ ${movie.imdbRating}</p>` : ""}
    `;
    div.onclick = () => loadMovie(movie.Title);
    container.appendChild(div);
}
