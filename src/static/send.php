<?php
declare(strict_types=1);

// === НАСТРОЙКИ: поменяйте адрес получателя заявок ===
const MAIL_TO = 'million101@ya.ru';
const MAIL_FROM = 'info@osnova-prava.com';
const FROM_NAME = 'Сайт';
const SITE_NAME = 'osnova-prava.com';

header('Content-Type: application/json; charset=utf-8');

function respond(bool $ok, string $message = '', int $code = 200): void
{
    http_response_code($code);
    echo json_encode(['ok' => $ok, 'error' => $ok ? '' : $message], JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    respond(false, 'Метод не поддерживается', 405);
}

// Honeypot: скрытое поле заполняют только боты
if (!empty($_POST['website'])) {
    respond(true);
}

$field = static function (string $key, int $max): string {
    $value = str_replace(["\r", "\n"], ' ', trim((string)($_POST[$key] ?? '')));
    return mb_substr($value, 0, $max);
};

$name = $field('name', 100);
$phone = $field('phone', 30);
$question = $field('question', 2000);
$formType = $field('form_type', 20);

if ($name === '') {
    respond(false, 'Укажите имя', 422);
}
if (!preg_match('/^[0-9+()\-\s]{6,30}$/u', $phone)) {
    respond(false, 'Укажите корректный телефон', 422);
}
if (empty($_POST['consent'])) {
    respond(false, 'Необходимо согласие на обработку персональных данных', 422);
}

$topic = $formType === 'callback' ? 'Заказ обратного звонка' : 'Заявка на консультацию';
$subject = mb_encode_mimeheader('Заявка с сайта ' . SITE_NAME);

$lines = [
    'Тип заявки: ' . $topic,
    'Имя: ' . $name,
    'Телефон: ' . $phone,
];
if ($question !== '') {
    $lines[] = 'Вопрос: ' . $question;
}
$lines[] = 'Дата: ' . date('d.m.Y H:i');
$body = implode("\n", $lines);

$headers = implode("\r\n", [
    'From: ' . mb_encode_mimeheader(FROM_NAME) . ' <' . MAIL_FROM . '>',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . PHP_VERSION,
]);

$sent = mail(MAIL_TO, $subject, $body, $headers);

if ($sent) {
    respond(true);
}

respond(false, 'Не удалось отправить заявку. Позвоните нам: 8-800-555-55-55', 500);
