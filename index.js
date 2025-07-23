const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Body:', JSON.stringify(req.body, null, 2));
    }
    next();
});

// Rota para teste
app.get('/', (req, res) => {
    res.json({
        message: 'API Webhook Santander está funcionando!',
        timestamp: new Date().toISOString(),
        endpoints: {
            webhook: '/webhook',
            test: '/test'
        }
    });
});

// Rota do webhook principal do Santander
app.post('/webhook', (req, res) => {
    console.log('\nWEBHOOK RECEBIDO DO SANTANDER:');
    console.log('='.repeat(50));
    console.log('Timestamp:', new Date().toISOString());
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Payload:', JSON.stringify(req.body, null, 2));
    console.log('='.repeat(50));
    
    // Processar dados do pagamento
    const webhookData = req.body;
    
    // Exemplo de estrutura esperada do Santander
    if (webhookData) {
        console.log('DADOS PROCESSADOS:');
        console.log('- ID da transação:', webhookData.transactionId || 'N/A');
        console.log('- Status:', webhookData.status || 'N/A');
        console.log('- Valor:', webhookData.amount || 'N/A');
        console.log('- Cliente:', webhookData.customer || 'N/A');
    }
    
    // Resposta obrigatória para confirmar recebimento
    res.status(200).json({
        success: true,
        message: 'Webhook recebido com sucesso',
        receivedAt: new Date().toISOString(),
        dataReceived: !!webhookData
    });
});

// Rota alternativa caso o Santander use outro endpoint
app.post('/webhook/santander', (req, res) => {
    console.log('\nWEBHOOK SANTANDER (endpoint alternativo):');
    console.log('Payload:', JSON.stringify(req.body, null, 2));
    
    res.status(200).json({
        success: true,
        message: 'Webhook Santander recebido',
        timestamp: new Date().toISOString()
    });
});

// Rota para testar no Postman
app.post('/test', (req, res) => {
    console.log('\nTESTE DO POSTMAN:');
    console.log('Body recebido:', JSON.stringify(req.body, null, 2));
    
    res.json({
        success: true,
        message: 'Teste realizado com sucesso!',
        dataReceived: req.body,
        timestamp: new Date().toISOString()
    });
});

// Rota GET para verificar logs
app.get('/status', (req, res) => {
    res.json({
        status: 'API Online',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        memory: process.memoryUsage(),
        env: process.env.NODE_ENV || 'development'
    });
});

// Middleware de tratamento de erro
app.use((err, req, res, next) => {
    console.error('Erro na API:', err);
    res.status(500).json({
        error: 'Erro interno do servidor',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint não encontrado',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`API Webhook rodando na porta ${PORT}`);
    console.log(`URL local: http://localhost:${PORT}`);
    console.log(`Endpoint webhook: http://localhost:${PORT}/webhook`);
    console.log(`Endpoint teste: http://localhost:${PORT}/test`);
});

module.exports = app;