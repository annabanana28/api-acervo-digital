// Importa a classe Aluno do model — é daqui que vêm os métodos de acesso ao banco de dados
import Aluno from "../model/Aluno.js";
// Importa os tipos Request e Response do Express — representam a requisição e a resposta HTTP
// "type" indica que é uma importação apenas de tipo (só existe em tempo de compilação, não gera código JS)
import { type Request, type Response } from "express";
// Importa o tipo AlunoDTO para tipar os dados recebidos do front-end
import type AlunoDTO from "../dto/AlunoDTO.js";

// Define a classe AlunoController que HERDA da classe Aluno
// Isso permite que o controller acesse diretamente os métodos estáticos do model (listarAlunos, cadastrarAluno, etc.)
// A arquitetura MVC separa responsabilidades: o Model cuida do banco, o Controller cuida das requisições HTTP
class AlunoController extends Aluno {

    /**
     * Lista todos os alunos.
     * @param req Objeto de requisição HTTP.
     * @param res Objeto de resposta HTTP.
     * @returns Lista de alunos em formato JSON.
     */
    // Método estático e assíncrono — recebe a requisição HTTP e devolve a resposta com todos os alunos
    // ✅ MELHORIA: Promise<Response> adicionado na assinatura
    // todos os caminhos retornam uma resposta HTTP — tipar isso explicitamente é mais profissional
    static async todos(req: Request, res: Response): Promise<Response> {
        try {
            // Chama o método herdado do model Aluno para buscar todos os alunos ativos no banco
            const listaDeAlunos = await Aluno.listarAlunos();

            // ✅ MELHORIA: verificação explícita se a lista está vazia
            // Se não houver alunos cadastrados, retorna 404 (Not Found) com mensagem clara
            // Sem isso, o front-end receberia um array vazio com status 200, sem saber se é erro ou não
            if (listaDeAlunos.length === 0) {
                return res.status(404).json({ mensagem: "Nenhum aluno encontrado." });
            }

            // Retorna a lista em formato JSON com status HTTP 200 (OK — requisição bem-sucedida)
            return res.status(200).json(listaDeAlunos);
        } catch (error) {
            // ✅ MELHORIA: console.error() no lugar de console.log() com contexto do controller
            console.error(`[AlunoController] Erro ao listar alunos: ${error}`);
            // ✅ MELHORIA: resposta de erro como objeto JSON ao invés de string simples
            // Objeto JSON é mais fácil de tratar no front-end do que uma string solta
            return res.status(500).json({ mensagem: "Erro ao recuperar a lista de alunos." });
        }
    }

    /**
     * Retorna informações de um aluno
     * @param req Objeto de requisição HTTP
     * @param res Objeto de resposta HTTP.
     * @returns Informações de aluno em formato JSON.
     */
    // Método que busca um único aluno com base no ID informado na URL (ex: GET /aluno/5)
    static async aluno(req: Request, res: Response): Promise<Response> {
        try {
            // Lê o parâmetro "id" da URL (req.params.id) e converte de string para número inteiro
            // O "as string" garante ao TypeScript que o valor existe e é uma string
            const idAluno = parseInt(req.params.id as string);

            // ✅ MELHORIA: validação do ID antes de consultar o banco
            // Se o valor não for um número válido (ex: /aluno/abc), NaN seria passado para o banco
            // isNaN() detecta isso e retorna uma resposta adequada ao invés de causar erro silencioso
            if (isNaN(idAluno)) {
                return res.status(400).json({ mensagem: "ID inválido. Informe um número inteiro." });
            }

            // Chama o método do model passando o ID para buscar o aluno específico no banco
            const aluno = await Aluno.listarAluno(idAluno);

            // ✅ MELHORIA: verificação explícita se o aluno foi encontrado
            // Se o model retornar null (aluno não existe), responde com 404 (Not Found)
            // Sem isso, o front-end receberia "null" com status 200, o que é semanticamente incorreto
            if (!aluno) {
                return res.status(404).json({ mensagem: "Aluno não encontrado." });
            }

            // Retorna o objeto do aluno em JSON com status HTTP 200 (OK)
            return res.status(200).json(aluno);
        } catch (error) {
            // ✅ MELHORIA: console.error() no lugar de console.log()
            console.error(`[AlunoController] Erro ao buscar aluno: ${error}`);
            // Retorna mensagem de erro com status HTTP 500
            return res.status(500).json({ mensagem: "Erro ao recuperar as informações do aluno." });
        }
    }

    /**
      * Cadastra um novo aluno.
      * @param req Objeto de requisição HTTP com os dados do aluno.
      * @param res Objeto de resposta HTTP.
      * @returns Mensagem de sucesso ou erro em formato JSON.
      */
    // Método que recebe os dados do front-end e cria um novo aluno no banco de dados
    static async cadastrar(req: Request, res: Response) {
        try {
            // Lê o corpo (body) da requisição HTTP e o tipifica como AlunoDTO
            // O front-end envia os dados do novo aluno no corpo da requisição (geralmente em formato JSON)
            const dadosRecebidos: AlunoDTO = req.body;

            // Cria um novo objeto Aluno usando os dados recebidos do front-end
            // O operador "??" define valores padrão caso os campos opcionais não tenham sido enviados
            const novoAluno = new Aluno(
                dadosRecebidos.nome,                                      // Nome obrigatório
                dadosRecebidos.sobrenome,                                 // Sobrenome obrigatório
                dadosRecebidos.data_nascimento ?? new Date("1900-01-01"), // Se não informado, usa 01/01/1900
                dadosRecebidos.endereco ?? '',                            // Se não informado, usa string vazia
                dadosRecebidos.email ?? '',                               // Se não informado, usa string vazia
                dadosRecebidos.celular                                    // Celular opcional (pode ser undefined)
            );

            // Chama o método do model para persistir (salvar) o novo aluno no banco de dados
            const result = await Aluno.cadastrarAluno(novoAluno);

            // Verifica o retorno do model: true = cadastro bem-sucedido, false = falha
            if (result) {
                // Retorna mensagem de sucesso com status HTTP 201 (Created — recurso criado com sucesso)
                return res.status(201).json({ mensagem: `Aluno cadastrado com sucesso.` });
            } else {
                // Retorna mensagem de erro com status HTTP 500 se o banco não conseguiu salvar
                return res.status(500).json({ mensagem: 'Não foi possível cadastrar o aluno no banco de dados.' });
            }
        } catch (error) {
            // Exibe o erro no console e retorna status HTTP 500 em caso de exceção inesperada
            console.log(`Erro ao cadastrar o aluno: ${error}`);
            return res.status(500).json({ mensagem: 'Erro ao cadastrar o aluno.' });
        }
    }

    /**
     * Remove um aluno.
     * @param req Objeto de requisição HTTP com o ID do aluno a ser removido.
     * @param res Objeto de resposta HTTP.
     * @returns Mensagem de sucesso ou erro em formato JSON.
     */
    // Método que recebe um ID pela URL e realiza a remoção lógica do aluno no banco
    // "Promise<Response>" indica que este método sempre retorna uma resposta HTTP ao final
    static async remover(req: Request, res: Response): Promise<Response> {
        try {
            // Lê o parâmetro "id" da URL e converte para número inteiro
            // Exemplo de URL: DELETE /aluno/3  →  idAluno = 3
            const idAluno = parseInt(req.params.id as string);

            // Chama o método do model para remover (logicamente) o aluno com o ID informado
            const result = await Aluno.removerAluno(idAluno);

            if (result) {
                // Retorna mensagem de sucesso com status HTTP 201 se a remoção funcionou
                // ⚠️ Observação: o ideal aqui seria status 200 (OK), pois 201 é para criação de recursos
                return res.status(201).json({ mensagem: 'Aluno removido com sucesso.' });
            } else {
                // Retorna status HTTP 404 (Not Found) se o aluno não foi encontrado ou já estava inativo
                return res.status(404).json({ mensagem: 'Aluno não encontrado para exclusão.' });
            }
        } catch (error) {
            // Exibe o erro no console e retorna status HTTP 500 em caso de exceção
            console.log(`Erro ao remover aluno: ${error}`)
            return res.status(500).json({ mensagem: 'Erro ao remover aluno.' });
        }
    }

    /**
     * Método para atualizar o cadastro de um aluno.
     * 
     * @param req Objeto de requisição do Express, contendo os dados atualizados do aluno
     * @param res Objeto de resposta do Express
     * @returns Retorna uma resposta HTTP indicando sucesso ou falha na atualização
     */
    // Método que recebe os novos dados do front-end e atualiza o cadastro do aluno no banco
    static async atualizar(req: Request, res: Response): Promise<Response> {
        try {
            // Lê o corpo da requisição e tipifica como AlunoDTO
            // O front-end envia os dados atualizados no corpo da requisição
            const dadosRecebidos: AlunoDTO = req.body;

            // Cria um novo objeto Aluno com os dados atualizados recebidos do front-end
            // Mesma lógica do método cadastrar — usa "??" para garantir valores padrão nos campos opcionais
            const aluno = new Aluno(
                dadosRecebidos.nome,
                dadosRecebidos.sobrenome,
                dadosRecebidos.data_nascimento ?? new Date("1900-01-01"),
                dadosRecebidos.endereco ?? '',
                dadosRecebidos.email ?? '',
                dadosRecebidos.celular
            );

            // Define o ID do aluno no objeto criado, lendo o parâmetro "id" da URL
            // Isso é necessário para que o model saiba QUAL aluno deve ser atualizado no banco
            // Exemplo de URL: PUT /aluno/7  →  setIdAluno(7)
            aluno.setIdAluno(parseInt(req.params.id as string));

            // Chama o método do model para atualizar os dados do aluno no banco de dados
            const result = await Aluno.atualizarAluno(aluno);

            // Verifica o retorno do model: true = atualização bem-sucedida, false = falha
            if (result) {
                // Retorna mensagem de sucesso com status HTTP 200 (OK)
                return res.status(200).json({ mensagem: "Cadastro atualizado com sucesso." });
            } else {
                // Retorna mensagem de erro com status HTTP 500 se o banco não conseguiu atualizar
                return res.status(500).json({ mensagem: 'Não foi possível atualizar o aluno no banco de dados.' });
            }
        } catch (error) {
            // Registra o erro nos logs do servidor
            console.error(`Erro ao atualizar aluno: ${error}`);
            // Retorna mensagem de erro com status HTTP 500 em caso de exceção inesperada
            return res.status(500).json({ mensagem: "Erro ao atualizar aluno." });
        }
    }
}

// Exporta a classe AlunoController para que possa ser importada e usada nas rotas da aplicação
export default AlunoController;