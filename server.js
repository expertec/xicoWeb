const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

app.post('/send-whatsapp', (req, res) => {
    const { to, message } = req.body;

    client.messages
        .create({
            body: message,
            from: 'whatsapp:' + process.env.TWILIO_WHATSAPP_NUMBER,
            to: 'whatsapp:' + to,
        })
        .then((message) => res.send({ success: true, messageSid: message.sid }))
        .catch((error) => {
            console.error(error);
            res.status(500).send({ success: false, error });
        });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
