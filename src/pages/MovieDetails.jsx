import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./MovieDetails.css";

const MovieDetails = () => {
  const { id } = useParams(); // URL-ből kinyerjük a film ID-t
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [trailer, setTrailer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        const API_KEY = process.env.REACT_APP_TMDB_API_KEY;

        // Film részletek
        const movieResponse = await axios.get(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=en-US`
        );
        setMovie(movieResponse.data);

        // Szereplők
        const castResponse = await axios.get(
          `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${API_KEY}&language=en-US`
        );
        setCast(castResponse.data.cast.slice(0, 10)); // Csak az első 10 szereplő

        // Trailer
        const trailerResponse = await axios.get(
          `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${API_KEY}&language=en-US`
        );
        const youtubeTrailer = trailerResponse.data.results.find(
          (video) => video.site === "YouTube" && video.type === "Trailer"
        );
        setTrailer(youtubeTrailer);

        // Vélemények
        const reviewsResponse = await axios.get(
          `https://api.themoviedb.org/3/movie/${id}/reviews?api_key=${API_KEY}&language=en-US&page=1`
        );
        setReviews(reviewsResponse.data.results);

        // Hasonló filmek (értékelés szerint rendezve)
        const similarResponse = await axios.get(
          `https://api.themoviedb.org/3/movie/${id}/similar?api_key=${API_KEY}&language=en-US&page=1`
        );
        const sortedMovies = similarResponse.data.results.sort(
          (a, b) => b.vote_average - a.vote_average
        );
        setSimilarMovies(sortedMovies);
      } catch (error) {
        console.error("Error fetching movie data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [id]);

  const handleBack = () => {
    navigate(-1); // Visszalép az előző oldalra
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!movie) {
    return <p>Movie not found.</p>;
  }

  return (
    <div className="movie-details">
      <button onClick={handleBack} className="back-button">
        ⬅ Back
      </button>
      <div className="movie-content">
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
          className="movie-poster"
        />
        <div className="movie-text">
          <h1>{movie.title}</h1>
          <p>{movie.overview}</p>
          <div className="movie-meta">
            <span>Release Date: {movie.release_date}</span>
          </div>
          <div className="movie-genres">
            <h3>Genres:</h3>
            <ul>
              {movie.genres.map((genre) => (
                <li key={genre.id}>{genre.name}</li>
              ))}
            </ul>
          </div>
          <div className="movie-rating">
            <h3>Rating:</h3>
            <div className="progress-bar">
              <div
                className="progress"
                style={{ width: `${movie.vote_average * 10}%` }}
              ></div>
            </div>
            <span>{movie.vote_average} / 10</span>
          </div>
        </div>
      </div>
      <div className="movie-cast">
        <h3>Cast:</h3>
        <ul>
          {cast.map((actor) => (
            <li key={actor.id}>
              <img
                src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                alt={actor.name}
              />
              <p>{actor.name}</p>
            </li>
          ))}
        </ul>
      </div>
      {trailer && (
        <div className="movie-trailer">
          <h3>Trailer:</h3>
          <iframe
            width="100%"
            height="315"
            src={`https://www.youtube.com/embed/${trailer.key}`}
            title="Movie Trailer"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}
      <div className="movie-reviews">
        <h3>Reviews:</h3>
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="review-card">
              <h4>{review.author}</h4>
              <p>{review.content.slice(0, 200)}...</p>
            </div>
          ))
        ) : (
          <p>No reviews available.</p>
        )}
      </div>
      <div className="similar-movies">
        <h3>Similar Movies (Sorted by Rating):</h3>
        <div className="movie-flex-grid">
          {similarMovies.map((similar) => (
            <div key={similar.id} className="movie-card">
              <img
                src={`https://image.tmdb.org/t/p/w200${similar.poster_path}`}
                alt={similar.title}
              />
              <p>{similar.title}</p>
              <p>⭐ {similar.vote_average}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
