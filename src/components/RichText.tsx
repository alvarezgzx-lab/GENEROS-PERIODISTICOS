/** Renderiza el énfasis tipográfico de los insumos (**negritas** y *cursivas*) sin alterar el texto. */
import { Fragment, type ReactNode } from 'react';

export function richText(texto: string): ReactNode[] {
  const partes: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let ultimo = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(texto))) {
    if (m.index > ultimo) partes.push(<Fragment key={k++}>{texto.slice(ultimo, m.index)}</Fragment>);
    if (m[1] !== undefined) partes.push(<strong key={k++}>{richText(m[1])}</strong>);
    else partes.push(<em key={k++}>{m[2]}</em>);
    ultimo = m.index + m[0].length;
  }
  if (ultimo < texto.length) partes.push(<Fragment key={k++}>{texto.slice(ultimo)}</Fragment>);
  return partes;
}

/** Texto plano sin marcas de énfasis. */
export const textoPlano = (texto: string) => texto.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1');
