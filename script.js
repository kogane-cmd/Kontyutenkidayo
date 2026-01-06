const LAT = 35.6895;
const LON = 139.6917;

async function loadWeather() {
  const adviceEl = document.getElementById("advice");
  adviceEl.textContent = "読み込み中…";

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
    `&hourly=temperature_2m,relativehumidity_2m` +
    `&daily=temperature_2m_max,temperature_2m_min` +
    `&timezone=Asia/Tokyo`;

  try {
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) throw new Error("HTTP Error");

    const data = await res.json();

    const maxTemp = data?.daily?.temperature_2m_max?.[0];
    const minTemp = data?.daily?.temperature_2m_min?.[0];
    const humidity = data?.hourly?.relativehumidity_2m?.[0];

    document.getElementById("max-temp").textContent =
      typeof maxTemp === "number" ? `${maxTemp}℃` : "--℃";

    document.getElementById("min-temp").textContent =
      typeof minTemp === "number" ? `${minTemp}℃` : "--℃";

    document.getElementById("humidity").textContent =
      typeof humidity === "number" ? `${humidity}%` : "--%";

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

  } catch (err) {
    adviceEl.textContent = "データ取得失敗（HTTPS か確認して）";
    console.error(err);
  }
}

window.onload = loadWeather;
