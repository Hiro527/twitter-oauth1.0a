# banana
- TwitterのOAuth1.0a認証を行い、認証情報を取得するやつです。
- 認証情報を取得した後は`console.log`するだけなので、コードを書き換えればいろいろできると思います。
- トークンのお漏らしにはお気をつけください。

# how-to-use
```bash
$ node index.js
```

# auth.json
`auth.json`に認証情報を保存する必要があります。<br>
ファイル形式は以下のとおりです。また、`callback.ip`, `callback.port`及び`callback.path`は任意の値に変更可能です。

```json:oauth.json
{
    "oauth_consumer_key": "API_KEY",
    "oauth_consumer_secret": "API_KEY_SECRET",
    "callback": {
        "ip": "localhost",
        "port": 30000,
        "path": "/oauth/callback"
    }
}
```