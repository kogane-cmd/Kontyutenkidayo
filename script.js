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

    const todayRain = getRainText(today.chanceOfRain);
    const tomorrowRain = getRainText(tomorrow.chanceOfRain);

    const todayAdvice = getBugAdvice(today.telop, todayMax);
    const tomorrowAdvice = getBugAdvice(tomorrow.telop, tomorrowMax);

    weatherBox.innerHTML = `
      <h2>今日（${today.dateLabel}）</h2>
      <p>天気：${today.telop} ${getIcon(today.telop)}</p>

      <p><span style="color:red;">最高気温：${todayMax}℃</span></p>
      <p><span style="color:blue;">最低気温：${todayMin}℃</span></p>

      <p>降水確率：${todayRain}</p>
      <p><b>${todayAdvice}</b></p>

      <hr>

      <h2>明日（${tomorrow.dateLabel}）</h2>
      <p>天気：${tomorrow.telop} ${getIcon(tomorrow.telop)}</p>

      <p><span style="color:red;">最高気温：${tomorrowMax}℃</span></p>
      <p><span style="color:blue;">最低気温：${tomorrowMin}℃</span></p>

      <p>降水確率：${tomorrowRain}</p>
      <p><b>${tomorrowAdvice}</b></p>
    `;
  } catch (e) {
    weatherBox.innerHTML = `天気情報の取得に失敗しました。`;
    console.error(e);
  }
}

// かわいい天気アイコン
function getIcon(weather) {
  if (weather.includes("晴")) return "☀️";
  if (weather.includes("曇")) return "⛅";
  if (weather.includes("雨")) return "🌧️";
  if (weather.includes("雪")) return "❄️";
  return "🌈";
}

// 降水確率まとめ
function getRainText(obj) {
  if (!obj) return "--%";

  const arr = [
    obj.T00_06,
    obj.T06_12,
    obj.T12_18,
    obj.T18_24
  ].filter(v => v && v !== "--");

  if (arr.length === 0) return "--%";

  // 1番高い降水確率だけ表示
  const max = Math.max(...arr.map(v => parseInt(v)));
  return `${max}%`;
}

// 🐞虫取りアドバイス
function getBugAdvice(weather, maxTemp) {
  if (weather.includes("雨") || weather.includes("雪")) {
    return "✕ 雨・雪は虫取りに不向きです";
  }

  const t = parseInt(maxTemp);

  if (isNaN(t)) return "△ 情報不足で判断できません";

  if (t >= 22 && t <= 32) return "◎ とても虫取りに向いています！";
  if (t >= 18 && t < 22) return "○ まあまあ虫取りできます";
  if (t > 32) return "⚠ 暑すぎ注意（人間が危険…）";
  if (t < 15) return "✕ 寒くて虫はほぼ出ません";

  return "△ あまり向いていません";
}
