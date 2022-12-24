# gasBitbankSpotOrder
bitbankのAPIから通貨ペア(btc_jpy)の最新ティッカー情報(buy:現在の買い注文の最高値)を取得して指定価格分の指値注文するGoogle Apps Script(GAS)

## 前提条件
* bitbankに登録(口座開設)済、かつ口座に日本円が入金済であること。
* bitbankのAPIアクセスキーとアクセスシークレットを発行済であること。
* Googleアカウント取得済であること。

## 注意事項
* 本コードでは必ずしも期待されたデータを取得することは保証しません。
* 本コードを実行したこと、参考にしたことによって被るあらゆる損害について責任を負いかねますので自己責任でご利用ください。
* 本コードでは指値注文を行いますが、指定する価格は[最小注文数量](https://bitbank.cc/docs/pairs/)に依存します。指定する注文価格が計算により最小注文数量を下回る場合、注文量が指定する注文価格以下となることがありますのでご注意ください。
* 本コードはbitbankのAPI仕様([bitbank-api-docs](https://github.com/bitbankinc/bitbank-api-docs))に基づき実装しています。API仕様は変更される可能性がありますので、最新の情報を確認してご利用ください。
* 本コードは通貨ペアとして```btc_jpy```が対象です。**他の通貨ペアについては未確認**のためご注意ください。

## 仕様
* GASでbitbankのPublic APIとPrivate APIを使用して指定する通貨ペアの**HTTPリクエスト時点の最新のティッカー情報**(**buy:現在の買い注文の最高値**)を取得して指定価格分を指値注文を実行します。
* 注文方法として関数の個別実行、または定期実行します。

### 最新ティッカー情報の取得

| 関数名 | 説明 | 
| -- | -- | 
|```getBuyPrice(pair)```|[Public API](https://github.com/bitbankinc/bitbank-api-docs/blob/master/public-api_JP.md)を利用してTicker情報から<br>オープンな情報を取得する関数。|

※本コードでは現在の買い注文の最高値(buy))を取得します。

### 指値注文

| 関数名 | 説明 | 
| -- | -- | 
| setOrderData(pair) | `getBuyPrice(pair)`で取得した最新ティッカー情報(buy)から<br>`config.gs`で定義(後述)する`ADJUST_ORDER_NUM`と<br>`ADJUST_PRICE`のパラメータと[PrivateAPI](https://github.com/bitbankinc/bitbank-api-docs/blob/master/rest-api_JP.md)利用して<br>指定価格分の価格と注文量を設定する関数。 |

※注文情報はParameters(requestBody)仕様に従い作成します。

### 認証 (spotOrderCoin()で実行)

| メソッド名 | 説明 | 
| -- | -- | 
| Utilities.computeHmacSha256Signature(concatenated_string, API_SECRET) | [bitbank APIの認証手順](https://github.com/bitbankinc/bitbank-api-docs/blob/master/rest-api_JP.md#%E8%AA%8D%E8%A8%BC)に従い認証情報を作成します。署名作成用の文字列として「`nonce`、`payload`」 を連結して`concatenated_string`を作成し、文字列を **HMAC-SHA256 形式**でAPI_SECRETを使用して署名(`signature`を作成します。 | 

| 変数名 | 説明 | 
| -- | -- | 
| nonce      | UNIXタイムスタンプ(整数値) ※リクエスト毎に数を増加 | 
| payload    | 注文情報(パラメータ)をJson文字列にしたリクエストボディ | 
| API_SECRET | APIキーページで取得したアクセスシークレット | 
| signature  | 署名(※```computeHmacSha256Signature()```ではバイト文字列を返すためGASで使用するため16進数化します。) | 

### POSTリクエスト (spotOrderCoin()で実行)

| メソッド名 | 説明 |
| -- | -- | 
| UrlFetchApp.fetch(url, option) | 引数urlに取得する URL(```PRIVATE_ENDPOINT_URL + '/user/spot/order'```)を指定してPOSTリクエストして指値注文する関数|

### パラメータ指定
パラメータとして```method```,```headers```,```payload```を```option```に設定して**POSTリクエスト**を送信します。

| パラメータ | 説明 |
| -- | -- | 
| method | HTTPリクエストメソッド(```post```)
| header |HTTPリクエストヘッダー(```Content-Type ```,```ACCESS-KEY```,```ACCESS-NONCE```,```ACCESS-SIGNATURE```を付与したもの)|

| header情報 | 変数名 |
| -- | -- | 
|```Content-Type``` | ```application/json```|
|```ACCESS-KEY``` | ```API_KEY```|
|```ACCESS-NONCE``` | ```nonce```|
|```ACCESS-SIGNATURE``` | ```signature```|

### エラー処理
POSTレスポンスの結果からエラーコードを参照し**エラー処理**(**エラーログ出力とGmailによるエラーメール送信**)をします。

### 指値注文の実行形式
※ 実際に指値注文を実行する際は**設定と使い方**を参照してください。

| 処理 | 説明 |
| -- | -- | 
|関数の手動実行|プロジェクトページから```spotOrderCoin()```を手動実行することで指値注文を実行します。|
|定期実行設定|**プロジェクトを定期実行設定により**関数を実行することで指値注文を実行します。|
|POSTリクエスト|Webアプリ(URL)に対してPOSTリクエストすることで指値注文を実行します。|

## 設定と使い方
### API設定
config.gs(```変数名```)に以下の設定情報を定義してください。 

| 設定情報 | 変数名 |
| -- | -- | 
|Public APIのエンドポイントURL|```PUBLIC_ENDPOINT_URL```|
|Private APIエンドポイントURL|```PRIVATE_ENDPOINT_URL```|
|APIキー|```API_KEY```|
|APIシークレットキー|```API_SEACRET```|

APIシークレットキーAPIの取得は[公式ドキュメント](https://support.bitbank.cc/hc/ja/articles/360036234574-API%E3%82%AD%E3%83%BC%E3%81%AE%E7%99%BA%E8%A1%8C%E3%81%A8API%E4%BB%95%E6%A7%98%E3%81%AE%E7%A2%BA%E8%AA%8D%E6%96%B9%E6%B3%95)を参照してください。

### 注文情報設定

| 注文情報 | 変数名 |
| -- | -- | 
|通貨ペア|```PAIR```('btc_jpy'で固定)|
|希望購入価格|```ORDER_NUM```|
|注文調整価格|```ADJUST_PRICE```(0以上で指定)|
|取引時の小数点以下の桁数|```DECIMAL_DIGITS_BTC```(8固定)|

※注文調整価格は注文時に即約定しないように定数分引いた金額を基準に計算します。定数は0とすれば現在の買い注文の最高値で注文数量を計算するため価格調整が不要な場合は0を設定してください。

### メール設定

| 設定情報 | 変数名 |説明|
| -- | -- | -- |
| メールアドレス|```emailAddress```|エラー発生時に設定したメール宛にエラー内容を送信します。|
|プロジェクト名|```projectName```|メール本文に記載されるプロジェクト名です。|

### アクセス許可
* ```spotOrderCoin()```を実行してスクリプトからGoogleアカウントへのアクセスを許可する **(※初回実行時※2022/12/4現在)**
  * Gmail のすべてのメールの閲覧、作成、送信、完全な削除
  * 外部サービスへの接続

* プロジェクトを定期実行設定 **(※定期実行を有効にする場合)**
  * GASの定期実行設定をすることで定期的な指値注文を行うことができます。
  * 「編集」→「現在のプロジェクトのトリガー」から設定。
  * Googleアカウントへのアクセスを許可する(※初回実行時※2022/12/4現在)
    * 外部サービスへの接続
    * 自分がいないときにこのアプリケーションを実行できるようにする

* Gmailへのアクセス許可設定
  * Gmailのすべてのメールの閲覧、作成、送信、完全な削除
### POSTリクエスト設定
#### アクセス元

| 設定情報 | 変数名 |説明|
| -- | -- | -- |
| HTTPメソッド||POSTを指定する|
|URL|-|[ウェブアプリURLの設定](https://github.com/7rikazhexde/gasBitbankSpotOrder/blob/5d30adc1cb311a00ddb98ffb8c2c091e93e202a6/README.md#L118)で取得したURL|
|Header|application/json|Content-Type|
|Body|sendData|アクセス元が送信する情報|

sendDataについて
  ```
  "sendData": {
  	"uniqueKey": "[アクセス元識別情報]", //文字列
  	"orderPrice": [希望価格] //数字
    }
  ```

#### アクセス先(GAS)
#### 注意事項
* **ウェブアプリURL**は不用意な公開は避け、セキュリティに十分配慮して運用してください。
* **アクセス元識別情報**はユーザーが個別に設定し、セキュリティに十分配慮して管理してください。
#### 設定
* ウェブアプリURLの設定
  * デプロイ → 新しいデプロイ
  * 種類の選択　→ ウェブアプリ
  * 次のユーザーとして実行: 自分(メールアドレス)
  * アクセスできるユーザー: 利用状況に合わせて設定してください。
* ソースコード
  * GASからbitbank APIでPOSTリクエストを実行許可するためにアクセス元を識別する情報を定義します。
  * ```doPost()関数```ではアクセス元が送信する識別情報と希望注文価格の情報とPOSTリクエストの実行許可を判断するリスト(```API_REQUEST_PERMISSION_LIST```)と比較して、実行可能なアクセス元を判断した場合のみ指値注文を実行します。
  * ```config.gs``` / ```API_REQUEST_PERMISSION_LIST``` に```['アクセス元識別情報1','アクセス元識別情報2',...]```の形式で定義してください。
