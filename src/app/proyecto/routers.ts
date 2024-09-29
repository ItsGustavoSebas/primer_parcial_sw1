import { dia, g, routers } from '@joint/plus';
import { RouterOptions } from './interfaces';

export const routerNamespace = { ...routers };

function customRouter(vertices: Array<g.Point>, opt: RouterOptions, linkView: dia.LinkView): { x: number; y: number }[] | undefined {
  const link = linkView.model;
  const source = link.getSourceElement();
  const target = link.getTargetElement();
  if (source) {
    const sourceBBox = source.getBBox();
    if (target) {
      const targetBBox = target.getBBox();
      const sourcePoint = linkView.sourceAnchor;
      const targetPoint = linkView.targetAnchor;
      const { x: tx0, y: ty0 } = targetBBox;
      const { x: sx0, y: sy0 } = sourceBBox;
      const sourceOutsidePoint = sourcePoint.clone();
      const spacing = 28;
      const sourceSide = sourceBBox.sideNearestToPoint(sourcePoint);
      switch (sourceSide) {
        case 'left':
          sourceOutsidePoint.x = sx0 - spacing;
          break;
        case 'right':
          sourceOutsidePoint.x = sx0 + sourceBBox.width + spacing;
          break;
        case 'top':
          sourceOutsidePoint.y = sy0 - spacing;
          break;
        case 'bottom':
          sourceOutsidePoint.y = sy0 + sourceBBox.height + spacing;
          break;
      }
      const targetOutsidePoint = targetPoint.clone();
      const targetSide = targetBBox.sideNearestToPoint(targetPoint);
      switch (targetSide) {
        case 'left':
          targetOutsidePoint.x = targetBBox.x - spacing;
          break;
        case 'right':
          targetOutsidePoint.x = targetBBox.x + targetBBox.width + spacing;
          break;
        case 'top':
          targetOutsidePoint.y = targetBBox.y - spacing;
          break;
        case 'bottom':
          targetOutsidePoint.y = targetBBox.y + targetBBox.height + spacing;
          break;
      }

      const { x: sox, y: soy } = sourceOutsidePoint;
      const { x: tox, y: toy } = targetOutsidePoint;
      const tx1 = tx0 + targetBBox.width;
      const ty1 = ty0 + targetBBox.height;
      const tcx = (tx0 + tx1) / 2;
      const tcy = (ty0 + ty1) / 2;
      const sx1 = sx0 + sourceBBox.width;
      const sy1 = sy0 + sourceBBox.height;

      if (sourceSide === 'left' && targetSide === 'right') {
        if (sox < tox) {
          let y = (soy + toy) / 2;
          if (sox < tx0) {
            if (y > tcy && y < ty1 + spacing) {
              y = ty0 - spacing;
            } else if (y <= tcy && y > ty0 - spacing) {
              y = ty1 + spacing;
            }
          }
          return [
            { x: sox, y: soy },
            { x: sox, y },
            { x: tox, y },
            { x: tox, y: toy },
          ];
        } else {
          const x = (sox + tox) / 2;
          return [
            { x, y: soy },
            { x, y: toy },
          ];
        }
      } else if (sourceSide === 'right' && targetSide === 'left') {
        // Right to left
        if (sox > tox) {
          let y = (soy + toy) / 2;
          if (sox > tx1) {
            if (y > tcy && y < ty1 + spacing) {
              y = ty0 - spacing;
            } else if (y <= tcy && y > ty0 - spacing) {
              y = ty1 + spacing;
            }
          }
          return [
            { x: sox, y: soy },
            { x: sox, y },
            { x: tox, y },
            { x: tox, y: toy },
          ];
        } else {
          const x = (sox + tox) / 2;
          return [
            { x, y: soy },
            { x, y: toy },
          ];
        }
      } else if (sourceSide === 'top' && targetSide === 'bottom') {
        // analogical to let to right
        if (soy < toy) {
          let x = (sox + tox) / 2;
          if (soy < ty0) {
            if (x > tcx && x < tx1 + spacing) {
              x = tx0 - spacing;
            } else if (x <= tcx && x > tx0 - spacing) {
              x = tx1 + spacing;
            }
          }
          return [
            { x: sox, y: soy },
            { x, y: soy },
            { x, y: toy },
            { x: tox, y: toy },
          ];
        }
        const y = (soy + toy) / 2;
        return [
          { x: sox, y },
          { x: tox, y },
        ];
      } else if (sourceSide === 'bottom' && targetSide === 'top') {
        // analogical to right to left
        if (soy >= toy) {
          let x = (sox + tox) / 2;
          if (soy > ty1) {
            if (x > tcx && x < tx1 + spacing) {
              x = tx0 - spacing;
            } else if (x <= tcx && x > tx0 - spacing) {
              x = tx1 + spacing;
            }
          }
          return [
            { x: sox, y: soy },
            { x, y: soy },
            { x, y: toy },
            { x: tox, y: toy },
          ];
        }
        const y = (soy + toy) / 2;
        return [
          { x: sox, y },
          { x: tox, y },
        ];
      } else if (sourceSide === 'top' && targetSide === 'top') {
        const y = Math.min(soy, toy);
        return [
          { x: sox, y },
          { x: tox, y },
        ];
      } else if (sourceSide === 'bottom' && targetSide === 'bottom') {
        const y = Math.max(soy, toy);
        return [
          { x: sox, y },
          { x: tox, y },
        ];
      } else if (sourceSide === 'left' && targetSide === 'left') {
        const x = Math.min(sox, tox);
        return [
          { x, y: soy },
          { x, y: toy },
        ];
      } else if (sourceSide === 'right' && targetSide === 'right') {
        const x = Math.max(sox, tox);
        return [
          { x, y: soy },
          { x, y: toy },
        ];
      } else if (sourceSide === 'top' && targetSide === 'right') {
        if (soy > toy) {
          if (sox < tox) {
            let y = (sy0 + toy) / 2;
            if (y > tcy && y < ty1 + spacing && sox < tx0 - spacing) {
              y = ty0 - spacing;
            }
            return [
              { x: sox, y },
              { x: tox, y },
              { x: tox, y: toy },
            ];
          }
          return [{ x: sox, y: toy }];
        }
        const x = (sx0 + tox) / 2;
        if (x > sx0 - spacing && soy < ty1) {
          const y = Math.min(sy0, ty0) - spacing;
          const x = Math.max(sx1, tx1) + spacing;
          return [
            { x: sox, y },
            { x, y },
            { x, y: toy },
          ];
        }
        return [
          { x: sox, y: soy },
          { x: x, y: soy },
          { x: x, y: toy },
        ];
      } else if (sourceSide === 'top' && targetSide === 'left') {
        if (soy > toy) {
          if (sox > tox) {
            let y = (sy0 + toy) / 2;
            if (y > tcy && y < ty1 + spacing && sox > tx1 + spacing) {
              y = ty0 - spacing;
            }
            return [
              { x: sox, y },
              { x: tox, y },
              { x: tox, y: toy },
            ];
          }
          return [{ x: sox, y: toy }];
        }
        const x = (sx1 + tox) / 2;
        if (x < sx1 + spacing && soy < ty1) {
          const y = Math.min(sy0, ty0) - spacing;
          const x = Math.min(sx0, tx0) - spacing;
          return [
            { x: sox, y },
            { x, y },
            { x, y: toy },
          ];
        }
        return [
          { x: sox, y: soy },
          { x: x, y: soy },
          { x: x, y: toy },
        ];
      } else if (sourceSide === 'bottom' && targetSide === 'right') {
        if (soy < toy) {
          if (sox < tox) {
            let y = (sy1 + ty0) / 2;
            if (y < tcy && y > ty0 - spacing && sox < tx0 - spacing) {
              y = ty1 + spacing;
            }
            return [
              { x: sox, y },
              { x: tox, y },
              { x: tox, y: toy },
            ];
          }
          return [
            { x: sox, y: soy },
            { x: sox, y: toy },
            { x: tox, y: toy },
          ];
        }
        const x = (sx0 + tox) / 2;
        if (x > sx0 - spacing && sy1 > toy) {
          const y = Math.max(sy1, ty1) + spacing;
          const x = Math.max(sx1, tx1) + spacing;
          return [
            { x: sox, y },
            { x, y },
            { x, y: toy },
          ];
        }
        return [
          { x: sox, y: soy },
          { x: x, y: soy },
          { x: x, y: toy },
          { x: tox, y: toy },
        ];
      } else if (sourceSide === 'bottom' && targetSide === 'left') {
        if (soy < toy) {
          if (sox > tox) {
            let y = (sy1 + ty0) / 2;
            if (y < tcy && y > ty0 - spacing && sox > tx1 + spacing) {
              y = ty1 + spacing;
            }
            return [
              { x: sox, y },
              { x: tox, y },
              { x: tox, y: toy },
            ];
          }
          return [
            { x: sox, y: soy },
            { x: sox, y: toy },
            { x: tox, y: toy },
          ];
        }
        const x = (sx1 + tox) / 2;
        if (x < sx1 + spacing && sy1 > toy) {
          const y = Math.max(sy1, ty1) + spacing;
          const x = Math.min(sx0, tx0) - spacing;
          return [
            { x: sox, y },
            { x, y },
            { x, y: toy },
          ];
        }
        return [
          { x: sox, y: soy },
          { x: x, y: soy },
          { x: x, y: toy },
          { x: tox, y: toy },
        ];
      } else if (sourceSide === 'left' && targetSide === 'bottom') {
        if (sox > tox) {
          if (soy < toy) {
            let x = (sx0 + tx1) / 2;
            if (x > tcx && x < tx1 + spacing && soy < ty0 - spacing) {
              x = Math.max(sx1, tx1) + spacing;
            }
            return [
              { x, y: soy },
              { x, y: toy },
              { x: tox, y: toy },
            ];
          }
          return [{ x: tox, y: soy }];
        }
        const y = (sy0 + ty1) / 2;
        if (y > sy0 - spacing) {
          const x = Math.min(sx0, tx0) - spacing;
          const y = Math.max(sy1, ty1) + spacing;
          return [
            { x, y: soy },
            { x, y },
            { x: tox, y },
          ];
        }
        return [
          { x: sox, y: soy },
          { x: sox, y: y },
          { x: tox, y },
          { x: tox, y: toy },
        ];
      } else if (sourceSide === 'left' && targetSide === 'top') {
        // Analogy to the left - bottom case.
        if (sox > tox) {
          if (soy > toy) {
            let x = (sx0 + tx1) / 2;
            if (x > tcx && x < tx1 + spacing && soy > ty1 + spacing) {
              x = Math.max(sx1, tx1) + spacing;
            }
            return [
              { x, y: soy },
              { x, y: toy },
              { x: tox, y: toy },
            ];
          }
          return [{ x: tox, y: soy }];
        }
        const y = (sy1 + ty0) / 2;
        if (y < sy1 + spacing) {
          const x = Math.min(sx0, tx0) - spacing;
          const y = Math.min(sy0, ty0) - spacing;
          return [
            { x, y: soy },
            { x, y },
            { x: tox, y },
          ];
        }
        return [
          { x: sox, y: soy },
          { x: sox, y: y },
          { x: tox, y },
          { x: tox, y: toy },
        ];
      } else if (sourceSide === 'right' && targetSide === 'top') {
        // Analogy to the right - bottom case.
        if (sox < tox) {
          if (soy > toy) {
            let x = (sx1 + tx0) / 2;
            if (x < tcx && x > tx0 - spacing && soy > ty1 + spacing) {
              x = Math.max(sx1, tx1) + spacing;
            }
            return [
              { x, y: soy },
              { x, y: toy },
              { x: tox, y: toy },
            ];
          }
          return [{ x: tox, y: soy }];
        }
        const y = (sy1 + ty0) / 2;
        if (y < sy1 + spacing) {
          const x = Math.max(sx1, tx1) + spacing;
          const y = Math.min(sy0, ty0) - spacing;
          return [
            { x, y: soy },
            { x, y },
            { x: tox, y },
          ];
        }
        return [
          { x: sox, y: soy },
          { x: sox, y: y },
          { x: tox, y },
          { x: tox, y: toy },
        ];
      } else if (sourceSide === 'right' && targetSide === 'bottom') {
        // Analogy to the right - top case.
        if (sox < tox) {
          if (soy < toy) {
            let x = (sx1 + tx0) / 2;
            if (x < tcx && x > tx0 - spacing && soy < ty0 - spacing) {
              x = Math.min(sx0, tx0) - spacing;
            }
            return [
              { x, y: soy },
              { x, y: toy },
              { x: tox, y: toy },
            ];
          }
          return [
            { x: sox, y: soy },
            { x: tox, y: soy },
            { x: tox, y: toy },
          ];
        }
        const y = (sy0 + ty1) / 2;
        if (y > sy0 - spacing) {
          const x = Math.max(sx1, tx1) + spacing;
          const y = Math.max(sy1, ty1) + spacing;
          return [
            { x, y: soy },
            { x, y },
            { x: tox, y },
          ];
        }
        return [
          { x: sox, y: soy },
          { x: sox, y: y },
          { x: tox, y },
          { x: tox, y: toy },
        ];
      }
    }
    return [];
  }
  return [];
};
Object.assign(routerNamespace, {
  customRouter,
});
