# Overview

Mail-listener5 library for node.js. Get notification when new email arrived to inbox or when message metadata (e.g. flags) changes externally. Uses IMAP protocol.

## Version Notes
THIS PACKAGE IS STILL UNDERGOING MORE THOROUGH TESTING AND IMPROVEMENT. Expect further commits as functionality is added. :-)

This package has several improvements and fixes over the mail-listener2 & mail-listener4. Most of the improvements are designed to improve security & usability, plus avoid deprecation warnings. The previous mail-listener packages used a now-deprecated version of MailParser and unsafe buffer constructors (see change notes below).

This package uses the simpleParser function in NodeMailer. This parser is easier to implement & provides a Mail object from which any needed attributes can be extracted. However, it is more resource-intensive when it comes to larger emails, as attachments are not handled as streams, but rather are buffered in memory. In a future version, I plan to reintroduce the ability to stream attachments directly (rather than buffering them) so that larger attachments can be processed with fewer resources.

Change notes:

  - Updating dependencies to newer versions, with security enhancements, etc. The previous mail-listeners all used now-deprecated versions of dependencies, many of which posed security problems as they used unsafe Buffer constructors (e.g. new Buffer() - see https://nodejs.org/en/docs/guides/buffer-constructor-deprecation/).
  - Updating code to use ES6 classes. The previous version used util.inherits(), which is now discouraged (see https://nodejs.org/dist/latest-v10.x/docs/api/util.html#util_util_inherits_constructor_superconstructor).
  - Updating code to use lexical variable declarations where appropriate.
  - Updating code to use ES6 arrow functions within methods where appropriate.
  - Updating test.js to use environment variables for credentials, etc (see new [Testing](#Testing) section below).

We are using these libraries: [node-imap](https://github.com/mscdex/node-imap), [mailparser](https://github.com/andris9/mailparser).

Heavily inspired by [mail-listener2](https://github.com/chirag04/mail-listener2) and [mail-listener5](https://github.com/Pranav-Dakshina/mail-listener2).

NOTE: This version is designed to work with & tested on NodeJS v 10.15.2 LTS, the most recent LTS version as at March 2019. It might not work on older versions of Node.

## Planned Future Improvements
Whilst this package is confirmed to work, the ability to stream attachments (present in the older versions of mail-listener) has been taken out, mainly because the MailParser library has changed significantly & a substantial amount of refactoring is required in order to allow the safe streaming of attachments (which may contain untrusted content). 

A future version will reintroduce this capability once the refactoring is complete. That version will allow attachments to be streamed directly to functions. At present, attachments are either saved to a file for later processing (if that option is selected) or an 'attachment' event is emitted, which contains a Buffer with the attachment content. This Buffer can then be processed as needed.

## Use

Install

`npm install mail-listener5`


JavaScript Code:


```javascript

var MailListener = require("mail-listener5");

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

mailListener.on("headers", function(headers, seqno){
  // do something with mail headers
});

mailListener.on("body", function(body, seqno){
  // do something with mail body
})

mailListener.on("attachment", function(attachment, path, seqno){
  // do something with attachment
});

mailListener.on("mail", function(mail, seqno) {
  // do something with the whole email as a single object
})

// it's possible to access imap object from node-imap library for performing additional actions. E.x.
mailListener.imap.move(:msguids, :mailboxes, function(){})

```

That's easy!

## Attachments
Attachments in this version are buffered. This feature is based on how [mailparser](https://github.com/andris9/mailparser#attachments)'s simpleParser function handles attachments.
Setting `attachments: true` will download attachments as buffer objects by default to the project directory.
A specific download directory may be specified by setting `attachmentOptions: { directory: "attachments/"}`.
The `"attachment"` event will be fired every time an attachment is encountered.

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
