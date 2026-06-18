async function run() {
  try {
    const res = await fetch('https://www.youtube.com/@forensicbypriyanshi');
    const html = await res.text();
    // Usually it's in the string "subscriberCountText":{"accessibility":{"accessibilityData":{"label":"6.5K subscribers"}}
    const match = html.match(/"subscriberCountText":\{"accessibility":\{"accessibilityData":\{"label":"([^"]+)"/);
    console.log(match ? match[1] : 'not found');
  } catch (e) {
    console.error(e);
  }
}
run();
