'use client';

function KernelFace() {
  return (
    <svg
      width="60"
      height="60"
      viewBox="0 0 60 60"
      shapeRendering="crispEdges"
      aria-hidden="true"
      className="kernel-face"
    >
      {/* antenna */}
      <rect x="27" y="0" width="6" height="5" fill="#00ff41" />
      <rect x="29" y="4" width="2" height="2" fill="#c8ffd4" />
      {/* head / monitor */}
      <rect x="3" y="4" width="54" height="52" rx="4" fill="#060606" stroke="#00ff41" strokeWidth="2" />
      {/* inner screen bezel */}
      <rect x="9" y="10" width="42" height="34" fill="#001a06" />
      {/* eyes (blink via CSS) */}
      <rect className="kernel-eye" x="14" y="16" width="10" height="10" fill="#00ff41" />
      <rect className="kernel-eye" x="36" y="16" width="10" height="10" fill="#00ff41" />
      {/* mouth */}
      <rect x="16" y="34" width="28" height="5" fill="#00ff41" />
      <rect x="20" y="33" width="20" height="2" fill="#00ff41" opacity="0.5" />
      {/* chin detail */}
      <rect x="9" y="46" width="42" height="2" fill="#00a030" />
    </svg>
  );
}

export default function Assistant({ data, step, total, onNext, onPrev, onClose, onDismiss }) {
  const isTour = typeof step === 'number';

  return (
    <div className="assistant" role="dialog" aria-label="Asistente KERNEL">
      <div className="assistant-character">
        <KernelFace />
      </div>
      <div className="assistant-bubble">
        <div className="assistant-head">
          <span className="assistant-title">
            <span className="assistant-name">KERNEL</span>
            {data && <span className="assistant-subtitle">{data.title}</span>}
          </span>
          <button className="assistant-close" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>
        {data && <p className="assistant-body">{data.body}</p>}
        <div className="assistant-actions">
          {isTour ? (
            <>
              <span className="assistant-step">
                {step + 1} / {total}
              </span>
              {step > 0 && <button onClick={onPrev}>« Atrás</button>}
              <button className="assistant-primary" onClick={onNext}>
                {step === total - 1 ? 'Listo' : 'Siguiente »'}
              </button>
            </>
          ) : (
            <button className="assistant-primary" onClick={onClose}>
              Entendido
            </button>
          )}
          <button className="assistant-mute" onClick={onDismiss} title="No volver a mostrar">
            No molestar
          </button>
        </div>
      </div>
    </div>
  );
}
