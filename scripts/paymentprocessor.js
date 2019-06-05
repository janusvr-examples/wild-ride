room.registerElement('paymentprocessor', {
  state: 'inactive',
  title: 'Send Payment',
  description: false,
  confirmations: 2,
  amount: 0,

  onpaymentbegin: null,
  onpaymentreceive: null,
  onpaymentprogress: null,
  onpaymentconfirm: null,

  createChildren: function() {
    this.popup = this.createObject('paragraph', {
      text: '<div class="wrapper"><h1>' + this.title + '</h1><p>Please wait...</p></div>',
      css: '.wrapper { text-align: center; font-size: 1em; background: rgba(0,0,0,.8); border: 2px solid orange; border-radius: 10px; padding: 1em; color: white; } h1 { font-size: 1.5em; margin: 0; color: orange; } .amount { } .hash { display: block; color: orange; } .payments { font-size: .8em; } .unconfirmed { background: rgba(255,255,0,.2); } .confirmed { background: rgba(0,255,0,.2); } .qrcode { width: 192px; height: 192px; display: block; margin: 0 auto; } p { margin: 0; } .message { margin-top: .5em; }',
      lighting: false,
      back_alpha: 0,
      pos: V(0, 1, 0.5),
      scale: V(.4),
    });
    this.startSession();
  },
  startSession: function() {
    var session = new WebSocket('wss://btc.metacade.com/session');
    session.addEventListener('message', this.onMessage);
    session.addEventListener('open', function() {
      this.state = 'connected';
      session.send(JSON.stringify({cmd: 'invoice', amount: this.amount, confirmations: this.confirmations}));
    }.bind(this));
    this.dispatchEvent({type: 'paymentbegin', data: this.amount});
  },
  onMessage: function(msg) {
    var json = JSON.parse(msg.data);
    var text = '<div class="wrapper"><h1>' + this.title + '</h1>';
    if (this.description) {
      text += '<p class="description">' + this.description + '</p>';
    }
    //var img = this.qrcode._el.childNodes[1];
    var bitcoinurl = (json.invoice ? 'bitcoin:' + json.invoice.hash + '?amount=' + json.invoice.amount : false);

    if (this.qrcodeurl != bitcoinurl) {
      this.qrcodeurl = bitcoinurl;
/*
      this.qrcode.clear();
      this.qrcode.makeCode("WHAT THE FUCK");
*/
      var qr = new QRious({
        value: bitcoinurl,
        size: 192
      });
/*
      img.addEventListener('load', function() {
console.log('done it!', img.src);
        this.onMessage({data: JSON.stringify({type: 'invoice', invoice: json.invoice})});
      }.bind(this));
console.log('image!', img.src);
*/
      this.qrcode = qr.toDataURL();
    }
    var qrcodetext = '';
    if (this.qrcode) {
      qrcodetext = '<img class="qrcode" src="' + this.qrcode + '" />';
    }
    if (json.type == 'invoice') {
      this.state = 'waiting';
      var invoice = json.invoice;
      text += '<p class="message">Awaiting payment of <strong class="amount">' + invoice.amount + '</strong> BTC</p>' + qrcodetext + '<strong class="hash">' + invoice.hash + '</strong></p>';
      console.log('bitcoin url:', bitcoinurl);
    } else if (json.type == 'update') {
      var total = 0;
      var history = json.history;
      var invoice = json.invoice;
      var totalRequired = 0,
          totalConfirmed = 0;
      if (history.items.length == 0) {
        this.state = 'waiting';
        text += '<p class="message">Awaiting payment of <strong class="amount">' + invoice.amount + '</strong> BTC</p>' + qrcodetext + '<strong class="hash">' + invoice.hash + '</strong></p>';
      } else {
        var paymenttext = '<p>Transactions:<table class="payments"><tr><th>Amount</th><th>Confirmations</th></tr>';
        for (var i = 0; i < history.items.length; i++) {
          var item = history.items[i];
          totalRequired += this.confirmations;
          totalConfirmed += item.confirmations;
          total += item.satoshis;
          paymenttext += '<tr class="' + (item.confirmations >= this.confirmations ? 'confirmed' : 'unconfirmed') + '"><td>' + (+(item.satoshis / 1e8).toFixed(8)) + '</td><td>' + item.confirmations + '</td></tr>';
        }
        paymenttext += '</table></p>';

        text += '<p class="message">Payment of <strong class="amount">' + invoice.amount + '</strong> BTC received<strong class="hash">Awaiting confirmation (' + totalConfirmed + ' / ' + totalRequired + ')</strong></p>';
        text += paymenttext;
        if (this.state == 'waiting') {
          this.state = 'confirming';
          this.dispatchEvent({type: 'paymentreceive', data: json.invoice});
        }
        if (totalConfirmed != this.confirmations) {
          this.dispatchEvent({type: 'paymentprogress', data: json.invoice});
          this.confirmations = totalConfirmed;
        }
      }
      
      //this.popup.text = '<div class="wrapper"><h1>Change Machine</h1><p>Received <strong>' + (+(total / 1e8).toFixed(8)) + '</strong> BTC!</p></div>';
    } else if (json.type == 'complete') {
      text += '<p class="message">Payment accepted!</p>';
      this.state = 'confirmed';
      this.dispatchEvent({type: 'paymentconfirm', data: "cool"});
    }
    text += '</div>';
    this.popup.text = text;
  }

});
