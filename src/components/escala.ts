import { createContext, useContext } from 'react';

/** Escala actual del lienzo 1920×1080 respecto a la ventana (para corregir el arrastre). */
export const EscalaContext = createContext(1);
export const useEscala = () => useContext(EscalaContext);
