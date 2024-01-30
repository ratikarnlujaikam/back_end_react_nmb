const {MailUrl} = require("../server");

const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const currentDate = new Date();
const formattedDate = `${currentDate.getFullYear().toString().slice(-2)}${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
// Create the transporter outside of the route handler
let transporter = nodemailer.createTransport({
    host: "10.121.1.22", //10.121.1.22 ลพบุรี //10.120.10.42 บางปะอิน
    port: 25,
  });

// Define your route handler inside the main function

router.get("/sendmail1/:selectedOptionDropdown1/:textValueRegistertb/:docNo", async (req, res) => {
    try {
        // Access data sent from the frontend via URL parameters
        const { selectedOptionDropdown1,
            textValueRegistertb,
            docNo,          
        } = req.params;

        if (selectedOptionDropdown1 === 'IQC') {
            const mailOptions = {
                from: `${textValueRegistertb} <cleanliness@Alarm>`,
                to: "ratikarn.l@minebea.co.th",
                subject: "Analysis Request to Cleanliness",
                text: `Document No. :  ${selectedOptionDropdown1}${docNo}
                    Please click ${MailUrl}cleanlinessspecialapprove?docNo=${selectedOptionDropdown1}${formattedDate}${docNo} to approve ${selectedOptionDropdown1}${formattedDate}${docNo}`,
            };

            // Send the email
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    res.json({
                        error,
                        api_result: "nok",
                    });
                } else {
                    console.log("Email sent: " + info.response);
                    res.json({
                        api_result: "ok",
                    });
                }
            });
        }
        else if (selectedOptionDropdown1 === 'OQA') {
            const mailOptions = {
                from: `${textValueRegistertb} <cleanliness@Alarm>`,
                to: "apichart.s@minebea.co.th",
                subject: "Analysis Request to Cleanliness",
                text: `Document No. :   ${selectedOptionDropdown1}${docNo}
                    Please click ${MailUrl}cleanlinessspecialapprove?docNo=${selectedOptionDropdown1}${formattedDate}${docNo} to approve ${selectedOptionDropdown1}${formattedDate}${docNo}`,
            };

            // Send the email
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    res.json({
                        error,
                        api_result: "nok",
                    });
                } else {
                    console.log("Email sent: " + info.response);
                    res.json({
                        api_result: "ok",
                    });
                }
            });
        }
        else if (selectedOptionDropdown1 === 'QC') {
            const mailOptions = {
                from: `${textValueRegistertb} <cleanliness@Alarm>`,
                to: "apichart.s@minebea.co.th",
                subject: "Analysis Request to Cleanliness",
                text: `Document No. :   ${selectedOptionDropdown1}${docNo}
                    Please click ${MailUrl}cleanlinessspecialapprove?docNo=${selectedOptionDropdown1}${formattedDate}${docNo} to approve ${selectedOptionDropdown1}${formattedDate}${docNo}`,
            };

            // Send the email
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    res.json({
                        error,
                        api_result: "nok",
                    });
                } else {
                    console.log("Email sent: " + info.response);
                    res.json({
                        api_result: "ok",
                    });
                }
            });
        }
        else if (selectedOptionDropdown1 === 'PD') {
            const mailOptions = {
                from: `${textValueRegistertb} <cleanliness@Alarm>`,
                to: "apichart.s@minebea.co.th",
                subject: "Analysis Request to Cleanliness",
                text: `Document No. :   ${selectedOptionDropdown1}${docNo}
                    Please click ${MailUrl}cleanlinessspecialapprove?docNo=${selectedOptionDropdown1}${formattedDate}${docNo} to approve ${selectedOptionDropdown1}${formattedDate}${docNo}`,
            };


            // Send the email
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    res.json({
                        error,
                        api_result: "nok",
                    });
                } else {
                    console.log("Email sent: " + info.response);
                    res.json({
                        api_result: "ok",
                    });
                }
            });
        }
        else if (selectedOptionDropdown1 === 'PENG') {
            const mailOptions = {
                from: `${textValueRegistertb} <cleanliness@Alarm>`,
                to: "apichart.s@minebea.co.th",
                subject: "Analysis Request to Cleanliness",
                text: `Document No. :   ${selectedOptionDropdown1}${docNo}
                    Please click ${MailUrl}cleanlinessspecialapprove?docNo=${selectedOptionDropdown1}${formattedDate}${docNo} to approve ${selectedOptionDropdown1}${formattedDate}${docNo}`,
            };


            // Send the email
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    res.json({
                        error,
                        api_result: "nok",
                    });
                } else {
                    console.log("Email sent: " + info.response);
                    res.json({
                        api_result: "ok",
                    });
                }
            });
        }
        else if (selectedOptionDropdown1 === 'ENG') {
            const mailOptions = {
                from: `${textValueRegistertb} <cleanliness@Alarm>`,
                to: "apichart.s@minebea.co.th",
                subject: "Analysis Request to Cleanliness",
                text: `Document No. :   ${selectedOptionDropdown1}${docNo}
                    Please click ${MailUrl}cleanlinessspecialapprove?docNo=${selectedOptionDropdown1}${formattedDate}${docNo} to approve ${selectedOptionDropdown1}${formattedDate}${docNo} `,
            };


            // Send the email
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    res.json({
                        error,
                        api_result: "nok",
                    });
                } else {
                    console.log("Email sent: " + info.response);
                    res.json({
                        api_result: "ok",
                    });
                }
            });
        }
        else if (selectedOptionDropdown1 === 'MM') {
            const mailOptions = {
                from: `${textValueRegistertb} <cleanliness@Alarm>`,
                to: "apichart.s@minebea.co.th",
                subject: "Analysis Request to Cleanliness",
                text: `Document No. :   ${selectedOptionDropdown1}${docNo}
                    Please click ${MailUrl}cleanlinessspecialapprove?docNo=${selectedOptionDropdown1}${formattedDate}${docNo} to approve ${selectedOptionDropdown1}${formattedDate}${docNo}`,
            };


            // Send the email
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    res.json({
                        error,
                        api_result: "nok",
                    });
                } else {
                    console.log("Email sent: " + info.response);
                    res.json({
                        api_result: "ok",
                    });
                }
            });
        }
        else if (selectedOptionDropdown1 === 'PC') {
            const mailOptions = {
                from: `${textValueRegistertb} <cleanliness@Alarm>`,
                to: "apichart.s@minebea.co.th",
                subject: "Analysis Request to Cleanliness",
                text: `Document No. :   ${selectedOptionDropdown1}${docNo}
                    Please click ${MailUrl}cleanlinessspecialapprove?docNo=${selectedOptionDropdown1}${formattedDate}${docNo} to approve ${selectedOptionDropdown1}${formattedDate}${docNo}`,
            };


            // Send the email
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    res.json({
                        error,
                        api_result: "nok",
                    });
                } else {
                    console.log("Email sent: " + info.response);
                    res.json({
                        api_result: "ok",
                    });
                }
            });
        }
        else if (selectedOptionDropdown1 === 'POM') {
            const mailOptions = {
                from: `${textValueRegistertb} <cleanliness@Alarm>`,
                to: "apichart.s@minebea.co.th",
                subject: "Analysis Request to Cleanliness",
                text: `Document No. :   ${selectedOptionDropdown1}${docNo}
                    Please click ${MailUrl}cleanlinessspecialapprove?docNo=${selectedOptionDropdown1}${formattedDate}${docNo} to approve ${selectedOptionDropdown1}${formattedDate}${docNo} `,
            };


            // Send the email
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    res.json({
                        error,
                        api_result: "nok",
                    });
                } else {
                    console.log("Email sent: " + info.response);
                    res.json({
                        api_result: "ok",
                    });
                }
            });
        }
        // Define the email content

    } catch (error) {
        console.log(error);
        res.json({
            error,
            api_result: "nok",
        });
    }
});


router.get("/sendmailapprove/:textValueRegistertb/:DocNo/:selectedOptionRadioButtons3/:textValueTextBoxmail", async (req, res) => {
        try {
            // Access data sent from the frontend via URL parameters
            const { selectedOptionRadioButtons3,
                textValueRegistertb,
                DocNo,
                textValueTextBoxmail,
            } = req.params;

            if (selectedOptionRadioButtons3 === 'Accept') {
                const mailOptions = {
                    from: `${textValueRegistertb} <cleanliness@Alarm>`,
                    to: "apichart.s@minebea.co.th,suparat.s@minebea.co.th,Tanyathon.p@minebea.co.th,Chadaporn.si@minebea.co.th",
                    subject: "Analysis Request to Cleanliness",
                    text: `Dear Cleanliness
                    Document No. :   ${DocNo}
                    Please click ${MailUrl}cleanlinessspecialapprovecleanliness?docNo=${DocNo} to approve ${DocNo}`,
                };

                // Send the email
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log(error);
                        res.json({
                            error,
                            api_result: "nok",
                        });
                    } else {
                        console.log("Email sent: " + info.response);
                        res.json({
                            api_result: "ok",
                        });
                    }
                });
            }
            else if (selectedOptionRadioButtons3 === 'Reject') {
                const mailOptions = {
                    from: `CleanlinessAlarm <cleanliness@Alarm>`,
                    to: `${textValueTextBoxmail}`,
                    subject: "Analysis Request to Cleanliness",
                    text: `Dear ${textValueRegistertb} 
                    Document No. :   ${DocNo} deny by Mgrequester
                    Click ${MailUrl}cleanlinessspecialview?docNo=${DocNo} to see  detail`
                    ,
                };
                

                // Send the email
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log(error);
                        res.json({
                            error,
                            api_result: "nok",
                        });
                    } else {
                        console.log("Email sent: " + info.response);
                        res.json({
                            api_result: "ok",
                        });
                    }
                });

            }

        } catch (error) {
            console.log(error);
            res.json({
                error,
                api_result: "nok",
            });
        }
    });



router.get("/sendmailcleanlinessapprove/:textValueRegistertb/:DocNo/:selectedOptionRadiocleanliness/:textValueTextBoxmail", async (req, res) => {
        try {
            // Access data sent from the frontend via URL parameters
            const { selectedOptionRadiocleanliness,
                textValueRegistertb,
                DocNo,
                textValueTextBoxmail,
            } = req.params;

            if (selectedOptionRadiocleanliness === 'Accept') {
                const mailOptions = {
                    from: ` CleanlinessAlarm <cleanliness@Alarm>`,
                    to: `${textValueTextBoxmail}`,
                    subject: "Analysis Request to Cleanliness",
                    text: `Dear ${textValueRegistertb}
                    Document No. :   ${DocNo}  Request success
                    Click ${MailUrl}cleanlinessspecialview?docNo=${DocNo} to see  detail
                    `,
                };

                // Send the email
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log(error);
                        res.json({
                            error,
                            api_result: "nok",
                        });
                    } else {
                        console.log("Email sent: " + info.response);
                        res.json({
                            api_result: "ok",
                        });
                    }
                });
            }
            else if (selectedOptionRadiocleanliness === 'Reject') {
                const mailOptions = {
                    from: `CleanlinessAlarm <cleanliness@Alarm>`,
                    to: `${textValueTextBoxmail}`,
                    subject: "Analysis Request to Cleanliness",
                    text: `Dear ${textValueRegistertb} 
                    Document No. :   ${DocNo} deny by cleanliness
                    Click ${MailUrl}cleanlinessspecialview?docNo=${DocNo} to see  detail`,
                };

                // Send the email
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log(error);
                        res.json({
                            error,
                            api_result: "nok",
                        });
                    } else {
                        console.log("Email sent: " + info.response);
                        res.json({
                            api_result: "ok",
                        });
                    }
                });

            }

        } catch (error) {
            console.log(error);
            res.json({
                error,
                api_result: "nok",
            });
        }
    });


// Call the main function to set up your route


module.exports = router;

