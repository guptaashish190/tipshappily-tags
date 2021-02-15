var express = require('express')
var router = express.Router()

var admin = require("firebase-admin");


router.post('/tip/handleWalletTransaction', async (req, res) => {

    const { transactionData, receiverId, isBusinessPayment } = req.body;

    const authHeader = req.headers.authorization;
    console.log(req.headers)
    let idToken;
    if (authHeader) {
        idToken = authHeader.split(' ')[1];
    } else {
        return res.status(403).json({
            error: true,
            message: "Unauthorized"
        });
    }

    admin.auth().verifyIdToken(idToken)
        .then(async function (decodedToken) {

            let senderId = decodedToken.uid;
            const senderData = {
                ...transactionData,
                timestamp: new Date().getTime(),
                response: 'success',
                merchant: 'Wallet',
                role: 'sender'
            }

            let receiverData = {
                ...transactionData,
                timestamp: new Date().getTime(),
                response: 'success',
                merchant: 'Wallet',
                role: 'receiver'
            }
            if (isBusinessPayment) {
                receiverData = {
                    ...receiverData,
                    ...req.body.businessData,
                }
            }

            admin.firestore().collection('transactions').doc(senderId).collection('history').add(senderData);
            admin.firestore().collection('transactions').doc(receiverId).collection('history').add(receiverData);

            // wallet amount calculation
            const receiverRef = admin.firestore().collection('transactions').doc(receiverId);
            const senderRef = admin.firestore().collection('transactions').doc(senderId);

            const senderRefData = (await senderRef.get()).data();
            senderRef.update({
                walletAmount: senderRefData.walletAmount - senderData.amount
            });

            const receiverRefData = (await receiverRef.get()).data();
            if (isBusinessPayment) {
                const businessRef = admin.firestore().collection('business').doc(req.body.businessData.receivingBusinessId);
                businessDoc = (await businessRef.get()).data();

                if (businessDoc["employeeKeeps"]) {
                    console.log("business employee keeps");
console.log("R",receiverRefData.walletAmount);
console.log("S",senderData.amount);
                    receiverRef.update({
                        walletAmount: receiverRefData.walletAmount + senderData.amount,
                    });
                } else {
                    console.log("business no employee keeps");
console.log(businessDoc);
console.log("R", businessDoc.businessWallet, senderData.amount);
                    businessRef.update({
                        businessWallet: businessDoc.businessWallet + senderData.amount,
                    });
                }
            } else {
                receiverRef.update({
                    walletAmount: receiverRefData.walletAmount + senderData.amount,
                });
            }


            res.json({
                error: false,
                message: 'success'
            });
        }).catch(function (error) {
            console.log(error)
            res.status(400).json({
                error: true,
                message: error
            });
        });
});
router.post('/shop/handleWalletTransaction', (req, res) => {

    const { transactionData } = req.body;

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

    admin.auth().verifyIdToken(idToken)
        .then(async function (decodedToken) {

            let userId = decodedToken.uid;
            const newTransactionData = {
                ...transactionData,
                timestamp: new Date().getTime(),
            }

            await admin.firestore().collection('transactions').doc(userId).collection('history').add(newTransactionData);
            await admin.firestore().collection('orders').add(newTransactionData);

            // wallet calculation
            const userRef = admin.firestore().collection('transactions').doc(userId);

            const userRefData = (await userRef.get()).data();
            await userRef.update({
                walletAmount: userRefData.walletAmount - newTransactionData.amount
            });
            res.json({
                error: false,
                message: 'success'
            });
        }).catch(function (error) {
            console.log(error)
            res.status(400).json({
                error: true,
                message: error
            });
        });
});

router.post('/business/distribute', (req, res) => {
    const { businessId, receiverData, currency, currencyUnicode, totalTip } = req.body;

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
    console.log("Hit ");
    admin.auth().verifyIdToken(idToken)
        .then(async function (decodedToken) {

            let userId = decodedToken.uid;

            const userTransactionHistoryDocId = (await admin.firestore().collection('transactions').doc(userId).collection('history').doc().get()).id;

            const promises = [];
            console.log(receiverData);
            receiverData.forEach(async receiver => {

                const receiverRef = admin.firestore().collection('transactions').doc(receiver.id)
                const data = {
                    "timestamp": new Date().getTime(),
                    "type": "TipToBusinessEmployee",
                    "merchant": "Wallet",
                    "response": "success",
                    "TransactionDocId": userTransactionHistoryDocId,
                    "UserId": userId,
                    "currency": currency,
                    "currencyUnicode": currencyUnicode,
                    "amount": receiver.amount,
                    "role": "receiver",
                    "ReceivingUserId": receiver.id,
                    "userMessage": "Business Tip",
                };

                promises.push(receiverRef.collection('history').add(data));

                const walletAmountReceiver = (await receiverRef.get()).data().walletAmount;
                await receiverRef.update({
                    walletAmount: walletAmountReceiver + receiver.amount
                });
            });
            console.log("Before promises");
            await Promise.all(promises);
            console.log("after promises");

            const businessRef = admin.firestore().collection('business').doc(businessId);

            const businessWalletAmount = (await businessRef.get()).data().businessWallet;
            await businessRef.update({
                businessWallet: businessWalletAmount - totalTip
            });
            res.json({
                error: false,
                message: 'success'
            });
        }).catch(function (error) {
            console.log(error);
            res.status(400).json({
                error: true,
                message: error
            });
        });

});

module.exports = router
