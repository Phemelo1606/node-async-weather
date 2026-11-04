import * as https from "https";


function getWeather(): Promise<any> {
  return new Promise((resolve, reject) => {
    const url =
      "https://api.open-meteo.com/v1/forecast?latitude=-28.74&longitude=24.77&current_weather=true";

    https
      .get(url, (res) => {
          let body = "";

          res.on('data', (chunk) => {
              body += chunk;
          })

          res.on('end', () => {
              if (body.length === 0) {
                  reject(new Error("Empty response from weather API"));
                  return;
              }
              try {
                  resolve(JSON.parse(body));
              } catch (err) {
                reject(err)
              }
          })


      })
      .on("error",  reject)
  });
}

function getNews(): Promise<any> {
    return new Promise((resolve, reject) => {
        const url = "https://dummyjson.com/posts?limit=5";
        https.get(url, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            })

            res.on('end', () => {
                if (body.length === 0) {
                    reject(new Error('Empty response from news API'));
                    return;
                } try {
                    resolve(JSON.parse(body))
                } catch (err) {
                    reject(err)
                }
            });




        })
            .on("error", reject)
    });
}


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

async function showDashFast() {
    try {
        const [weather, news] = await Promise.all([getWeather(), getNews()]);
        console.log("Weather:", weather.current_weather);
        console.log("Headlines:", news.posts.map((p: any) => p.title));
    } catch (err: any) {
        console.log("Dashboard failed:", err.message);
    }
}


async function showfastestDash() {
    try {
        const result = await Promise.race([getWeather(), getNews()]);
        if (result.posts) {
            console.log("News won the race:", result.posts.map((p: any) => p.title));
        } else {
             console.log("Weather won the race:", result.current_weather);
        }

    } catch (err: any) {
        console.log("Dashboard failed:", err.message);
    }
}

showDashboard();

showDashFast();

showfastestDash()