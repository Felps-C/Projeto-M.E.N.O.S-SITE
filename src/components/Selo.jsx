// Etiqueta de status. tipo="alerta" (vermelha) ou tipo="normal" (verde).
export default function Selo({ tipo = 'normal', children }) {
  return <span className={`selo ${tipo}`}>{children}</span>;
}
