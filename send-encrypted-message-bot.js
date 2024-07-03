import crypto from 'crypto';
const TelegramBot = require('node-telegram-bot-api');

const sendMessage = async (message) => {
  const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

  const id = crypto.randomBytes(16).toString('hex');
  const telegramMessage = message;
  const base64EncodedKey = process.env.PUBLIC_KEY;
  const decodedKey = Buffer.from(base64EncodedKey, 'base64').toString('utf-8');

  // Generate a random symmetric key
  const symmetricKey = crypto.randomBytes(32); // 256 bits for AES

  // Encrypt the message with the symmetric key
  const iv = crypto.randomBytes(16); // Initialization vector for AES-256-CBC
  const cipher = crypto.createCipheriv('aes-256-cbc', symmetricKey, iv);
  const encryptedMessage = Buffer.concat([cipher.update(telegramMessage, 'utf-8'), cipher.final()]);

  // Convert the symmetric key to a base64-encoded string
  const encryptedSymmetricKey = crypto.publicEncrypt(
    {
      key: decodedKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    symmetricKey
  ).toString('base64');

  // Convert the encrypted message and encrypted symmetric key to base64-encoded strings
  const encryptedMessageBase64 = encryptedMessage.toString('base64');
  await bot.sendMessage(process.env.TELEGRAM_CHAT_ID, `${encryptedSymmetricKey};;${encryptedMessageBase64}`)
};

const main = async () => {
  const message = "lorem ipsum dolor sit amet"
  await sendMessage(message)
}

main()
