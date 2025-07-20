const { makeWASocket, useSingleFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const express = require('express');
const fs = require('fs');

const { state, saveState } = useSingleFileAuthState('./auth.json');

const app = express();
const port = 3000;

let pairingCode = '';

async function connectBot() {
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    browser: ['Pasiya-MD', 'Chrome', '110'],
  });

  if (!sock.authState.creds.registered) {
    const code = await sock.requestPairingCode('94784548818'); // <-- PUT YOUR NUMBER
    pairingCode = code;
    console.log('Pairing code:', code);
  }

  sock.ev.on('creds.update', saveState);
}

connectBot();

app.get('/', (req, res) => {
  if (pairingCode) {
    res.send(`<h2>Scan this Pairing Code on WhatsApp:</h2><h1>${pairingCode}</h1>`);
  } else {
    res.send('<p>Loading Pairing Code...</p>');
  }
});

app.listen(port, () => {
  console.log(`Pair code site running at http://localhost:${port}`);
});
