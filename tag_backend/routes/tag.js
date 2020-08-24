var express = require('express')
var router = express.Router()


const tagPageServer = "http://localhost:5000";

function getPageName(tagtypeid) {
    let pageName;
    switch (tagtypeid) {
        case 't94RaJbYDkRZb5ajhzeI':
            pageName = "rect_curve_1";
            break;
        case 'lXJREkHUnfH1kgqioMCK':
            pageName = "rect_straight_1";
            break;
        case 'AeLywdduznpSrQOc1zIx':
            pageName = "square_curve_1";
            break;
        case 'BQbnhBc0QQ0IlQN2OP8v':
            pageName = "rect_curve_3";
            break;
        case 'KtHvazHr91pJFPr5Utvs':
            pageName = "square_curve_3";
            break;
        case 'uNnmea2WS2zNaBtI7nuM':
            pageName = "rect_curve_2";
            break;
        case 'CImPPzxLN01WngWcTuY6':
            pageName = "round_curve_3";
            break;
        case 'uPMvnJGRbzDfDx6TCAxa':
            pageName = "round_curve_1";
            break;
        case 'XQ0rV7yYJk3xjTejXYNO':
            pageName = "square_curve_2";
            break;
        case 'yzD3acjbq344oGAErrk7':
            pageName = "square_straight_1";
            break;
        case 'lhitAuvALJJNKp0cfcEY':
            pageName = "round_straight_1";
            break;
        case 'RsBhRPH7ujc6eh1WWUhU':
            pageName = "round_curve_2";
            break;
    }
    return pageName + ".html";
}

async function printPDF(image, title, desc, qrdata, tagtypeid) {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
        ],
        timeout: 10000,
    });
    const page = await browser.newPage();

    const tag_page_url = getPageName(tagtypeid);
    image = encodeURIComponent(image);
    await page.goto(`${tagPageServer}/tag_designs/${tag_page_url}?title=${title}&qrdata=${qrdata}&image=${image}&desc=${desc}`, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'A4' });

    await browser.close();
    return pdf;
}



router.get('/get', (req, res) => {
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
        res.send("All fields required!");
    }
    printPDF(image, title, desc, qrdata, tagtypeid).then(pdf => {
        res.set({ 'Content-Type': 'application/pdf', 'Content-Length': pdf.length })
        res.send(pdf)
    });
});

module.exports = router