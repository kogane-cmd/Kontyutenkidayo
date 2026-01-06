async function getWeatherJMA(code) {
  const url = `https://www.jma.go.jp/bosai/forecast/data/forecast/${code}.json`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const area = data[0]?.timeSeries?.[0]?.areas?.[0];
    const dates = data[0]?.timeSeries?.[0]?.timeDefines || [];

    const weatherToday = area?.weathers?.[0] || "不明";
    const weatherTomorrow = area?.weathers?.[1] || "不明";
    const windToday = area?.winds?.[0] || "不明";
    const windTomorrow = area?.winds?.[1] || "不明";

    // ---------- 🔍 temps を持ってる timeSeries を探す ----------
    let temps = ["--","--","--","--"];
    for (const ts of data[1].timeSeries) {
      const a = ts.areas?.[0];
      if (a?.temps) {
        temps = a.temps;
        break;
      }
    }

    // ---------- 🔍 湿度（ほぼ無いので fallback付き） ----------
    let humidities = ["--","--"];
    for (const ts of data[1].timeSeries) {
      const a = ts.areas?.[0];
      if (a?.humidity) {
        humidities = a.humidity;
        break;
      }
    }

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
