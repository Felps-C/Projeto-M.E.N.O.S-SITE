import { useEffect } from 'react';

// Janela sobre a tela. Fecha com Esc ou clicando fora.
export default function Modal({ titulo, aoFechar, children }) {
  useEffect(() => {
    const aoApertar = (evento) => {
      if (evento.key === 'Escape') aoFechar();
    };
    window.addEventListener('keydown', aoApertar);
    return () => window.removeEventListener('keydown', aoApertar);
  }, [aoFechar]);

  return (
    <div
      className="modal-fundo"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) aoFechar();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-label={titulo}>
        <h2>{titulo}</h2>
        {children}
      </div>
    </div>
  );
}
