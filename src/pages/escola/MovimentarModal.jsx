import { useState } from 'react';
import { registrarEntrada, registrarSaida } from '../../api/estoque.js';
import Campo from '../../components/Campo.jsx';
import Mensagem from '../../components/Mensagem.jsx';
import Modal from '../../components/Modal.jsx';

// Registra entrada (chegou produto) ou saída (usou na merenda) de um produto.
// A quantidade muda só por aqui, assim o histórico de movimentações sempre bate com o saldo.
export default function MovimentarModal({ estoqueId, produto, aoFechar, aoConcluir }) {
  const [tipo, setTipo] = useState('entrada');
  const [quantidade, setQuantidade] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const confirmar = async (evento) => {
    evento.preventDefault();
    if (!/^\d+$/.test(quantidade) || Number(quantidade) < 1) {
      setErro('Informe uma quantidade inteira maior que zero.');
      return;
    }
    const valor = Number(quantidade);
    setSalvando(true);
    setErro('');
    try {
      if (tipo === 'entrada') await registrarEntrada(estoqueId, produto.id, valor);
      else await registrarSaida(estoqueId, produto.id, valor);
      aoConcluir(`${tipo === 'entrada' ? 'Entrada' : 'Saída'} de ${valor} registrada em "${produto.nome}".`);
    } catch (falha) {
      setErro(falha.message); // ex.: "saldo insuficiente" numa saída
      setSalvando(false);
    }
  };

  return (
    <Modal titulo={`Movimentar: ${produto.nome}`} aoFechar={aoFechar}>
      <p className="suave">Quantidade atual: <strong>{produto.quantidade}</strong></p>
      <form onSubmit={confirmar} noValidate>
        <div className="opcoes-radio">
          {[
            ['entrada', 'Entrada'],
            ['saida', 'Saída'],
          ].map(([valor, texto]) => (
            <label key={valor} className={`opcao-radio ${tipo === valor ? 'ativa' : ''}`}>
              <input type="radio" name="tipo" value={valor} checked={tipo === valor} onChange={() => setTipo(valor)} />
              {texto}
            </label>
          ))}
        </div>
        <Campo
          rotulo="Quantidade"
          type="number"
          min="1"
          step="1"
          inputMode="numeric"
          placeholder="0"
          value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)}
          autoFocus
        />
        {erro && <Mensagem>{erro}</Mensagem>}
        <div className="acoes-form">
          <button type="button" className="botao neutro" onClick={aoFechar}>Cancelar</button>
          <button type="submit" className="botao" disabled={salvando}>
            {salvando ? 'Salvando…' : 'Confirmar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
