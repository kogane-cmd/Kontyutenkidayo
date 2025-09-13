document.getElementById("pref").addEventListener("change", () => {
  getWeatherJMA(document.getElementById("pref").value);
});

window.addEventListener("DOMContentLoaded", () => {
  getWeatherJMA(document.getElementById("pref").value);
});

async function getWeatherJMA(code) {
  const url = `https://www.jma.go.jp/bosai/forecast/data/forecast/${code}.json`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const area = data[0].timeSeries[0].areas[0];
    const dates = data[0].timeSeries[0].timeDefines;
    const weatherToday = area.weathers[0];
    const weatherTomorrow = area.weathers[1];
    const windToday = area.winds[0];
    const windTomorrow = area.winds[1];

    const tempArea = data[1].timeSeries[0].areas[0];
    const temps = tempArea.temps;
    const humidityArea = data[1].timeSeries[1].areas[0];
    const humidities = humidityArea.humidity;

    const bugHuntingToday = isGoodForBugHunting(weatherToday, windToday, temps[0], humidities[0])
      ? "◎ 虫取りに適しています！"
      : "△ 虫取りにはあまり向いていません。";

    const bugHuntingTomorrow = isGoodForBugHunting(weatherTomorrow, windTomorrow, temps[1], humidities[1])
      ? "◎ 虫取りに適しています！"
      : "△ 虫取りにはあまり向いていません。";

    document.getElementById("weather").innerHTML = `
      <h2>今日（${formatDate(dates[0])}）</h2>
      <p>天気：${weatherToday} ${getWeatherIcon(weatherToday)}</p>
      <p>風：${windToday}</p>
      <p><span style="color:red;">最高気温：${temps[0]}℃</span></p>
      <p><span style="color:blue;">最低気温：${temps[2]}℃</span></p>
      <p>湿度：${humidities[0]}%</p>
      <p>${bugHuntingToday}</p>
      <hr>
      <h2>明日（${formatDate(dates[1])}）</h2>
      <p>天気：${weatherTomorrow} ${getWeatherIcon(weatherTomorrow)}</p>
      <p>風：${windTomorrow}</p>
      <p><span style="color:red;">最高気温：${temps[1]}℃</span></p>
      <p><span style="color:blue;">最低気温：${temps[3]}℃</span></p>
      <p>湿度：${humidities[1]}%</p>
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

function isGoodForBugHunting(weather, wind, temp, humidity) {
  const tempNum = parseInt(temp);
  const humidityNum = parseInt(humidity);
  return (
    weather.includes("晴") &&
    !wind.includes("強い") &&
    tempNum >= 20 &&
    tempNum <= 30 &&
    humidityNum >= 40 &&
    humidityNum <= 80
  );
}

function getWeatherIcon(weather) {
  if (weather.includes("晴")) return "☀️";
  if (weather.includes("曇")) return "⛅";
  if (weather.includes("雨")) return "🌧️";
  if (weather.includes("雪")) return "❄️";
  return "🌈";
}
