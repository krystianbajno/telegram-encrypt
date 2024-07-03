# telegram-encrypt
Your message is AES-256 CBC encrypted using a randomly generated symmetric key, and the symmetric key is encrypted with RSA public key. The encrypted message is stored alongside encrypted key. I decrypt the symmetric key using my offline private key, and next decrypt the message using the obtained symmetric key. This technique is called envelope encryption. Exposing the algorithm does not hurt the encryption. As long as the private key is not known, the system is secure. In case the private key is lost, previous messages become unreadable.
