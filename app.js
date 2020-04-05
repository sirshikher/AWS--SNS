import express from "express";
import dotenv from 'dotenv';
import AWS from 'aws-sdk';

dotenv.config();
const app = express();
app.get("/", (req, res) => {
    console.log("Message = " + req.query.message);
    console.log("Number = " + req.query.number);
    console.log("Subject = " + req.query.subject);
    var AWSconfig = new AWS.SNS({ apiVersion: "2010-03-31" });
    var params = {
        Message: process.env.VERIFY_PORT + `type=phone/code=${req.query.message}/value=${req.query.number}`,
        PhoneNumber: "+" + req.query.number,
        MessageAttributes: {
            "AWS.SNS.SMS.SenderID": {
                DataType: "String",
                StringValue: req.query.subject
            }
        }
    };
    var SMSAttributes = {
        attributes: {
            DefaultSMSType: "Transactional"
        }
    };
    AWSconfig.setSMSAttributes(SMSAttributes);

    var publishTextPromise = AWSconfig.publish(params).promise();
    publishTextPromise
        .then(function (data) {
            res.end(JSON.stringify({ MessageID: data.MessageId }));
        })
        .catch(function (err) {
            res.end(JSON.stringify({ Error: err }));
        });
});
app.listen(3002, () => console.log("SMS Service Listening on PORT 3002"));
