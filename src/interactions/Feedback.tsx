/** Retroalimentación inmediata: ícono + texto + color, anunciada con aria-live. Nunca solo color. */
import { CheckCircle2, Info, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';

export type Estado = 'correcto' | 'incorrecto' | 'neutral';

const ESTILO: Record<Estado, { Icono: typeof CheckCircle2; color: string }> = {
  correcto: { Icono: CheckCircle2, color: 'var(--color-2)' },
  incorrecto: { Icono: XCircle, color: 'var(--color-3)' },
  neutral: { Icono: Info, color: 'var(--color-5)' },
};

export function Feedback({ estado, titulo, children }: { estado: Estado | null; titulo?: string; children?: ReactNode }) {
  const e = estado ? ESTILO[estado] : null;
  return (
    <div className="feedback-region" role="status" aria-live="polite" aria-atomic="true">
      {e && (
        <div className={`feedback ${estado}`} style={{ borderColor: e.color }} data-feedback={estado}>
          <e.Icono size={56} color={e.color} strokeWidth={2.4} aria-hidden="true" />
          <div>
            <p className="b feedback-titulo">{titulo}</p>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
