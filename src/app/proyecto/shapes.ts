import { dia, shapes, util } from '@joint/plus';
import { ColumnData } from './interfaces';

export class Table extends shapes.standard.HeaderedRecord {
  override defaults() {
    return util.defaultsDeep(
      {
        type: 'app.Table',
        columns: [],
        code: '',
        padding: { top: 40, bottom: 10, left: 10, right: 10 },
        size: { width: 260 },
        itemMinLabelWidth: 80,
        itemHeight: 25,
        itemOffset: 0,
        itemOverflow: true,
        attrs: {
          root: {
            magnet: false,
          },
          body: {
            stroke: '#FFF',
            fill: '#FFF',
            strokeWidth: 1,
          },
          tabColor: {
            x: -1,
            y: -5,
            width: 'calc(w+2)',
            height: 5,
            stroke: 'none',
            fill: '#6C6C6C',
            strokeWidth: 1,
          },
          header: {
            fill: '#F8FAFC',
            stroke: '#F8FAFC',
            strokeWidth: 1,
          },
          headerLabel: {
            fill: '#636363',
            fontWeight: 'bold',
            fontFamily: 'sans-serif',
            textWrap: {
              ellipsis: true,
              height: 30,
            },
          },
          itemBodies_0: {
            magnet: 'item',
          },
          group_1: {
            pointerEvents: 'none',
          },
          itemLabels: {
            fontFamily: 'sans-serif',
            fill: '#636363',
            pointerEvents: 'none',
          },
          itemLabels_1: {
            fill: '#9C9C9C',
            textAnchor: 'end',
            x: 'calc(0.5 * w - 10)',
          },
          itemLabels_keys: {
            x: 'calc(0.5 * w - 30)',
          },
          iconsGroup_1: {
            refX: '50%',
            refX2: -26,
          },
          
        },
      },
      super.defaults
    );
  }

  override preinitialize(): void {
    this.markup = [
      {
        tagName: 'rect',
        selector: 'body',
      },
      {
        tagName: 'rect',
        selector: 'header',
      },
      {
        tagName: 'rect',
        selector: 'tabColor',
      },
      {
        tagName: 'text',
        selector: 'headerLabel',
      },
    ];
  }

  override initialize(...args: any[]) {
    super.initialize(...args);
    this.on('change', () => this.onColumnsChange());
    this._setColumns(this.get('columns'));
  
}


  onColumnsChange() {
    if (this.hasChanged('columns')) {
      this._setColumns(this.get('columns'));
    }
  }
  getColumns(): Array<{ nombre: string; pk: boolean; scope: string; tipoDato: string }> {
    const columns = this.get('columns');  // Obtenemos las columnas del objeto
    return columns.map((col: ColumnData) => ({
      nombre: col.name,          // Nombre de la columna
      pk: !!col.key,             // Si es clave primaria (convertimos a booleano)
      scope: col.scope || 'private', 
      tipoDato: col.type,        
    }));
  }
  

  setCode(code: string) {
    this.set('code', code);
    return this;
  }

  getCode(): string {
    return this.get('code');
  }

  setName(name: string, opt?: object) {
    return this.attr(['headerLabel', 'text'], name, opt);
  }

  getName(): string {
    return this.attr(['headerLabel', 'text']);
  }

  setTabColor(color: string) {
    return this.attr(['tabColor', 'fill'], color);
  }

  getTabColor(): string {
    return this.attr(['tabColor', 'fill']);
  }

  setColumns(data: Array<ColumnData>) {
    this.set('columns', data);
    return this;
  }

  override toJSON() {
    const json = super.toJSON();
    // keeping only the `columns` attribute
    delete json['items'];
    return json;
  }

  protected _setColumns(data: Array<ColumnData> = []) {
    const names: Array<object> = [];
    const values: Array<object> = [];
  
    data.forEach((item, i) => {
      if (!item.name) return;
  
      // Determinamos el scope: + para público, - para privado
      const scopeSymbol = item.scope === 'public' ? '+' : '-';
  
      // Formateamos el nombre como en UML: "scope name: type"
      const formattedName = `${scopeSymbol} ${item.name} : ${item.type}`;
  
      // Agregamos el nombre formateado a la primera fila (etiqueta de la columna)
      names.push({
        id: item.name,
        label: formattedName, // Usamos el nombre formateado
        span: 2,
      });
  
      const value = {
        id: `${item.type}_${i}`,
      };
  
      // Si es una llave, agregamos el icono
      if (item.key) {
        Object.assign(value, {
          group: 'keys',
          icon: 'assets/key.svg',
        });
      }
  
      values.push(value);
    });
  
    // Establecemos los items con la nueva estructura
    this.set('items', [names, values]);
    this.removeInvalidLinks();
  
    return this;
  }
  
}

export class Link extends dia.Link {
  override defaults() {
    return {
      ...super.defaults,
      type: 'app.Link',
      z: -1,
      attrs: {
        root: {
          pointerEvents: "none"
        },
        wrapper: {
          connection: true,
          strokeWidth: 10
        },
        line: {
          connection: true,
          stroke: '#A0A0A0',
          strokeWidth: 2,
          strokeDasharray: 'none',
          sourceMarker: {
            d: null, // Será personalizado según el tipo de relación
          },
          targetMarker: {
            d: null, // Será personalizado según el tipo de relación
          },
        },
      },
    };
  }

  override initialize(...args: any[]) {
    super.initialize(...args);
    this.on('change:relationType', this.updateLineStyle);
    this.updateLineStyle();
  }

  // Este método cambia el estilo de la línea y los marcadores según el tipo de relación
  updateLineStyle() {
    const relationType = this.get('relationType') || 'asociacion'; // Asociación por defecto

    let lineStyle;
    let markerEnd;

    switch (relationType) {
      case 'asociacion':
        lineStyle = {
            stroke: '#000000',
            strokeWidth: 2,
            strokeDasharray: 'none',
          };
        break;

      case 'agregacion':
        lineStyle = {
          stroke: '#000000',
          strokeWidth: 2,
          strokeDasharray: 'none',
        };
        markerEnd = {
          type: 'path',
          d: 'M 10 -4 0 0 10 4 20 0 z',
          stroke: '#000000',
          fill: '#F3F7F6',
        };
        break;

      case 'composicion':
        lineStyle = {
          stroke: '#000000',
          strokeWidth: 2,
          strokeDasharray: 'none',
        };
        markerEnd = {
          type: 'path',
          d: 'M 10 -4 0 0 10 4 20 0 z',
          stroke: '#000000',
          fill: '#000000',
        };
        break;

      case 'herencia':
        lineStyle = {
          stroke: '#000000',
          strokeWidth: 2,
          strokeDasharray: 'none',
        };
        markerEnd = {
          type: 'path',
          d: 'M 15 -7.5 0 0 15 7.5 Z', // Flecha más grande para herencia
          fill: '#F3F7F6',
        };
        break;

      default:
        lineStyle = {
          stroke: '#000000',
          strokeWidth: 2,
          strokeDasharray: 'none',
        };
        markerEnd = {
          type: 'path',
          d: 'M 10 -5 0 0 10 5 Z', // Flecha simple por defecto
          stroke: '#A0A0A0',
          fill: '#A0A0A0',
        };
        break;
    }

    this.attr('line', { ...lineStyle, targetMarker: markerEnd });
  }

  override markup = [
    {
      tagName: 'path',
      selector: 'wrapper',
      attributes: {
        fill: 'none',
        stroke: 'transparent',
      },
    },
    {
      tagName: 'path',
      selector: 'line',
      attributes: {
        fill: 'none',
      },
    },
  ];
}

const TableView = shapes.standard.RecordView;



Object.assign(shapes, {
  app: {
    Table,
    TableView,
    Link,
  },
});
