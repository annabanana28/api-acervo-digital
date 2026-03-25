// Importa a classe DatabaseModel — usada para testar a conexão com o banco antes de subir o servidor
import { DatabaseModel } from "./model/DatabaseModel.js";
// Importa o servidor Express configurado no server.ts — é ele quem será iniciado após a conexão com o banco
import { server } from "./server.js";
// Importa a biblioteca dotenv — responsável por carregar as variáveis de ambiente do arquivo .env
// Variáveis de ambiente guardam informações sensíveis (senhas, portas, hosts) fora do código-fonte
import dotenv from "dotenv";

// Carrega as variáveis definidas no arquivo .env para dentro do process.env
// Deve ser chamado o mais cedo possível, antes de qualquer leitura de process.env
// Sem esta linha, process.env.PORT e process.env.HOST retornariam undefined
dotenv.config();

// Lê a variável PORT do arquivo .env e converte de string para número inteiro
// Ex: se .env tiver PORT=3333, a variável port receberá o número 3333
const port: number = parseInt(process.env.PORT as string);

// Lê a variável HOST do arquivo .env
// O operador "??" garante que, se HOST não estiver definido no .env, usa string vazia como padrão
const host: string = process.env.HOST ?? "";

// ✅ MELHORIA: validação das variáveis de ambiente antes de iniciar o servidor
// Se PORT ou HOST não estiverem definidos no .env, o servidor não subiria corretamente —
// port seria NaN e host seria string vazia, causando erros silenciosos difíceis de depurar
if (isNaN(port) || !host) {
    console.error("Variáveis de ambiente PORT e HOST são obrigatórias. Verifique o arquivo .env");
    // process.exit(1) encerra o processo com código de erro (1 = falha)
    // Isso evita que o servidor tente subir em condições inválidas
    process.exit(1);
}

// ✅ MELHORIA: função async/await no lugar de .then()
// async/await torna o código mais legível e linear — evita o aninhamento de callbacks
// É o padrão moderno para lidar com operações assíncronas em TypeScript/JavaScript
async function iniciarServidor(): Promise<void> {
    try {
        // Testa a conexão com o banco de dados antes de iniciar o servidor
        // testeConexao() retorna true se a conexão foi bem-sucedida, false caso contrário
        const conexaoOk = await new DatabaseModel().testeConexao();

        if (conexaoOk) {
            // Se a conexão funcionou, inicia o servidor Express na porta e host definidos no .env
            // O callback é executado assim que o servidor estiver no ar e pronto para receber requisições
            server.listen(port, () => {
                // console.info é semanticamente mais adequado que console.log para mensagens informativas
                console.info(`Servidor executando no endereço ${host}:${port}`);
            });
        } else {
            // Se testeConexao() retornou false, o banco não respondeu corretamente
            console.error("Não foi possível conectar com o banco de dados.");
            // ✅ MELHORIA: process.exit(1) encerra o processo com código de erro
            // Sem isso, o Node.js continuaria rodando sem banco — todas as rotas retornariam erro
            // Código 1 indica falha; código 0 indica encerramento normal
            process.exit(1);
        }
    } catch (error) {
        // ✅ MELHORIA: bloco catch para capturar erros inesperados durante a inicialização
        // Ex: erro de rede, timeout de conexão, variável de ambiente malformada
        // Sem o try/catch, um erro inesperado derrubaria o processo sem mensagem clara
        console.error(`Erro ao iniciar o servidor: ${error}`);
        process.exit(1);
    }
}

// Chama a função de inicialização do servidor
// A função é assíncrona, mas não precisamos de await aqui pois estamos no escopo global
iniciarServidor();