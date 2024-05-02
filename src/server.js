if (process.env.NODE_ENV !== 'production') {
 require('dotenv').config()
}

const express = require('express');
const bodyParser = require('body-parser');
const efiRequest = require('./apis/efi');

const app = express();

app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.set('views', 'src/views');

const reqEFAlready = efiRequest({
    clientID: process.env.EFI_CLIENT_ID,
    clientSecret: process.env.EFI_CLIENT_SECRET
});

app.get('/', async (req, res) => {
    const reqEF = await reqEFAlready;
    const dataCob = {
        calendario: {
            expiracao: 3600
            },
            devedor: {
            cpf: '12345678909',
            nome: 'Francisco da Silva'
            },
            valor: {
            original: '100.00'
            },
            chave: '71cdf9ba-c695-4e3c-b010-abb521a3f1be',
            solicitacaoPagador: 'Cobrança dos serviços prestados'
        };   


    const cobResponse = await reqEF.post('/v2/cob', dataCob,);

    const qrcodeResponse = await reqEF.get(`/v2/loc/${cobResponse.data.loc.id}/qrcode`);
    
    res.render('qrcode', {qrcodeimage: qrcodeResponse.data.imagemQrcode})


    });

app.get('/cobrancas', async(req, res) => {
    const reqEF = await reqEFAlready;

    const cobResponse = await reqEF.get('/v2/cob?inicio=2024-04-01T16:00:35Z&fim=2024-05-02T20:10:00Z');
    
    res.send(cobResponse.data);

});   

app.post('/webhook(/pix)?', (req, res) => {
    console.log(req.body);
    res.send('200');
});


app.listen(8000, () => {
    console.log('running');
})





