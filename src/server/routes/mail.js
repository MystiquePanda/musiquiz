import express from "express";
import nodemailer from "nodemailer";
import sessionManager from "server/session";
import config from "server/config";
import path from "path";

const router = express.Router();
const transporter = nodemailer.createTransport({
    host: config.emailHost,
    port: config.emailPort,
    secure: true,
    auth: {
        user: config.emailAcct,
        pass: config.emailPass,
    },
});

async function sendMail(mail) {
    let error;

    // send mail with defined transport object
    const info = await transporter.sendMail(mail).catch((e) => {
        console.error(e);
        error = e;
        return {};
    });

    console.log("Email sent: %s", info.messageId);
    return { info, error };
}

async function shareMusiQ(req, res) {
    const user = sessionManager.get(req.session, "userName");
    const emails = req.body.emails.toString();
    const musiq = req.body.message.name;
    const link = `${config.baseURI}${req.body.message.link}`;

    const htmlMessage = `<div style="width:100%;font-family:-apple-system,BlinkMacSystemFont, Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji"> <div style="height:10px;background-color:#3399cc">&nbsp;</div><div style="display:flex"><a href="${link}"><img style="width:100px;height:100px;margin:20px" src="cid:logo-musiQuiz"/></a><p>a fun MusiQ - "${musiq}" from ${user} just for you.<br/><span style="color:#6633cc">Happy MusiQ-ing 🎶</span><br/><br/><span style="font-size:small;color:#3399cc">↽ launch the musiQ with the icon</span></p><br/></div><div style="background-color:#6633cc;color:lightgrey;font-size:x-small;text-align:right;padding-bottom:1px"> www.musiq.mystiquepanda.com</div> 
    </div>`;
    const textMessage = `a fun MusiQ - "${musiq}" from ${user} just for you! launch MusiQ-${musiq} <br/> ${link}`;

    const mail = {
        from: '"MusiQ" <musiq.mystiquepanda@gmail.com>',
        bcc: emails,
        subject: `🎶 a MusiQ from ${user} `,
        text: textMessage,
        html: htmlMessage,
        attachments: [
            {
                filename: "logo-musiQuiz.png",
                path: path.join(
                    __dirname,
                    "../../../public/images/logo-musiQuiz.png"
                ),
                cid: "logo-musiQuiz",
            },
        ],
    };

    if (req.body.sendToCreator) {
        mail.to = sessionManager.get(req.session, "userEmail");
    }

    const r = await sendMail(mail);

    res.send({ id: r.messageId, error: r.error });
}

router.post("/send", shareMusiQ);

module.exports = router;
