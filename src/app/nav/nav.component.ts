import { Component, HostListener, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, NavigationEnd, ActivatedRoute } from '@angular/router';
import { UsersService } from '../users.service';
import { v4 as uuidv4 } from 'uuid';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../project.service';
declare function showAndHide(): any;
@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, FormsModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent implements OnInit {

  constructor(private readonly userService: UsersService, private router: Router, private readonly projectService: ProjectService, private route: ActivatedRoute){
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
      }
    });
  }
  open = false;
  isAuthenticated: boolean = false;
  isAdmin: boolean = false;
  isUser: boolean = false;
  asideOpen = false;
  currentRoute: string = '';
  dropdownIndex: number | null = null;
  isAddUserDropdownOpen: boolean = false;
  projectName: string = '';
  users: any[] = [];
  currentUrl: string = '';
  email: string = ''; // Para almacenar el valor del input
  accessLevel: string = 'ver'; // Para almacenar el valor del select
  projectId: string = ''; // Almacenar el ID del proyecto
  token: string | null = ''; // Almacenar el token

  ngOnInit(): void {
    this.currentUrl = window.location.href; 
    this.userService.authStatus$.subscribe(status => {
      this.isAuthenticated = status;
      this.isAdmin = this.userService.isAdmin();
      this.isUser = this.userService.isUser();
    });
    this.userService.projectName$.subscribe((name: string) => {
      this.projectName = name;
    });
    this.userService.users$.subscribe((users: any[]) => {
      this.users = users;
    });
    this.userService.projectId$.subscribe((id: string) => {
      this.projectId = id;
    });
  }

  logout(): void {
    this.userService.logOut();
  }

  copyToClipboard() {
    const inputElement = document.getElementById('link') as HTMLInputElement;
    if (inputElement) {
      inputElement.select(); // Selecciona el contenido del input
      inputElement.setSelectionRange(0, 99999); // Para dispositivos móviles
      navigator.clipboard.writeText(this.currentUrl).then(
        () => {
          console.log('Texto copiado al portapapeles');
        },
        (err) => {
          console.error('Error al copiar texto', err);
        }
      );
    }
  }

  toggleMenu() {
    this.open = !this.open;
  }
  createNewDiagram() {
    const newDiagramId = uuidv4();
    this.router.navigate(['/proyecto', newDiagramId]);
  }  

  toggleDropdown(index: number) {
    this.dropdownIndex = this.dropdownIndex === index ? null : index;
  }

  toggleAddUserDropdown() {
    this.isAddUserDropdownOpen = !this.isAddUserDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: MouseEvent) {
    const clickedInside = (event.target as HTMLElement).closest('.relative');
    if (!clickedInside) {
      this.open = false;
    }
  }
  toggleAside() {
    this.asideOpen = !this.asideOpen;
  }
  get isProjectRoute(): boolean {
    return this.router.url.includes('/proyecto');
  }
  handleEnter() {
    this.token = localStorage.getItem('token');
    console.log(this.projectId);
    console.log(this.token)
    if (this.email && this.accessLevel && this.projectId && this.token) {
      const projectData = {
        email: this.email,
        proyectoId: this.projectId,
        permiso: this.accessLevel
      };
      this.sendInvite(projectData, this.token);
    } else {
      console.error('Faltan datos necesarios para enviar la invitación');
    }
  }

  // Función que puedes implementar para enviar los datos
  async sendInvite(projectData: any, token: string) {
    try {
      const response = await this.projectService.enviarInvitacion(projectData, token);
      this.isAddUserDropdownOpen = false;
    } catch (error) {
      console.error('Error al enviar la invitación:', error);
    }
  }
}
