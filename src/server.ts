// Importa o framework Express — é ele quem cria e gerencia o servidor web da aplicação
import express from "express";
// Importa o middleware CORS (Cross-Origin Resource Sharing)
// O CORS controla quais origens (domínios) têm permissão para acessar a API
// Sem ele, o navegador bloquearia requisições vindas de um domínio diferente do servidor
// Ex: front-end em localhost:3000 tentando acessar API em localhost:3333 seria bloqueado sem CORS
import cors from "cors";
// Importa o router criado no arquivo routes.ts — contém todos os endpoints da aplicação
import { router } from "./routes.js";




/**
 * Cria servidor express
 */
// Cria a instância do servidor Express e armazena na variável "server"
// É este objeto que recebe todas as configurações e sobe o servidor HTTP
const server = express();

/**
 * Configurações do servidor
 */
// Registra o middleware que permite ao servidor ler e interpretar corpos de requisição em formato JSON
// Sem isso, req.body chegaria como undefined nos controllers — nenhum dado do front-end seria lido
server.use(express.json());

// Registra o middleware CORS com as configurações padrão (permite qualquer origem)
// ✅ MELHORIA: console.warn alerta ativamente durante o desenvolvimento que o CORS está aberto
// Em produção, substitua cors() por cors({ origin: "https://seu-dominio.com" })
// para restringir o acesso apenas aos domínios autorizados
console.warn("[server] iniciado com sucesso.");
server.use(cors());

// Registra o router com todos os endpoints da aplicação
// A partir daqui, toda requisição que chegar ao servidor será direcionada para a rota correspondente
server.use(router);

// Exporta o servidor para que possa ser importado e iniciado em outro arquivo (app.ts)
// O uso de exportação nomeada "export { server }" mantém consistência com a exportação do router
export { server };