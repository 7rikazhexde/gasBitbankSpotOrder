/**
 * bitbankのAPIからpairで指定したコインの最新ティッカー情報(buy:現在の買い注文の最高値)を取得する関数
 * @param {String} pair ペア情報
 * @return {Array} [is_get_buy_price,buy_price]という形式で返す。
 * @type {Boolean} is_get_buy_price 配列要素[0]に格納されるティッカー情報の取得判断情報
 * @type {Numver} buy_price 配列要素[1]に格納されるティッカー情報
 * @see 【GAS】bitbank(ビットバンク)のAPIをGoogle Apps Scriptで利用する ビットコインの最新取引価格を取得してみる
 * @link https://qiita.com/kaketechjapan/items/d6ae9a0630e949fcc517
 * @see Ticker
 * @link https://github.com/bitbankinc/bitbank-api-docs/blob/master/public-api_JP.md#ticker
 */
function getBuyPrice(pair){
  // 変数初期化
  // ティッカー情報の取得判断情報
  var is_get_buy_price = false;
  // 現在の買い注文の最高値
  var buy_price = 0;

  // ティッカー情報を取得
  try {
    var response = JSON.parse( UrlFetchApp.fetch(PUBLIC_ENDPOINT_URL + '/' + pair + '/ticker') );
  } catch(e) {
    const errorMessage = printError(e);
    // エラー内容をログに出力してメールを送信する
    console.error(errorMessage);
    sendErrorMail(errorMessage);
    // ティッカー情報の取得判断情報と現在の買い注文の最高値を配列で返す。
    return [is_get_buy_price, buy_price];
  }

  // レスポンスがエラーでなければログを出力する
  if (errorParser(response) != true){
    // ティッカー情報の取得判断情報を取得済みに更新
    is_get_buy_price = true;
    console.log('btc_jpyのティッカー情報取得成功')
    console.log(response);
  }

  // レスポンスから現在の買い注文の最高値を取得
  buy_price = response.data.buy;
  // ティッカー情報の取得判断情報と現在の買い注文の最高値を配列で返す。
  return [is_get_buy_price, buy_price];
}
  
/**
 * getBuyPrice()関数で取得したpairで指定したコインの最新ティッカー情報(buy:現在の買い注文の最高値)から価格と注文量を作成する関数
 * @desc 注文量はティッカー情報とADJUST_ORDER_NUMから計算して設定する
 * @todo ユーザーは ADJUST_ORDER_NUM と ADJUST_PRICE を config.gs で設定すること
 * @param {String} pair ペア情報
 * @return {Array} [is_set_order_data, order_price, order_num]という形式で返す。
 * @type {Boolean} is_set_order_data 配列要素[0]に格納される注文データ準備状況
 * @type {Number} order_price 配列要素[1]に格納される価格
 * @type {Number} order_num 配列要素[2]に格納される注文量
 */
function setOrderData(pair){
  // 変数初期化
  var is_set_order_data = false;
  var order_price = 0;
  var order_num = 0;
  // 価格と注文量を取得
  const buy_price_list = getBuyPrice(pair);

  // レスポンスデータを取得できていなければ初期値を返す
  if (buy_price_list[0] != true){
    // 注文データ準備状況,価格,注文量を配列で返す。
    return [is_set_order_data, order_price, order_num];
  } else {
    // 価格更新
    var buy_price = buy_price_list[1];
  }

  try {
    // 注文量更新
    // 例)ADJUST_ORDER_NUMが1000の場合、1000円分のbtc_jpyの注文量を計算する。
    var order_num = (ADJUST_ORDER_NUM / (buy_price - ADJUST_PRICE)).toFixed(DECIMAL_DIGITS_BTC);
  } catch(e) {
    const errorMessage = printError(e);
    // エラー内容をログに出力してメールを送信する
    console.error(errorMessage);
    sendErrorMail(errorMessage);
    // 注文データ準備状況,価格,注文量を配列で返す。
    return [is_set_order_data, order_price, order_num];;  
  }
  // 価格更新
  // 価格を現在の買い注文の最高値から下げたい場合はADJUST_PRICE(デフォルトは0)分引く。
  order_price = buy_price - ADJUST_PRICE;

  // 注文データ作成完了
  is_set_order_data = true;
  // 注文データ準備状況,価格,注文量を配列で返す。
  return [is_set_order_data, order_price, order_num];
}

/**
 * setOrderData()でbitbankのAPIからbtc_jpyの最新ティッカー情報を取得する関数
 * @desc テスト用関数であり定期実行時の注文には使用しません。
 */
function testGetOrderData(){
  const pair = PAIR;
  const order_date_list = setOrderData(pair);
  console.log('order_date_list= ',order_date_list);
  if (order_date_list[0] != false){
    const order_price = String(order_date_list[1]);
    const order_num = String(order_date_list[2]);
    console.log('order_price =',order_price);
    console.log('order_num =',order_num);
  }
  return;
}
  
/**
 * btc_jpyの指値注文する関数
 * @desc ペア情報はbtc_jpyで価格と注文量はsetOrderData()関数で計算してリクエストボディに設定する。戻り値はなし。
 * @todo ユーザーは API_KEY と API_SECRET を config.gs で設定すること
 * @see <参考>【GAS】bitbank(ビットバンク)のAPIをGoogle Apps Scriptで利用する 自分の資産情報を取得してみる
 * @link https://qiita.com/kaketechjapan/items/da6696146adcdb631ab9
 * @see 新規注文を行う
 * @link https://github.com/bitbankinc/bitbank-api-docs/blob/master/rest-api_JP.md
 */
function spotOrderCoin(){
  // 変数初期化
  var order_price = 0;
  var order_num = 0;

  // 注文データ作成
  const pair = PAIR;
  const order_date_list = setOrderData(pair);

  // 注文データをセットできているかチェックする
  if (order_date_list[0] == true){
    // 注文データをセットOK
    // 数字から文字列に変換する
    order_price = String(order_date_list[1]);
    order_num = String(order_date_list[2]);
  } else {
    // 注文データセットNG
    // 注文せずに終了する
    errorMessage = 'リクエストデータに問題がある可能性があります。\n' + 'gasのログとconfig.gsを正しく設定できているか確認して下さい。\n' + '処理を終了します。'
    console.error(errorMessage);
    return;
  }

  // UNIXタイムスタンプからナンスを作成
  const date = new Date();
  const nonce = Math.floor( (date.getTime() / 1000) ).toString();

  // パラメータをリクエストボディに設定
  const body = {
    "pair": pair, //通貨ペア
    "price": order_price, //価格
    "amount": order_num, //注文量
    "side": "buy", // 買い注文
    "type": "limit" // 指値
  };

  // bodyの内容をJSON文字列に変換
  const payload = JSON.stringify(body);

  // 連結文字列を作成
  const concatenated_string = `${nonce}${payload}`;

  // 著名を作成
  const signature_base = Utilities.computeHmacSha256Signature(concatenated_string, API_SECRET);
  const signature = signature_base.reduce( function(str, chr) {
    chr = (chr < 0 ? chr + 256 : chr).toString(16);
    return str + (chr.length == 1 ? '0' : '') + chr;
  }, '');

  // ヘッダー情報を設定
  const headers = {
    "Content-Type": "application/json",
    "ACCESS-KEY": API_KEY,
    "ACCESS-NONCE": nonce,
    "ACCESS-SIGNATURE": signature
  };

  // payloadをoptionsに設定
  const options = {
    "method": "POST",
    "headers": headers,
    "payload": payload
  };

  // ビットコインを買い注文
  const response = JSON.parse( UrlFetchApp.fetch(PRIVATE_ENDPOINT_URL + '/user/spot/order', options) );

  // レスポンスがエラーでなければログを出力する
  if (errorParser(response) != true){
    console.log('btc_jpyの指値注文成功');
    console.log(response);
    // レスポンスをJSON文字列に変換してメール送信する
    sendMail(JSON.stringify(response));
  }
  return;
}