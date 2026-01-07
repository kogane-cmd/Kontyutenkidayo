const select = document.getElementById("pref");
const weatherBox = document.getElementById("weather");

// ページが読み込まれたら最初の都道府県で取得
window.addEventListener("DOMContentLoaded", () => {
  getWeather(select.value);
});

// 県を変えたら再取得
select.addEventListener("change", () => {
  getWeather(select.value);
});

async function getWeather(code) {
  weatherBox.textContent = "読み込み中...";

  const url = `https://www.jma.go.jp/bosai/forecast/data/forecast/${code}.json`;

  try {
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      weatherBox.innerHTML = "<p>天気情報の取得に失敗しました。</p>";
      return;
    }

    const data = await res.json();

    const area = data[0].timeSeries[0].areas[0];
    const dates = data[0].timeSeries[0].timeDefines;

    const weatherToday = area.weathers[0] || "不明";
    const weatherTomorrow = area.weathers[1] || "不明";

    const tempAreaSeries = data[1]?.timeSeries || [];
    let temps = ["--","--","--","--"];
    let humidities = ["--","--"];

    for (const ts of tempAreaSeries) {
      if (ts.areas?.[0]?.temps) {
        temps = ts.areas[0].temps;
        break;
      }
    }

    for (const ts of tempAreaSeries) {
      if (ts.areas?.[0]?.humidity) {
        humidities = ts.areas[0].humidity;
        break;
      }
    }

    const todayIcon = getWeatherIcon(weatherToday);
    const tomorrowIcon = getWeatherIcon(weatherTomorrow);

    const bugToday = isGoodForBugHunting(weatherToday, temps[0], humidities[0]);
    const bugTomorrow = isGoodForBugHunting(weatherTomorrow, temps[1], humidities[1]);

    weatherBox.innerHTML = `
      <h2>今日（${formatDate(dates[0])}）</h2>
      <p>天気：${weatherToday} ${todayIcon}</p>
      <p>最高気温：${temps[0]}℃</p>
      <p>最低気温：${temps[2]}℃</p>
      <p>湿度：${humidities[0]}%</p>
      <p>${bugToday}</p>

      <hr>

      <h2>明日（${formatDate(dates[1])}）</h2>
      <p>天気：${weatherTomorrow} ${tomorrowIcon}</p>
      <p>最高気温：${temps[1]}℃</p>
      <p>最低気温：${temps[3]}℃</p>
      <p>湿度：${humidities[1]}%</p>
      <p>${bugTomorrow}</p>
    `;
  } catch (error) {
    weatherBox.innerHTML = "<p>天気情報の取得に失敗しました。</p>";
    console.error(error);
  }
}

function formatDate(iso) {
  const d = new Date(iso);
  return `${d.getMonth()+1}月${d.getDate()}日`;
}

function getWeatherIcon(weather) {
  if (weather.includes("晴")) return "☀️";
  if (weather.includes("曇")) return "⛅";
  if (weather.includes("雨")) return "🌧️";
  if (weather.includes("雪")) return "❄️";
  return "";
}

function isGoodForBugHunting(weather, temp, humidity) {
  const t = parseInt(temp);
  const h = parseInt(humidity);

  if (weather.includes("雨") || weather.includes("雪")) return "✕ 雨/雪は虫取り向かない";
  if (!isNaN(t) && t >= 22 && t <= 32 && !isNaN(h) && h >= 40 && h <= 80) {
    return "◎ 虫取り向いてる";
  }
  return "△ 虫取りイマイチ";
}
