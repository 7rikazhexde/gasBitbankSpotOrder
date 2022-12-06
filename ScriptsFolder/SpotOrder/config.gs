/**
 * Public API設定
 * @type {String} PUBLIC_ENDPOINT_URL エンドポイント URL
 * @see API概要
 * @link https://github.com/bitbankinc/bitbank-api-docs/blob/master/public-api_JP.md
 */
const PUBLIC_ENDPOINT_URL = 'https://public.bitbank.cc';

/**
 * Private REST API設定
 * @type {String} PRIVATE_ENDPOINT_URL エンドポイント URL
 * @see API概要
 * @link https://github.com/bitbankinc/bitbank-api-docs/blob/master/rest-api_JP.md
 * @type {String} API_KEY APIキーページで取得したAPIキー。
 * @type {String} API_SECRET APIキーページで取得したシークレットキー。
 * @see 認証
 * @link https://github.com/bitbankinc/bitbank-api-docs/blob/master/rest-api_JP.md
 */
const PRIVATE_ENDPOINT_URL = 'https://api.bitbank.cc/v1';
const API_KEY = '[APIキーページで取得したAPIキー]';
const API_SECRET = '[APIキーページで取得したシークレット]';

/**
 * Private REST API設定 / 注文情報 / 新規注文を行う
 * @type {String} PAIR 通貨ペア
 * @type {Number} ORDER_NUM 希望購入価格
 * @type {Number} ADJUST_PRICE 指値取引のために最新取引価格から調整するための価格(0以上で指定)
 * @type {Number} DECIMAL_DIGITS_BTC BTC取引時の小数点以下の桁数
 * @see 新規注文を行う
 * @link https://github.com/bitbankinc/bitbank-api-docs/blob/master/rest-api_JP.md
 */
const PAIR = 'btc_jpy';
var ORDER_NUM = 500;
const ADJUST_PRICE = 0;
const DECIMAL_DIGITS_BTC = 8;

/**
 * Mail設定用変数
 * @param {String} emailAddress Gmailのメールアドレス
 * @todo ユーザーはメールアドレスを指定すること（※本スクリプトでは送信元と宛先のメールアドレスは共用とします。変更する場合はユーザー自身で変更してください。）
 */
const emailAddress = '[Gmailのメールアドレス]';

/**
 * プロジェクト名用変数
 * @param {String} projectName
 * @todo ユーザーは作成したスクリプトのプロジェクト名を設定すること
 */
const projectName = '[スクリプトのプロジェクト名]';

/**
 * GASからbitbank APIでPOSTリクエストを実行許可する管理リスト
 * @type { {[key: String]: String} } [[アクセス元識別情報1],[アクセス元識別情報2],...]の形式で定義してください。
 * @todo 本リストはdoPost()関数で使用します。詳細を参照し、POSTリクエストを使用する場合は定義してください。
 * @todo アクセス元識別情報はユーザーが個別に設定してください。セキュリティには配慮して管理してください。
 */
const API_REQUEST_PERMISSION_LIST = [
    'アクセス元識別情報1',
    'アクセス元識別情報2'
];

/**
 * POSTリクエストを実行許可を判断するリストを検索するテスト関数
 * @desc テスト用関数であり定期実行では使用しません。
 */
function testCheckList(){
  var test1 = 'アクセス元識別情報1';
  if(test1 in API_REQUEST_PERMISSION_LIST){
    console.log('OK');
  }
}