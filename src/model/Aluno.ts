// Importa o tipo AlunoDTO, que define a "forma" dos dados de um aluno (como um molde/contrato)
import type AlunoDTO from "../dto/AlunoDTO.js";
// Importa a classe DatabaseModel, responsável por gerenciar a conexão com o banco de dados
import { DatabaseModel } from "./DatabaseModel.js";

// Cria uma instância do DatabaseModel e acessa o pool de conexões com o banco de dados
// O "pool" é um conjunto de conexões reutilizáveis, mais eficiente que abrir/fechar uma por vez
const database = new DatabaseModel().pool;



// Define a classe Aluno, que representa um aluno no sistema
class Aluno {

    // Atributo privado: ID único do aluno no banco de dados (começa em 0, pois ainda não foi salvo)
    private id_aluno: number = 0;
    // Atributo privado: Registro Acadêmico do aluno (começa vazio)
    private ra: string = "";
    // Atributo privado: Primeiro nome do aluno
    private nome: string;
    // Atributo privado: Sobrenome do aluno
    private sobrenome: string;
    // Atributo privado: Data de nascimento do aluno
    private data_nascimento: Date;
    // Atributo privado: Endereço residencial do aluno
    private endereco: string;
    // Atributo privado: E-mail do aluno
    private email: string;
    // Atributo privado: Número de celular do aluno
    private celular: string;
    // Atributo privado: Status do aluno (true = ativo, false = inativo/removido)
    private status_aluno: boolean = true;

    // Construtor: método especial chamado automaticamente ao criar um novo objeto Aluno
    // Os parâmetros com "_" na frente são uma convenção para diferenciar dos atributos da classe
    constructor(
        _nome: string,           // Nome obrigatório
        _sobrenome: string,      // Sobrenome obrigatório
        _data_nascimento: Date,  // Data de nascimento obrigatória
        _endereco: string,       // Endereço obrigatório
        _email: string,          // E-mail obrigatório
        _celular?: string        // Celular opcional (o "?" indica que pode ser omitido)
    ) {
        // Atribui o valor recebido ao atributo interno da classe
        this.nome = _nome;
        this.sobrenome = _sobrenome;
        this.data_nascimento = _data_nascimento;
        this.endereco = _endereco;
        this.email = _email;
        // Se _celular foi informado, usa esse valor; senão, usa string vazia ("")
        // O operador "??" é chamado de "nullish coalescing" — retorna o lado direito se o esquerdo for null/undefined
        this.celular = _celular ?? "";
    }

    // ==================== GETTERS E SETTERS ====================
    // Getters e setters são métodos públicos que permitem ler/alterar atributos privados com segurança

    // Getter: retorna o ID do aluno
    public getIdAluno(): number {
        return this.id_aluno;
    }

    // Setter: define um novo valor para o ID do aluno
    public setIdAluno(id_aluno: number): void {
        this.id_aluno = id_aluno;
    }

    // Getter: retorna o RA do aluno
    public getRa(): string {
        return this.ra;
    }

    // Setter: define um novo valor para o RA do aluno
    public setRa(ra: string): void {
        this.ra = ra;
    }

    // Getter: retorna o nome do aluno
    public getNome(): string {
        return this.nome;
    }

    // Setter: define um novo valor para o nome do aluno
    public setNome(nome: string): void {
        this.nome = nome;
    }

    // Getter: retorna o sobrenome do aluno
    public getSobrenome(): string {
        return this.sobrenome;
    }

    // Setter: define um novo valor para o sobrenome do aluno
    public setSobrenome(sobrenome: string): void {
        this.sobrenome = sobrenome;
    }

    // Getter: retorna a data de nascimento do aluno
    public getDataNascimento(): Date {
        return this.data_nascimento;
    }

    // Setter: define uma nova data de nascimento para o aluno
    public setDataNascimento(data_nascimento: Date): void {
        this.data_nascimento = data_nascimento;
    }

    // Getter: retorna o endereço do aluno
    public getEndereco(): string {
        return this.endereco;
    }

    // Setter: define um novo endereço para o aluno
    public setEndereco(endereco: string): void {
        this.endereco = endereco;
    }

    // Getter: retorna o e-mail do aluno
    public getEmail(): string {
        return this.email;
    }

    // Setter: define um novo e-mail para o aluno
    public setEmail(email: string): void {
        this.email = email;
    }

    // Getter: retorna o celular do aluno
    public getCelular(): string {
        return this.celular;
    }

    // Setter: define um novo número de celular para o aluno
    public setCelular(celular: string): void {
        this.celular = celular;
    }

    // Getter duplicado do RA (mesma função que getRa acima — provavelmente um erro de duplicidade no código original)
    public getRA(): string {
        return this.ra;
    }

    // Setter duplicado do RA (mesma função que setRa acima)
    public setRA(ra: string): void {
        this.ra = ra;
    }

    // Getter: retorna o status do aluno (true = ativo, false = inativo)
    public getStatusAluno(): boolean {
        return this.status_aluno;
    }

    // Setter: define um novo status para o aluno
    public setStatusAluno(status_aluno: boolean): void {
        this.status_aluno = status_aluno;
    }

    // ==================== MÉTODOS ESTÁTICOS (operações no banco de dados) ====================
    // Métodos "static" pertencem à classe, não ao objeto — são chamados como Aluno.listarAlunos()

    /**
     * Retorna uma lista com todos os alunos cadastrados no banco de dados
     * 
     * @returns Lista com todos os alunos cadastrados no banco de dados
     */
    // "async" indica que este método é assíncrono — ele pode "esperar" por operações demoradas (como banco de dados)
    // ✅ MELHORIA: retorno simplificado para AlunoDTO[] (notação moderna, equivalente a Array<AlunoDTO>)
    // ✅ MELHORIA: erro é lançado ao invés de retornar null — permite que o chamador trate a falha
    static async listarAlunos(): Promise<AlunoDTO[]> {
        try {
            // Bloco try: tenta executar o código; se algo der errado, vai para o catch

            // ✅ MELHORIA: colunas explícitas no lugar de SELECT *
            // SELECT * busca todas as colunas do banco — se houver colunas pesadas ou desnecessárias,
            // isso aumenta o tráfego de dados sem necessidade. Listar as colunas é mais seguro e eficiente.
            const querySelectAluno = `
                SELECT
                    id_aluno,
                    ra,
                    nome,
                    sobrenome,
                    data_nascimento,
                    endereco,
                    email,
                    celular,
                    status_aluno
                FROM Aluno
                WHERE status_aluno = TRUE;
            `;

            // Executa a query no banco de dados e aguarda o resultado
            // "await" pausa a execução aqui até o banco responder
            const respostaBD = await database.query(querySelectAluno);

            // ✅ MELHORIA: .map() substitui o forEach + push manual
            // .map() percorre o array e já retorna um novo array transformado,
            // sem precisar criar uma lista vazia e empurrar item por item.
            // É mais legível, funcional e elimina a necessidade de uma variável mutável (let).
            // O "any" é necessário aqui pois o TypeScript não consegue inferir os tipos
            // retornados pelo banco em tempo de compilação — padrão usado no restante do arquivo.
            const listaDeAlunos: AlunoDTO[] = respostaBD.rows.map((aluno: any): AlunoDTO => ({
                id_aluno:        aluno.id_aluno,          // ID do aluno
                ra:              aluno.ra,                // Registro Acadêmico
                nome:            aluno.nome,              // Nome
                sobrenome:       aluno.sobrenome,         // Sobrenome
                data_nascimento: aluno.data_nascimento,   // Data de nascimento
                endereco:        aluno.endereco,          // Endereço
                email:           aluno.email,             // E-mail
                celular:         aluno.celular,           // Celular
                status_aluno:    aluno.status_aluno       // Status ativo/inativo
            }));

            // Retorna a lista com todos os alunos encontrados
            return listaDeAlunos;

        } catch (error) {
            // ✅ MELHORIA: console.error() no lugar de console.log()
            // console.error() direciona a mensagem para o canal de erros (stderr),
            // o que facilita a separação de logs em ferramentas de monitoramento
            // (ex: Datadog, CloudWatch, PM2) e indica a gravidade corretamente
            console.error(`[AlunoModel] Erro ao listar alunos: ${error}`);

            // ✅ MELHORIA: lança o erro ao invés de retornar null
            // Retornar null "engole" o erro — quem chamou a função não sabe o que houve.
            // Lançar o erro permite que a camada superior (controller/service) decida
            // como tratar a falha: exibir mensagem ao usuário, registrar log, etc.
            throw new Error(`Falha ao buscar alunos no banco de dados: ${error}`);
        }
    }

    /**
     * Retorna as informações de um aluno informado pelo ID
     * 
     * @param idAluno Identificador único do aluno
     * @returns Objeto com informações do aluno
     */
    // Recebe o ID do aluno como parâmetro e retorna um AlunoDTO ou null
    static async listarAluno(id_aluno: number): Promise<AlunoDTO | null> {
        try {
            // Bloco try: aqui tentamos executar o código que pode gerar um erro.
            // Se ocorrer algum erro dentro deste bloco, ele será capturado pelo catch.

            // Define a query SQL — o "$1" é um parâmetro que será substituído pelo valor real (id_aluno)
            // Isso é chamado de "prepared statement" e protege contra ataques de SQL Injection
            const querySelectAluno = `SELECT * FROM aluno WHERE id_aluno = $1`;

            // Executa a query passando o id_aluno como segundo argumento (substitui o $1)
            const respostaBD = await database.query(querySelectAluno, [id_aluno]);

            // Monta o objeto AlunoDTO com o primeiro resultado retornado (rows[0] = primeira linha)
            const alunoDTO: AlunoDTO = {
                id_aluno: respostaBD.rows[0].id_aluno,               // ID do aluno
                nome: respostaBD.rows[0].nome,                       // Nome do aluno
                sobrenome: respostaBD.rows[0].sobrenome,             // Sobrenome do aluno
                data_nascimento: respostaBD.rows[0].data_nascimento, // Data de nascimento do aluno
                endereco: respostaBD.rows[0].endereco,               // Endereço do aluno
                email: respostaBD.rows[0].email,                     // E-mail do aluno
                celular: respostaBD.rows[0].celular,                 // Celular do aluno
                ra: respostaBD.rows[0].ra,                           // Registro Acadêmico
                status_aluno: respostaBD.rows[0].status_aluno        // Status ativo/inativo
            };

            // Retorna o objeto aluno preenchido com os dados do banco
            return alunoDTO;
        } catch (error) {
            // Bloco catch: se algum erro ocorrer no bloco try, ele será capturado aqui.
            // Isso evita que o erro interrompa a execução do programa.

            // Exibe uma mensagem de erro no console para facilitar o debug
            console.log(`Erro ao realizar a consulta: ${error}`);

            // Retorna null para indicar que não foi possível buscar o aluno
            return null;
        }
    }

    /**
    * Cadastra um novo aluno no banco de dados
    * @param aluno Objeto Aluno contendo as informações a serem cadastradas
    * @returns Boolean indicando se o cadastro foi bem-sucedido
    */
    // Recebe um objeto Aluno completo e tenta inseri-lo no banco de dados
    static async cadastrarAluno(aluno: Aluno): Promise<boolean> {
        try {
            // Query SQL de inserção — os "$1", "$2"... são placeholders substituídos pelos valores reais
            // "RETURNING id_aluno" faz o banco retornar o ID gerado automaticamente após o INSERT
            const queryInsertAluno = `
                INSERT INTO Aluno (nome, sobrenome, data_nascimento, endereco, email, celular)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id_aluno;
            `;

            // ✅ MELHORIA: parâmetros alinhados verticalmente — cada valor na sua própria linha
            // facilita a leitura e a manutenção (ex: adicionar/remover um campo sem bagunçar o resto)
            // .toUpperCase() converte texto para maiúsculas; .toLowerCase() converte para minúsculas
            const result = await database.query(queryInsertAluno, [
                aluno.getNome().toUpperCase(),       // Nome em maiúsculas
                aluno.getSobrenome().toUpperCase(),  // Sobrenome em maiúsculas
                aluno.getDataNascimento(),           // Data de nascimento sem transformação
                aluno.getEndereco().toUpperCase(),   // Endereço em maiúsculas
                aluno.getEmail().toLowerCase(),      // E-mail em minúsculas
                aluno.getCelular()                   // Celular sem transformação
            ]);

            // ✅ MELHORIA: rowCount no lugar de result.rows.length > 0
            // "rowCount" é a forma semântica correta para verificar linhas afetadas em INSERT/UPDATE/DELETE
            // "rows.length" funciona aqui por causa do RETURNING, mas rowCount é mais explícito e direto
            if (result.rowCount && result.rowCount > 0) {
                // Exibe no console o ID do aluno recém-cadastrado
                console.log(`Aluno cadastrado com sucesso. ID: ${result.rows[0].id_aluno}`);
                // Retorna true para indicar sucesso
                return true;
            }

            // Se nenhuma linha foi afetada, o cadastro não funcionou — retorna false
            return false;
        } catch (error) {
            // Captura e exibe qualquer erro ocorrido durante o cadastro
            console.error(`Erro ao cadastrar aluno: ${error}`);
            // Retorna false indicando falha
            return false;
        }
    }

    /**
    * Remove um aluno do banco de dados
    * @param id_aluno ID do aluno a ser removido
    * @returns Boolean indicando se a remoção foi bem-sucedida
   */
    // Recebe o ID do aluno e realiza uma "remoção lógica" (não apaga do banco, apenas desativa)
    static async removerAluno(id_aluno: number): Promise<boolean> {
        try {
            // Busca o aluno no banco antes de tentar remover, para verificar se ele existe e está ativo
            const aluno: AlunoDTO | null = await this.listarAluno(id_aluno);

            // Só prossegue se o aluno existir (não for null) E estiver com status ativo (true)
            if (aluno && aluno.status_aluno) {
                // Query que desativa todos os empréstimos relacionados ao aluno
                // Em vez de apagar, usa UPDATE para setar o status como FALSE (remoção lógica)
                const queryDeleteEmprestimoAluno = `
                    UPDATE emprestimo
                    SET status_emprestimo_registro = FALSE
                    WHERE id_aluno = $1;
                `;

                // Executa a desativação dos empréstimos do aluno
                await database.query(queryDeleteEmprestimoAluno, [id_aluno]);

                // Query que desativa o próprio aluno (também uma remoção lógica)
                const queryDeleteAluno = `
                    UPDATE aluno
                    SET status_aluno = FALSE
                    WHERE id_aluno = $1;
                `;

                // Executa a desativação do aluno e verifica se alguma linha foi afetada
                const result = await database.query(queryDeleteAluno, [id_aluno]);

                // ✅ MELHORIA: rowCount agora é realmente usado para confirmar o sucesso
                // Antes, o resultado era armazenado em "result" mas nunca verificado —
                // o método retornava true mesmo que o UPDATE não afetasse nenhuma linha
                return (result.rowCount ?? 0) > 0;
            }

            // Se o aluno não existir ou já estiver inativo, retorna false
            return false;

        } catch (error) {
            // ✅ MELHORIA: console.error() no lugar de console.log()
            // Direciona o erro para o canal correto (stderr) e indica gravidade
            console.error(`[AlunoModel] Erro ao remover aluno: ${error}`);
            return false;
        }
    }

    /**
    * Atualiza os dados de um aluno no banco de dados.
    * @param aluno Objeto do tipo Aluno com os novos dados
    * @returns true caso sucesso, false caso erro
    */
    // Recebe um objeto Aluno com os dados atualizados e os salva no banco
    static async atualizarAluno(aluno: Aluno): Promise<boolean> {
        try {
            // Antes de atualizar, verifica se o aluno existe e está ativo no banco
            const alunoConsulta: AlunoDTO | null = await this.listarAluno(aluno.id_aluno);

            // Só prossegue com a atualização se o aluno existir e estiver ativo
            if (alunoConsulta && alunoConsulta.status_aluno) {
                // Query SQL de atualização — cada campo recebe um placeholder "$n"
                // O WHERE garante que só o aluno com o ID correto seja atualizado
                const queryAtualizarAluno = `UPDATE Aluno SET 
                                                    nome = $1, 
                                                    sobrenome = $2,
                                                    data_nascimento = $3, 
                                                    endereco = $4,
                                                    celular = $5, 
                                                    email = $6                                            
                                                WHERE id_aluno = $7`;

                // Executa a query de atualização com os valores do objeto aluno recebido
                const respostaBD = await database.query(queryAtualizarAluno, [
                    aluno.getNome().toUpperCase(),       // Nome em maiúsculas
                    aluno.getSobrenome().toUpperCase(),  // Sobrenome em maiúsculas
                    aluno.getDataNascimento(),           // Data de nascimento
                    aluno.getEndereco().toUpperCase(),   // Endereço em maiúsculas
                    aluno.getCelular(),                  // Celular
                    aluno.getEmail().toLowerCase(),      // E-mail em minúsculas
                    aluno.id_aluno                       // ID do aluno (para o WHERE)
                ]);

                // Se rowCount for diferente de 0, a atualização funcionou — retorna true
                if (respostaBD.rowCount != 0) {
                    return true;
                }
            }

            // Se o aluno não existe, está inativo, ou o UPDATE não afetou nenhuma linha, retorna false
            return false;
        } catch (error) {
            // Exibe o erro no console e retorna false em caso de exceção
            console.log(`Erro na consulta: ${error}`);
            return false;
        }
    }

}

// Exporta a classe Aluno para que possa ser importada e usada em outros arquivos do projeto
export default Aluno;