const movieTrailer = require('movie-trailer');

const MovieTrailer = {
  async getTrailer(title) {
    const trailer = await movieTrailer(title);
    return trailer;
  },
};

module.exports = MovieTrailer;
