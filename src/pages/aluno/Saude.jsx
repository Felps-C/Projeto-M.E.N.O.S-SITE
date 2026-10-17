import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { atualizarEstudante, buscarEstudante } from '../../api/endpoints.js';
import {
  NENHUMA_RESTRICAO,
  OPCOES_ALERGIA,
  limiteDasObservacoes,
  lerAlergias,
  montarAlergias,
} from '../../utils/alergias.js';

const ITENS = [...OPCOES_ALERGIA, NENHUMA_RESTRICAO];

// Tela "Saúde e Alergias" do aluno (Figma): caixinhas + observações.
export default function Saude() {
  const { sessao } = useAuth();
  const navegar = useNavigate();

  const [estudante, setEstudante] = useState(null); // cadastro completo, que o PUT do backend exige
  const [marcadas, setMarcadas] = useState([]);
  const [observacoes, setObservacoes] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let ativo = true;
    buscarEstudante(sessao.id)
      .then((dados) => {
        if (!ativo) return;
        const salvo = lerAlergias(dados.alergias);
        setEstudante(dados);
        setMarcadas(salvo.marcadas);
        setObservacoes(salvo.observacoes);
      })
      .catch((e) => ativo && setErro(e.message));
    return () => {
      ativo = false;
    };
  }, [sessao.id]);

  function alternar(item) {
    setMarcadas((atual) => {
      if (atual.includes(item)) return atual.filter((i) => i !== item);
      // "Nenhuma restrição" não combina com as outras opções.
      if (item === NENHUMA_RESTRICAO) return [NENHUMA_RESTRICAO];
      return [...atual.filter((i) => i !== NENHUMA_RESTRICAO), item];
    });
  }

  async function salvar(evento) {
    evento.preventDefault();
    if (!estudante) return;
    setErro('');
    setSalvando(true);
    try {
      await atualizarEstudante(sessao.id, {
        nome: estudante.nome,
        email: estudante.email,
        matriculaEscolar: estudante.matriculaEscolar,
        escolaId: estudante.escolaId,
        alergias: montarAlergias(marcadas, observacoes),
      });
      navegar('/aluno');
    } catch (e) {
      setErro(e.message);
      setSalvando(false);
    }
  }

  const limite = limiteDasObservacoes(marcadas);

  return (
    <form className="aluno-pagina" onSubmit={salvar}>
      <h1>Saúde e Alergias</h1>
      <p className="aluno-pagina-sub">Nos ajude a cuidar melhor da sua alimentação escolar</p>

      {!estudante && !erro && <p className="detalhe">Carregando...</p>}

      {estudante && (
        <>
          {ITENS.map((item) => (
            <label key={item} className={`item-saude${marcadas.includes(item) ? ' marcado' : ''}`}>
              <input type="checkbox" checked={marcadas.includes(item)} onChange={() => alternar(item)} />
              <span>{item}</span>
            </label>
          ))}

          <label className="saude-obs">
            <span className="saude-obs-rotulo">Outras observações (opcional)</span>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              maxLength={limite}
              rows={3}
              placeholder="Ex: outras restrições ou informações importantes"
            />
          </label>
        </>
      )}

      {erro && <p className="erro-geral" role="alert">{erro}</p>}

      <button className="botao botao-bloco" disabled={!estudante || salvando}>
        {salvando ? 'Salvando...' : 'Salvar e continuar'}
      </button>
    </form>
  );
}
