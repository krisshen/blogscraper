const puppeteer = require('puppeteer');

async function run() {

  const browser = await puppeteer.launch({
    headless: false
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 1201,
    height: 800,
    deviceScaleFactor: 1,
  });

  try {
    // go to blog page directly
    await page.goto('https://www.propelleraero.com/blog');

    // go to each blog category
    const BLOG_HEADER_SELECTOR = 'button[data-filter]';
    const headers = await page.$$(BLOG_HEADER_SELECTOR);

    for (i = 0; i < headers.length; i++) {
      if (i != 0) {
        await headers[i].click();
        await page.waitFor(3000);
      }
    }

    // grab all blogs links
    const BLOG_URL_SELECTOR = 'h2.entry-title a';
    const urls = await page.$$eval(BLOG_URL_SELECTOR, links => links.map(a => a.href));
    console.log(urls.length)

    // console.log(urls)

    let max_word_count_content = { url: '', word_count: 0 };

    // visit each blog and get content word count
    const BLOG_CONTENT_SELECTOR = 'div.entry-content';
    var url;
    var word_count;
    for (i = 0; i < urls.length; i++) {
      url = urls[i];
      // console.log(`crawling blog: ${url}`)
      await page.goto(url, { waitUntil: 'networkidle2' });

      word_count = await page.$eval(BLOG_CONTENT_SELECTOR, content => content.innerText.length);

      // compare for max word count
      console.log(`word count: ${word_count}`)
      if (word_count > max_word_count_content.word_count) {
        max_word_count_content.word_count = word_count;
        max_word_count_content.url = url;
      }
    }

    console.log('crawling done...')
    console.log(`the blog with the highest words is: ${max_word_count_content.url} with ${max_word_count_content.word_count} words`)

    browser.close();

  } catch (error) {
    console.log(error)
    if (browser) browser.close();
  }

}

run();