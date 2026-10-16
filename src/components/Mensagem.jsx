// Faixa de aviso. tipo="erro" (vermelha, padrão) ou tipo="ok" (verde).
export default function Mensagem({ tipo = 'erro', children }) {
  return (
    <div className={`mensagem ${tipo}`} role={tipo === 'erro' ? 'alert' : 'status'}>
      {children}
    </div>
  );
}
