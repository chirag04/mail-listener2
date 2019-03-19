var MailListener = require("./index.js").MailListener;

var mailListener = new MailListener({
  username: process.env.IMAPUSER,
  password: process.env.IMAPPASS,
  host: process.env.IMAPHOST,
  port: 993,
  tls: true,
  connTimeout: 10000, // Default by node-imap
  authTimeout: 5000, // Default by node-imap,
  debug: null, // Or your custom function with only one incoming argument. Default: null
  tlsOptions: { rejectUnauthorized: false },
  mailbox: "INBOX", // mailbox to monitor
  searchFilter: ["ALL"], // the search filter being used after an IDLE notification has been retrieved
  markSeen: true, // all fetched email willbe marked as seen and not fetched next time
  fetchUnreadOnStart: true, // use it only if you want to get all unread email on lib start. Default is `false`,
  attachments: true, // download attachments as they are encountered to the project directory
  attachmentOptions: { directory: "attachments/" }
});

mailListener.start();

mailListener.on("server:connected", function(){
  console.log("imapConnected");
});

mailListener.on("mailbox", function(mailbox){
  console.log("Total number of mails: ", mailbox.messages.total);
});

mailListener.on("server:disconnected", function(){
  console.log("imapDisconnected");
});

mailListener.on("error", function(err){
  console.log(err);
});

mailListener.on("headers", function(headers, seqno){
  console.log(`Email#${seqno} headers: `, headers);
});

mailListener.on("body", function(body, seqno) {
  console.log(`Email#${seqno} body: `, body);
})

mailListener.on("attachment", function(attachment, path, seqno){
  console.log(`Email#${seqno} Attachment stored at: `, path);
});

mailListener.on("mail", function(mail, seqno) {
  console.log(`Email#${seqno} - entire parsed object: `, mail);
})
