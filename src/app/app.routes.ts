import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ProfileComponent } from './profile/profile.component';
import { UpdateuserComponent } from './updateuser/updateuser.component';
import { UserlistComponent } from './userlist/userlist.component';
import { usersGuard, adminGuard } from './users.guard';
import { RoleslistComponent } from './rolelist/rolelist.component';
import { UpdateroleComponent } from './updaterole/updaterole.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { ProyectoComponent } from './proyecto/proyecto.component';
import { ProyectolistComponent } from './proyectolist/proyectolist.component';
import { MapeoComponent } from './mapeo/mapeo.component';
import { RegistrarseComponent } from './registrarse/registrarse.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent, canActivate: [usersGuard] },
    { path: 'profile', component: ProfileComponent, canActivate: [usersGuard] },
    { path: 'update/:id', component: UpdateuserComponent, canActivate: [usersGuard] },
    { path: 'users', component: UserlistComponent, canActivate: [usersGuard] },
    { path: 'roles', component: RoleslistComponent, canActivate: [usersGuard] },
    { path: 'proyecto/:id', component: ProyectoComponent },
    { path: 'proyectomapeo/:id', component: MapeoComponent },
    { path: 'dashboard', component: ProyectolistComponent },
    { path: 'registrarse', component: RegistrarseComponent},
    { path: 'role/update/:id', component: UpdateroleComponent, canActivate: [usersGuard] },
    { path: '', component: WelcomeComponent },
    { path: '**', redirectTo: '', pathMatch: 'full' } 
];
