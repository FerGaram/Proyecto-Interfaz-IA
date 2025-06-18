// Tipos
export interface FiguraOriginal {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export interface InflatedFigura extends FiguraOriginal {
  inflate: number;
}

// Inflado asimétrico: cada lado puede inflarse diferente
export interface InflatedFiguraAsym extends FiguraOriginal {
  inflate: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

// Verifica si dos rectángulos se intersectan
export function rectsIntersect(a: FiguraOriginal, b: FiguraOriginal): boolean {
  return !(
    a.x + a.width <= b.x ||
    a.x >= b.x + b.width ||
    a.y + a.height <= b.y ||
    a.y >= b.y + b.height
  );
}

// Calcula el máximo delta de inflación para un rectángulo sin invadir otros
export function getMaxInflateDelta(
  figura: FiguraOriginal,
  otras: FiguraOriginal[],
  step = 1,
  maxDelta = 100
): number {
  let delta = 0;
  outer: for (let d = 1; d <= maxDelta; d += step) {
    const inflated: FiguraOriginal = {
      ...figura,
      x: figura.x - d,
      y: figura.y - d,
      width: figura.width + 2 * d,
      height: figura.height + 2 * d,
    };
    for (const otra of otras) {
      if (otra.id !== figura.id && rectsIntersect(inflated, otra)) {
        break outer;
      }
    }
    delta = d;
  }
  return delta;
}

// Devuelve una nueva figura inflada por delta
export function inflateFigura(figura: FiguraOriginal, delta: number): FiguraOriginal {
  return {
    ...figura,
    x: figura.x - delta,
    y: figura.y - delta,
    width: figura.width + 2 * delta,
    height: figura.height + 2 * delta,
  };
}

// Calcula todas las figuras infladas al máximo permitido
export function inflateFigurasNoOverlap(figuras: FiguraOriginal[]): InflatedFigura[] {
  return figuras.map((fig) => {
    const otras = figuras.filter((f) => f.id !== fig.id);
    const maxDelta = getMaxInflateDelta(fig, otras);
    return { ...fig, inflate: maxDelta };
  });
}

// Calcula la distancia mínima de cada lado de 'fig' a cualquier lado de cualquier otra figura
function getMaxInflatePerSide(fig: FiguraOriginal, otras: FiguraOriginal[], maxDelta = 100): InflatedFiguraAsym["inflate"] {
  // Para cada lado, buscamos la distancia mínima a cualquier lado de otra figura
  let minTop = maxDelta, minRight = maxDelta, minBottom = maxDelta, minLeft = maxDelta;
  for (const otra of otras) {
    if (otra.id === fig.id) continue;
    // Top: distancia entre fig.y y (otra.y + otra.height) si verticalmente se solapan
    if (
      fig.x < otra.x + otra.width &&
      fig.x + fig.width > otra.x // hay solapamiento horizontal
    ) {
      if (otra.y + otra.height <= fig.y) {
        minTop = Math.min(minTop, fig.y - (otra.y + otra.height));
      }
      if (otra.y >= fig.y + fig.height) {
        minBottom = Math.min(minBottom, otra.y - (fig.y + fig.height));
      }
    }
    // Left/Right: si hay solapamiento vertical
    if (
      fig.y < otra.y + otra.height &&
      fig.y + fig.height > otra.y
    ) {
      if (otra.x + otra.width <= fig.x) {
        minLeft = Math.min(minLeft, fig.x - (otra.x + otra.width));
      }
      if (otra.x >= fig.x + fig.width) {
        minRight = Math.min(minRight, otra.x - (fig.x + fig.width));
      }
    }
    // Distancia a vértices (evitar contacto vértice-arista)
    // Top-left
    minTop = Math.min(minTop, fig.y - (otra.y + otra.height));
    minLeft = Math.min(minLeft, fig.x - (otra.x + otra.width));
    // Top-right
    minTop = Math.min(minTop, fig.y - (otra.y + otra.height));
    minRight = Math.min(minRight, otra.x - (fig.x + fig.width));
    // Bottom-left
    minBottom = Math.min(minBottom, otra.y - (fig.y + fig.height));
    minLeft = Math.min(minLeft, fig.x - (otra.x + otra.width));
    // Bottom-right
    minBottom = Math.min(minBottom, otra.y - (fig.y + fig.height));
    minRight = Math.min(minRight, otra.x - (fig.x + fig.width));
  }
  // No permitir valores negativos ni cero (mínimo 0)
  return {
    top: Math.max(0, minTop - 0.1),
    right: Math.max(0, minRight - 0.1),
    bottom: Math.max(0, minBottom - 0.1),
    left: Math.max(0, minLeft - 0.1),
  };
}

// Calcula la distancia mínima entre lados paralelos de dos rectángulos en una dirección
// function minDistanceBetweenRects(a: FiguraOriginal, b: FiguraOriginal, direction: 'left' | 'right' | 'top' | 'bottom') {
//   // Solo si hay solapamiento en la otra dimensión
//   if (direction === 'left' || direction === 'right') {
//     if (a.y + a.height <= b.y || a.y >= b.y + b.height) return Infinity;
//     if (direction === 'left' && b.x + b.width <= a.x) return a.x - (b.x + b.width);
//     if (direction === 'right' && b.x >= a.x + a.width) return b.x - (a.x + a.width);
//   } else {
//     if (a.x + a.width <= b.x || a.x >= b.x + b.width) return Infinity;
//     if (direction === 'top' && b.y + b.height <= a.y) return a.y - (b.y + b.height);
//     if (direction === 'bottom' && b.y >= a.y + a.height) return b.y - (a.y + a.height);
//   }
//   return Infinity;
// }

// Calcula la expansión máxima de cada lado para que la figura inflada nunca cruce ni contenga otra figura original
function getMaxInflatePerSideNoContain(fig: FiguraOriginal, otras: FiguraOriginal[], maxDelta = 1000): InflatedFiguraAsym["inflate"] {
  let minTop = maxDelta, minRight = maxDelta, minBottom = maxDelta, minLeft = maxDelta;
  for (const otra of otras) {
    if (otra.id === fig.id) continue;
    // Top: solo si hay solapamiento horizontal
    if (fig.x < otra.x + otra.width && fig.x + fig.width > otra.x) {
      if (otra.y + otra.height <= fig.y) {
        minTop = Math.min(minTop, fig.y - (otra.y + otra.height));
      }
    }
    // Bottom: solo si hay solapamiento horizontal
    if (fig.x < otra.x + otra.width && fig.x + fig.width > otra.x) {
      if (otra.y >= fig.y + fig.height) {
        minBottom = Math.min(minBottom, otra.y - (fig.y + fig.height));
      }
    }
    // Left: solo si hay solapamiento vertical
    if (fig.y < otra.y + otra.height && fig.y + fig.height > otra.y) {
      if (otra.x + otra.width <= fig.x) {
        minLeft = Math.min(minLeft, fig.x - (otra.x + otra.width));
      }
    }
    // Right: solo si hay solapamiento vertical
    if (fig.y < otra.y + otra.height && fig.y + fig.height > otra.y) {
      if (otra.x >= fig.x + fig.width) {
        minRight = Math.min(minRight, otra.x - (fig.x + fig.width));
      }
    }
  }
  // No permitir valores negativos ni cero (mínimo 0)
  return {
    top: Math.max(0, minTop - 0.1),
    right: Math.max(0, minRight - 0.1),
    bottom: Math.max(0, minBottom - 0.1),
    left: Math.max(0, minLeft - 0.1),
  };
}

// Calcula todas las figuras infladas asimétricamente para que nunca contengan ni crucen originales ajenos
export function inflateFigurasNoContainOtherOriginal(figuras: FiguraOriginal[]): InflatedFiguraAsym[] {
  return figuras.map((fig) => {
    const otras = figuras.filter((f) => f.id !== fig.id);
    const inflate = getMaxInflatePerSideNoContain(fig, otras);
    return {
      ...fig,
      inflate,
      x: fig.x - inflate.left,
      y: fig.y - inflate.top,
      width: fig.width + inflate.left + inflate.right,
      height: fig.height + inflate.top + inflate.bottom,
    };
  });
}

// Calcula la expansión máxima de cada lado para que la figura inflada toque otras infladas pero nunca contenga originales ajenos
export function inflateFigurasTouchInflatedNoContainOriginal(figuras: FiguraOriginal[]): InflatedFiguraAsym[] {
  // Paso 1: Inflar cada figura hasta antes de tocar cualquier original ajeno
  const infladasBase = figuras.map((fig) => {
    const otras = figuras.filter((f) => f.id !== fig.id);
    const inflate = getMaxInflatePerSideNoContain(fig, otras);
    return {
      ...fig,
      inflate,
      x: fig.x - inflate.left,
      y: fig.y - inflate.top,
      width: fig.width + inflate.left + inflate.right,
      height: fig.height + inflate.top + inflate.bottom,
    };
  });
  // Paso 2: Ajustar para que las infladas se toquen entre sí pero nunca crucen originales ajenos
  return infladasBase.map((inflada, idx) => {
    let { x, y, width, height, inflate } = inflada;
    // Revisar cada lado contra las otras infladas
    for (let j = 0; j < infladasBase.length; j++) {
      if (j === idx) continue;
      const otra = infladasBase[j];
      // Solo ajustar si no se cruza ningún original ajeno
      // Derecha
      if (
        y < otra.y + otra.height && y + height > otra.y && // solapamiento vertical
        x + width <= otra.x // a la izquierda
      ) {
        const dist = otra.x - (x + width);
        if (dist < 0.1) {
          width += dist; // ajustar para que solo se toquen
        }
      }
      // Izquierda
      if (
        y < otra.y + otra.height && y + height > otra.y &&
        otra.x + otra.width <= x // a la derecha
      ) {
        const dist = x - (otra.x + otra.width);
        if (dist < 0.1) {
          x += dist;
          width -= dist;
        }
      }
      // Abajo
      if (
        x < otra.x + otra.width && x + width > otra.x &&
        y + height <= otra.y // arriba
      ) {
        const dist = otra.y - (y + height);
        if (dist < 0.1) {
          height += dist;
        }
      }
      // Arriba
      if (
        x < otra.x + otra.width && x + width > otra.x &&
        otra.y + otra.height <= y // abajo
      ) {
        const dist = y - (otra.y + otra.height);
        if (dist < 0.1) {
          y += dist;
          height -= dist;
        }
      }
    }
    return { ...inflada, x, y, width, height, inflate };
  });
}

// Verifica si un rectángulo cubre/intersecta cualquier original ajeno
function intersectsAnyOriginal(rect: FiguraOriginal, originales: FiguraOriginal[], selfId: string): boolean {
  return originales.some(o => o.id !== selfId && rectsIntersect(rect, o));
}

// Expansión iterativa: cada inflada se expande hasta rozar otras infladas, pero nunca cubre originales ajenos
export function inflateFigurasIterative(figuras: FiguraOriginal[]): InflatedFiguraAsym[] {
  // Paso 1: Inflar cada figura hasta antes de tocar cualquier original ajeno
  let infladas = figuras.map((fig) => {
    const otras = figuras.filter((f) => f.id !== fig.id);
    const inflate = getMaxInflatePerSideNoContain(fig, otras);
    return {
      ...fig,
      inflate: { ...inflate },
      x: fig.x - inflate.left,
      y: fig.y - inflate.top,
      width: fig.width + inflate.left + inflate.right,
      height: fig.height + inflate.top + inflate.bottom,
    };
  });

  // Paso 2: Iterativamente expandir cada lado hasta rozar otras infladas, sin cubrir originales ajenos
  let changed = true;
  const maxIters = 20;
  let iter = 0;
  while (changed && iter < maxIters) {
    changed = false;
    iter++;
    infladas = infladas.map((inflada, idx) => {
      let { x, y, width, height, inflate } = inflada;
      const selfId = inflada.id;
      // Expandir cada lado
      const tryExpand = (side: 'top' | 'right' | 'bottom' | 'left') => {
        let step = 1;
        let canExpand = true;
        while (canExpand) {
          let nx = x, ny = y, nw = width, nh = height;
          if (side === 'top') { ny -= step; nh += step; }
          if (side === 'bottom') { nh += step; }
          if (side === 'left') { nx -= step; nw += step; }
          if (side === 'right') { nw += step; }
          const testRect = { id: selfId, x: nx, y: ny, width: nw, height: nh };
          // ¿Toca alguna inflada ajena?
          let touchesOtherInflada = infladas.some((o, j) => j !== idx && rectsIntersect(testRect, o));
          // ¿Cubre algún original ajeno?
          let coversOriginal = intersectsAnyOriginal(testRect, figuras, selfId);
          if (!touchesOtherInflada && !coversOriginal) {
            // Expandir
            x = nx; y = ny; width = nw; height = nh;
            inflate = { ...inflate };
            if (side === 'top') inflate.top += step;
            if (side === 'bottom') inflate.bottom += step;
            if (side === 'left') inflate.left += step;
            if (side === 'right') inflate.right += step;
            changed = true;
          } else {
            canExpand = false;
          }
        }
      };
      tryExpand('top');
      tryExpand('bottom');
      tryExpand('left');
      tryExpand('right');
      return { ...inflada, x, y, width, height, inflate };
    });
  }
  return infladas;
}

// Expansión rectangular coherente: todos los lados se expanden lo máximo posible, pero el rectángulo inflado nunca cruza ni contiene originales ajenos
export function inflateFigurasRectIterative(figuras: FiguraOriginal[]): InflatedFiguraAsym[] {
  // Paso 1: Para cada figura, calcula la expansión máxima de cada lado sin cruzar originales ajenos
  const infladas = figuras.map((fig) => {
    const otras = figuras.filter((f) => f.id !== fig.id);
    const inflate = getMaxInflatePerSideNoContain(fig, otras);
    return { ...fig, inflate: { ...inflate } };
  });
  // Paso 2: Para cada figura, la expansión final es la mínima permitida por todos los lados (para mantener cuadrilátero)
  return infladas.map((inflada) => {
    const minDelta = Math.min(
      inflada.inflate.top,
      inflada.inflate.right,
      inflada.inflate.bottom,
      inflada.inflate.left
    );
    return {
      ...inflada,
      x: inflada.x - minDelta,
      y: inflada.y - minDelta,
      width: inflada.width + 2 * minDelta,
      height: inflada.height + 2 * minDelta,
      inflate: { top: minDelta, right: minDelta, bottom: minDelta, left: minDelta },
    };
  });
}

// Expansión asimétrica: cada lado se expande hasta el máximo permitido, nunca cubriendo originales ajenos
export function inflateFigurasAsymNoContain(figuras: FiguraOriginal[]): InflatedFiguraAsym[] {
  const maxDelta = 60;
  return figuras.map((fig) => {
    const otras = figuras.filter((f) => f.id !== fig.id);
    let inflate = getMaxInflatePerSideNoContain(fig, otras);
    // Si no hay otras figuras, limitar expansión máxima
    if (otras.length === 0) {
      inflate = {
        top: Math.min(inflate.top, maxDelta),
        right: Math.min(inflate.right, maxDelta),
        bottom: Math.min(inflate.bottom, maxDelta),
        left: Math.min(inflate.left, maxDelta),
      };
    }
    return {
      ...fig,
      x: fig.x - inflate.left,
      y: fig.y - inflate.top,
      width: fig.width + inflate.left + inflate.right,
      height: fig.height + inflate.top + inflate.bottom,
      inflate,
    };
  });
}
