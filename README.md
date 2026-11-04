# Task 7 – Async Weather & News Dashboard

A Node.js + TypeScript project that fetches the **current weather** and the **latest news headlines** from public APIs, and does the same job three times, once in each asynchronous style:

1. **Callbacks**
2. **Promises** (including `Promise.all()` and `Promise.race()`)
3. **Async/Await** with `try...catch`

The goal is to understand asynchronous programming and the Node.js event loop by comparing the three styles side by side.

## APIs used

| Data | API | Notes |
---|
| Weather | [Open-Meteo](https://open-meteo.com/) | Current weather for coordinates near Kimberley (`latitude=-28.74`, `longitude=24.77`). No API key needed. |
| News | [DummyJSON Posts](https://dummyjson.com/docs/posts) | `https://dummyjson.com/posts?limit=5` returns 5 sample posts. Used as the "headlines" (post titles). |

All requests are made with Node's built-in `https` module, so there are no HTTP libraries to install.

## Project structure

```
node-async-weather/
- src/
   - callbackVersion.ts     # Sprint 2: callbacks (and "callback hell")
   - promiseVersion.ts      # Sprint 3: promises, chaining, Promise.all, Promise.race
   - asyncAwaitVersion.ts   # Sprint 4: async/await with try...catch
- package.json
- tsconfig.json
- README.md
```

## Setup

Requirements: [Node.js](https://nodejs.org/) (v18 or newer recommended) and npm.

```bash
git clone https://github.com/Phemelo1606/node-async-weather.git
cd node-async-weather
npm install
```

Dependencies (dev): `typescript`, `@types/node`, `tsx` (runs TypeScript files directly).

## Usage

Each version has its own npm script:

```bash
npm run callback   # callback version
npm run promise    # promise version
npm run async      # async/await version
```

An internet connection is required, because the data comes from live APIs.

## The three styles

### 1. Callbacks (`src/callbackVersion.ts`)

A callback is a function you hand to another function and say "call me when you're done". `getWeather(callback)` and `getNews(callback)` use the **error-first** convention: `callback(error, data)`. If something went wrong, `error` is filled in; otherwise `error` is `null` and `data` holds the result.

The response from `https.get` arrives as a stream of **chunks**. The code joins them in a `"data"` handler and only parses the JSON in the `"end"` handler, once the whole response has arrived.

**Callback hell.** `showDash()` needs the weather first, then the news, so the news call has to be nested *inside* the weather callback:

```ts
getWeather((weatherError, weather) => {
  if (weatherError) { ...; return; }

  getNews((newsError, news) => {
    if (newsError) { ...; return; }
    // display both
  });
});
```

With just two dependent calls there are already two levels of nesting and two separate `if (error)` checks. A third dependent call would push the code another level to the right with a third error check. This "pyramid" is what makes callback code hard to read and maintain.

**Sample output** (`npm run callback`):

```
Weather: {
  time: '2026-11-04T22:15',
  interval: 900,
  temperature: 24.6,
  windspeed: 8.3,
  winddirection: 41,
  is_day: 0,
  weathercode: 0
}
Headlines: [
  'His mother had always taught him',
  'He was an expert but not in a discipline',
  'Dave watched as the forest burned up on the hill.',
  'All he wanted was a candy bar.',
  'Hopes and dreams were dashed that day.'
]
```

### 2. Promises (`src/promiseVersion.ts`)

A promise is an object that stands for a value that does not exist *yet*. It is in one of three states: **pending**, **fulfilled** or **rejected**. `getWeather()` and `getNews()` now take no callback; they *return* a promise built with `new Promise((resolve, reject) => ...)`:

| Callback version | Promise version |

| `callback(null, value)` | `resolve(value)` |
| `callback(error)` | `reject(error)` |

**Chaining.** If a `.then` returns a promise, the next `.then` waits for it. This gives the same weather → news → display order as the nested callbacks, but in a flat line with a **single** `.catch` that handles an error from any step:

```ts
getWeather()
  .then((weather) => {
    weatherResult = weather;
    return getNews();
  })
  .then((news) => {
    // display both
  })
  .catch((err) => console.log("Dashboard failed:", err.message));
```

**`Promise.all()`** starts both requests at the same time and waits for **all** of them. The result is an array in the same order as the input. If any one promise rejects, the whole thing rejects.

**`Promise.race()`** settles as soon as the **first** promise finishes, and gives back that single result. Which request wins can change from run to run, so the code checks `result.posts` to see whether the news or the weather won. If the fastest promise fails, the race fails too, even if the other would have succeeded.

**Sample output** (`npm run promise`), one block per technique:

Chain (weather, then news):

```
Weather: {
  time: '2026-11-04T22:15',
  interval: 900,
  temperature: 24.6,
  windspeed: 8.3,
  winddirection: 41,
  is_day: 0,
  weathercode: 0
}
Headlines: [
  'His mother had always taught him',
  'He was an expert but not in a discipline',
  'Dave watched as the forest burned up on the hill.',
  'All he wanted was a candy bar.',
  'Hopes and dreams were dashed that day.'
]
```

`Promise.all()` prints the same two items, from requests that ran at the same time.

`Promise.race()`:

```
News won the race: [
  'His mother had always taught him',
  'He was an expert but not in a discipline',
  'Dave watched as the forest burned up on the hill.',
  'All he wanted was a candy bar.',
  'Hopes and dreams were dashed that day.'
]
```

### 3. Async/Await (`src/asyncAwaitVersion.ts`)

`async/await` is the same promises, written so the code reads top to bottom. `await` pauses *that function* until the promise settles and gives back the value directly; the rest of the program keeps running in the meantime. Errors are handled with `try...catch` instead of `.catch(...)`.

```ts
async function showDashboard() {
  try {
    const weather = await getWeather();
    const news = await getNews();
    console.log("Weather:", weather.current_weather);
    console.log("Headlines:", news.posts.map((p: any) => p.title));
  } catch (err: any) {
    console.log("Dashboard failed:", err.message);
  }
}
```

The file has three functions:

- `showDashboard()` – sequential: weather first, then news.
- `showDashFast()` – `await Promise.all([...])`: both at the same time.
- `showfastestDash()` – `await Promise.race([...])`: whichever finishes first.

There is no `weatherResult` workaround as in the promise chain, because both values live in the same function scope.

**Sample output** (`npm run async`), for `showDashboard()` and `showDashFast()`:

```
Weather: {
  time: '2026-11-04T22:15',
  interval: 900,
  temperature: 24.6,
  windspeed: 8.3,
  winddirection: 41,
  is_day: 0,
  weathercode: 0
}
Headlines: [
  'His mother had always taught him',
  'He was an expert but not in a discipline',
  'Dave watched as the forest burned up on the hill.',
  'All he wanted was a candy bar.',
  'Hopes and dreams were dashed that day.'
]
```

For `showfastestDash()`:

```
News won the race: [
  'His mother had always taught him',
  'He was an expert but not in a discipline',
  'Dave watched as the forest burned up on the hill.',
  'All he wanted was a candy bar.',
  'Hopes and dreams were dashed that day.'
]
```

## Error handling

All three versions handle the same failures and report them in the same format: `Dashboard failed: <message>`.

| What went wrong | How it is caught | Example message |
---|
| The server cannot be reached (no internet, bad domain) | the request's `"error"` event | `Dashboard failed: getaddrinfo ENOTFOUND dummyjson.comm` |
| The connection is cut mid-request | the request's `"error"` event | `Dashboard failed: read ECONNRESET` |
| The server answers with an error status | a `res.statusCode !== 200` check in the `"end"` handler | `Dashboard failed: News API returned status 404` |
| The response body is empty | a `body.length === 0` check | `Dashboard failed: Empty response from news API` |
| The body is not valid JSON | `try...catch` around `JSON.parse` (promise and async versions) | `Dashboard failed: Unexpected token ...` |

The status-code check matters because an API can answer `404` or `500` with a perfectly valid JSON body. Without the check the program would treat it as a success and print `undefined`. These cases were tested by pointing a URL at a missing route (`404`) and at a misspelled domain (`ENOTFOUND`).

### Known limitations

- In `callbackVersion.ts`, `JSON.parse` is not wrapped in `try...catch`, so an invalid (non-JSON) response body would throw inside the event handler instead of being reported through the callback. The promise and async versions do handle this case.
- `getWeather` and `getNews` are repeated in each of the three files so that each version stands alone, as the task describes. In a larger project they would live in one shared module.
- The `ECONNRESET` error can show up occasionally. It is a network-level failure, not a logic error, and re-running the script usually fixes it.

## Learning outcomes

- **The event loop.** Node.js does not wait for a network request to finish. It starts the request, carries on with other work, and runs the result handler when the response arrives. This is why code written after a request can run before its result.
- **Callbacks** work, but dependent calls must be nested inside each other. Every level needs its own error check, and the code drifts to the right ("callback hell").
- **Promises** return an object you attach `.then` / `.catch` to. Chaining keeps dependent steps in a flat line with one shared error handler. `Promise.all()` runs requests in parallel and waits for all of them. `Promise.race()` takes whichever finishes first.
- **Async/await** is built on promises, but reads like normal step-by-step code, and `try...catch` handles errors in one place.
- **Robust error handling** means checking more than just "did the request fail". A server can answer with an error status, an empty body or invalid JSON, and each case needs to become a clear, readable message.

### Quick comparison

| | Callbacks | Promises | Async/Await |

| Result delivered via | a function you pass in | a returned promise (`.then`) | `await` |
| Dependent steps | nested | chained (flat) | plain top-to-bottom lines |
| Error handling | `if (error)` at every level | one `.catch` | one `try...catch` |
| Parallel requests | manual | `Promise.all()` | `await Promise.all()` |


