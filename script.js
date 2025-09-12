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
    const waveToday = area.waves[0];
    const waveTomorrow = area.waves[1];

    document.getElementById("weather").innerHTML = `
      <h2>今日（${formatDate(dates[0])}）</h2>
      <p>天気：${weatherToday}</p>
      <p>風：${windToday}</p>
      <p>波：${waveToday}</p>
      <h2>明日（${formatDate(dates[1])}）</h2>
      <p>天気：${weatherTomorrow}</p>
      <p>風：${windTomorrow}</p>
      <p>波：${waveTomorrow}</p>
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
