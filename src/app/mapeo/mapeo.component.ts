import { Component } from '@angular/core';
import { ProjectService } from '../project.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mapeo',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './mapeo.component.html',
  styleUrl: './mapeo.component.css'
})
export class MapeoComponent {
  tablas: any[] = [];
  proyectoId: any;
  errorMessage: string = '';
  selectedCell: { tablaIndex: number, atributoIndex: number } | null = null;
  dropdownPosition: { top: number, left: number } | null = null;

  isModalOpen = false; 
  nombreNuevaTabla: string = '';
  multSource: string = '';
  nuevosAtributos: { nombre: string, tipoDato: string, scope: string }[] = [];

  constructor(
    public readonly projectService: ProjectService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadtablas();
  }

  async loadtablas() {
    try {
      this.proyectoId = this.route.snapshot.paramMap.get('id');
      const token: any = localStorage.getItem('token');
      const response = await this.projectService.getProyectMapeoById(this.proyectoId, token);
      if (response) {
        this.tablas = response;
      } else {
        this.showError('No roles found.');
      }
    } catch (error: any) {
      this.showError(error.message);
    }
  }

  showError(message: string) {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = ''; 
    }, 3000);
  }

  confirmEliminarAtributo() {
    if (this.selectedCell) {
      const tabla = this.tablas[this.selectedCell.tablaIndex];
      const atributo = tabla.atributos[this.selectedCell.atributoIndex];
      
      if (window.confirm(`¿Estás seguro de que deseas eliminar el atributo ${atributo.nombre}?`)) {
        const token: any = localStorage.getItem('token');
        this.projectService.deleteAtributo(atributo.id, token)
          .then(() => {
            this.loadtablas(); 
            this.selectedCell = null;
          })
          .catch(error => {
            this.showError(error.message);
          });
      }
    }
  }

  openModal() {
    this.isModalOpen = true;
    this.nuevosAtributos = [{ nombre: '', tipoDato: 'string', scope: 'public' }]; 
  }

  cerrarModal() {
    this.isModalOpen = false;
    this.nombreNuevaTabla = '';
    this.nuevosAtributos = [];
  }

  agregarAtributo() {
    this.nuevosAtributos.push({ nombre: '', tipoDato: 'string', scope: 'public' });
  }

  async normalizarAtributo() {
    if (this.selectedCell) {
      const tabla = this.tablas[this.selectedCell.tablaIndex];
      const atributo = tabla.atributos[this.selectedCell.atributoIndex];
      this.selectedCell = null;
      const datos = {
        multsource: this.multSource,
        tablaId: tabla.id,
        name: this.nombreNuevaTabla,
        atributoId: atributo.id,
        atributos: this.nuevosAtributos
      };

      console.log(datos);

      try {
        const token: any = localStorage.getItem('token');
        this.projectService.normalizarTabla(datos, token); 

        const res = await this.projectService.normalizarTabla(datos, token);
        console.log(res);
        if (res.statusCode === 200) {
          this.cerrarModal(); 
          this.loadtablas(); 
        } else {
          this.showError(res.message);
        }
      } catch (error: any) {
        this.showError(error.message);
      }
    }
  }

  checkAndToggleDropdown(event: MouseEvent, tablaIndex: number, atributoIndex: number, atributo: any) {
    if (!atributo.pk && !atributo.fk) {
      this.toggleDropdown(event, tablaIndex, atributoIndex);
    } else {
      this.selectedCell = null; 
    }
  }  

  toggleDropdown(event: MouseEvent, tablaIndex: number, atributoIndex: number) {
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();

    this.dropdownPosition = {
      top: rect.bottom + window.scrollY -65,
      left: rect.left + window.scrollX
    };

    if (this.selectedCell && this.selectedCell.tablaIndex === tablaIndex && this.selectedCell.atributoIndex === atributoIndex) {
      this.selectedCell = null; 
    } else {
      this.selectedCell = { tablaIndex, atributoIndex }; 
    }
  }
  redirectToDiseno() {
    this.router.navigate([`/proyecto/${this.proyectoId}`]);
  }
}

