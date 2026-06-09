async function main() { 
  try {
    const res = await fetch('https://p-biefc5ovbc72ptz6ccakjqwraynae5rr.kimi.page/assets/index-Be9bjFZl.js'); 
    const text = await res.text(); 
    console.log(text.substring(0, 1000));
    const showMatches = text.match(/date:.*?,|title:.*?,|location:.*?,/g);
    console.log("MATCHES:", showMatches?.slice(0, 50));
    
    // Also try to find video/media matches
    const mediaMatches = text.match(/https:\/\/instagram.*?mp4|https:\/\/.*?(?:jpg|jpeg|png|mp4|webm)/g);
    console.log("MEDIA:", mediaMatches?.slice(0, 20));
  } catch(e) {
    console.error(e);
  }
} 
main();
