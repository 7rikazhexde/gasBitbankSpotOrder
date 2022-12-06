/**
 * Webアプリ(URL)に対してPOSTリクエストが送られた時に指定価格で指値注文する関数
 * @desc 関数はアクセス元が送信する識別情報と希望注文価格の情報とOSTリクエストを実行許可を判断するリスト(API_REQUEST_PERMISSION_LIST)と比較する
 * @desc 実行可能なアクセス元の場合は指値注文を実行するspotOrderCoin()関数を実行する
 * @return {String} ContentServiceのTextoutputオブジェクト(JSON)　正常時：APIから受信したレスポンスデータ 異常時：エラーメッセージ
 * @todo POSTリクエストを利用する場合はAPI_REQUEST_PERMISSION_LISTを定義すること
 */
function doPost(e) {
  // POSTされたデータを取得
  const params = JSON.parse(e.postData.getDataAsString());
  // アクセス元の情報
  const uniqueKey = params.sendData.uniqueKey;
  // 希望注文価格
  const orderPrice = params.sendData.orderPrice;
  // POSTデータで更新
  ORDER_NUM = orderPrice;
  // 結果の格納先
  var result = {};
  // Textoutputオブジェクトを生成
  var output = ContentService.createTextOutput();
  //Mime TypeをJSONに設定
  output.setMimeType(ContentService.MimeType.JSON);
  
  // POSTリクエストの実行許可リストに存在するか確認
  if(API_REQUEST_PERMISSION_LIST.includes(uniqueKey)){
    // POSTリクエストの希望注文価格ベースで指値注文する
    result = spotOrderCoin();
  }
  // 許可リストになければエラーメッセージを返す
  else {
    result = { 
      success: 0,
      data: { 
        message: 'APIのアクセス許可がありません。アクセス元の情報を確認してください。'
      } 
    };
  }

  // 返すデータ（上記のresult）をセットする
  output.setContent(JSON.stringify(result));
  // リクエスト元に返す
  return output;
}