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

  // シンプルにAPIへ直接リクエストを送ります（API自体がCORS許可されています）
  const url = `https://tsukumijima.net{cityId}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP Error");

    const data = await res.json();

    const today = data.forecasts[0];
    const tomorrow = data.forecasts[1];
    const dayAfter = data.forecasts[2]; // 明後日

    weatherBox.innerHTML = `
      ${makeDayBlock(today, 0)}
      <hr style="margin: 1.5em 0; border: 0; border-top: 1px solid #eee;">
      ${makeDayBlock(tomorrow, 1)}
      <hr style="margin: 1.5em 0; border: 0; border-top: 1px solid #eee;">
      ${makeDayBlock(dayAfter, 2)}
    `;
  } catch (e) {
    weatherBox.innerHTML = "天気情報の取得に失敗しました。";
    console.error(e);
  }
}

/* ===== 1日分の表示（無駄な隙間をなくしてiPadでも見やすく） ===== */
function makeDayBlock(day, offset) {
  if (!day) return `<h2>データがありません</h2>`;

  const max = day.temperature.max?.celsius ?? "--";
  const min = day.temperature.min?.celsius ?? "--";
  const rain = getRainText(day.chanceOfRain);
  const advice = getBugAdvice(day.telop, max);
  const dateText = makeDateText(offset);

  return `
    <h2 style="margin-top: 0; margin-bottom: 0.6em; color: #333; font-size: 24px;">${dateText}</h2>
    <div style="font-size: 16px; color: #555; line-height: 1.8;">
      <p style="margin: 4px 0;">天気：${day.telop} ${getIcon(day.telop)}</p>
      <p style="margin: 4px 0;">
        <span style="color:red; font-weight:bold;">最高気温：${max}℃</span> ／ 
        <span style="color:blue; font-weight:bold;">最低気温：${min}℃</span>
      </p>
      <p style="margin: 4px 0;">降水確率：${rain}</p>
      <p style="margin: 12px 0 0 0; font-size: 18px; color: #2e7d32;"><b>${advice}</b></p>
    </div>
  `;
}

/* ===== 今日・明日・明後日の日付 ===== */
function makeDateText(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);

  const m = d.getMonth() + 1;
  const day = d.getDate();

  if (offset === 0) return `今日（${m}月${day}日）`;
  if (offset === 1) return `明日（${m}月${day}日）`;
  if (offset === 2) return `明後日（${m}月${day}日）`;

  return `${m}月${day}日`;
}

/* ===== 天気アイコン ===== */
function getIcon(weather) {
  if (!weather) return "🌈";
  if (weather.includes("晴")) return "☀️";
  if (weather.includes("曇")) return "⛅";
  if (weather.includes("雨")) return "🌧️";
  if (weather.includes("雪")) return "❄️";
  return "🌈";
}

/* ===== 降水確率（「%」マーク混在バグや「--」によるNaNを完全に防ぐ） ===== */
function getRainText(obj) {
  if (!obj) return "--%";

  // 各時間帯のデータを配列としてまとめる
  const rawValues = [
    obj.T00_06,
    obj.T06_12,
    obj.T12_18,
    obj.T18_24
  ];

  const validNumbers = [];

  for (let i = 0; i < rawValues.length; i++) {
    let val = rawValues[i];
    
    // データが存在し、かつ「--」ではない有効な予報データのみを抽出
    if (val !== undefined && val !== null && val !== "--" && val !== "") {
      // 文字列として届く「"10%"」から「%」を除去して「"10"」にする
      if (typeof val === "string") {
        val = val.replace("%", "");
      }
      
      const num = parseInt(val);
      // 正しく数字に変換できたら配列に追加
      if (!isNaN(num)) {
        validNumbers.push(num);
      }
    }
  }

  // 夜間などで、これ以降の有効な数字が一つもない場合は「--%」を返す
  if (validNumbers.length === 0) return "--%";

  // 正常な数字の中から最も高い降水確率を出力
  const max = Math.max(...validNumbers);
  return `${max}%`;
}

/* ===== 🐞虫取り判定 ===== */
function getBugAdvice(weather, maxTemp) {
  if (!weather) return "△ 情報不足で判断できません";
  
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
