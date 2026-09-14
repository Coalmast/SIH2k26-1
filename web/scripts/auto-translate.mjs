import fs from 'fs';
import path from 'path';

async function translateText(text, targetLang = 'hi') {
  if (!text) return '';
  // Avoid translating pure numbers or very short symbols
  if (!isNaN(text) || text.length < 2) return text;
  
  try {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)'
      }
    };
    let url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    let res = await fetch(url, options);
    
    if (res.status === 429) {
      console.log(' Rate limited! Waiting 2 seconds...');
      await new Promise(r => setTimeout(r, 10000));
      res = await fetch(url, options); // retry once
    }
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const json = await res.json();
    return json[0].map(item => item[0]).join('');
  } catch (e) {
    console.error(`\nFailed to translate: "${text}" | Error: ${e.message}`);
    return text;
  }
}

async function run() {
  const enPath = path.join(process.cwd(), 'src', 'i18n', 'locales', 'en.json');
  const hiPath = path.join(process.cwd(), 'src', 'i18n', 'locales', 'hi.json');
  
  if (!fs.existsSync(enPath) || !fs.existsSync(hiPath)) {
    console.error("Could not find the translation files. Make sure you run this from the 'web' folder.");
    return;
  }
  
  const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  let hiData = {};
  try {
    hiData = JSON.parse(fs.readFileSync(hiPath, 'utf8'));
  } catch(e) {}
  
  const keys = Object.keys(enData);
  console.log(`Found ${keys.length} total keys. Checking for missing Hindi translations...`);
  
  let translatedCount = 0;
  
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const enText = enData[key];
    
    // Translate if missing, empty, OR if the scanner just copied the English text as a placeholder
    if (!hiData[key] || hiData[key] === '' || hiData[key] === enText) {
      process.stdout.write(`[${i + 1}/${keys.length}] Translating: "${enText.substring(0, 30).replace(/\n/g, ' ')}..." -> `);
      
      const translated = await translateText(enText, 'hi');
      hiData[key] = translated;
      
      console.log(`"${translated.substring(0, 30).replace(/\n/g, ' ')}..."`);
      translatedCount++;
      
      // Sleep slightly to prevent Google API rate limits
      await new Promise(r => setTimeout(r, 150));
      
      // Save progress every 20 items
      if (translatedCount % 20 === 0) {
        fs.writeFileSync(hiPath, JSON.stringify(hiData, null, 2));
      }
    } else {
       // Leave existing valid translations alone
       hiData[key] = hiData[key];
    }
  }
  
  // Final save
  fs.writeFileSync(hiPath, JSON.stringify(hiData, null, 2));
  console.log(`\nAll done! Successfully machine-translated ${translatedCount} missing keys to Hindi.`);
}

run();
