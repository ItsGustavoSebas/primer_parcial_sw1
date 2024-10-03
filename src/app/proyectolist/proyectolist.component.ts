import { Component, ElementRef, ViewChild } from '@angular/core';
import { ProjectService } from '../project.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import * as xml2js from 'xml2js';
@Component({
  selector: 'app-proyectolist',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './proyectolist.component.html',
  styleUrl: './proyectolist.component.css',
})
export class ProyectolistComponent {
  @ViewChild('modal') modal!: ElementRef;
  selectedFile: File | null = null; 
  titulo: string = ''; 
  descripcion: string = ''; 
  
  constructor(
    public readonly projectService: ProjectService,
    private readonly router: Router,
    private http: HttpClient
  ) {}

  proyectos: any[] = [];
  errorMessage: string = '';
  tables: any[] = [];
  relaciones: any[] = [];
  ngOnInit(): void {
    this.loadProyect();
  }
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const xmlContent = e.target.result;
        this.parseXMI(xmlContent);
      };
      reader.readAsText(file);
    }
  }

  async parseXMI(file: string): Promise<any[]> {
    const parser = new xml2js.Parser({ explicitArray: false });
    parser.parseString(file, (error: any, result: any) => {
      if (error) {
        console.error('Error al parsear el XML:', error);
      } else {
        this.processXmlContent(result);
      }
    });
    return this.tables;
  }

  processXmlContent(file: any): void {
    const ownedElements = file['XMI']['XMI.content']['UML:Model']['UML:Namespace.ownedElement']['UML:Package']['UML:Namespace.ownedElement']['UML:Class'];
    console.log('Contenido de ownedElements:', ownedElements);
    const associations = file['XMI']['XMI.content']['UML:Model']['UML:Namespace.ownedElement']['UML:Package']['UML:Namespace.ownedElement']['UML:Association'];
    const generalizations = file['XMI']['XMI.content']['UML:Model']['UML:Namespace.ownedElement']['UML:Package']['UML:Namespace.ownedElement']['UML:Generalization'];
    const posiciones = file['XMI']['XMI.content']['UML:Diagram']['UML:Diagram.element']['UML:DiagramElement']
    if (Array.isArray(ownedElements)) {
      ownedElements.forEach((ownedElement: any) => {
        const attributes: any[] = [];
        console.log(ownedElement);
        var posicion_x: any;
        var posicion_y: any;
        const className = ownedElement.$.name;
        const classId = ownedElement.$['xmi.id'];
        if (Array.isArray(posiciones)) {
          posiciones.forEach((posicion: any) => {
            if(posicion.$.subject == classId){
              const geometryString = posicion.$.geometry;
              const geometry = geometryString.split(';').reduce((acc: { [key: string]: number }, pair: string) => {
                const [key, value] = pair.split('=');
                acc[key] = parseInt(value, 10); 
                return acc;
              }, {});
              
              posicion_x = geometry['Left'];
              console.log("posicionx "+posicion_x);
              posicion_y = geometry['Top'];
              console.log("posiciony "+posicion_y);
            }
          });
        }
        const ownedAtributos = ownedElement['UML:Classifier.feature']?.['UML:Attribute'] ?? null;
        console.log('Atributos', ownedAtributos);
        if (Array.isArray(ownedAtributos)) {
          ownedAtributos.forEach((ownedAtributo: any) => {
            const AtributoName = ownedAtributo.$.name;
            const AtributoScope = ownedAtributo.$.visibility
            const AtributoTipo = ownedAtributo['UML:ModelElement.taggedValue']['UML:TaggedValue'][0].$.value
            console.log('Atributo Tipo', AtributoTipo);
            console.log('Atributo Nombre', AtributoName);
            console.log('Atributo Scope', AtributoScope);
            attributes.push({
              nombre: AtributoName,
              tipoDato: AtributoTipo,
              scope: AtributoScope
            });
          });
        }else{
          if(ownedAtributos != null){
          const AtributoName = ownedAtributos.$.name;
            const AtributoScope = ownedAtributos.$.visibility
            const AtributoTipo = ownedAtributos['UML:ModelElement.taggedValue']['UML:TaggedValue'][0].$.value
            console.log('Atributo Tipo', AtributoTipo);
            console.log('Atributo Nombre', AtributoName);
            console.log('Atributo Scope', AtributoScope);
            attributes.push({
              nombre: AtributoName,
              tipoDato: AtributoTipo,
              scope: AtributoScope
            });
        }
      }
        this.tables.push({
          name: className,
          posicion_x: posicion_x * 1.5,
          posicion_y: posicion_y * 1.5,
          atributos: attributes
        });
        console.log(this.tables);
      });
  }
  if (Array.isArray(associations)) {
    associations.forEach((association: any) => {
      const asociacionName = association.$.name;
      var asociacionTipo = association['UML:ModelElement.taggedValue']['UML:TaggedValue'][1].$.value
      var asociacionSource: any;
      var asociacionTarget: any;
      const multSource = association['UML:Association.connection']['UML:AssociationEnd'][0].$.multiplicity
      const multTarget = association['UML:Association.connection']['UML:AssociationEnd'][1].$.multiplicity
      association['UML:ModelElement.taggedValue']['UML:TaggedValue'].forEach((association1: any) => {
        if(association1.$.tag == "ea_sourceName"){
          asociacionSource = association1.$.value;
        }
        if(association1.$.tag == "ea_targetName"){
          asociacionTarget = association1.$.value;
        }
      });
      if(asociacionTipo == "Association"){
        asociacionTipo = "asociacion"
      }else{
        if(association['UML:Association.connection']['UML:AssociationEnd'][1].$.aggregation == "composite" ||
          association['UML:Association.connection']['UML:AssociationEnd'][0].$.aggregation == "composite"
        ){
          asociacionTipo = "composicion"
        }else{
          asociacionTipo = "agregacion"
        }
      }
      console.log("asociacion" + asociacionTipo);
      this.relaciones.push({
        detalle: asociacionName,
        tipo: asociacionTipo,
        tablaSource:asociacionSource,
        tablaTarget: asociacionTarget,
        multsource: multSource,
        multtarget: multTarget
      });
    });
  }else{
    if(associations != null){
      const asociacionName = associations.$.name;
      var asociacionTipo = associations['UML:ModelElement.taggedValue']['UML:TaggedValue'][1].$.value
      var asociacionSource: any;
      var asociacionTarget: any;
      const multSource = associations['UML:Association.connection']['UML:AssociationEnd'][0].$.multiplicity
      const multTarget = associations['UML:Association.connection']['UML:AssociationEnd'][1].$.multiplicity
      associations['UML:ModelElement.taggedValue']['UML:TaggedValue'].forEach((association1: any) => {
        if(association1.$.tag == "ea_sourceName"){
          asociacionSource = association1.$.value;
        }
        if(association1.$.tag == "ea_targetName"){
          asociacionTarget = association1.$.value;
        }
      });
      if(asociacionTipo == "Association"){
        asociacionTipo = "asociacion"
      }else{
        if(associations['UML:Association.connection']['UML:AssociationEnd'][1].$.aggregation == "composite" ||
          associations['UML:Association.connection']['UML:AssociationEnd'][0].$.aggregation == "composite"
        ){
          asociacionTipo = "composicion"
        }else{
          asociacionTipo = "agregacion"
        }
      }
      console.log("asociacion" + asociacionTipo);
      this.relaciones.push({
        detalle: asociacionName,
        tipo: asociacionTipo,
        tablaSource:asociacionSource,
        tablaTarget: asociacionTarget,
        multsource: multSource,
        multtarget: multTarget
      });
    }
  }
  if (Array.isArray(generalizations)) {
    generalizations.forEach((generalization: any) => {
      const asociacionSource = generalization['UML:ModelElement.taggedValue']['UML:TaggedValue'][10].$.value
      const asociacionTarget = generalization['UML:ModelElement.taggedValue']['UML:TaggedValue'][11].$.value
      this.relaciones.push({
        detalle: "",
        tipo: "herencia",
        tablaSource:asociacionSource,
        tablaTarget: asociacionTarget,
        multsource: "",
        multtarget: ""
      });
    });
  }else{
    if(generalizations != null){
      const asociacionSource = generalizations['UML:ModelElement.taggedValue']['UML:TaggedValue'][10].$.value
      const asociacionTarget = generalizations['UML:ModelElement.taggedValue']['UML:TaggedValue'][11].$.value
      this.relaciones.push({
        detalle: "",
        tipo: "herencia",
        tablaSource:asociacionSource,
        tablaTarget: asociacionTarget,
        multsource: "",
        multtarget: ""
      });
    }
  }

}



  async onSubmit() {
    const token = localStorage.getItem('token'); 
    if (!token) {
      console.error('No Token Found');
      return;
    }

    if (this.tables) {
      const projectData = {
        titulo: this.titulo,
        descripcion: this.descripcion,
        tablas: this.tables,
        relaciones: this.relaciones
      };
      console.log(projectData);
      this.projectService
        .uploadProjectWithFile(projectData, token)
        .subscribe(
          (response) => {
            const projectId = response.projectId;
            this.router.navigate(['/proyecto', projectId]); 
          },
          (error) => {
            console.error('Error al crear proyecto sin archivo:', error);
          }
        );
    } else {
      const projectData = {
        titulo: this.titulo,
        descripcion: this.descripcion,
      };

      this.projectService
        .createProjectWithoutFile(projectData, token)
        .subscribe(
          (response) => {
            const projectId = response.projectId; 
            this.router.navigate(['/proyecto', projectId]); 
          },
          (error) => {
            console.error('Error al crear proyecto sin archivo:', error);
          }
        );
    }
  }

  openModal() {
    if (this.modal) {
      this.modal.nativeElement.style.display = 'block';
    } else {
      console.error('El modalElement no está definido aún');
    }
  }

  closeModal(): void {
    const modalElement = this.modal.nativeElement;
    modalElement.style.display = 'none';
  }
  async loadProyect() {
    try {
      const token: any = localStorage.getItem('token');
      const response = await this.projectService.getAllProjects(token);
      console.log(response);
      if (response) {
        this.proyectos = response;
      } else {
        this.showError('No proyectos found.');
      }
    } catch (error: any) {
      this.showError(error.message);
    }
  }

  navigateToProyecto(proyectoId: string) {
    this.router.navigate(['/proyecto', proyectoId]);
  }

  showError(mess: string) {
    this.errorMessage = mess;
    setTimeout(() => {
      this.errorMessage = '';
    }, 3000);
  }
}
