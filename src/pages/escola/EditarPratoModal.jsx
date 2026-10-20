import { useEffect, useState } from 'react';
import Campo from '../../components/Campo.jsx';
import Mensagem from '../../components/Mensagem.jsx';
import Modal from '../../components/Modal.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { urlImagemPrato } from '../../api/endpoints.js';
import { salvarEdicaoPrato } from '../../utils/cardapio.js';

export const REFEICOES = ['Café da manhã', 'Lanche', 'Almoço', 'Jantar'];
const LIMITE_FOTO = 10 * 1024 * 1024; // mesmo limite do backend

// Janela para editar um prato já publicado: nome, refeição, data, descrição e foto.
export default function EditarPratoModal({ menu, prato, aoFechar, aoConcluir }) {
  const { sessao } = useAuth();
  const [form, setForm] = useState({
    nome: prato.nome,
    tipoRefeicao: prato.tipoRefeicao || 'Almoço',
    dataInicio: menu.dataInicio,
    descricao: prato.descricao || '',
  });
  const [arquivo, setArquivo] = useState(null);
  const [previa, setPrevia] = useState('');
  const [fotoAtualOk, setFotoAtualOk] = useState(true);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!arquivo) {
      setPrevia('');
      return undefined;
    }
    const url = URL.createObjectURL(arquivo);
    setPrevia(url);
    return () => URL.revokeObjectURL(url);
  }, [arquivo]);

  const mudar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  function escolherArquivo(e) {
    const escolhido = e.target.files[0];
    e.target.value = '';
    if (!escolhido) return;
    if (!escolhido.type.startsWith('image/')) {
      setErros((x) => ({ ...x, arquivo: 'Escolha um arquivo de imagem (JPG, PNG...)' }));
    } else if (escolhido.size > LIMITE_FOTO) {
      setErros((x) => ({ ...x, arquivo: 'A imagem deve ter no máximo 10 MB' }));
    } else {
      setErros((x) => ({ ...x, arquivo: undefined }));
      setArquivo(escolhido);
    }
  }

  async function salvar(evento) {
    evento.preventDefault();
    setErroGeral('');
    const problemas = {};
    if (!form.nome.trim()) problemas.nome = 'Informe o nome do prato';
    if (!form.dataInicio) problemas.dataInicio = 'Informe a data do cardápio';
    setErros(problemas);
    if (Object.keys(problemas).length > 0) return;

    setSalvando(true);
    try {
      await salvarEdicaoPrato(sessao.escolaId, menu, prato, {
        nome: form.nome.trim(),
        tipoRefeicao: form.tipoRefeicao,
        descricao: form.descricao.trim(),
        dataInicio: form.dataInicio,
        arquivo,
      });
      aoConcluir(`Prato "${form.nome.trim()}" atualizado.`);
    } catch (e) {
      setErroGeral(e.message);
      setSalvando(false);
    }
  }

  const fotoMostrada = previa || (fotoAtualOk ? urlImagemPrato(prato.id, Date.now()) : '');

  return (
    <Modal titulo="Editar prato" aoFechar={aoFechar}>
      <form onSubmit={salvar} noValidate>
        <Campo rotulo="Nome do prato" value={form.nome} onChange={mudar('nome')} erro={erros.nome} />

        <div className="campo">
          <label>
            <span className="campo-rotulo">Tipo de refeição</span>
            <div className="campo-caixa">
              <select value={form.tipoRefeicao} onChange={mudar('tipoRefeicao')}>
                {REFEICOES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </label>
        </div>

        <Campo rotulo="Data do cardápio" tipo="date" value={form.dataInicio} onChange={mudar('dataInicio')} erro={erros.dataInicio} />

        <div className="campo">
          <label>
            <span className="campo-rotulo">Descrição</span>
            <textarea value={form.descricao} onChange={mudar('descricao')} maxLength={255} placeholder="Ingredientes ou informações do prato" />
          </label>
          <span className="contador">{form.descricao.length}/255</span>
        </div>

        <div className="campo">
          <span className="campo-rotulo">Foto do prato</span>
          <label className="upload upload-pequeno">
            <input type="file" accept="image/*" onChange={escolherArquivo} hidden />
            {fotoMostrada ? (
              <img src={fotoMostrada} alt="Foto do prato" onError={() => setFotoAtualOk(false)} />
            ) : (
              <span>Clique para enviar uma foto</span>
            )}
          </label>
          {fotoMostrada && <span className="campo-dica">Clique na foto para trocar.</span>}
          {erros.arquivo && <span className="campo-erro">{erros.arquivo}</span>}
        </div>

        {erroGeral && <Mensagem>{erroGeral}</Mensagem>}

        <div className="acoes-modal">
          <button type="button" className="botao neutro" onClick={aoFechar} disabled={salvando}>Cancelar</button>
          <button className="botao" disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar'}</button>
        </div>
      </form>
    </Modal>
  );
}
