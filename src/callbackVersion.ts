import * as https from 'https';

function getWeather(callback: (error: Error | null, data?: any) => void) {
    const url = "https://api.open-meteo.com/v1/forecast?latitude=-28.74&longitude=24.77&current_weather=true";
    https.get(url, (res) => {
        let body = "";

        res.on("data", (chunk) => {
            body += chunk;
        })

        res.on("end", () => {
             if (res.statusCode !== 200) {
                callback(new Error(`Weather API returned status ${res.statusCode}`));
                return;
            }
            if (body.length === 0) {
                callback(new Error("Empty response from weather API"));
                return;
            }
             callback(null, JSON.parse(body));
        })


    })
        .on("error", (err) => {
            callback(err)

        });
}


getWeather((error, data) => {
    if (error) {
        console.log("Weather failed:", error.message);
        return;
    }
    console.log("Weather:", data);
});


function getNews(callback: (error: Error | null, data?: any) => void) {
    const url = "https://dummyjson.com/posts?limit=5";
    https.get(url, (res) => {
        let body = "";

        res.on("data", (chunk) => {
            body += chunk;
        })

        res.on("end", () => {
            if (res.statusCode !== 200) {
                callback(new Error(`News API returned status ${res.statusCode}`));
                return;
            }
            if (body.length === 0) {
                callback(new Error("Empty response from news API"));
                return;
            }
            callback(null, JSON.parse(body));
        })
    })

        .on("error", (err) => {
            callback(err);
        })
}

getNews((error, data) => {
    if (error) {
        console.log("News Failed:", error.message);
        return;
    }
    console.log("News:", data);
});


function showDash() {
    getWeather((weatherError, weather) => {
        if (weatherError) {
            console.log("Weather Error:", weatherError.message)
            return;
        }

        getNews((newsError, news) => {
            if (newsError) {
                console.log("News Error:", newsError.message)
                return;
            }

            console.log("Weather:", weather.current_weather);
            console.log("Headlines", news.posts.map((p: any) => p.title));
        })




    })
}

showDash();