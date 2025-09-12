window.addEventListener("DOMContentLoaded", getWeatherJMA);

async function getWeatherJMA() {
  const url = "https://www.jma.go.jp/bosai/forecast/data/forecast/130000.json";

  try {
    const res = await fetch(url);
    const data = await res.json();

    const area = data[0].timeSeries[0].areas[0];
    const dates = data[0].timeSeries[0].timeDefines;
    const weatherToday = area.weathers[0];
    const weatherTomorrow = area.weathers[1];
    const windToday = area.winds[0];
    const windTomorrow = area.winds[1];

    const bugHuntingToday = isGoodForBugHunting(weatherToday, windToday)
      ? "◎ 虫取りに適しています！"
      : "△ 虫取りにはあまり向いていません。";

    const bugHuntingTomorrow = isGoodForBugHunting(weatherTomorrow, windTomorrow)
      ? "◎ 虫取りに適しています！"
      : "△ 虫取りにはあまり向いていません。";

    document.getElementById("weather").innerHTML = `
      <h2>今日（${formatDate(dates[0])}）</h2>
      <p>天気：${weatherToday} ${getWeatherIcon(weatherToday)}</p>
      <p>風：${windToday}</p>
      <p>${bugHuntingToday}</p>
      <hr>
      <h2>明日（${formatDate(dates[1])}）</h2>
      <p>天気：${weatherTomorrow} ${getWeatherIcon(weatherTomorrow)}</p>
      <p>風：${windTomorrow}</p>
      <p>${bugHuntingTomorrow}</p>
    `;
  } catch (e) {
    document.getElementById("weather").innerHTML = `<p>天気情報の取得に失敗しました。</p>`;
    console.error("エラー:", e);
  }
}

function formatDate(isoString) {
  const date = new Date(isoString);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function isGoodForBugHunting(weather, wind) {
  return weather.includes("晴") && !wind.includes("強い");
}

function getWeatherIcon(weather) {
  if (weather.includes("晴")) return "☀️";
  if (weather.includes("曇")) return "⛅";
  if (weather.includes("雨")) return "🌧️";
  if (weather.includes("雪")) return "❄️";
  return "🌈";
}
