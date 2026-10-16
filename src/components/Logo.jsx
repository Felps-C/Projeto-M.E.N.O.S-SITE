import { useState } from 'react';

// Mostra /logo.png (pasta public). Se o arquivo não existir, mostra um texto no lugar.
export default function Logo({ largura = 160 }) {
  const [semImagem, setSemImagem] = useState(false);

  if (semImagem) {
    return <div className="logo-texto">M.E.N.O.S</div>;
  }
  return (
    <img
      src="/logo.png"
      width={largura}
      alt="M.E.N.O.S – Merenda Escolar Nutritiva e Otimizada Sem Desperdício"
      onError={() => setSemImagem(true)}
    />
  );
}
