import { useEffect, useState } from 'react';
import Campo from '../../components/Campo.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { publicarPrato } from '../../api/endpoints.js';
import { formatarData, hojeISO } from '../../utils.js';
import ListaPratos from './ListaPratos.jsx';

const REFEICOES = ['Café da manhã', 'Lanche', 'Almoço', 'Jantar'];
const LIMITE_FOTO = 10 * 1024 * 1024; // mesmo limite de upload do backend (10 MB)

const novoForm = () => ({ nome: '', tipoRefeicao: 'Almoço', dataInicio: hojeISO(), descricao: '' });

// Tela "Criar Cardápio" da escola: cada envio publica UM prato para os alunos.
export default function CriarCardapio() {
  const { sessao } = useAuth();
  const [form, setForm] = useState(novoForm);
  const [arquivo, setArquivo] = useState(null);
  const [previa, setPrevia] = useState('');
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [versao, setVersao] = useState(0); // muda quando um prato é publicado, para a lista recarregar

  // Cria (e depois libera) o endereço temporário usado na pré-visualização da foto.
  useEffect(() => {
    if (!arquivo) {
      setPrevia('');
      return undefined;
    }
    const url = URL.createObjectURL(arquivo);
    setPrevia(url);
    return () => URL.revokeObjectURL(url);
  }, [arquivo]);

  const mudar = (campo) => (evento) => {
    setForm((f) => ({ ...f, [campo]: evento.target.value }));
    setSucesso('');
  };

  function escolherArquivo(evento) {
    const escolhido = evento.target.files[0];
    evento.target.value = ''; // permite escolher o mesmo arquivo de novo
    if (!escolhido) return;
    if (!escolhido.type.startsWith('image/')) {
      setErros((e) => ({ ...e, arquivo: 'Escolha um arquivo de imagem (JPG, PNG...)' }));
      return;
    }
    if (escolhido.size > LIMITE_FOTO) {
      setErros((e) => ({ ...e, arquivo: 'A imagem deve ter no máximo 10 MB' }));
      return;
    }
    setErros((e) => ({ ...e, arquivo: undefined }));
    setArquivo(escolhido);
    setSucesso('');
  }

  function cancelar() {
    setForm(novoForm());
    setArquivo(null);
    setErros({});
    setErroGeral('');
    setSucesso('');
  }

  async function enviar(evento) {
    evento.preventDefault();
    setErroGeral('');
    setSucesso('');

    const problemas = {};
    if (!form.nome.trim()) problemas.nome = 'Informe o nome do prato';
    if (!form.dataInicio) problemas.dataInicio = 'Informe a data do cardápio';
    setErros(problemas);
    if (Object.keys(problemas).length > 0) return;

    setEnviando(true);
    try {
      await publicarPrato(sessao.escolaId, {
        nome: form.nome.trim(),
        tipoRefeicao: form.tipoRefeicao,
        descricao: form.descricao.trim(),
        dataInicio: form.dataInicio,
        arquivo,
      });
      setSucesso(`Prato publicado no cardápio de ${formatarData(form.dataInicio)}!`);
      // Limpa o prato, mas mantém a data para cadastrar vários pratos seguidos.
      setForm((f) => ({ ...novoForm(), dataInicio: f.dataInicio, tipoRefeicao: f.tipoRefeicao }));
      setArquivo(null);
      setVersao((v) => v + 1);
    } catch (e) {
      setErroGeral(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div>
      <h1 className="pagina-titulo">Cardápio</h1>
      <p className="pagina-sub">Publique o cardápio e novos pratos para os alunos</p>

      <form className="formulario" onSubmit={enviar} noValidate>
        <h2>Novo item do cardápio</h2>
        <p className="sub">Adicione um prato ao cardápio da semana</p>

        {sucesso && <p className="aviso-sucesso" role="status">{sucesso}</p>}

        <Campo
          rotulo="Nome do prato"
          value={form.nome}
          onChange={mudar('nome')}
          placeholder="Ex: Arroz, feijão e frango grelhado"
          erro={erros.nome}
        />

        <div className="linha-2">
          <div className="campo">
            <label>
              <span className="campo-rotulo">Tipo de refeição</span>
              <div className="campo-caixa">
                <select value={form.tipoRefeicao} onChange={mudar('tipoRefeicao')}>
                  {REFEICOES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </label>
          </div>
          <Campo
            rotulo="Data do cardápio"
            tipo="date"
            value={form.dataInicio}
            onChange={mudar('dataInicio')}
            erro={erros.dataInicio}
          />
        </div>

        <div className="campo">
          <label>
            <span className="campo-rotulo">Descrição</span>
            <textarea
              value={form.descricao}
              onChange={mudar('descricao')}
              maxLength={255}
              placeholder="Descreva os ingredientes ou informações do prato"
            />
          </label>
          <span className="contador">{form.descricao.length}/255</span>
        </div>

        <div className="campo">
          <span className="campo-rotulo">Imagem do prato (opcional)</span>
          <label className="upload">
            <input type="file" accept="image/*" onChange={escolherArquivo} hidden />
            {previa ? (
              <img src={previa} alt="Pré-visualização do prato" />
            ) : (
              <span>Clique para enviar uma foto do prato</span>
            )}
          </label>
          {arquivo && (
            <button type="button" className="link-remover" onClick={() => setArquivo(null)}>
              Remover foto
            </button>
          )}
          {erros.arquivo && <span className="campo-erro">{erros.arquivo}</span>}
        </div>

        {erroGeral && <p className="erro-geral" role="alert">{erroGeral}</p>}

        <div className="acoes-form">
          <button type="button" className="botao contorno" onClick={cancelar} disabled={enviando}>
            Cancelar
          </button>
          <button className="botao" disabled={enviando}>
            {enviando ? 'Publicando...' : 'Publicar cardápio'}
          </button>
        </div>
      </form>

      <ListaPratos recarregar={versao} />
    </div>
  );
}
