var Imap = require('imap');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var MailParser = require("mailparser").MailParser;

module.exports = MailListener;

function MailListener(options) {
  this.markSeen = !!options.markSeen;
  this.mailbox = options.mailbox || "INBOX";
  this.searchFilter = options.searchFilter || "UNSEEN";
  this.fetchUnreadOnStart = !!options.fetchUnreadOnStart;
  this.mailParserOptions = options.mailParserOptions || {},
  this.imap = new Imap({
    xoauth2: options.xoauth2,
    user: options.username,
    password: options.password,
    host: options.host,
    port: options.port,
    tls: options.tls,
    tlsOptions: options.tlsOptions || {}
  });
  
  this.imap.once('ready', imapReady.bind(this));
  this.imap.once('close', imapClose.bind(this));
  this.imap.on('error', imapError.bind(this));
}

util.inherits(MailListener, EventEmitter);

MailListener.prototype.start = function() {
  this.imap.connect();
};

MailListener.prototype.stop = function() {
  this.imap.end();
};

function imapReady() {
  var self = this;
  this.imap.openBox(this.mailbox, false, function(err, mailbox) {
    if(err) {
      self.emit('error',err);
    } else {
      self.emit('server:connected');
      if(self.fetchUnreadOnStart) {
        parseUnread.call(self);
      }
      self.imap.on('mail', imapMail.bind(self));
    }
  });
}

function imapClose() {
  this.emit('server:disconnected');
}

function imapError(err) {
  this.emit('error',err);
}

function imapMail() {
  parseUnread.call(this);
}

function parseUnread() {
  var self = this;
  this.imap.search([ self.searchFilter ], function(err, results) {
    if (err) {
      self.emit('error',err);
    } else if(results.length > 0) {
      var f = self.imap.fetch(results, { bodies: '', markSeen: self.markSeen });
      f.on('message', function(msg, seqno) {
        var parser = new MailParser(self.mailParserOptions);
        parser.on("end", function(mail) {
          self.emit('mail',mail);
        });
        msg.on('body', function(stream, info) {
          stream.pipe(parser);
        });
      });
      f.once('error', function(err) {
        self.emit('error',err);
      });
    }
  });
}
