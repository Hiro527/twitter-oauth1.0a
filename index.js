const express = require('express');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');
const axios = require('axios').default;

const auth = require('./auth.json');

const OAUTH_CALLBACK = `http://${auth.callback.ip}:${auth.callback.port}${auth.callback.path}`;

let appAuthInfo = {};

const oauth = OAuth({
    consumer: {
        key: auth.oauth_consumer_key,
        secret: auth.oauth_consumer_secret,
    },
    signature_method: 'HMAC-SHA1',
    hash_function(base_string, key) {
        return crypto
            .createHmac('sha1', key)
            .update(base_string)
            .digest('base64');
    },
});

// express
const app = express();

app.get(auth.callback.path, (req, res) => {
    res.send(
        '認証が完了しました。このページを閉じて、コンソールに表示されている内容をご確認ください。'
    );

    console.log('ユーザー認証中…');

    const oauth_token = req.query.oauth_token;
    const oauth_verifier = req.query.oauth_verifier;
    const authTokenUrl = `https://api.twitter.com/oauth/access_token?oauth_token=${oauth_token}&oauth_verifier=${oauth_verifier}`;

    axios({
        method: 'post',
        url: authTokenUrl,
        headers: oauth.toHeader(
            oauth.authorize({
                url: authTokenUrl,
                method: 'post',
            })
        ),
    })
        .then((res) => {
            data = res.data;
            data = data.split('&');
            parsed = {};
            Object.values(data).forEach((v) => {
                s = v.split('=');
                parsed[s[0]] = s[1];
            });
            console.log(
                `Twitterアカウント(@${
                    parsed.screen_name
                })と連携しました。認証情報は以下のとおりです。\n${JSON.stringify(
                    parsed,
                    null,
                    '    '
                )}`
            );
            console.log(
                '認証情報はあなたのアカウントにアクセスするための機密情報です。第三者へ漏洩するとアカウントを乗っ取られるなどのとても大きなリスクが生じるため、厳重に取り扱ってください。'
            );
            console.log('終了するにはCtrl+Cを押してください…');
        })
        .catch(console.error);
});

app.listen(auth.callback.port);

// Get oauth_token
console.log('アプリケーション認証中…');

const reqTokenUrl = `https://api.twitter.com/oauth/request_token?oauth_callback=${encodeURIComponent(
    OAUTH_CALLBACK
)}`;

axios({
    method: 'post',
    url: reqTokenUrl,
    headers: oauth.toHeader(
        oauth.authorize({
            url: reqTokenUrl,
            method: 'POST',
        })
    ),
})
    .then((res) => {
        data = res.data;
        data = data.split('&');
        Object.values(data).forEach((v) => {
            s = v.split('=');
            appAuthInfo[s[0]] = s[1];
        });
        if (appAuthInfo.oauth_callback_confirmed !== 'true') {
            console.error(
                'アプリケーション認証に失敗しました: oauth_callbackが不正です。'
            );
            return;
        }
        console.log(
            `次に、Twitterアカウントとあなたのシステムを連携するための認証を行います。以下のURLを開いて認証を続行してください。\n\nhttps://api.twitter.com/oauth/authorize?oauth_token=${appAuthInfo.oauth_token}\n`
        );
        return;
    })
    .catch(console.error);
