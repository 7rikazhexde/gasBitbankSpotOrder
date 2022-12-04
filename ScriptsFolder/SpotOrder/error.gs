/**
 * エラーログ出力用関数
 * @param {Error} error Errorインスタンス
 * @return {string} エラー名とスタックトレース
 */
function printError(error){
  return "[Error     ] "  + error.name + "\n" + 
         "[StackTrace]\n" + error.stack;
}

/**
 * エラーメッセージ取得関数
 * @param {Object} json_dict JSON文字列データ
 * @desc レスポンスデータのエラーコードからエラーメッセージを取得する。
 * @desc エラーコードが存在しない場合は不明なエラーとして処理する。
 * @desc エラーコード内容をメールで送信する
 * @see ERROR_CODES
 * @return {Boolean} is_error エラーがあるかどうか判別する変数(エラーの場合はtrueを返す)
 */
function errorParser(json_dict){
  // 変数初期化
  var is_error = false;
  var message = "";
  
  // エラーコード判定処理
  if (json_dict['success'] == 1){
    return is_error;
  } else {
    code = json_dict['data']['code'];
    contents = ERROR_CODES[code]
    if(code in ERROR_CODES){
      is_error = true;
      message = '　エラーコード: ' + code + "\n" + '　内容: ' + contents;
    } else {
      is_error = true;
      message = '不明なエラーです。サポートにお問い合わせ下さい'
    }
    // エラー内容をログに出力してメールを送信する
    console.error(message);
    sendErrorMail(message);
    return is_error;
  }
}

/**
 * エラーメッセージ用連装配列
 * @desc <注意事項>エラーコードは下記bitbank-api-docsのリンクを基に定義しています。エラーコードは必ず最新版の情報を参照してください。
 * @type { {[key: String]: String} }
 * @see エラーコード一覧 (2022-09-29)
 * @link https://github.com/bitbankinc/bitbank-api-docs/blob/master/errors_JP.md
 */
ERROR_CODES = {
    // システムエラー/予期せぬエラー
    '10000': 'URLが存在しません',
    '10001': 'システムエラーが発生しました。サポートにお問い合わせ下さい',
    '10002': '不正なJSON形式です。送信内容をご確認下さい',
    '10003': 'システムエラーが発生しました。サポートにお問い合わせ下さい',
    '10005': 'タイムアウトエラーが発生しました。しばらく間をおいて再度実行して下さい',
    '10007': 'メンテナンスのため一時サービスを停止しております。 今しばらくお待ちください。',
    '10008': 'ただいまサーバが大変混み合っています。時間をおいてから再度リクエストしてください。',
    '10009': 'アクセス頻度が高すぎます。時間をおいてから再度リクエストしてください。',
    // 認証エラー
    '20001': 'API認証に失敗しました',
    '20002': 'APIキーが不正です',
    '20003': 'APIキーが存在しません',
    '20004': 'API Nonceが存在しません',
    '20005': 'APIシグネチャが存在しません',
    '20011': '２段階認証に失敗しました',
    '20014': 'SMS認証に失敗しました',
    '20018': 'ログインして下さい （API呼び出し時に /v1/ を付け忘れている時に起こります）',
    '20023': '２段階認証コードを入力して下さい',
    '20024': 'SMS認証コードを入力して下さい',
    '20025': '２段階認証コードとSMS認証コードを入力して下さい',
    '20026': '一定回数以上２段階認証に失敗したためロックしました。60秒待ってから再度お試しください',
    // 必須パラメータバリデーションエラー
    '30001': '注文数量を指定して下さい',
    '30006': '注文IDを指定して下さい',
    '30007': '注文ID配列を指定して下さい',
    '30009': '銘柄を指定して下さい',
    '30012': '注文価格を指定して下さい',
    '30013': '売買どちらかを指定して下さい',
    '30015': '注文タイプを指定して下さい',
    '30016': 'アセット名を指定して下さい',
    '30019': 'uuidを指定して下さい',
    '30039': '出金額を指定して下さい',
    '30101': 'トリガー価格を指定してください',
    '30103': '送金先種別を指定して下さい',
    '30104': '送金先名を入力して下さい',
    '30105': 'VASPを指定して下さい',
    '30106': '受取人種別を指定して下さい',
    '30107': '受取人姓を入力して下さい',
    '30108': '受取人名を入力して下さい',
    '30109': '受取人カナ姓を入力して下さい',
    '30110': '受取人カナ名を入力して下さい',
    '30111': '受取法人名を入力して下さい',
    '30112': '受取法人カナ名を入力して下さい',
    '30113': '法人格を入力して下さい',
    '30114': '法人格表示位置を入力して下さい',
    '30115': '書類のアップロードが必要です',
    '30116': '住所(郵便番号)を入力して下さい',
    '30117': '住所(都道府県)を入力して下さい',
    '30118': '住所(市区町村)を入力して下さい',
    '30119': '住所(番地)を入力して下さい',
    '30120': '住所(建物・アパート名)を入力して下さい',
    '30121': '出金目的を指定して下さい',
    // バリデーションエラー
    '40001': '注文数量が不正でず',
    '40006': 'count値が不正です',
    '40007': '終了時期が不正です',
    '40008': 'end_id値が不正です',
    '40009': 'from_id値が不正です',
    '40013': '注文IDが不正です',
    '40014': '注文ID配列が不正です',
    '40015': '指定された注文が多すぎます',
    '40017': '銘柄名が不正です',
    '40020': '注文価格が不正です',
    '40021': '売買区分が不正です',
    '40022': '開始時期が不正です',
    '40024': '注文タイプが不正です',
    '40025': 'アセット名が不正です',
    '40028': 'uuidが不正です',
    '40048': '出金額が不正です',
    '40112': 'トリガー価格が不正です',
    '40113': 'post_only値が不正です',
    '40114': 'Post Onlyはご指定の注文タイプでは指定できません',
    '40116': '送金先種別が不正です',
    '40117': '送金先名が不正です',
    '40118': 'VASPが不正です',
    '40119': '受取人種別が不正です',
    '40120': '受取人姓が不正です',
    '40121': '受取人名が不正です',
    '40122': '受取人カナ姓が不正です',
    '40123': '受取人カナ名が不正です',
    '40124': '受取法人名が不正です',
    '40125': '受取法人カナ名が不正です',
    '40126': '法人格が不正です',
    '40127': '法人格表示位置が不正です',
    // DBに問い合わせた結果データ異常
    '50003': '現在、このアカウントはご指定の操作を実行できない状態となっております。サポートにお問い合わせ下さい',
    '50004': '現在、このアカウントは仮登録の状態となっております。アカウント登録完了後、再度お試し下さい',
    '50005': '現在、このアカウントはロックされております。サポートにお問い合わせ下さい',
    '50006': '現在、このアカウントはロックされております。サポートにお問い合わせ下さい',
    '50008': 'ユーザの本人確認が完了していません',
    '50009': 'ご指定の注文は存在しません',
    '50010': 'ご指定の注文はキャンセルできません',
    '50011': 'APIが見つかりません',
    '50026': 'ご指定の注文は既にキャンセル済みです',
    '50027': 'ご指定の注文は既に約定済みです',
    '50033': 'このアドレスへの出金は追加項目の入力が必要です',
    '50034': 'VASPが見つかりません',
    '50035': '法人情報が登録されていません',
    '50037': '直前の入金内容を確認中のため、一時的に出金を制限しております。数分後に再度実行して下さい。',
    // 値が不正
    '60001': '保有数量が不足しています',
    '60002': '成行買い注文の数量上限を上回っています',
    '60003': '指定した数量が制限を超えています',
    '60004': '指定した数量がしきい値を下回っています',
    '60005': '指定した価格が上限を上回っています',
    '60006': '指定した価格が下限を下回っています',
    '60011': '同時発注制限件数(30件)を上回っています',
    '60016': '指定したトリガー価格が上限を上回っています',
    // システムステータスによりリクエスト停止状態
    '70001': 'システムエラーが発生しました。サポートにお問い合わせ下さい',
    '70002': 'システムエラーが発生しました。サポートにお問い合わせ下さい',
    '70003': 'システムエラーが発生しました。サポートにお問い合わせ下さい',
    '70004': '現在取引停止中のため、注文を承ることができません',
    '70005': '現在買い注文停止中のため、注文を承ることができません',
    '70006': '現在売り注文停止中のため、注文を承ることができません',
    '70009': 'ただいま成行注文を一時的に制限しています。指値注文をご利用ください',
    '70010': 'ただいまシステム負荷が高まっているため、最小注文数量を一時的に引き上げています',
    '70011': 'ただいまリクエストが混雑してます。しばらく時間を空けてから再度リクエストをお願いします',
    '70012': 'システムエラーが発生しました。サポートにお問い合わせ下さい',
    '70013': 'ただいまシステム負荷が高まっているため、注文および注文キャンセルを一時的に制限しています',
    '70014': 'ただいまシステム負荷が高まっているため、出金申請および出金申請キャンセルを一時的に制限しています',
    '70015': 'ただいまシステム負荷が高まっているため、貸出申請および貸出申請キャンセルを一時的に制限しています',
    '70016': '貸出申請および貸出申請キャンセル停止中のため、リクエストを承ることができません',
    '70017': '指定された銘柄は注文停止中のため、リクエストを承ることができません',
    '70018': '指定された銘柄は注文およびキャンセル停止中のため、リクエストを承ることができません',
    '70019': '注文はキャンセル中です',
    '70020': '現在成行注文停止中のため、注文を承ることができません',
    '70021': '指値注文価格が乖離率を超過しています',
    '70022': '現在逆指値指値注文停止中のため、注文を承ることができません',
    '70023': '現在逆指値成行注文停止中のため、注文を承ることができません'
}

/**
 * エラーメッセージを取得するテスト用関数
 * @desc テスト用関数であり定期実行では使用しません。
 */
function testErrorParser(){
  // 異常系(エラーコードが存在しない)
  //var hash = { success: 0, data: { code: 400001 } };
  // 正常系(エラーコード受信)
  var hash = { success: 0, data: { code: 40001 } };
  // 正常系(ティッカー情報受信)
  /* var hash = 	{ success: 1,
  data: 
   { sell: '2287501',
     buy: '2287500',
     open: '2306556',
     high: '2312496',
     low: '2281115',
     last: '2287501',
     vol: '104.1748',
     timestamp: 1670073531096 } }
    */
  console.log(errorParser(hash));
}