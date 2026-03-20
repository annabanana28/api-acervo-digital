// Importa a classe Livro do model — é daqui que vêm os métodos de acesso ao banco de dados
import Livro from "../model/Livro.js";
// Importa os tipos Request e Response do Express — representam a requisição e a resposta HTTP
import { type Request, type Response } from "express";
// Importa o tipo LivroDTO para tipar os dados recebidos do front-end
import type LivroDTO from "../dto/LivroDTO.js";

// Define a classe LivroController que HERDA da classe Livro
// A herança permite acessar os métodos estáticos do model diretamente
// O controller é responsável por receber as requisições HTTP e devolver as respostas — nunca acessa o banco diretamente
class LivroController extends Livro {

    // ✅ MELHORIA: Promise<Response> adicionado na assinatura
    // todos os caminhos retornam uma resposta HTTP — tipar isso explicitamente é mais profissional
    static async todos(req: Request, res: Response): Promise<Response> {
        try {
            // Chama o método do model para buscar todos os livros com status ativo no banco
            const listaDeLivros = await Livro.listarLivros();

            // ✅ MELHORIA: verificação explícita se a lista está vazia
            // Se não houver livros cadastrados, retorna 404 (Not Found) com mensagem clara
            // Sem isso, o front-end receberia um array vazio com status 200, sem saber se é erro ou não
            if (listaDeLivros.length === 0) {
                return res.status(404).json({ mensagem: "Nenhum livro encontrado." });
            }

            // Retorna a lista em formato JSON com status HTTP 200 (OK — requisição bem-sucedida)
            return res.status(200).json(listaDeLivros);
        } catch (error) {
            // ✅ MELHORIA: prefixo [LivroController] para facilitar rastreamento nos logs
            console.error(`[LivroController] Erro ao listar livros: ${error}`);
            // Retorna mensagem de erro com status HTTP 500 (Internal Server Error)
            return res.status(500).json({ mensagem: "Erro ao recuperar as informações dos livros." });
        }
    }

    // ✅ MELHORIA: Promise<Response> adicionado na assinatura
    static async livro(req: Request, res: Response): Promise<Response> {
        try {
            // Lê o parâmetro "id" da URL e converte para número inteiro
            const idLivro = parseInt(req.params.id as string);

            // ✅ MELHORIA: validação do ID antes de consultar o banco
            // Se a URL receber /livro/abc, parseInt retorna NaN — isNaN() detecta isso
            // e retorna 400 (Bad Request) ao invés de causar erro silencioso no banco
            if (isNaN(idLivro)) {
                return res.status(400).json({ mensagem: "ID inválido. Informe um número inteiro." });
            }

            // Chama o método do model passando o ID para buscar o livro específico no banco
            const livro = await Livro.listarLivro(idLivro);

            // ✅ MELHORIA: verificação explícita se o livro foi encontrado
            // Se o model retornar null, responde com 404 (Not Found)
            // Sem isso, o front-end receberia "null" com status 200, o que é semanticamente incorreto
            if (!livro) {
                return res.status(404).json({ mensagem: "Livro não encontrado." });
            }

            // Retorna o objeto do livro em JSON com status HTTP 200 (OK)
            return res.status(200).json(livro);
        } catch (error) {
            // ✅ MELHORIA: console.error() no lugar de console.log() com contexto do controller
            // A mensagem anterior era genérica — agora identifica o controller e o método
            console.error(`[LivroController] Erro ao buscar livro: ${error}`);
            // ✅ MELHORIA: resposta de erro como objeto JSON ao invés de string simples
            return res.status(500).json({ mensagem: "Erro ao recuperar as informações do livro." });
        }
    }

    // ✅ MELHORIA: Promise<Response> adicionado na assinatura
    static async cadastrar(req: Request, res: Response): Promise<Response> {
        try {
            // Lê o corpo da requisição HTTP e tipifica como LivroDTO
            const dadosRecebidos: LivroDTO = req.body;

            // ✅ MELHORIA: validação dos campos obrigatórios antes de tentar cadastrar
            // Se titulo, autor, editora ou isbn não forem enviados, retorna 400 (Bad Request)
            // Sem isso, o banco receberia valores undefined e poderia lançar um erro confuso
            if (!dadosRecebidos.titulo || !dadosRecebidos.autor || !dadosRecebidos.editora || !dadosRecebidos.isbn) {
                return res.status(400).json({ mensagem: "Titulo, autor, editora e isbn são obrigatórios." });
            }

            // Cria um novo objeto Livro com os dados recebidos do front-end
            const novoLivro = new Livro(
                dadosRecebidos.titulo,                              // Título do livro
                dadosRecebidos.autor,                               // Autor do livro
                dadosRecebidos.editora,                             // Editora do livro
                (dadosRecebidos.ano_publicacao ?? 0).toString(),    // Ano — usa "0" se não informado
                dadosRecebidos.isbn,                                // ISBN do livro
                dadosRecebidos.quant_total,                         // Quantidade total de exemplares
                dadosRecebidos.quant_disponivel,                    // Quantidade disponível para empréstimo
                dadosRecebidos.quant_aquisicao,                     // Quantidade adquirida
                dadosRecebidos.valor_aquisicao ?? 0                 // Valor — usa 0 se não informado
            );

            // Chama o método do model para persistir o novo livro no banco de dados
            const result = await Livro.cadastrarLivro(novoLivro);

            // Verifica o retorno do model: true = cadastro bem-sucedido, false = falha
            if (result) {
                // ✅ MELHORIA: status 201 (Created) no lugar de 200 (OK)
                // 201 é o status semântico correto para criação de recursos — mesmo padrão dos outros controllers
                return res.status(201).json({ mensagem: "Livro cadastrado com sucesso." });
            } else {
                return res.status(500).json({ mensagem: "Não foi possível cadastrar o livro no banco de dados." });
            }
        } catch (error) {
            // ✅ MELHORIA: prefixo [LivroController] para facilitar rastreamento nos logs
            console.error(`[LivroController] Erro ao cadastrar livro: ${error}`);
            return res.status(500).json({ mensagem: "Erro ao cadastrar o livro." });
        }
    }

    static async remover(req: Request, res: Response): Promise<Response> {
        try {
            // Lê o parâmetro "id" da URL e converte para número inteiro
            // Exemplo de URL: DELETE /livro/5  →  idLivro = 5
            const idLivro = parseInt(req.params.id as string);

            // ✅ MELHORIA: validação do ID antes de consultar o banco
            // Se a URL receber /livro/abc, parseInt retorna NaN — isNaN() detecta isso
            // e retorna 400 (Bad Request) ao invés de causar erro silencioso no banco
            if (isNaN(idLivro)) {
                return res.status(400).json({ mensagem: "ID inválido. Informe um número inteiro." });
            }

            // Chama o método do model para remover (logicamente) o livro com o ID informado
            // O model também desativa todos os empréstimos relacionados antes de desativar o livro
            const result = await Livro.removerLivro(idLivro);

            if (result) {
                // ✅ MELHORIA: status 200 (OK) no lugar de 201 (Created)
                // 201 é reservado para criação de recursos — remoção deve retornar 200
                return res.status(200).json({ mensagem: "Livro removido com sucesso." });
            } else {
                // Retorna status HTTP 404 (Not Found) se o livro não foi encontrado ou já estava inativo
                return res.status(404).json({ mensagem: "Livro não encontrado para exclusão." });
            }
        } catch (error) {
            // ✅ MELHORIA: prefixo [LivroController] para facilitar rastreamento nos logs
            console.error(`[LivroController] Erro ao remover livro: ${error}`);
            return res.status(500).json({ mensagem: "Erro ao remover o livro." });
        }
    }

    static async atualizar(req: Request, res: Response): Promise<Response> {
        try {
            const idLivro = parseInt(req.params.id as string);
            const dadosRecebidos: LivroDTO = req.body;
            const livro = new Livro(
                dadosRecebidos.titulo,
                dadosRecebidos.autor,
                dadosRecebidos.editora,
                (dadosRecebidos.ano_publicacao ?? 0).toString(),
                dadosRecebidos.isbn,
                dadosRecebidos.quant_total,
                dadosRecebidos.quant_disponivel,
                dadosRecebidos.quant_aquisicao,
                dadosRecebidos.valor_aquisicao ?? 0
            );
            livro.setIdLivro(idLivro);
            const sucesso = await Livro.atualizarLivro(livro);
            if (sucesso) {
                return res.status(200).json({ mensagem: "Cadastro atualizado com sucesso." });
            } else {
                return res.status(400).json({ mensagem: "Não foi possível atualizar o livro no banco de dados." });
            }
        } catch (error) {
            console.error(`Erro ao atualizar livro: ${error}`);
            return res.status(500).json({ mensagem: "Erro ao atualizar o livro." });
        }
    }
}

export default LivroController;