# Overview

Mail-listener5 library for node.js. Get notification when new email arrived to inbox or when message metadata (e.g. flags) changes externally. Uses IMAP protocol.

## Version Notes
THIS INITIAL COMMIT IS STILL UNDERGOING MORE THOROUGH TESTING. Expect further commits in the next week or so (mid-March 2019) after this testing has finished & passed. :-)

This package has several improvements and fixes over the mail-listener2 & mail-listener4. Most of the improvements are designed to improve security, performance & usability, plus avoid deprecation warnings.
  - Updating dependencies to newer versions, with security enhancements, etc.
  - Updating code to use ES6 classes. The previous version used util.inherits(), which is now discouraged (see https://nodejs.org/dist/latest-v10.x/docs/api/util.html#util_util_inherits_constructor_superconstructor).
  - Updating code to use safer Buffer constructors. Use of the new Buffer() expression is deprecated (see https://nodejs.org/en/docs/guides/buffer-constructor-deprecation/), so Buffer().from() is used instead.
  - Updating code to use lexical variable declarations where appropriate.
  - Updating code to use ES6 arrow functions within methods where appropriate.
  - Updating test.js to use environment variables for credentials, etc (see new [Testing](#Testing) section below).

We are using these libraries: [node-imap](https://github.com/mscdex/node-imap), [mailparser](https://github.com/andris9/mailparser).

Heavily inspired by [mail-listener2](https://github.com/chirag04/mail-listener2) and [mail-listener5](https://github.com/Pranav-Dakshina/mail-listener2).

NOTE: This version is designed to work with & tested on NodeJS v 10.15.2 LTS, the most recent LTS version as at March 2019. It might not work on older versions of Node.

## Use

Install

`npm install mail-listener5`


JavaScript Code:


```javascript

var MailListener = require("mail-listener4");

var mailListener = new MailListener({
  username: "imap-username",
  password: "imap-password",
  host: "imap-host",
  port: 993, // imap port
  tls: true,
  connTimeout: 10000, // Default by node-imap
  authTimeout: 5000, // Default by node-imap,
  debug: console.log, // Or your custom function with only one incoming argument. Default: null
  tlsOptions: { rejectUnauthorized: false },
  mailbox: "INBOX", // mailbox to monitor
  searchFilter: ["ALL"], // the search filter being used after an IDLE notification has been retrieved
  markSeen: true, // all fetched email willbe marked as seen and not fetched next time
  fetchUnreadOnStart: true, // use it only if you want to get all unread email on lib start. Default is `false`,
  mailParserOptions: {streamAttachments: true}, // options to be passed to mailParser lib.
  attachments: true, // download attachments as they are encountered to the project directory
  attachmentOptions: { directory: "attachments/" } // specify a download directory for attachments
});

mailListener.start(); // start listening

// stop listening
//mailListener.stop();

mailListener.on("server:connected", function(){
  console.log("imapConnected");
});

mailListener.on("mailbox", function(mailbox){
  console.log("Total number of mails: ", mailbox.messages.total); // this field in mailbox gives the total number of emails
});

mailListener.on("server:disconnected", function(){
  console.log("imapDisconnected");
});

mailListener.on("error", function(err){
  console.log(err);
});

mailListener.on("mail", function(mail, seqno, attributes){
  // do something with mail object including attachments
  console.log("emailParsed", mail);
  // mail processing code goes here
});

mailListener.on("attachment", function(attachment){
  console.log(attachment.path);
});

// it's possible to access imap object from node-imap library for performing additional actions. E.x.
mailListener.imap.move(:msguids, :mailboxes, function(){})

```

That's easy!

## Attachments
Attachments can be streamed or buffered. This feature is based on how [mailparser](https://github.com/andris9/mailparser#attachments) handles attachments.
Setting `attachments: true` will download attachments as buffer objects by default to the project directory.
A specific download directory may be specified by setting `attachmentOptions: { directory: "attachments/"}`.
Attachments may also be streamed using `attachmentOptions: { stream: "true"}`. The `"attachment"` event will be fired every time an attachment is encountered.
Refer to the [mailparser docs](https://github.com/andris9/mailparser#attachment-streaming) for specifics on how to stream attachments.

## Testing
A test script is available at test.js. Before using the test script, it is necessary to set the following environment variables:
  - IMAPUSER - IMAP account username.
  - IMAPPASS - IMAP account password.
  - IMAPHOST - IMAP server hostname (e.g. imap.example.com).

The test script assumes that the IMAP host supports TLS and that the port is the usual 993. These values can be changed in test.js if necessary.

To run the test script, simply execute:

```bash
export IMAPUSER='user@example.com' IMAPPASS='password' IMAPHOST='imap.example.com'; node test.js
```

## License

MIT
