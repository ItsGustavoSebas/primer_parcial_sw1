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

  findTableByName(tables: Table[], code: string): Table | undefined {
    return tables.find((table) => table.getCode() === code);
  }

  onColumnsChange() {
    if (this.hasChanged('columns')) {
      this._setColumns(this.get('columns'));
    }
  }
  getColumns(): Array<{
    nombre: string;
    pk: boolean;
    scope: string;
    tipoDato: string;
  }> {
    const columns = this.get('columns'); 
    return columns.map((col: ColumnData) => ({
      nombre: col.name, 
      pk: !!col.key, 
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
    delete json['items'];
    return json;
  }

  protected _setColumns(data: Array<ColumnData> = []) {
    const names: Array<object> = [];
    const values: Array<object> = [];

    data.forEach((item, i) => {
      if (!item.name) return;

      const scopeSymbol = item.scope === 'public' ? '+' : '-';

      const formattedName = `${scopeSymbol} ${item.name} : ${item.type}`;

      names.push({
        id: item.name,
        label: formattedName, 
        span: 2,
      });

      const value = {
        id: `${item.type}_${i}`,
      };

      if (item.key) {
        Object.assign(value, {
          group: 'keys',
          icon: 'assets/key.svg',
        });
      }

      values.push(value);
    });

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
      code: '',
      z: -1,
      attrs: {
        root: {
          pointerEvents: 'visibleStroke',
        },
        wrapper: {
          connection: true,
          strokeWidth: 10,
        },
        line: {
          connection: true,
          stroke: '#A0A0A0',
          strokeWidth: 2,
          strokeDasharray: 'none',
          sourceMarker: {
            d: null, 
          },
          targetMarker: {
            d: null, 
          },
        },
      },
    };
  }

  setCode(code: string) {
    this.set('code', code);
    return this;
  }

  getCode(): string {
    return this.get('code');
  }

  override initialize(...args: any[]) {
    super.initialize(...args);
    this.on('change:relationType', this.updateLineStyle);
    this.updateLineStyle();
  }

  updateLineStyle() {
    const relationType = this.get('relationType') || 'asociacion'; 

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
          d: 'M 15 -7.5 0 0 15 7.5 Z', 
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
          d: 'M 10 -5 0 0 10 5 Z', 
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
