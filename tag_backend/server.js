const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = 8345;
const tagPageServer =  "http://localhost:5000";

function getPageName(tagtypeid) {
    let pageName;
    switch (tagtypeid) {
        case '1Ah68S0YX6iCDdlHUCJF':
            pageName = "rect_curve_1";
            break;
        case '3UOOrY0q25Ct9klWTx5b':
            pageName = "rect_straight_1";
            break;
        case '3d89FnlQhE5tUyjMRcgk':
            pageName = "square_curve_1";
            break;
        case 'A5YdVk3WuzK9se94OZtf':
            pageName = "rect_curve_3";
            break;
        case 'CAqhgKstXScxAKLIl4Cj':
            pageName = "square_curve_3";
            break;
        case 'Dy6fxMAOgqw6QA1Rb0U8':
            pageName = "rect_curve_2";
            break;
        case 'HklS1AKdjzZtOGZCGSV1':
            pageName = "round_curve_3";
            break;
        case 'NrXmKNMxPTmULTHykOfu':
            pageName = "round_curve_1";
            break;
        case 'TjQLszhLuNY33l4DhLcQ':
            pageName = "square_curve_2";
            break;
        case 'aydiaE85pJGDYeTjfB0o':
            pageName = "square_straight_1";
            break;
        case 'hq6P8lvebYRJZxz7jOOY':
            pageName = "round_straight_1";
            break;
        case 'mCU01giWFCbkCHNhusTY':
            pageName = "round_curve_2";
            break;
    }
    return pageName + ".html";
}

async function printPDF(image, title, desc, qrdata, tagtypeid) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const tag_page_url = getPageName(tagtypeid);

    await page.goto(`${tagPageServer}/tag_designs/${tag_page_url}?title=${title}&qrdata=${qrdata}&image=${image}&desc=${desc}`, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'A4' });

    await browser.close();
    return pdf;
}

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/gettag', (req, res) => {
    const image = req.query.image;
    const title = req.query.title;
    const desc = req.query.desc;
    const qrdata = req.query.qrdata;
    const tagtypeid = req.query.tagtypeid;

    console.log("-----------------");

    console.log(image);
    console.log(title);
    console.log(desc);
    console.log(qrdata);
    console.log(tagtypeid);

    console.log("-----------------");
    if (!image || !title || !desc || !qrdata || !tagtypeid) {
        res.send("All fields required");
    }
    printPDF(image, title, desc, qrdata, tagtypeid).then(pdf => {
        res.set({ 'Content-Type': 'application/pdf', 'Content-Length': pdf.length })
        res.send(pdf)
    });
});

app.listen(port, () => console.log(`App listening at http://localhost:${port}`));
