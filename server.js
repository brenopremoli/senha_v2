const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

let ultimaSenhaGeral = 0;
let historicoGlobal = []; // Armazena as últimas chamadas para rechamar

io.on('connection', (socket) => {
    console.log('Dispositivo conectado.');

    // Sincroniza o estado atual com o novo dispositivo
    socket.emit('sincronizar-inicial', {
        senha: ultimaSenhaGeral,
        historico: historicoGlobal
    });

    socket.on('chamar-senha', (dados) => {
        if (dados.tipo === 'chamada') {
            ultimaSenhaGeral = parseInt(dados.senha);
            
            // Adiciona ao histórico global compartilhado
            historicoGlobal.unshift({ senha: dados.senha, guiche: dados.guiche });
            if (historicoGlobal.length > 3) historicoGlobal.pop();
        }
        
        // Atualiza o painel e todos os controles
        io.emit('nova-senha-painel', dados);
        io.emit('atualizar-lista-rechamar', historicoGlobal);
    });

    socket.on('resetar-geral', () => {
        ultimaSenhaGeral = 0;
        historicoGlobal = [];
        io.emit('resetar-sistema-completo');
    });
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n=== SISTEMA DE SENHAS INICIADO ===`);
    console.log(`Aceda em: http://localhost:${PORT}/painel.html`);    
    console.log(`Aceda em: http://localhost:3000/controle.html`);

});