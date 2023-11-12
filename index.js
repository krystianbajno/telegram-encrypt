const express = require('express');
var fs = require('fs');
const crypto = require('crypto');
require('dotenv').config()
var cors = require('cors')
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()

const app = express();
const port = 4000;
app.use(cors())
const privateKey = fs.readFileSync("./private_key.pem")

app.post('/decrypt', jsonParser, (req, res) => {
  console.log(req.body)
  const { encryptedData } = req.body;

  console.log('Received encrypted data:', encryptedData);

  // Split the encryptedData into encryptedSymmetricKey and encryptedMessage
  const [encryptedSymmetricKey, encryptedMessageBase64] = encryptedData.split(';;');

  console.log('Encrypted Symmetric Key:', encryptedSymmetricKey);
  console.log('Encrypted Message (Base64):', encryptedMessageBase64);

  // Convert base64-encoded strings to Buffers
  const encryptedSymmetricKeyBuffer = Buffer.from(encryptedSymmetricKey, 'base64');
  const encryptedMessageBuffer = Buffer.from(encryptedMessageBase64, 'base64');

  console.log('Decrypted Private Key:', privateKey);

  // Decrypt the symmetric key using the private key
  const decryptedSymmetricKey = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    encryptedSymmetricKeyBuffer
  );

  console.log('Decrypted Symmetric Key:', decryptedSymmetricKey.toString('hex'));

  // Extract the IV from the encrypted message (first 16 bytes)
  const iv = encryptedMessageBuffer.slice(0, 16);

  console.log('IV:', iv.toString('hex'));

  // Decrypt the message using the decrypted symmetric key and IV
  const decipher = crypto.createDecipheriv('aes-256-cbc', decryptedSymmetricKey, iv);

  // Update the decipher with the rest of the encrypted message
  const decryptedMessage = Buffer.concat([decipher.update(encryptedMessageBuffer.slice(16)), decipher.final()]);

  console.log('Decrypted Message:', decryptedMessage.toString('utf-8'));

  // Send the decrypted message to the client
  res.json({ decryptedMessage: decryptedMessage.toString('utf-8') });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});