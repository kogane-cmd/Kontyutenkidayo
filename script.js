// ==== 設定 ====
// Open-Meteo を使用（APIキー不要）
const LAT = 35.6895;  // ここを地域に合わせて変更
const LON = 139.6917;

async function loadWeather() {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&hourly=temperature_2m,relativehumidity_2m&daily=temperature_2m_max,temperature_2m_min&timezone=Asia/Tokyo`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const maxTemp = data?.daily?.temperature_2m_max?.[0];
    const minTemp = data?.daily?.temperature_2m_min?.[0];
    const humidity = data?.hourly?.relativehumidity_2m?.[0];

    const maxEl = document.getElementById("max-temp");
    const minEl = document.getElementById("min-temp");
    const humEl = document.getElementById("humidity");
    const adviceEl = document.getElementById("advice");

    // --- 値が取れないと「--」になる問題対策 ---
    maxEl.textContent = (typeof maxTemp === "number") ? `${maxTemp}℃` : "--℃";
    minEl.textContent = (typeof minTemp === "number") ? `${minTemp}℃` : "--℃";
    humEl.textContent = (typeof humidity === "number") ? `${humidity}%` : "--%";

    // --- 虫取り判定 ---
    let advice = "△ 虫取りにはあまり向いていません。";

    if (typeof maxTemp === "number" && typeof humidity === "number") {
      if (maxTemp >= 22 && maxTemp <= 32 && humidity >= 40 && humidity <= 80) {
        advice = "◎ とても虫取りに向いています！";
      } else if (maxTemp >= 18 && maxTemp < 22) {
        advice = "○ まあまあ虫取りできます。";
      } else if (maxTemp > 32) {
        advice = "⚠ 暑すぎ注意。虫より人間が危険。";
      } else if (maxTemp < 15) {
        advice = "✕ 寒くて虫はほぼ出ません。";
      }
    }

    adviceEl.textContent = advice;

  } catch (e) {
    document.getElementById("advice").textContent = "データ取得エラー";
  }
}

document.addEventListener("DOMContentLoaded", loadWeather);
