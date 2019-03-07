/**@module mail-listener5
 * @author Matej Malicek <matej@malicek.co>
 * @version 1.0.0
 * @date 4 March 2019
 */

 // Require statements
var Imap = require('imap');
var EventEmitter = require('events').EventEmitter;
var MailParser = require('mailparser').MailParser;
var fs = require('fs');
var path = require('path');
var async = require('async');

class MailListener extends EventEmitter {
  constructor(options) {
    super();
    this.markSeen = !! options.markSeen;
    this.mailbox = options.mailbox || 'INBOX';
    if ('string' === typeof options.searchFilter) 
    {
      this.searchFilter = [options.searchFilter];
    } 
    else 
    {
      this.searchFilter = options.searchFilter || ['UNSEEN'];
    }
    this.fetchUnreadOnStart = !! options.fetchUnreadOnStart;
    this.mailParserOptions = options.mailParserOptions || {};
    if (options.attachments && options.attachmentOptions && options.attachmentOptions.stream) 
    {
      this.mailParserOptions.streamAttachments = true;
    }
    this.attachmentOptions = options.attachmentOptions || {};
    this.attachments = options.attachments || false;
    this.attachmentOptions.directory = (this.attachmentOptions.directory ? this.attachmentOptions.directory : '');
    this.imap = new Imap({
      xoauth2: options.xoauth2,
      user: options.username,
      password: options.password,
      host: options.host,
      port: options.port,
      tls: options.tls,
      tlsOptions: options.tlsOptions || {},
      connTimeout: options.connTimeout || null,
      authTimeout: options.authTimeout || null,
      debug: options.debug || null
    });
    this.imap.once('ready', this.imapReady.bind(this));
    this.imap.once('close', this.imapClose.bind(this));
    this.imap.on('error', this.imapError.bind(this));
  }

  start() {
    this.imap.connect();
  }

  stop() {
    this.imap.connect();
  }

  imapReady() {
    this.imap.openBox(this.mailbox, false, (error, mailbox) => {
      if (error)
      {
        this.emit('error', error);
      }
      else
      {
        this.emit('server:connected');
        this.emit('mailbox', mailbox);
        if (this.fetchUnreadOnStart)
        {
          this.parseUnread.call(this);
        }
        let listener = this.imapMail.bind(this);
        this.imap.on('mail', listener);
        this.imap.on('update', listener);
      }
    });
  }

  imapClose() {
    this.emit('server:disconnected');
  }

  imapError(error) {
    this.emit('error', error);
  }

  imapMail() {
    this.parseUnread.call(this);
  }

  parseUnread() {
    let self = this;
    self.imap.search(self.searchFilter, (error, results) => {
      if (error) 
      {
        self.emit('error', err);
      } 
      else if (results.length > 0) 
      {
        async.each(results, (result, callback) => {
          let f = self.imap.fetch(result, {
            bodies: '',
            markSeen: self.markSeen
          });
          f.on('message', (msg, seqno) => {
            let parser = new MailParser(self.mailParserOptions);
            let attributes = null;
            let emailData = '';
  
            parser.on('end', function(mail) {
              mail.email = emailBuffer.toString('utf-8');
              if (!self.mailParserOptions.streamAttachments && mail.attachments && self.attachments) 
              {
                async.each(mail.attachments, (attachment, callback) => {
                  fs.writeFile(`${self.attachmentOptions.directory}${attachment.generatedFileName}`, attachment.content, (error) => {
                    if(error) 
                    {
                      self.emit('error', error);
                      callback();
                    } 
                    else 
                    {
                      attachment.path = path.resolve(`${self.attachmentOptions.directory}${attachment.generatedFileName}`);
                      self.emit('attachment', attachment);
                      callback();
                    }
                  });
                }, (error) => {
                  self.emit('mail', mail, seqno, attributes);
                  callback();
                });
              }
              else
              {
                self.emit('mail', mail, seqno, attributes);
              }
            });
            parser.on('attachment', (attachment) => {
              self.emit('attachment', attachment);
            });
            msg.on('body', function(stream, info) {
              stream.setEncoding('');
              stream.on('data', function(chunk) {
                emailData += chunk;
              });
              stream.once('end', function() {
                parser.write(Buffer.from(emailData));
                parser.end();
              });
            });
            msg.on('attributes', function(attrs) {
              attributes = attrs;
            });
          });
          f.once('error', (error) => {
            self.emit('error', error);
          });
        }, (error) => {
          if (error) 
          {
            self.emit('error', error);
          }
        });
      }
    });
  }
};
module.exports.MailListener = MailListener;