require('dotenv').config();

const { Telegraf } = require('telegraf');
const Markup = require('telegraf/markup');
const tmdb = require('./api/Tmdb');
const movieTrailer = require('./api/MovieTrailer');

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
  ctx.replyWithAnimation(
    'https://tlgrm.ru/_/stickers/d06/e20/d06e2057-5c13-324d-b94f-9b5a0e64f2da/11.webp'
  );
  ctx.reply(
    `👋 Привет, ${ctx.message.from.first_name} ${ctx.message.from.last_name}!\n\n🤖 Нажимай на кнопку (если они скрыты можно открыть возле поля ввода или используй /help) и я помогу тебе сгенерировать рандомный фильм/сериал/тв программу!\n\n💬  /help - команда поможет тебе разобраться как работать с ботом)`,
    Markup.keyboard([['Поиск фильма'], ['Поиск сериала/программы'], ['Помощь']])
      .resize()
      .extra()
  );
  console.log(
    `-------------->>>> User id: ${ctx.message.from.id}; Username: ${ctx.message.from.username}; User first name: ${ctx.message.from.first_name}; User last name: ${ctx.message.from.last_name}`
  );
});

bot.help((ctx) => {
  const message = `🤖 Я умный бот который поможет тебе подобрать фильм, сериал или программу на вечер.\n\n📖 Нажимай на определенную кнопку "Поиск фильма" или "Поиск сериала/программы", также можно в ручную написать команду поиска и я смогу подобрать фильм/сериал/программу.\n\n💬 "Поиск фильма" - команда поиска фильма\n\n💬 "Поиск сериала/программы" - команда поиска ТВ шоу/сериала`;
  ctx.reply(message);
});

bot.on('text', async (ctx) => {
  const { text } = ctx.message;
  const textCapitalize = text.charAt(0).toUpperCase() + text.slice(1);
  const months = [
    'Января',
    'Февраля',
    'Марта',
    'Апреля',
    'Мая',
    'Июня',
    'Июля',
    'Августа',
    'Сентября',
    'Октября',
    'Ноября',
    'Декабря',
  ];

  const pageId = Math.floor(Math.random() * 500) + 1;
  const movieId = Math.floor(Math.random() * 20) + 1;

  let data = {};
  let trailer = '';

  if (textCapitalize === 'Помощь') {
    console.log(
      `------------>>> User ${ctx.message.from.first_name} need help!`
    );

    const message = `🤖 Я умный бот который поможет тебе подобрать фильм, сериал или программу на вечер.\n\n📖 Нажимай на определенную кнопку "Поиск фильма" или "Поиск сериала/программы", также можно в ручную написать команду поиска и я смогу подобрать фильм/сериал/программу.\n\n💬 "Поиск фильма" - команда поиска фильма\n\n💬 "Поиск сериала/программы" - команда поиска ТВ шоу\n\n💬 "Поиск сериала" - команда поиска ТВ шоу(равнозначна команде "Поиск сериала/программы")\n\n💬 /help - помощь работы с Ботом`;
    ctx.reply(message);
  }
  if (textCapitalize === 'Привет') {
    ctx.replyWithAnimation(
      'https://tlgrm.ru/_/stickers/d06/e20/d06e2057-5c13-324d-b94f-9b5a0e64f2da/11.webp'
    );
    if (ctx.message.from.last_name) {
      const message = `👋 Привет, ${ctx.message.from.first_name} ${ctx.message.from.last_name}! Чтобы начать поиск фильма напиши "поиск фильма" или нажимай на определенную кнопку.`;
      ctx.reply(message);
    } else {
      const message = `👋 Привет, ${ctx.message.from.first_name}! Чтобы начать поиск фильма напиши "поиск фильма" или нажимай на определенную кнопку.`;
      ctx.reply(message);
    }
  }
  if (textCapitalize === 'Hi') {
    if (ctx.message.from.last_name) {
      const message = `👋 Hi, ${ctx.message.from.first_name} ${ctx.message.from.last_name}!`;
      ctx.reply(message);
    } else {
      const message = `👋 Hi, ${ctx.message.from.first_name}! Чтобы начать поиск фильма напиши "поиск фильма" или нажимай на определенную кнопку.`;
      ctx.reply(message);
    }
  }
  if (
    textCapitalize !== 'Помощь' &&
    textCapitalize !== 'Поиск сериала/программы' &&
    textCapitalize !== 'Поиск фильма' &&
    textCapitalize !== 'Привет' &&
    textCapitalize !== 'Hi' &&
    textCapitalize !== 'Топ фильмов'
  ) {
    ctx.reply(`Я тебя не понимаю, попробуйте обратиться в /help .`);
  }
  if (textCapitalize === 'Поиск фильма') {
    console.log(
      `------------>>> User ${ctx.message.from.first_name} start looking movie!`
    );

    try {
      const id = await tmdb.getMovieId(process.env.TMDB_API, pageId, movieId);
      const movie = await tmdb.getDescription(process.env.TMDB_API, id);

      const {
        title,
        release_date,
        overview,
        original_title,
        genres,
        poster_path,
        vote_average,

      } = movie;

      const newGenres = genres
        .map((genre) => {
          return genre.name;
        })
        .join(', ');

      const poster = `https://www.themoviedb.org/t/p/w600_and_h900_bestv2${poster_path}`;

      const releaseDate = release_date.split('-');
      const day = releaseDate[2];
      const month = months[parseInt(releaseDate[1] - 1)];
      const year = releaseDate[0];

      try {
        trailer = await movieTrailer.getTrailer(original_title);
      } catch (error) {
        trailer = 'Трейлер к фильму не найден!';
        console.log(error);
      }

      data = {
        poster,
        title,
        original_title: original_title
          ? original_title
          : 'Оригинальное название не найдено',
        overview: overview ? overview : 'Описание фильма не найдено',
        newGenres: newGenres ? newGenres : 'Жарны к фильму не определены',
        release: `${day} ${month} ${year}`,
        trailer: trailer ? trailer : 'Трейлер не найден',
        vote_average: vote_average ? vote_average : 'Рейтинг не найден',
      };

      if (trailer === 'Трейлер к фильму не найден!') {
        ctx.replyWithPhoto(poster);
      }
      if (trailer){
        const random = `🎬 Название: ${data.title}\n\n💡 Описание фильма: ${data.overview}\n\n 👀 Рейтинг: ${data.vote_average}\n\n 🎞 Оригинальное название: ${data.original_title}\n\n✅ Жанр: ${data.newGenres}\n\n🗓 Дата релиза: ${data.release}\n\n📺 Трейлер: ${data.trailer}`;
        ctx.reply(random)
      } else { 
        const random = `🎬 Название: ${data.title}\n\n💡 Описание фильма: ${data.overview}\n\n 👀 Рейтинг: ${data.vote_average}\n\n 🎞 Оригинальное название: ${data.original_title}\n\n✅ Жанр: ${data.newGenres}\n\n🗓 Дата релиза: ${data.release}\n\n🖼 Постер: ${data.poster}`;
        ctx.reply(random);
      }

    } catch (error) {
      ctx.reply('Мы не смогли подобрать фильм! Попробуйте еще раз!');
      console.log(error);
    }
  }
  if (textCapitalize === 'Поиск сериала/программы') {
    console.log(
      `------------>>> User ${ctx.message.from.first_name} start looking tv shows!`
    );

    try {
      const id = await tmdb.getTvId(process.env.TMDB_API, pageId, movieId);
      const tvShow = await tmdb.getTvDescription(process.env.TMDB_API, id);

      const {
        name,
        overview,
        poster_path,
        genres,
        original_name,
        first_air_date,
        last_air_date,
        vote_average,
      } = tvShow;

      const tvGenres = genres
        .map((genre) => {
          return genre.name;
        })
        .join(', ');

      const poster = `https://www.themoviedb.org/t/p/w600_and_h900_bestv2${poster_path}`;

      const firstAirDate = first_air_date.split('-');
      const airYear = firstAirDate[0];
      const airMonth = months[parseInt(firstAirDate[1] - 1)];
      const airDay = firstAirDate[2];

      const lastAirDate = last_air_date.split('-');
      const lastYear = lastAirDate[0];
      const lastMonth = months[parseInt(lastAirDate[1] - 1)];
      const lastDay = lastAirDate[2];

      try {
        trailer = await movieTrailer.getTrailer(original_name);
      } catch (error) {
        trailer = 'Трейлер к сериалу/программе не найден!';
        console.log(error);
      }

      data = {
        poster,
        name,
        original_name: original_name
          ? original_name
          : 'Оригинальное название сериала/программы не найдено',
        overview: overview ? overview : 'Описание сериала/программы не найдено',
        tvGenres: tvGenres
          ? tvGenres
          : 'Жарны к сериалу/программе не определены',
        airDate:
          first_air_date !== ''
            ? `${airDay} ${airMonth} ${airYear}`
            : 'Дата начала сериала/программы не найдено!',
        lastDate:
          last_air_date !== ''
            ? `${lastDay} ${lastMonth} ${lastYear}`
            : 'Дата окончания сериала/программы не найдно! Возможно проект еще работает!',
        trailer: trailer ? trailer : 'Трейлер не найден(',
        vote_average: vote_average ? vote_average : 'Рейтинг не найден(',
      };

      if (trailer === 'Трейлер к сериалу/программе не найден!') {
        ctx.replyWithPhoto(poster);
      }
      if(trailer){
      const random = `🎬 Название: ${data.name}\n\n💡 Описание сериала/программы: ${data.overview}\n\n👀 Рейтинг: ${data.vote_average}\n\n🎞 Оригинальное название: ${data.original_name}\n\n✅ Жанр: ${data.tvGenres}\n\n🗓 Дата релиза: ${data.airDate}\n\n🗓 Дата окончания: ${data.lastDate}\n\n📺 Трейлер: ${data.trailer}`;
      ctx.reply(random);
      } else {
        const random = `🎬 Название: ${data.name}\n\n💡 Описание сериала/программы: ${data.overview}\n\n👀 Рейтинг: ${data.vote_average}\n\n🎞 Оригинальное название: ${data.original_name}\n\n✅ Жанр: ${data.tvGenres}\n\n🗓 Дата релиза: ${data.airDate}\n\n🗓 Дата окончания: ${data.lastDate}\n\n🖼 Постер: ${data.poster}`;
        ctx.reply(random);
      }
    } catch (error) {
      ctx.reply('Мы не смогли подобрать сериал! Попробуйте еще раз!');
      console.log(error);
    }
  }
});

bot.launch();
