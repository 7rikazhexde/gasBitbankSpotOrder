/**
 * エラー内容をメール(Gmail)を送信する関数
 * @param {String} message 本文（エラー内容）
 * @todo optionsは必要であれば追加してください。
 * @see sendEmail(recipient, subject, body)
 * @link https://developers.google.com/apps-script/reference/gmail/gmail-app#sendemailrecipient,-subject,-body
 */
function sendErrorMail(message) {
  const recipient = emailAddress;
  const subject = '【GAS】エラー通知メール';

  const body = '【GAS】エラー通知メール\n\n'
             + 'プロジェクト名: ' + projectName + '\n'
             + 'エラー内容:\n'
             + message;

  GmailApp.sendEmail(recipient, subject, body);
  retutn;
}
  
/**
 * メール(Gmail)を送信する関数
 * @param {String} message 本文
 * @todo optionsは必要であれば追加してください。
 * @see sendEmail(recipient, subject, body)
 * @link https://developers.google.com/apps-script/reference/gmail/gmail-app#sendemailrecipient,-subject,-body
 */
function sendMail(message) {
  const recipient = emailAddress;
  const subject = '【GAS】指値注文成功通知';

  const body = '【GAS】指値注文成功通知メール\n\n'
             + 'プロジェクト名: ' + projectName + '\n'
             + '注文内容:\n'
             + message;

  GmailApp.sendEmail(recipient, subject, body);
  return;
}
  
/**
 * メール(Gmail)を送信するテスト用関数
 * @param {String} message 本文
 * @desc テスト用関数であり定期実行では使用しません。
 */
function testSendGmail(){
  sendErrorMail('test');
}