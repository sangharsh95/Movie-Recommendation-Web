const API_KEY = "956a86";
const movieContainer = document.getElementById("movie-container");

function getMovie() {
    const movieName = document.getElementById("movieInput").value;

    if (movieName === "") {
        alert("Please enter a movie name");
        return;
    }

    const url = `https://www.omdbapi.com/?apikey=${API_KEY}&t=${movieName}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.Response === "False") {
                movieContainer.innerHTML = "<p>Movie not found ❌</p>";
                return;
            }

            movieContainer.innerHTML = `
                <div class="movie-card">
                    <img src="${data.Poster}" alt="Movie Poster">
                    <h2>${data.Title}</h2>
                    <p><strong>Genre:</strong> ${data.Genre}</p>
                    <p class="rating">⭐ IMDb: ${data.imdbRating}</p>
                    <p><strong>Released:</strong> ${data.Released}</p>
                    <p><strong>Runtime:</strong> ${data.Runtime}</p>
                    <p>${data.Plot}</p>
                </div>
            `;
        });
}
