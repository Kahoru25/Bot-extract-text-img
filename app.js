

const { createBot, createProvider, createFlow, addKeyword, EVENTS, addAnswer, addAction } = require('@bot-whatsapp/bot');
const QRPortalWeb = require('@bot-whatsapp/portal');
const BaileysProvider = require('@bot-whatsapp/provider/baileys');
const MockAdapter = require('@bot-whatsapp/database/mock');
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const fs = require("fs");
const { createWorker } = require ('tesseract.js');

let textExtract
const flowImage = addKeyword(EVENTS.MEDIA).addAction(async (ctx, { flowDynamic }) => {
  try {
    const buffer = await downloadMediaMessage(ctx, "buffer");
    await fs.writeFileSync("./images/image.jpeg", buffer);// --> en esta linea especificas en donde se alojara la imagen, en este ejemplo en la raiz del proyecto
    (async () => {
      const worker = await createWorker('spa');
      const ret = await worker.recognize('./images/image.jpeg');
      console.log(ret.data.text);
      textExtract = ret.data.text
      await worker.terminate();
      await flowDynamic(`Aqui esta tu texto extraido \n\n ${textExtract}`)
    })();
  } catch (err) {
    console.log(err);
  }
});



const main = async () => {
    const adapterDB = new MockAdapter();
    const adapterFlow = createFlow([flowImage]);
    const adapterProvider = createProvider(BaileysProvider);

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    });
};

main();
