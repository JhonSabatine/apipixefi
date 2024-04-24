if (process.env.NODE_ENV !== 'production') {
 require('dotenv').config()
}

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { url } = require('inspector');
const express = require('express');

const cert = fs.readFileSync(
    path.resolve(__dirname, `../certs/${process.env.EFI_CERT}`)
);

const agent = new https.Agent({
    pfx: cert,
    passphrase: ''
});

const credentials = Buffer.from(`${process.env.EFI_CLIENT_ID}:${process.env.EFI_CLIENT_SECRET}`
).toString('base64');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'src/views');
app.get('/', (req, res) => {
    axios({
        method: 'POST',
        url: `${process.env.EFI_ENDPOINT}/oauth/token`,
        headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/json'
        },
        httpsAgent: agent,
        data: {
            grant_type: 'client_credentials'
        }
    }).then((response) => {
        const accessToken = response.data?.access_token;
    
        const reqEF = axios.create({
            baseURL: process.env.EFI_ENDPOINT,
            httpsAgent: agent,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            }
        });
    
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
        
    
        reqEF.post('/v2/cob', dataCob,).then((response) => res.send(response.data));
        
    });


});

app.listen(8000, () => {
    console.log('running');
})





