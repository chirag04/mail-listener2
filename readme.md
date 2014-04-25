# Overview

Mail-listener2 library for node.js. Get notification when new email arrived to inbox. Uses IMAP protocol.

We are using these libraries: [node-imap](https://github.com/mscdex/node-imap), [mailparser](https://github.com/andris9/mailparser).

Heavily inspired by [mail-listener](https://github.com/circuithub/mail-listener).

## Use

Install

`npm install mail-listener2`


JavaScript Code:


```javascript

var MailListener = require("mail-listener2");

var mailListener = new MailListener({
  username: "imap-username",
  password: "imap-password",
  host: "imap-host",
  port: 993, // imap port
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
  mailbox: "INBOX", // mailbox to monitor
  searchFilter: "UNSEEN", // the search filter being used after an IDLE notification has been retrieved
  markSeen: true, // all fetched email willbe marked as seen and not fetched next time
  fetchUnreadOnStart: true, // use it only if you want to get all unread email on lib start. Default is `false`,
  mailParserOptions: {streamAttachments: true} // options to be passed to mailParser lib.
});

mailListener.start(); // start listening

// stop listening
//mailListener.stop();

mailListener.on("server:connected", function(){
  console.log("imapConnected");
});

mailListener.on("server:disconnected", function(){
  console.log("imapDisconnected");
});

mailListener.on("error", function(err){
  console.log(err);
});

mailListener.on("mail", function(mail){
  // do something with mail object including attachments
  console.log("emailParsed", mail);
  
  // mail processing code goes here
});

// A more complex example.
// when new (UNSEEN) mail arrives mark it read (SEEN) and move it
mailListener.on("mail", function(mail, seqno, attributes) {
  var mailuid = attributes.uid,
    toMailbox = 'moved-box';
  
  mailListener.imap.addFlags(mailuid, '\\SEEN', function (err) {
    if (err) {
      console.log('error marking message read/SEEN');
      return;
    }

    console.log('moving to ' + toMailbox);
    mailListener.imap.move(mailuid, toMailbox, function (err) {
      if (err) {
        console.log('error moving message');
      }
    });
  });
});

```

That's easy!


## License

MIT
