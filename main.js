(function(document) {
  'use strict';

  var app = document.querySelector('#app');
  app.addEventListener('dom-change', function(event) {
    app.database = document.querySelector('firebase-document');
  });  
  app.login = function() {
    var auth = document.querySelector('firebase-auth');
    if (!auth.signedIn) {
      auth.signInWithRedirect();
    }
  };

  app.addItem = function(event) {
    event.preventDefault(); // Don't send the form!
    app.data = {
      done: false,
      text: app.newItemValue
    };
    
    return app.database.save('/user/' + app.user.uid).then(function() {
      app.database.reset();
      app.newItemValue = '';
    }.bind(this));
  };
  
  app.toggleItem = function(event) {
    app.data = {
      done: !event.model.item.done
    };
    return app.database.save('/user/' + app.user.uid + '/' + event.model.item.$key).then(function() {
      app.database.reset();
    }.bind(this));
    
  };
  app.deleteItem = function(event) {
    app.database.path = '/user/' + app.user.uid + '/' + event.model.item.$key;
    return app.database.destroy();
  };

  app.handleError = function(event) {
    console.log(event);  
  };
  
  app.firebaseProvider = 'google';
})(document);
