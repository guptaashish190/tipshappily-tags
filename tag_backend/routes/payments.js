var express = require('express')
var router = express.Router()

var admin = require("firebase-admin");

admin.initializeApp();

router.post('/tip/handleWalletTransaction', async (req, res) => {

    const { idToken, transactionData, receiverId, isBusinessPayment } = req.body;

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

            await admin.firestore().collection('transactions').doc(senderId).collection('history').add(senderData);
            await admin.firestore().collection('transactions').doc(receiverId).collection('history').add(receiverData);

            // wallet amount calculation
            const receiverRef = admin.firestore().collection('transactions').doc(receiverId);
            const senderRef = admin.firestore().collection('transactions').doc(senderId);

            const senderRefData = (await senderRef.get()).data();
            console.log(senderRefData)
            await senderRef.set({
                walletAmount: senderRefData.walletAmount - senderData.amount
            });

            const receiverRefData = (await receiverRef.get()).data();
            if (isBusinessPayment) {
                const businessRef = admin.firestore().collection('business').doc(req.body.businessData.receivingBusinessId);
                businessDoc = (await businessRef.get()).data;

                if (businessDoc["employeeKeeps"]) {
                    await receiverRef.set({
                        walletAmount: receiverRefData.walletAmount + senderData.amount,
                    });
                } else {
                    await businessRef.set({
                        businessWallet: businessDoc.businessWallet + senderData.amount,
                    });
                }
            } else {
                console.log(receiverRefData)
                await receiverRef.set({
                    walletAmount: receiverRefData.walletAmount + senderData.amount,
                });
            }


            res.json({
                error: false,
                message: 'success'
            });
        }).catch(function (error) {
            console.log(error)
            res.json({
                error: true,
                message: error
            });
        });
});
router.post('/shop/handleWalletTransaction', (req, res) => {

    const { idToken, transactionData } = req.body;

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
            await userRef.set({
                walletAmount: userRefData.walletAmount - newTransactionData.amount
            });
            res.json({
                error: false,
                message: 'success'
            });
        }).catch(function (error) {
            console.log(error)
            res.json({
                error: true,
                message: error
            });
        });
});

module.exports = router