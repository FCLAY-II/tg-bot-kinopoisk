require('dotenv').config()

const TelegramBot = require('node-telegram-bot-api')
const {
  findGenres,
  findLists,
  findByGenres,
  findRandom,
} = require('./tgBotFunction/index')

const token = process.env.BOT_TOKEN

const bot = new TelegramBot(token, { polling: true })

const keyboard = [
  [
    {
      text: 'Выбрать по жанру',
      callback_data: 'movie-genre',
    },
  ],
  [
    {
      text: 'Выбрать по спискам',
      callback_data: 'movie-list',
    },
  ],
  [
    {
      text: 'Полный рандом',
      callback_data: 'randomAll',
    },
  ],
]
const chatIdArr = []

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id
  chatIdArr.push(chatId)
  await bot.sendMessage(msg.chat.id, `Привет, ${msg.chat.first_name}!`)
  console.log(msg.chat)
  await bot.sendMessage(
    msg.chat.id,
    'Снова ищешь что посмотреть? Давай начнем!'
  )
  bot.sendMessage(chatId, 'Как будем выбирать фильм?', {
    reply_markup: {
      inline_keyboard: keyboard,
    },
  })
})

let top250PageCounter = 1
let top250Counter = 1

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id
  const genresArr = await findGenres()
  const keyboardGenres = genresArr[0].map((el, i) => {
    return [
      {
        text: el,
        callback_data: `${genresArr[1][i]}`,
      },
    ]
  })
  const keyboardLists = [
    [
      {
        text: 'Top 250 Best Films',
        callback_data: `TOP_250_BEST_FILMS`,
      },
    ],
    [
      {
        text: 'Top 100 Popular Films',
        callback_data: `TOP_100_POPULAR_FILMS`,
      },
    ],
    [
      {
        text: 'Top Await Films',
        callback_data: `TOP_AWAIT_FILMS`,
      },
    ],
  ]
  if (query.data === 'begining') {
    bot.sendMessage(chatId, 'Как будем выбирать фильм?', {
      reply_markup: {
        inline_keyboard: keyboard,
      },
    })
  }
  if (query.data === 'movie-genre') {
    bot.sendMessage(chatId, 'Выбери жанр ', {
      reply_markup: {
        inline_keyboard: keyboardGenres,
      },
    })
  }
  if (query.data === 'movie-list') {
    bot.sendMessage(chatId, 'Выбери список', {
      reply_markup: {
        inline_keyboard: keyboardLists,
      },
    })
  }
  if (query.data === 'randomAll') {
    let pageNum = Math.floor(Math.random() * (20 - 1) + 1)
    let id = Math.floor(Math.random() * (20 - 1) + 1)
    let films = await findRandom(pageNum)
    let film = films[id]
    let genres = ''
    for (const genre of film.genres) {
      genres += genre.genre + ' '
    }
    await bot.sendPhoto(chatId, film.posterUrlPreview, {
      caption: `${
        film.nameRu
          ? film.nameRu
          : film.nameOriginal
          ? film.nameOriginal
          : 'ololo'
      }
    Рейтинг:${film.rating}
    Жанры: ${genres}
        `,
      reply_markup: {
        inline_keyboard: keyboard,
      },
    })
  }
  if (
    query.data === 'TOP_250_BEST_FILMS' ||
    query.data === 'TOP_100_POPULAR_FILMS' ||
    query.data === 'TOP_AWAIT_FILMS'
  ) {
    let list = query.data
    top250PageCounter = 1
    top250Counter = 1
    await getList(query, list, top250PageCounter).then(() => {
      bot.sendMessage(chatId, 'Выберите действие:', {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Далее',
                callback_data: `${list}/next`,
              },
            ],
            [
              {
                text: 'В начало',
                callback_data: `begining`,
              },
            ],
          ],
        },
      })
    })
  }
  if (
    query.data === 'TOP_250_BEST_FILMS/next' ||
    query.data === 'TOP_100_POPULAR_FILMS/next' ||
    query.data === 'TOP_AWAIT_FILMS/next'
  ) {
    let arr = query.data.split('/')
    let list = arr[0]
    top250PageCounter++
    await getList(query, list, top250PageCounter).then((result) => {
      if (!result) {
        bot.sendMessage(chatId, 'Выберите действие:', {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'Далее',
                  callback_data: `${list}/next`,
                },
              ],
              [
                {
                  text: 'В начало',
                  callback_data: `begining`,
                },
              ],
            ],
          },
        })
      } else {
        bot.sendMessage(chatId, 'Список закончился', {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'В начало',
                  callback_data: `begining`,
                },
              ],
            ],
          },
        })
      }
      topfilms
    })
  }

  if (genresArr[1].includes(Number(query.data))) {
    top250PageCounter = 1
    top250Counter = 1
    bot.sendMessage(chatId, 'выбери год', {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '1980-1990',
              callback_data: `showGenreFilms/${query.data}/1980/1990`,
            },
          ],
          [
            {
              text: '1990-2000',
              callback_data: `showGenreFilms/${query.data}/1990/2000`,
            },
          ],
          [
            {
              text: '2000-2010',
              callback_data: `showGenreFilms/${query.data}/2000/2010`,
            },
          ],
          [
            {
              text: '2010-2021',
              callback_data: `showGenreFilms/${query.data}/2010/2021`,
            },
          ],
          [
            {
              text: 'Любой',
              callback_data: `showGenreFilms/${query.data}/1880/2021`,
            },
          ],
        ],
      },
    })
  }

  if (query.data.indexOf('showGenreFilms') === 0) {
    let arr = query.data.split('/')
    await showByGenre(query, arr[1], arr[2], arr[3], top250PageCounter).then(
      (result) => {
        if (!result) {
          top250PageCounter++
          bot.sendMessage(chatId, 'Выберите действие:', {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: 'Далее',
                    callback_data: query.data,
                  },
                ],
                [
                  {
                    text: 'В начало',
                    callback_data: `begining`,
                  },
                ],
              ],
            },
          })
        } else {
          bot.sendMessage(chatId, 'Список закончился', {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: 'В начало',
                    callback_data: `begining`,
                  },
                ],
              ],
            },
          })
        }
      }
    )
  }
})

async function getList(query, list, page) {
  const chatId = query.message.chat.id
  const topfilms = await findLists(list, page)
  if (topfilms.length > 0) {
    for (let i = 0; i < topfilms.length; i++) {
      let genres = ''
      for (const genre of topfilms[i].genres) {
        genres += genre.genre + ', '
      }
      await bot.sendPhoto(chatId, topfilms[i].posterUrlPreview, {
        caption: `${top250Counter}. ${topfilms[i].nameRu}
Рейтинг: ${topfilms[i].rating}
Жанры: ${genres}
    `,
        disable_notification: true,
      })
      top250Counter++
    }
  } else {
    const data = '404'
    return data
  }
}

async function showByGenre(query, genreId, yearStart, yearEnd, pageNum) {
  const chatId = query.message.chat.id
  const genrefilms = await findByGenres(genreId, yearStart, yearEnd, pageNum)
  if (genrefilms.length > 0) {
    for (let i = 0; i < genrefilms.length; i++) {
      let genres = ''
      for (const genre of genrefilms[i].genres) {
        genres += genre.genre + ', '
      }
      await bot.sendPhoto(chatId, genrefilms[i].posterUrlPreview, {
        caption: `${top250Counter}. ${genrefilms[i].nameRu}
Рейтинг: ${genrefilms[i].rating}
Жанры: ${genres}
    `,
        disable_notification: true,
      })
      top250Counter++
    }
  } else {
    const data = '404'
    return data
  }
}
