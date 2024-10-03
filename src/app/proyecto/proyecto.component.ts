import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  Renderer2,
  AfterViewInit,
} from '@angular/core';
import {
  dia,
  setTheme,
  shapes,
  ui,
  linkTools,
  elementTools,
  g,
  util,
} from '@joint/plus';
import { Link, Table } from './shapes';
import { TableHighlighter } from './highlighters';
import { FormsModule } from '@angular/forms';
import { routerNamespace } from './routers';
import { anchorNamespace } from './anchors';
import { NavComponent } from '../nav/nav.component';
import { filter } from 'rxjs/operators';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { UsersService } from '../users.service';
import { ProjectService } from '../project.service';
import { CommonModule } from '@angular/common';
import { io } from 'socket.io-client';
interface RelacionSource {
  id: number;
  code: string;
  detalle: string;
  multtarget: string;
  multsource: string;
  targetName: any; 
  sourceName: any;
  targetArgs: any;
  sourceArgs: any;
  tablaTarget: Tabla;
  tipo: { id: number; nombre: string };
}

interface Tabla {
  id: number;
  code: string;
  name: string;
  posicion_x: number;
  posicion_y: number;
  tabcolor: string;
  relacionesSource: RelacionSource[];
  atributos: Atributo[];
}

interface Atributo {
  id: string;
  nombre: string;
  nulleable: boolean;
  pk: boolean;
  tipoDato: { id: number; nombre: string };
  scope: { id: number; nombre: string };
}

interface Tabla {
  id: number;
  name: string;
  posicion_x: number;
  posicion_y: number;
  tabcolor: string;
  relacionesSource: RelacionSource[];
}

interface Usuario {
  id: number;
  name: string;
  urlAvatar: string;
  email: string;
}

interface Colaborador {
  id: number;
  permiso: string;
  usuario: Usuario;
}

interface Proyecto {
  id: number;
  descripcion: string;
  titulo: string;
  creador: Usuario;
  tablas: Tabla[];
  colaboradores: Colaborador[];
}

@Component({
  selector: 'app-proyecto',
  templateUrl: './proyecto.component.html',
  imports: [FormsModule, NavComponent, CommonModule],
  styleUrls: ['./proyecto.component.css'],
  standalone: true,
})
export class ProyectoComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true }) canvas!: ElementRef;
  @ViewChild('relationModal') relationModal!: ElementRef;
  @ViewChild('app', { static: false }) appEl!: ElementRef;
  private graph!: dia.Graph;
  private paper!: dia.Paper;
  private zoomLevel: number = 1;
  private isPanning: boolean = false;
  private socket: any;
  private panStartPosition: { x: number; y: number } = { x: 0, y: 0 };
  private paperStartTranslate: { tx: number; ty: number } = { tx: 0, ty: 0 };
  public selectedRelationType: string = 'asociacion';
  private pendingLink!: dia.Link;
  dropdownOpen = false;
  relationTypeMap: { [key: string]: number } = {
    asociacion: 1,
    agregacion: 2,
    composicion: 3,
    herencia: 4,
  };
  sourceMultiplicity: string = '';
  targetMultiplicity: string = '';
  relationLabel: string = '';
  projectName: string = 'Nombre del Proyecto';
  projectId: number = 1;
  proyectoId: any;
  dropdownPosition: { top: number; left: number } | null = null;
  constructor(
    private readonly userService: UsersService,
    private readonly route: ActivatedRoute,
    private readonly projectService: ProjectService,
    private renderer: Renderer2,
    private readonly router: Router
  ) {}

  ngAfterViewInit(): void {
    
    this.initializeGraph();
    setTheme('my-theme');
    this.addWheelZoomListener();
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No Token Found');
    }
    this.loadProjectData(token);
    const appElement = this.appEl.nativeElement;
    this.renderer.setStyle(appElement, 'position', 'relative');
    this.socket = io('http://localhost:3000');
    this.socket.emit('join', this.projectId);
    this.socket.on('updateGraph', (data: any) => {
      const { changeType, payload } = data;
      console.log(data);
      switch (changeType) {
        case 'newTable':
          this.addNewTableToGraph(payload);
          break;
        case 'updatedTable':
          console.log("editar", payload)
          this.updateTableInGraph(payload);
          break;
        case 'newRelacion':
          this.addRelationInGraph(payload);
          break;
        case 'deleteTabla':
          this.deleteTableInGraph(payload);
          break;
        case 'deleteRelacion':
            this.deleteRelacionInGraph(payload);
            break;
      }
    });
  }

  deleteRelacionInGraph(payload: any): void {
    const relacionToDelete = this.graph.getCells().find(cell => {
      if (cell instanceof Link) {
        return cell.getCode() === payload.code; 
      }
      return false;
    });
  
    if (relacionToDelete) {
      const relacion = relacionToDelete as Link; 
      relacion.remove();
    }
  }

  addRelationInGraph(payload: any): void {
    const sourceTable = this.graph.getCells().find((cell) => {
      return cell.get('code') === payload.tablaSourceId; 
    });
  
    const targetTable = this.graph.getCells().find((cell) => {
      return cell.get('code') === payload.tablaTargetId;
    });
  
    if (sourceTable && targetTable) {
      const newLink = new Link({
        source: {
          id: sourceTable.id,
          anchor: {
            name: payload.sourceName,
            args: eval(
              `(${payload.sourceArgs.replace(/(\w+):/g, '"$1":')})`
            ),
          },
        },
        target: {
          id: targetTable.id,
          anchor: {
            name: payload.targetName,
            args: eval(
              `(${payload.targetArgs.replace(/(\w+):/g, '"$1":')})`
            ), 
          },
        },
        relationType: payload.tipoName,
        labels: [
          {
            attrs: {
              text: {
                text: payload.multsource, 
              },
            },
            position: 0.1,
          },
          {
            attrs: {
              text: {
                text: payload.detalle, 
              },
            },
            position: 0.5,
          },
          {
            attrs: {
              text: {
                text: payload.multtarget, 
              },
            },
            position: 0.9,
          },
        ],
      });
      newLink.setCode(payload.code)
      newLink.addTo(this.graph); 
  
      console.log('Relación agregada correctamente.');
    } else {
      console.error('Error: No se encontraron las tablas de origen o destino.');
    }
  }
  

  deleteTableInGraph(payload: any): void {
    const tableToUpdate = this.graph.getCells().find(cell => {
      if (cell instanceof Table) {
        return cell.getCode() === payload.code; 
      }
      return false;
    });
  
    if (tableToUpdate) {
      const table = tableToUpdate as Table; 
      table.remove();
    }
  }

  updateTableInGraph(payload: any): void {
    const tableToUpdate = this.graph.getCells().find(cell => {
      if (cell instanceof Table) {
        return cell.getCode() === payload.code; 
      }
      return false;
    });
  
    if (tableToUpdate) {
      const table = tableToUpdate as Table; 
      console.log(table)
      table.setName(payload.name);

      table.position(payload.position.x, payload.position.y);
      
      table.setTabColor(payload.tabColor);
  
      const updatedColumns = payload.columns.map((column: any) => ({
        name: column.nombre,
        type: column.tipoDato,
        key: false,
        scope: column.scope,
      }));
  
      table.setColumns(updatedColumns); 
    } else {
      console.error('No se encontró la tabla con el código:', payload.code);
    }
  }

  

  addNewTableToGraph(payload: any): void {
    const newTable = new Table()
      .setName(payload.name)         
      .setTabColor(payload.tabColor)  
      .position(payload.position.x, payload.position.y);  
    newTable.setCode(payload.code);
    newTable.addTo(this.graph);
    console.log(newTable.toJSON())
  }
  

  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
    #app .joint-dialog.joint-theme-default .body {
      padding: 0;
      max-height: 500px;
      overflow-y: scroll;
    }
    #app .joint-dialog.joint-theme-default .fg {
      border: none;
      border-radius: 0px;
      filter: drop-shadow(0.1rem 0.1rem 0.15rem rgba(0, 0, 0, 0.2));
    }
    #app .joint-dialog.joint-theme-default .titlebar {
      padding: 16px;
      border-radius: 0px;
      color: #3D3D3D;
      background: #FFF;
      border: none;
      border-bottom: 1px solid #dddddd;
      font-size: 20px;
    }
    #app .joint-dialog.joint-theme-default .titlebar .titletab {
      height: 5px;
      position: absolute;
      top: -5px;
      left: 0;
      width: 100%;
    }
    #app .joint-dialog.joint-theme-default .controls {
      border: none;
      border-top: 1px solid #dddddd;
    }
    #app .joint-dialog.joint-theme-default .controls .control-button {
      color: #303030;
      border: 1px solid #CCC;
      background: #FFF;
      border-radius: 0px;
      min-width: 82px;
    }
    #app .joint-dialog.joint-theme-default .controls .control-button:hover {
      border: 1px solid #CCC;
      background: #CCC;
      opacity: 0.8;
      transition: 0.1s linear;
    }
    #app .joint-dialog.joint-theme-default .controls .control-button.left {
      color: #F8F8FF;
      background: #F6511D;
      border: 1px solid #F6511D;
    }
    #app .joint-paper .joint-element {
      cursor: move;
    }
    #app .joint-paper .record-item-body {
      cursor: pointer;
    }
    #app .joint-inspector.joint-theme-default {
      border: none;
      background: #FFF;
      padding: 5px 16px;
    }
    #app .joint-inspector.joint-theme-default .field {
      padding: 0;
    }
    #app .joint-inspector.joint-theme-default .list-item {
      color: #636363;
      background: #FFF;
      border: none;
      border-top: 1px solid #CCC;
      box-shadow: none;
      padding: 0;
      padding-top: 12px;
      padding-bottom: 16px;
      margin: 0;
      display: flex;
      flex-direction: column;
    }
    #app .joint-inspector.joint-theme-default .btn-list-add,
    #app .joint-inspector.joint-theme-default .btn-list-del {
      margin: 0;
      height: 30px;
      background: transparent;
      color: #F8F8FF;
      box-shadow: none;
      border-radius: 0px;
    }
    #app .joint-inspector.joint-theme-default .btn-list-add:hover,
    #app .joint-inspector.joint-theme-default .btn-list-del:hover {
      transition: 0.1s linear;
    }
    #app .joint-inspector.joint-theme-default .btn-list-add {
      margin-top: 4px;
      margin-bottom: 8px;
      width: 100%;
      background: #015EFF;
      border: 1px solid #015EFF;
    }
    #app .joint-inspector.joint-theme-default .btn-list-add:hover {
      opacity: 0.8;
    }
    #app .joint-inspector.joint-theme-default .btn-list-del {
      order: 4;
      align-self: flex-end;
      margin-top: 8px;
      text-align: center;
      min-width: 82px;
      color: #F6511D;
      border: 1px solid #F6511D;
    }
    #app .joint-inspector.joint-theme-default .btn-list-del:hover {
      color: #F8F8FF;
      background: #F6511D;
    }
    #app .joint-inspector.joint-theme-default label,
    #app .joint-inspector.joint-theme-default output,
    #app .joint-inspector.joint-theme-default .units {
      color: #3D3D3D;
      text-transform: none;
      text-shadow: none;
      font-size: 12px;
      margin: 0;
      line-height: 28px;
    }
    #app .joint-inspector.joint-theme-default label:after {
      content: "";
    }
    #app .joint-inspector.joint-theme-default input[type=text],
    #app .joint-inspector.joint-theme-default input[type=number],
    #app .joint-inspector.joint-theme-default textarea,
    #app .joint-inspector.joint-theme-default .content-editable,
    #app .joint-inspector.joint-theme-default select {
      margin-bottom: 12px;
      width: 100%;
      height: auto;
      line-height: 16px;
      text-shadow: none;
      box-shadow: none;
      box-sizing: border-box;
      outline: none;
      padding: 16px 12px;
      overflow: auto;
      color: #303030;
      background: #FFF;
      border: 1px solid #CCC;
      border-radius: 0px;
    }
    #app .joint-inspector.joint-theme-default .toggle {
      width: 40px;
      height: 20px;
    }
    #app .joint-inspector.joint-theme-default .toggle span, #app .joint-inspector.joint-theme-default .toggle input:checked + span {
      border: 1px solid #015EFF;
      background: #015EFF;
    }
    #app .joint-inspector.joint-theme-default .toggle span, #app .joint-inspector.joint-theme-default .toggle input:not(:checked) + span {
      border: 1px solid #CCC;
      background: #CCC;
    }
    `;
    document.head.appendChild(style);
  }

  editTable(tableView: dia.ElementView) {
    const HIGHLIGHTER_ID = 'table-selected';
    const table = tableView.model as Table;
    const tableName = table.getName();
    if (TableHighlighter.get(tableView, HIGHLIGHTER_ID)) return;

    TableHighlighter.add(tableView, 'root', HIGHLIGHTER_ID);

    const inspector = new ui.Inspector({
      cell: table,
      theme: 'default',
      inputs: {
        'attrs/tabColor/fill': {
          label: 'Color',
          type: 'color',
        },
        'attrs/headerLabel/text': {
          label: 'Nombre',
          type: 'text',
        },
        columns: {
          label: 'Atributo',
          type: 'list',
          addButtonLabel: 'Add Atributo',
          removeButtonLabel: 'Remove Atributo',
          item: {
            type: 'object',
            properties: {
              name: {
                label: 'Name',
                type: 'text',
              },
              type: {
                label: 'Type',
                type: 'select',
                options: [
                  'char',
                  'string',
                  'int',
                  'boolean',
                  'byte',
                  'double',
                  'date',
                ],
              },
              scope: {
                label: 'Scope',
                type: 'select',
                options: ['public', 'private'],
              },
            },
          },
        },
      },
    });

    inspector.render();
    inspector.el.style.position = 'relative';

    const dialog = new ui.Dialog({
      theme: 'default',
      modal: false,
      draggable: true,
      closeButton: false,
      width: 300,
      title: tableName || 'New Table*',
      content: inspector.el,
      buttons: [
        {
          content: 'Remove',
          action: 'remove',
          position: 'left',
        },
        {
          content: 'Close',
          action: 'close',
        },
      ],
    });
    dialog.el.style.position = 'absolute';
    dialog.el.style.top = '6px'; 
    dialog.el.style.left = '500px'; 
    dialog.el.style.width = '300px';
    dialog.open(this.appEl.nativeElement);

    const dialogTitleBar = dialog.el.querySelector(
      '.titlebar'
    ) as HTMLDivElement;
    const dialogTitleTab = document.createElement('div');
    dialogTitleTab.style.background = table.getTabColor();
    dialogTitleTab.setAttribute('class', 'titletab');
    dialogTitleBar.appendChild(dialogTitleTab);

    inspector.on('change:attrs/tabColor/fill', () => {
      dialogTitleTab.style.background = table.getTabColor();
    });

    inspector.on('change:attrs/headerLabel/text', async () => {
      dialogTitleBar.textContent = table.getName();
      const updatedTable = {
        name: table.getName(),
        atributos: table.getColumns(),
        tabcolor: table.getTabColor(),
      };
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No Token Found');
      }
      const response: Proyecto = await this.projectService.crearAtributos(
        table.getCode(),
        updatedTable,
        token
      );
      this.socket.emit('graphChanged', {
        roomId: this.projectId,
        changeType: 'updatedTable', 
        payload: {
          id: table.id,
          name: table.getName(),
          position: table.position(),
          columns: table.getColumns(),
          tabColor: table.getTabColor(),
          code: table.getCode()
        }
      });
    });

    dialog.on('action:close', async () => {
      inspector.remove();
      TableHighlighter.remove(tableView, HIGHLIGHTER_ID);
      const updatedTable = {
        name: table.getName(),
        atributos: table.getColumns(),
        tabcolor: table.getTabColor(),
      };
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No Token Found');
      }
      const response: Proyecto = await this.projectService.crearAtributos(
        table.getCode(),
        updatedTable,
        token
      );
      this.socket.emit('graphChanged', {
        roomId: this.projectId,
        changeType: 'updatedTable', 
        payload: {
          id: table.id,
          name: table.getName(),
          position: table.position(),
          columns: table.getColumns(),
          tabColor: table.getTabColor(),
          code: table.getCode()
        }
      });
    });
    dialog.on('action:remove', () => {
      dialog.close();
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No Token Found');
      }
      
      console.log("eliminar");
    
      this.projectService.deleteTabla(table.getCode(), token)
        .then(() => {
          this.socket.emit('graphChanged', {
            roomId: this.projectId,
            changeType: 'deleteTabla', 
            payload: {
              id: table.id,
              code: table.getCode()
            }
          });
          table.remove(); 
        })
        .catch(error => {
          console.error("Error al eliminar la tabla:", error);
        });
    });
    

    if (!tableName) {
      const inputEl = inspector.el.querySelector(
        'input[data-attribute="attrs/headerLabel/text"]'
      ) as HTMLInputElement;
      inputEl.focus();
    }
  }

  addWheelZoomListener(): void {
    this.paper.on(
      'blank:mousewheel',
      (evt: dia.Event, x: number, y: number, delta: number) => {
        evt.preventDefault();
        if (delta > 0) {
          this.zoomIn();
        } else {
          this.zoomOut();
        }
      }
    );
  }
  zoomIn(): void {
    this.zoomLevel += 0.1;
    this.paper.scale(this.zoomLevel, this.zoomLevel);
  }

  enablePanning(): void {
    this.paper.on(
      'blank:pointerdown',
      (evt: dia.Event, x: number, y: number) => {
        this.isPanning = true;

        this.panStartPosition = { x: evt.clientX ?? 0, y: evt.clientY ?? 0 };

        const translate = this.paper.translate();
        this.paperStartTranslate = { tx: translate.tx, ty: translate.ty };
      }
    );

    this.paper.on('blank:pointermove', (evt: dia.Event) => {
      if (!this.isPanning) return;

      const dx = (evt.clientX ?? 0) - this.panStartPosition.x;
      const dy = (evt.clientY ?? 0) - this.panStartPosition.y;
      this.paper.translate(
        this.paperStartTranslate.tx + dx,
        this.paperStartTranslate.ty + dy
      );
    });

    this.paper.on('cell:pointerup blank:pointerup', () => {
      this.isPanning = false;
    });
    this.paper.on('cell:pointerup blank:pointerup', async (cellView) => {
      if (cellView.model.isLink()) return; 

      const table = cellView.model; 
      const position = table.position();

      const updatedTable = {
        posicion_x: position.x,
        posicion_y: position.y,
      };

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No Token Found');
      }

      this.socket.emit('graphChanged', {
        roomId: this.projectId,
        changeType: 'updatedTable', 
        payload: {
          id: table.id,
          name: table.getName(),
          position: table.position(),
          columns: table.getColumns(),
          tabColor: table.getTabColor(),
          code: table.getCode()
        }
      });
      try {
        const response: Proyecto = await this.projectService.editarPosicion(
          table.getCode(),
          updatedTable,
          token
        );
        console.log('Posición actualizada:', response);
      } catch (error) {
        console.error('Error al actualizar la posición:', error);
      }
    });
  }

  zoomOut(): void {
    this.zoomLevel -= 0.1;
    this.paper.scale(this.zoomLevel, this.zoomLevel);
  }

  openModal() {
    if (this.relationModal) {
      this.relationModal.nativeElement.style.display = 'block';
    } else {
      console.error('El modalElement no está definido aún');
    }
  }

  async loadProjectData(token: string) {
    try {
      this.proyectoId = this.route.snapshot.paramMap.get('id');
      const projectData: Proyecto = await this.projectService.getProyectById(
        this.proyectoId,
        token
      );
      console.log(projectData)
      this.projectName = projectData.titulo;
      this.projectId = projectData.id;
      var users = [
        {
          name: projectData.creador.name,
          avatarUrl: projectData.creador.urlAvatar,
          email: projectData.creador.email,
          permiso: 'Titular',
        },
      ];
      projectData.colaboradores.forEach((colaborador) => {
        users.push({
          name: colaborador.usuario.name,
          avatarUrl: colaborador.usuario.urlAvatar || 'default_avatar_url.jpg',
          email: colaborador.usuario.email,
          permiso: colaborador.permiso,
        });
      });
      this.userService.setProjectData(this.projectName, users, this.projectId.toString());
      const tablasMap = new Map<string, any>();

      projectData.tablas.forEach((tabla: Tabla) => {
        const newTable = new Table()
          .setName(tabla.name)
          .setTabColor(tabla.tabcolor)
          .position(tabla.posicion_x, tabla.posicion_y);
        newTable.setCode(tabla.id.toString());
        const columns = tabla.atributos.map((atributo) => ({
          name: atributo.nombre,
          type: atributo.tipoDato.nombre,
          key: atributo.pk, 
          scope: atributo.scope.nombre,
          code: atributo.id,
        }));

        newTable.setColumns(columns).addTo(this.graph);
        tablasMap.set(tabla.name, newTable);
      });

      projectData.tablas.forEach((tabla: Tabla) => {
        tabla.relacionesSource.forEach((relacion: RelacionSource) => {
          const sourceTable = tablasMap.get(tabla.name); 
          const targetTable = tablasMap.get(relacion.tablaTarget.name);
          console.log(relacion.sourceArgs);
          if (sourceTable && targetTable) {
            const newLink = new Link({
              source: {
                id: sourceTable.id,
                anchor: {
                  name: relacion.sourceName,
                  args: eval(
                    `(${relacion.sourceArgs.replace(/(\w+):/g, '"$1":')})`
                  ),
                },
              },
              target: {
                id: targetTable.id,
                anchor: {
                  name: relacion.targetName,
                  args: eval(
                    `(${relacion.sourceArgs.replace(/(\w+):/g, '"$1":')})`
                  ),
                },
              },
              relationType: relacion.tipo.nombre, 
              labels: [
                {
                  attrs: {
                    text: {
                      text: relacion.multsource,
                    },
                  },
                  position: 0.1,
                },
                {
                  attrs: { text: { text: relacion.detalle } }, 
                  position: 0.5,
                },
                {
                  attrs: {
                    text: {
                      text: relacion.multtarget,
                    },
                  },
                  position: 0.9,
                },
              ],
            });
            newLink.setCode(relacion.id.toString())
            newLink.addTo(this.graph);
          } else {
            console.error(
              'Error: Una de las tablas no fue encontrada en el mapa'
            );
          }
        });
      });
    } catch (error) {
      console.error('Error al cargar los datos del proyecto:', error);
    }
  }

  closeModal(): void {
    const modalElement = this.relationModal.nativeElement;
    modalElement.style.display = 'none';
  }

  confirmRelation(): void {
    const sourceMultiplicity = this.sourceMultiplicity || ''; 
    const targetMultiplicity = this.targetMultiplicity || ''; 
    const relationLabel = this.relationLabel || '';

    this.pendingLink.set({
      relationType: this.selectedRelationType,
      labels: [
        {
          attrs: {
            text: {
              text: sourceMultiplicity, 
            },
          },
          position: 0.1, 
        },
        {
          attrs: {
            text: {
              text: relationLabel,
            },
          },
          position: 0.5, 
        },
        {
          attrs: {
            text: {
              text: targetMultiplicity, 
            },
          },
          position: 0.9, 
        },
      ],
    });
    const sourceAnchor = this.pendingLink.get('source').anchor;
    const targetAnchor = this.pendingLink.get('target').anchor;
    const sourceid = this.pendingLink.get('source').id;
    const targetid = this.pendingLink.get('target').id;
    const sourceName = sourceAnchor?.name || 'right';
    const sourceArgs = sourceAnchor?.args || '{ dy: 0 }'; 
    const tipoId = this.relationTypeMap[this.selectedRelationType];
    if (!tipoId) {
      console.error('Tipo de relación no válido');
      return;
    }
    const targetName = targetAnchor?.name || 'left';
    const targetArgs = targetAnchor?.args || '{ dy: 0 }'; 
    const tablaData = {
      code: '',
      detalle: this.relationLabel || '', 
      multtarget: this.targetMultiplicity || '', 
      multsource: this.sourceMultiplicity || '',
      targetName: targetName,
      sourceName: sourceName,
      targetArgs: targetArgs,
      sourceArgs: sourceArgs,
      tablaSourceId: this.graph.getCell(sourceid).get('code'),
      tablaTargetId: this.graph.getCell(targetid).get('code'),
      sourceId: sourceid,
      targetId: targetid,
      tipoId: tipoId,
      tipoName: this.selectedRelationType,
    };
    console.log(tablaData)
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No Token Found');
    }
    this.projectService
    .crearRelacion(tablaData, token)
    .then((response) => {
      console.log('Relación creada:', response);
      const relationId = response.id.toString();
      (this.pendingLink as Link).setCode(relationId);
      tablaData.code = relationId;
      this.socket.emit('graphChanged', {
        roomId: this.projectId,
        changeType: 'newRelacion', 
        payload: tablaData
      });

      this.closeModal();
    })
    .catch((error) => {
      console.error('Error al crear relación:', error);
    });
  }

  initializeGraph(): void {
    const UNIT = 10;
    const RADIUS = UNIT / 2;
    this.graph = new dia.Graph();
    this.paper = new dia.Paper({
      el: this.canvas.nativeElement,
      model: this.graph,
      width: 1600,
      height: 700,
      gridSize: 10,
      interactive: true,
      async: true,
      frozen: true,
      sorting: dia.Paper.sorting.APPROX,
      cellViewNamespace: shapes,
      snapLinks: true,
      linkPinning: false,
      magnetThreshold: 'onleave',
      highlighting: {
        connecting: {
          name: 'addClass',
          options: {
            className: 'column-connected',
          },
        },
      },
      defaultConnector: {
        name: 'rounded',
        args: { radius: 5 },
      },
      defaultConnectionPoint: {
        name: 'boundary',
        args: {
          offset: 2,
        },
      },
      defaultLink: () => new Link(),
      routerNamespace: routerNamespace,
      validateConnection: function (srcView, srcMagnet, tgtView, tgtMagnet) {
        return srcMagnet !== tgtMagnet;
      },
      defaultRouter: { name: 'customRouter' },
      anchorNamespace: anchorNamespace,
      defaultAnchor: { name: 'customAnchor' },
    });
    this.paper.on('link:connect', (linkView: dia.LinkView) => {
      this.pendingLink = linkView.model;
      this.openModal();
    });
    this.enablePanning();

    this.paper.on('link:mouseenter', (linkView: dia.LinkView) => {
      showLinkTools(linkView);
    });
    this.paper.on('link:mouseleave', (linkView: dia.LinkView) => {
      linkView.removeTools();
    });
    this.graph.on('remove', (cell) => {
      if (cell instanceof Link) {
        const linkId = cell.getCode(); 
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No Token Found');
        }
        this.projectService.deleteRelacion(linkId, token)
        .then(() => {
          this.socket.emit('graphChanged', {
            roomId: this.projectId,
            changeType: 'deleteRelacion', 
            payload: {
              id: cell.id,
              code: linkId
            }
          });
        })
        .catch(error => {
          console.error("Error al eliminar la tabla:", error);
        });
      }
    });
    this.paper.on('element:pointerclick', (elementView: dia.ElementView) => {
      this.addStyles();
      this.editTable(elementView);
    });
    this.paper.on(
      'blank:pointerdblclick',
      async (evt: dia.Event, x: number, y: number) => {
        const updatedTable = {
          name: 'new',
          posicion_x: x,
          posicion_y: y,
          tabcolor: '#6C6C6C',
        };
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No Token Found');
        }
        const projectData: Proyecto = await this.projectService.crearTabla(
          this.proyectoId.toString(),
          updatedTable,
          token
        );
        if (projectData) {
          const table = new Table();
          table.position(x, y);
          table.setName('new');
          table.addTo(this.graph);
          table.setCode(projectData.id.toString());
          this.addStyles();
          this.editTable(table.findView(this.paper) as dia.ElementView);
        
        this.socket.emit('graphChanged', {
          roomId: this.projectId,
          changeType: 'newTable', 
          payload: {
            id: table.id, 
            name: table.getName(),
            position: table.position(),
            columns: table.getColumns,
            tabColor: table.getTabColor(),
            code: table.getCode()
          }
        });
      }
      }
    );

    this.paper.unfreeze();

    function showLinkTools(linkView: dia.LinkView) {
      const tools = new dia.ToolsView({
        tools: [
          new linkTools.SourceAnchor(),
          new linkTools.TargetAnchor(),
          new linkTools.Boundary(),
          new linkTools.Remove({
            distance: '50%',
            markup: [
              {
                tagName: 'circle',
                selector: 'button',
                attributes: {
                  r: 8,
                  fill: '#FF1D00',
                  cursor: 'pointer',
                },
              },
              {
                tagName: 'path',
                selector: 'icon',
                attributes: {
                  d: 'M -3 -3 3 3 M -3 3 3 -3',
                  fill: 'none',
                  stroke: '#FFFFFF',
                  'stroke-width': 2,
                  'pointer-events': 'none',
                },
              },
            ],
          }),
        ],
      });

      linkView.addTools(tools);
    }
  }
  redirectToMapeo() {
    this.router.navigate([`/proyectomapeo/${this.proyectoId}`]);
  }
  toggleDropdown(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();

    this.dropdownPosition = {
      top: rect.bottom + window.scrollY - 770, 
      left: rect.left + window.scrollX - 30,
    };

    this.dropdownOpen = !this.dropdownOpen;
  }
  exportAsPng(): void {
    const svgElement = this.paper.svg; 
    const svgString = new XMLSerializer().serializeToString(svgElement); 

    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'diagram.svg';
    link.click();

    this.svgToPng(svgString);
  }

  svgToPng(svg: string): void {
    const img = new Image();
    const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement('canvas');

      canvas.width = Number(this.paper.options.width!);
      canvas.height = Number(this.paper.options.height!);

      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob!);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'diagram.png';
        link.click();
      }, 'image/png');
    };

    img.src = url;
  }

  exportAsXMI(): void {
    const token = localStorage.getItem('token'); 
    if (!token) {
      console.error('No Token Found');
      return;
    }
    this.projectService
      .generarXmi(this.proyectoId, token)
      .subscribe((response: Blob) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'archivo.xmi'; 
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url); 
        a.remove();
      });
  }

  exportAsSpringBoot(): void {
    const token = localStorage.getItem('token'); 
    if (!token) {
      console.error('No Token Found');
      return;
    }
  
    this.projectService.generarORM(this.proyectoId, token).subscribe({
      next: (response: Blob) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'archivo.zip'; 
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url); 
        a.remove();
      },
      error: (err) => {
        console.error('Error al descargar el archivo:', err);
      }
    });
  }
  
}
