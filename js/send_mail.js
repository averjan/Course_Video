const nodemailer = require('nodemailer')

let transporter = nodemailer.createTransport({
    pool: true,
    service: 'Mail.ru',
    port: 465,
    secure: true, // use TLS
    auth: {
        user: "course_work_ksis@mail.ru",
        pass: "15dirafa"
    }
});

let mailOptions = {
    from: 'course_work_ksis@mail.ru',
    to: 'taverkin@mail.ru',
    subject: 'Sending Email using Node.js',
    text: 'That was easy!'
};

function sendMail() {
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}
