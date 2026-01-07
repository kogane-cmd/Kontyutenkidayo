const select = document.getElementById("pref");
const weatherBox = document.getElementById("weather");

select.addEventListener("change", () => {
  getWeather(select.value);
});

window.addEventListener("DOMContentLoaded", () => {
  getWeather(select.value);
});

async function getWeather(cityId) {
  weatherBox.innerHTML = "読み込み中...";

  const url = `https://weather.tsukumijima.net/api/forecast/city/${cityId}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP Error");

    const data = await res.json();

    const today = data.forecasts[0];
    const tomorrow = data.forecasts[1];

    const todayMax = today.temperature.max?.celsius || "--";
    const todayMin = today.temperature.min?.celsius || "--";
    const tomorrowMax = tomorrow.temperature.max?.celsius || "--";
    const tomorrowMin = tomorrow.temperature.min?.celsius || "--";

    weatherBox.innerHTML = `
      <h2>今日（${today.dateLabel}）</h2>
      <p>天気：${today.telop} ${getIcon(today.telop)}</p>

      <p><span style="color:red;">最高気温：${todayMax}℃</span></p>
      <p><span style="color:blue;">最低気温：${todayMin}℃</span></p>

      <hr>

      <h2>明日（${tomorrow.dateLabel}）</h2>
      <p>天気：${tomorrow.telop} ${getIcon(tomorrow.telop)}</p>

      <p><span style="color:red;">最高気温：${tomorrowMax}℃</span></p>
      <p><span style="color:blue;">最低気温：${tomorrowMin}℃</span></p>
    `;
  } catch (e) {
    weatherBox.innerHTML = `天気情報の取得に失敗しました。`;
    console.error(e);
  }
}

function getIcon(weather) {
  if (weather.includes("晴")) return "☀️";
  if (weather.includes("曇")) return "⛅";
  if (weather.includes("雨")) return "🌧️";
  if (weather.includes("雪")) return "❄️";
  return "🌈";
}
