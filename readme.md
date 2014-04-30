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
  
  // process email
});


```
That's easy!


### a more complex example

 * Get the first 20 (UNSEEN) emails
 * Mark them read (\SEEN)
 * Archive them

[full gist (yzorg)](https://gist.github.com/yzorg/11307678)

``` javascript

// copy all initialization and event logging above

// make sure you include in options:  
//   fetchUnreadOnStart: true,
var count = 0;

mailListener.on("mail", function(mail, seqno, attributes) {
  var mailuid = attributes.uid,
    toMailbox = '[Gmail]/All Mail',
    i = ++count;

  if (i > 20) {
    mailListener.stop(); // start listening
    return;
  }

  console.log('email parsed', { 
    i: i, 
    subject: mail.subject, 
    seqno: seqno, 
    uid: attributes.uid,
    attributes: attributes 
  });

  console.log('attempting to mark msg read/seen');
  mailListener.imap.addFlags(mailuid, '\\Seen', function (err) {
    if (err) {
      console.log('error marking message read/SEEN');
      return;
    }

    console.log('moving ' + (seqno || '?') + ' to ' + toMailbox);
      mailListener.imap.move(mailuid, toMailbox, function (err) {
        if (err) {
          console.log('error moving message');
          return;
        }
        console.log('moved ' + (seqno || '?'), mail.subject);
      });
  });
});

mailListener.start(); // start listening

// When testing this script with GMail in US it took about 
// 8 seconds to get unread email list, another 40 seconds 
// to archive those 20 messages (move to All Mail).
setTimeout(function () {
  mailListener.stop();
}, 60*1000); // 60 seconds


```

Now moving mail is easy too!

## License

MIT
