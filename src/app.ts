import { DatabaseModel } from "./model/DatabaseModel.js";
import { server } from "./server.js";
import dotenv from "dotenv";

dotenv.config();

const port: number = parseInt(process.env.PORT as string);
const host: string = process.env.HOST ?? "";

// validação básica
if (isNaN(port) || !host) {
    console.error("Variáveis de ambiente PORT e HOST são obrigatórias. Verifique o arquivo .env");
    process.exit(1);
}

async function iniciarServidor(): Promise<void> {
    try {
        // tenta conectar no banco
        const conexaoOk = await new DatabaseModel().testeConexao();

        if (conexaoOk) {
            console.info("Banco conectado com sucesso ✅");
        } else {
            console.warn("Banco NÃO conectado ⚠️ — servidor será iniciado mesmo assim");
        }

        // 🚀 SERVIDOR SEMPRE INICIA (esse é o segredo)
        server.listen(port, () => {
            console.info(`Servidor rodando em http://${host}:${port}`);
        });

    } catch (error) {
        console.error("Erro ao conectar com o banco:", error);

        // mesmo com erro, sobe o servidor
        server.listen(port, () => {
            console.info(`Servidor rodando (sem banco) em http://${host}:${port}`);
        });
    }
}

// inicia
iniciarServidor();
