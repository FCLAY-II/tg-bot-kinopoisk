const fetch =
  typeof window !== 'undefined' ? window.fetch : require('node-fetch');

const Tmdb = {
  async getMovieId(token, pageId, movieId) {
    const request = await fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${token}&language=ru-RU&page=${pageId}`
    );
    const json = await request.json();
    return json.results[movieId].id;
  },

  async getDescription(token, id) {
    const request = await fetch(
      `https://api.themoviedb.org/3/movie/${id}?api_key=${token}&language=ru-RU`
    );
    const json = await request.json();
    return json;
  },

  async getTvId(token, pageId, movieId) {
    const request = await fetch(
      `https://api.themoviedb.org/3/tv/popular?api_key=${token}&language=ru-RU&page=${pageId}`
    );
    const json = await request.json();
    return json.results[movieId].id;
  },

  async getTvDescription(token, id) {
    const request = await fetch(
      `https://api.themoviedb.org/3/tv/${id}?api_key=${token}&language=ru-RU`
    );
    const json = await request.json();
    return json;
  },

  async getPopularMovie(token) {
    const request = await fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${token}&language=ru-Ru&page=1`
    );
    const json = await request.json();
    return json;
  },
};

module.exports = Tmdb;
