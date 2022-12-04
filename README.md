# gasBitbankSpotOrder
bitbankのAPIから通貨ペア(btc_jpy)の最新ティッカー情報(buy:現在の買い注文の最高値)を取得して指定価格分の指値注文するGoogle Apps Script(GAS)

## 前提条件
* bitbankに登録(口座開設)済、かつ口座に日本円が入金済であること。
* bitbankのAPIアクセスキーとアクセスシークレットを発行済であること。
* Googleアカウント取得済であること。

## 注意事項
* 本コードでは必ずしも期待されたデータを取得することは保証しません。
* 本コードを実行したこと、参考にしたことによって被るあらゆる損害について責任を負いかねますので自己責任でご利用ください。
* 本コードでは指定する注文価格による指値注文を行いますが、[最小注文数量](https://bitbank.cc/docs/pairs/)に依存します。指定する注文価格が計算により最小注文数量を下回る場合、注文量が指定する注文価格以下となることがありますのでご注意ください。
* 本コードはbitbankのAPI仕様([bitbank-api-docs](https://github.com/bitbankinc/bitbank-api-docs))に基づき実装しています。API仕様は変更される可能性がありますので、最新の情報は確認してご利用ください。
* 本コードは通貨ペアとして```btc_jpy```が対象です。**他の通貨ペアについては未確認**のためご注意ください。

## 仕様
* GASでbitbankのPublic APIとPrivate APIを使用して指定する通貨ペアの**HTTPリクエスト時点の最新のティッカー情報**(**buy:現在の買い注文の最高値**)を取得して指定価格分を指値注文を実行します。
* 注文方法として関数の個別実行、または定期実行（積立）行います。

* 最新ティッカー情報(buy:現在の買い注文の最高値)の取得
  * 関数名：```getBuyPrice(pair)```
  * Public APIを利用してTicker情報からオープンな情報を取得します。
    [Public API公式ドキュメント(日本語)/Ticker](https://github.com/bitbankinc/bitbank-api-docs/blob/master/public-api_JP.md)

* 指値注文
  * Private API利用して注文を行います。
    * [PrivateAPI公式ドキュメント(日本語)/新規注文を行う](https://github.com/bitbankinc/bitbank-api-docs/blob/master/rest-api_JP.md)
    * 注文情報はParameters(requestBody)仕様に従い作成します。
  * 注文量設定
    * 関数名:```setOrderData(pair)```
    * ```getBuyPrice(pair)```で取得した最新ティッカー情報(buy:現在の買い注文の最高値)から```config.gs```で定義(後述)する```ADJUST_ORDER_NUM```と```ADJUST_PRICE```のパラメータに基づき指定価格分の　**価格**と**注文量**を設定します。
  * 認証
    * 関数名:```spotOrderCoin() / Utilities.computeHmacSha256Signature(concatenated_string, API_SECRET)```
    * [認証](https://github.com/bitbankinc/bitbank-api-docs/blob/master/rest-api_JP.md#%E8%AA%8D%E8%A8%BC)に従い認証情報を作成します。
    * 署名作成用の文字列として「```nonce```、```payload```」 を連結して```concatenated_string```を作成し、文字列を **HMAC-SHA256 形式**で```API_SECRET```を使用して署名(```signature```)を作成します。
      * ```nonce``` : UNIXタイムスタンプ(整数値) ※リクエスト毎に数を増加
      * ```payload```: 注文情報(パラメータ)をJson文字列にしたリクエストボディ
      * ```API_SECRET```: APIキーページで取得したアクセスシークレット
      * ```signature```: 署名(※```computeHmacSha256Signature()```ではバイト文字列を返すためGASで使用するため16進数化します。)
  * 指値注文
    * 関数名:```spotOrderCoin() / UrlFetchApp.fetch(url, option)```
      * url : 取得する URL(```PRIVATE_ENDPOINT_URL + '/user/spot/order'```)
    * パラメータとして```method```,```headers```,```payload```を```option```に設定して**POSTリクエスト**を送信します。
      * method : HTTPリクエストメソッド(```post```)
      * header : HTTPリクエストヘッダー(```Content-Type ```,```ACCESS-KEY```,```ACCESS-NONCE```,```ACCESS-SIGNATURE```を付与したもの)
        * ```Content-Type``` : ```application/json```
        * ```ACCESS-KEY``` : ```API_KEY```
        * ```ACCESS-NONCE``` : ```nonce```
        * ```ACCESS-SIGNATURE``` : ```signature```
  * エラー処理
    * POSTレスポンスの結果からエラーコードを参照し**エラー処理**(**エラーログ出力とGmailによるエラーメール送信**)をします。


## 設定と使い方
### API設定
config.gs(```変数名```)に以下の設定情報を定義してください。  
* Public APIのエンドポイントURL: ```PUBLIC_ENDPOINT_URL```
* Private APIエンドポイントURL: ```PRIVATE_ENDPOINT_URL```
* APIキー: ```API_KEY```
* APIシークレットキー: ```API_SEACRET```
  * APIの取得は[公式ドキュメント](https://support.bitbank.cc/hc/ja/articles/360036234574-API%E3%82%AD%E3%83%BC%E3%81%AE%E7%99%BA%E8%A1%8C%E3%81%A8API%E4%BB%95%E6%A7%98%E3%81%AE%E7%A2%BA%E8%AA%8D%E6%96%B9%E6%B3%95)を参照してください。

### 注文情報設定
* 通貨ペア: ```PAIR```('btc_jpy'で固定)
* 希望購入価格: ```ADJUST_ORDER_NUM```
* 指値取引のために最新取引価格から調整するための価格: ```ADJUST_PRICE```(0以上で指定)
* 取引時の小数点以下の桁数 : ```DECIMAL_DIGITS_BTC```(8固定)

### メール設定
* メールアドレス: ```emailAddress```
  * エラー発生時に設定したメール宛にエラー内容を送信します。
* プロジェクト名: ```projectName```
  * メール本文に記載されるプロジェクト名です。

### アクセス許可
* ```spotOrderCoin()```を実行してスクリプトからGoogleアカウントへのアクセスを許可する **(※初回実行時※2022/12/4現在)**
  * Googleスプレッドシー卜の参照、編集、作成、削除
  * 外部サービスへの接続
  * 自分がいないときにこのアプリケーションを実行できるようにする

* プロジェクトを定期実行設定 **(※定期実行を有効にする場合)**
  * GASの定期実行設定をすることで定期的な指値注文を行うことができます。
  * 「編集」→「現在のプロジェクトのトリガー」から設定。
  * Googleアカウントへのアクセスを許可する(※初回実行時※2022/12/4現在)
    * 外部サービスへの接続
    * 自分がいないときにこのアプリケーションを実行できるようにする

* Gmailへのアクセス許可設定
  * Gmailのすべてのメールの閲覧、作成、送信、完全な削除