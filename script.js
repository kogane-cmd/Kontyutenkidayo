const select = document.getElementById("pref");
const weatherBox = document.getElementById("weather");

// 画面表示されたら最初の都道府県で取得
window.addEventListener("DOMContentLoaded", () => {
  getWeather(select.value);
});

// 都道府県変更イベント
select.addEventListener("change", () => {
  getWeather(select.value);
});

// ───────────────────
//  天気取得 本体
// ───────────────────
async function getWeather(code) {
  weatherBox.textContent = "読み込み中...";

  const url = `https://www.jma.go.jp/bosai/forecast/data/forecast/${code}.json`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP Error");
    const data = await res.json();

    // 天気
    const area = data[0].timeSeries[0].areas[0];
    const dates = data[0].timeSeries[0].timeDefines;

    const weatherToday = area.weathers[0];
    const weatherTomorrow = area.weathers[1];

    // 気温
    const tempArea = data[1].timeSeries[0].areas[0];
    const temps = tempArea.temps || ["--","--","--","--"];

    // 湿度（地域によって無いことがある）
    let humidities = ["--","--"];
    try {
      const humArea = data[1].timeSeries[1].areas[0];
      humidities = humArea.humidity;
    } catch {}

    const todayBug = judge(weatherToday, temps[0], humidities[0]);
    const tomorrowBug = judge(weatherTomorrow, temps[1], humidities[1]);

    weatherBox.innerHTML = `
      <h2>今日（${format(dates[0])}）</h2>
      <p>天気：${weatherToday} ${icon(weatherToday)}</p>
      <p><span style="color:red;">最高：${temps[0]}℃</span></p>
      <p><span style="color:blue;">最低：${temps[2]}℃</span></p>
      <p>湿度：${humidities[0]}%</p>
      <p>${todayBug}</p>

      <hr>

      <h2>明日（${format(dates[1])}）</h2>
      <p>天気：${weatherTomorrow} ${icon(weatherTomorrow)}</p>
      <p><span style="color:red;">最高：${temps[1]}℃</span></p>
      <p><span style="color:blue;">最低：${temps[3]}℃</span></p>
      <p>湿度：${humidities[1]}%</p>
      <p>${tomorrowBug}</p>
    `;
  } catch (e) {
    console.error(e);
    weatherBox.innerHTML = `<p>天気情報の取得に失敗しました。</p>`;
  }
}

// ───────────────────
//  補助関数
// ───────────────────
function format(iso) {
  const d = new Date(iso);
  return `${d.getMonth()+1}月${d.getDate()}日`;
}

function icon(weather) {
  if (weather.includes("晴")) return "☀️";
  if (weather.includes("曇")) return "⛅";
  if (weather.includes("雨")) return "🌧️";
  if (weather.includes("雪")) return "❄️";
  return "🌈";
}

function judge(weather, temp, hum) {
  const t = parseInt(temp);
  const h = parseInt(hum);

  if (!weather || isNaN(t) || isNaN(h)) {
    return "△ データ不足のため判定できません。";
  }

  if (weather.includes("雨") || weather.includes("雪")) {
    return "✕ 雨・雪は虫取り無理。";
  }

  if (t >= 22 && t <= 32 && h >= 40 && h <= 80) {
    return "◎ とても虫取りに向いています！";
  }

  if (t >= 18 && t < 22) {
    return "○ まあまあ虫取りできます。";
  }

  if (t > 32) return "⚠ 暑すぎ注意。危険！";
  if (t < 15) return "✕ 寒すぎて虫ほぼ出ません。";

  return "△ 虫取りにはあまり向いていません。";
}
