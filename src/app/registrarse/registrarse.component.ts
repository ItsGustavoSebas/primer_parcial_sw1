import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from '../users.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registrarse',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './registrarse.component.html',
  styleUrls: ['./registrarse.component.css']
})
export class RegistrarseComponent implements OnInit {
  formData: any = {
    name: '',
    email: '',
    password: '',
    roles: [],
    urlAvatar: ''
  };
  availableAvatars: string[] = [
    'assets/imagenes/avatars/avatar1.jpg',
    'assets/imagenes/avatars/avatar2.jpg',
    'assets/imagenes/avatars/avatar3.png',
    'assets/imagenes/avatars/avatar4.png',
    'assets/imagenes/avatars/avatar5.png',
  ];
  selectedAvatar: string = '';
  errorMessage: string = '';
  previewUrl: string | ArrayBuffer | null = null; 

  
  constructor(
    private readonly userService: UsersService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
  }

  selectAvatar(avatar: string) {
    this.selectedAvatar = avatar;
    this.formData.urlAvatar = avatar;
  }

  async handleSubmit() {
    if (!this.formData.name || !this.formData.email || !this.formData.password || !this.formData.urlAvatar) {
      this.showError('Por favor completa todos los campos y selecciona un avatar.');
      return;
    }

    const confirmRegistration = confirm('¿Estás seguro de que deseas registrar este usuario?');
    if (!confirmRegistration) return;

    try {
      const newUserData = {
        email: this.formData.email,
        name: this.formData.name,
        password: this.formData.password,
        roles: ["USER"],
        urlAvatar: this.formData.urlAvatar
      };

      const response = await this.userService.registrar(newUserData);
      if (response.statusCode === 200) {
        const loginResponse = await this.userService.login(this.formData.email, this.formData.password);
        
        if (loginResponse.statusCode === 200) {
          this.router.navigate(['/dashboard']);
        } else {
          this.showError(loginResponse.message);
        }
      } else {
        this.showError(response.message);
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
}