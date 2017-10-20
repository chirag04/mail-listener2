var MailListener = require("./");

var mailListener = new MailListener({
  username: "xxx",
  password: "xxx",
  host: "imap.gmail.com",
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
  mailbox: "INBOX",
  markSeen: true,
  fetchUnreadOnStart: true,
  attachments: true,
  attachmentOptions: { directory: "attachments/" }
});

mailListener.start();

mailListener.on("server:connected", function(){
  console.log("imapConnected");
});

mailListener.on("server:disconnected", function(){
  console.log("imapDisconnected");
  setTimeout(function() {
    console.log("Trying to establish imap connection again");
    mailListener.restart();
  }, 5* 1000);
});

mailListener.on("error", function(err){
  console.log(err);
});

mailListener.on("mail", function(mail){
  console.log(mail);
});

mailListener.on("attachment", function(attachment){
  console.log(attachment);
});
