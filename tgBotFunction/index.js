const axios = require('axios');

async function findGenres() {
  const response = await axios(
    `https://kinopoiskapiunofficial.tech/api/v2.1/films/filters`,
    {
      headers: {
        'X-API-KEY': 'c11b5c8f-1e5f-4e69-985b-3dc1a54673aa',
      },
    }
  );
  const genresIdArr = response.data.genres;
  const genresArr = genresIdArr.map((el) => el.genre);
  const idArr = genresIdArr.map((el) => el.id);
  return [genresArr, idArr];
}

async function findLists(list, pageNum) {
  const response = await axios(
    `https://kinopoiskapiunofficial.tech/api/v2.2/films/top?type=${list}&page=${pageNum}`,
    {
      headers: {
        'X-API-KEY': 'c11b5c8f-1e5f-4e69-985b-3dc1a54673aa',
      },
    }
  );

  return response.data.films;
}

async function findByGenres(
  genreId,
  yearStart = 1888,
  yearEnd = 2021,
  pageNum
) {
  const response = await axios(
    `https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-filters?genre=${genreId}&order=RATING&type=ALL&ratingFrom=0&ratingTo=10&yearFrom=${yearStart}&yearTo=${yearEnd}&page=${pageNum}`,
    {
      headers: {
        'X-API-KEY': 'c11b5c8f-1e5f-4e69-985b-3dc1a54673aa',
      },
    }
  );
  return response.data.films;
}

async function findById(id) {
  const response = await axios(
    `https://kinopoiskapiunofficial.tech/api/v2.2/films/${id}`,
    {
      headers: {
        'X-API-KEY': 'c11b5c8f-1e5f-4e69-985b-3dc1a54673aa',
      },
    }
  );
  return response.data;
}

async function findRandom(pageNum) {
  const response = await axios(
    `https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-filters?order=NUM_VOTE&type=ALL&ratingFrom=0&ratingTo=10&yearFrom=1888&yearTo=2020&page=${pageNum}`,
    {
      headers: {
        'X-API-KEY': 'c11b5c8f-1e5f-4e69-985b-3dc1a54673aa',
      },
    }
  );
  return response.data.films;
}
module.exports = { findGenres, findLists, findByGenres, findById, findRandom };
