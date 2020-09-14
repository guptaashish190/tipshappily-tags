var express = require('express')
var router = express.Router()

var admin = require("firebase-admin");
const { allowedAdmins } = require('../config');



router.get('/validateAdminCode', (req, res) => {
    const { authorization } = req.headers;
    const code = authorization.split(' ')[1];

    const { username } = req.query;
    console.log(process.env.ADMIN_CODE, code);
    if (process.env.ADMIN_CODE === code && allowedAdmins.includes(username)) {
        return res.send({
            valid: true
        });
    }
    return res.send({
        valid: false
    });
});

router.post('/delete', async (req, res) => {

    const authHeader = req.headers.authorization;

    let idToken;
    if (authHeader) {
        idToken = authHeader.split(' ')[1];
    } else {
        return res.status(403).json({
            error: true,
            message: "Unauthorized"
        });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        let userId = decodedToken.uid;

        await admin.auth().deleteUser(userId);
        res.json({
            error: false,
            message: 'success'
        });
    } catch (e) {
        res.json({
            error: true,
            message: e
        });
    }
})

module.exports = router