// Cabeçalho das telas da escola: título, subtítulo e (opcional) um botão de ação à direita.
export default function PaginaTopo({ titulo, subtitulo, acao }) {
  return (
    <header className="pagina-topo">
      <div>
        <h1>{titulo}</h1>
        {subtitulo && <p className="subtitulo">{subtitulo}</p>}
      </div>
      {acao}
    </header>
  );
}
