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

    static async livro(req: Request, res: Response) {
        try {
            const idLivro = parseInt(req.params.id as string);
            const livro = await Livro.listarLivro(idLivro);
            return res.status(200).json(livro);
        } catch (error) {
            console.log(`Erro ao acessar método herdado: ${error}`);
            return res.status(500).json("Erro ao recuperar as informações do livro.");
        }
    }

    static async cadastrar(req: Request, res: Response) {
        try {
            const dadosRecebidos: LivroDTO = req.body;
            const novoLivro = new Livro(
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
            const result = await Livro.cadastrarLivro(novoLivro);
            if (result) {
                return res.status(200).json({ mensagem: "Livro cadastrado com sucesso." });
            } else {
                return res.status(500).json({ mensagem: "Não foi possível cadastrar o livro no banco de dados." });
            }
        } catch (error) {
            console.error(`Erro ao cadastrar o livro: ${error}`);
            return res.status(500).json({ mensagem: "Erro ao cadastrar o livro." });
        }
    }

    static async remover(req: Request, res: Response): Promise<Response> {
        try {
            const idLivro = parseInt(req.params.id as string);
            const result = await Livro.removerLivro(idLivro);
            if (result) {
                return res.status(201).json({ mensagem: "Livro removido com sucesso." });
            } else {
                return res.status(404).json({ mensagem: "Livro não encontrado para exclusão." });
            }
        } catch (error) {
            console.error("Erro ao remover o livro: ", error);
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