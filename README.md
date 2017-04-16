# PolymerFirebaseCodelab

PolymerFirebaseCodelab polymerfire version

このリポジトリは、Google Code Labs の 
[Interacting with data using the <firebase-element>](https://codelabs.developers.google.com/codelabs/polymer-firebase/index.html)
の `4. Connect with Firebase` から `7. Using Google login` までの流れについて、現時点で動作するようにしたサンプルプログラムです。

## 4。Firebaseと接続する

いよいよ Firebase と連携します！

### Firebaseインスタンスの作成

1. https://www.firebase.com にアクセスしてください
1. アカウントを作成する。「無料で開始」をクリックして新しいアカウントを作成するか、「ログイン」をクリックしてGoogleアカウントを使用してログインすることができます。
1. ダッシュボードで、新しいFirebaseアプリを作成します。`プロジェクト名` を入力し、`国` を選択する必要があります。
![](4-firebase-create-app.png)
1. 新しく作成したプロジェクトをクリックすると、アプリのダッシュボードが開きます。

### 匿名ログインの許可

ひとまず、アプリケーションへの匿名ログインを許可します。
前の手順で作成した Firebaseインスタンスのダッシュボードを開き、`Authentication` から `ログイン方法` に移動して 匿名ログインを有効にします。

![](4-anonynimous-login.png)

### polymerfire-element を追加する

これで、Firebaseアプリケーションを自由に使用できます。
実際に使用するには、対応する polymerfire-element を追加する必要があります。
bower.jsonを開き、polymerfire-element を `dependencies` に追加します。
`dependencies` は後で次のようになります。

#### bower.json

```json
"dependencies": {
  "iron-elements": "PolymerElements/iron-elements#^1.0.0",
  "paper-elements": "PolymerElements/paper-elements#^1.0.1",
  "polymerfire": "firebase/polymerfire#^0.10.3"
}
```

その後、bower_components フォルダを右クリックし、[ Bower Install ]をクリックします。
Chrome Dev Editorは、すべての依存関係をダウンロードしてインストールします。

![](https://codelabs.developers.google.com/codelabs/polymer-firebase/img/img-7.png)

次のインポートを追加します。

#### index.html

```html
<link rel="import" href="bower_components/polymerfire/firebase-app.html">
<link rel="import" href="bower_components/polymerfire/firebase-auth.html">
<link rel="import" href="bower_components/polymerfire/firebase-document.html">
<link rel="import" href="bower_components/polymerfire/firebase-query.html">
```

Firebaseに接続するための変数を設定します。
Firebaseインスタンスのダッシュボードを開き、`Authentication` から `ウェブ設定` をクリックして表示された画面のとおり設定した
`<firebase-app>` エレメントを追加します。

![](4-web-settings.png)

```html
<firebase-app
  auth-domain="YOUR-FIREBASE-ID.firebaseapp.com"
  database-url="https://YOUR-FIREBASE-ID.firebaseio.com"
  api-key="YOUR-API-KEY"
  storage-bucket="YOUR-FIREBASE-ID.appspot.com"
  messaging-sender-id="YOUR-SENDER-ID">
</firebase-app>
```
必要に応じてURLを調整してください。

Firebase に匿名ログインできるように、app 変数宣言のすぐ下に次のコードを追加します。

#### main.js

```js
app.firebaseProvider = 'anonymous';
```

ユーザーを認証するには、`<firebase-auth>` 要素を使用します。
簡単にするために、ログインボタンを用意して、クリックされたらログインするようにします。

`<dom-repeat>` エレメントの下に追加します。

#### index.html

```html
<paper-button on-click="login">login</paper-button>
<firebase-auth
  provider="[[firebaseProvider]]"
  user="{{user}}"
  on-error="handleError"></firebase-auth>
```

`on-rerror` で認証プロセス中に発生したエラーを表示します。
ログインが成功すると、`user` にユーザー情報が入ります。
この変更を利用してFirebaseエレメントのデータを取得します。

ログインに必要な2つのスクリプトをファイルの最後に追加します。

#### main.js

```js
app.login = function() {
  var auth = document.querySelector('firebase-auth');
  if (!auth.signedIn) {
    auth.signInWithRedirect();
  }
};
app.handleError = function(event) {
  console.log(event);  
};
```

## 5。Firebaseに永続化する

認証が設定されたので、ユーザーの個人データストアにアクセスできます。
`user` の変更を検知して、該当するパスから `items` にデータを取得します。

#### index.html

```html
<firebase-query
  data="{{items}}"
  path="/user/[[user.uid]]"></firebase-query>
```

ログイン後にFirebaseのデータと同期しようとしているので、最初に追加したダミーデータを削除してください。
代わりにFirebaseとデータを同期するために `<firebase-document>`　エレメントを追加してください。

#### index.html

```html
<firebase-document
  data="{{data}}"></firebase-document>
```

Firebaseと `data` を使用して同期するように、3つのイベントハンドラを更新する必要があります。

#### main.js

```js
app.addEventListener('dom-change', function(event) {
  app.database = document.querySelector('firebase-document');
});

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
```

Dev Editorの再生ボタンをクリックして、Firebaseと連携していることを確認してください。
アイテムの追加、アイテムのチェック、アイテムの削除。その後、ページをリロードして、データが失われていないことを確認します。

## 6. ユーザーのデータを保護する

いまのところ作成した TODO リストは安全ではありません。
誰かがあなたの uid を知ったいたら、DevToolsを開いてデータにアクセスするだけです。
そこで、Firebaseの "Database - ルール" 機能はこの問題を解決します。
ユーザーのドキュメントへのアクセスをそのユーザーのみに制限するには、次の操作を行います。

1. Firebaseダッシュボードから `Database` 移動する
1. 「ルール」に進みます。
1. 次のようにルールを変更します。

#### セキュリティ＆ルール

```
{
    "rules": {
        "user": {
          "$uid": {
            ".read": "auth != null && auth.uid == $uid",
            ".write": "auth != null && auth.uid == $uid"
          }
        }
    }
}
```

このルールは、ユーザーが自分のデータを読み書きできることを保証します。
ログインした後で、DevToolsから `user` の `uid` を変更するとエラーになります。

## 7. Googleログインの使用

あなたのアプリは現在ブラウザインスタンスにリンクされているので（匿名ユーザーはローカルストレージに保存されます）、
ユーザーはリストを作成したマシンからTODOリストにしかアクセスできません。
これを変更するには、一貫性のあるuidを複数のデバイスから使用する必要があります。
これを達成するには、Googleログインを使用する方法があります。

### Googleログインの有効化

Firebaseダッシュボードから、「Authentication」に移動し、「ログイン方法」タブに移動し、Googleログインを有効にします。

![](7-google-login.png)

あなたのアプリは、今、Googleの資格情報を使用してログインすることができます。
残った最後の変更は、アプリにGoogle認証をサポートしていることを伝えることです。
次のように firebaseProvider 変数をgoogleへ変更します。

#### main.js

```js
app.firebaseProvider = 'google';
```

これは 本当に面白いです！
複数のブラウザを開き、Googleアカウントでログインしていない場合はログインし、TODOリストはすべてのブラウザで同期されていることを確認してください。
もう一度認証を確認したい場合は、シークレットウィンドウを開くこともできます。
