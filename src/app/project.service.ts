import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private BASE_URL = "http://localhost:8080";
  constructor(private http: HttpClient) {}

  async getProyectById(proyectoId: string, token: string): Promise<any> {
    const url = `${this.BASE_URL}/user/proyectos/get/${proyectoId}`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    try {
      const response = this.http.get<any>(url, { headers }).toPromise();
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getAllProjects(token: string): Promise<any> {
    const url = `${this.BASE_URL}/user/proyectos/user`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    try {
      const response = this.http.get<any>(url, { headers }).toPromise();
      console.log(response);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async crearTabla(proyectoId: string, tablaData: any, token: string): Promise<any> {
    const url = `${this.BASE_URL}/user/proyectos/crearTabla/${proyectoId}`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    try {
      const response = this.http
        .post<any>(url, tablaData, { headers })
        .toPromise();
      return response;
    } catch (error) {
      throw error;
    }
  }

  async crearAtributos(tablaId: string, tablaData: any, token: string): Promise<any> {
    const url = `${this.BASE_URL}/user/proyectos/atributos/${tablaId}`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    try {
      const response = this.http
        .post<any>(url, tablaData, { headers })
        .toPromise();
      return response;
    } catch (error) {
      throw error;
    }
  }

  async editarPosicion(tablaId: string, tablaData: any, token: string): Promise<any> {
    const url = `${this.BASE_URL}/user/proyectos/posicion/${tablaId}`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    try {
      const response = this.http
        .post<any>(url, tablaData, { headers })
        .toPromise();
      return response;
    } catch (error) {
      throw error;
    }
  }

  async crearRelacion(tablaData: any, token: string): Promise<any> {
    const url = `${this.BASE_URL}/user/proyectos/relacion`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    try {
      const response = this.http
        .post<any>(url, tablaData, { headers })
        .toPromise();
      return response;
    } catch (error) {
      throw error;
    }
  }
  uploadProjectWithFile(formData: any, token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.post<any>(`${this.BASE_URL}/user/proyectos/proyectoCompleto`, formData, { headers });
  }

  createProjectWithoutFile(projectData: any, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });

    return this.http.post('${this.BASE_URL}/user/proyectos/without-file', projectData, { headers });
  }

  generarXmi(proyectoId: number, token: string): Observable<Blob> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 
      Authorization: `Bearer ${token}`
    });
    return this.http.get(`${this.BASE_URL}/user/proyectos/generate/${proyectoId}`, {
      headers: headers,
      responseType: 'blob', 
    });
  }

  generarORM(proyectoId: number, token: string): Observable<Blob> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 
      Authorization: `Bearer ${token}`
    });
    return this.http.get(`${this.BASE_URL}/user/exportar/${proyectoId}/generar-entidades`, {
      headers: headers,
      responseType: 'blob', 
    });
  }

  async getProyectMapeoById(proyectoId: string, token: string): Promise<any> {
    const url = `${this.BASE_URL}/user/mapeo/get/${proyectoId}`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    try {
      const response = this.http.get<any>(url, { headers }).toPromise();
      console.log(response);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async deleteAtributo(atributoId: string, token: string): Promise<any> {
    const url = `${this.BASE_URL}/user/mapeo/delete/${atributoId}`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    try {
      const response = this.http.delete<any>(url, { headers }).toPromise();
      return response;
    } catch (error) {
      throw error;
    }
  }

  async normalizarTabla(projectData: any, token: string): Promise<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
    try {
      const response = this.http.post(`${this.BASE_URL}/user/mapeo/normalizar`, projectData, { headers }).toPromise();;
      return response;
    } catch (error) {
      throw error;
    }
  }

  async enviarInvitacion(projectData: any, token: string): Promise<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
    try {
      const response = this.http.post(`${this.BASE_URL}/user/proyectos/invitacion`, projectData, { headers }).toPromise();;
      return response;
    } catch (error) {
      throw error;
    }
  }

async deleteTabla(tablaId: string, token: string): Promise<any> {
    const url = `${this.BASE_URL}/user/proyectos/delete/${tablaId}`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    try {
      const response = this.http.delete<any>(url, { headers }).toPromise();
      return response;
    } catch (error) {
      throw error;
    }
  }
  async deleteRelacion(relacionId: string, token: string): Promise<any> {
    const url = `${this.BASE_URL}/user/proyectos/deleteRelacion/${relacionId}`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    try {
      const response = this.http.delete<any>(url, { headers }).toPromise();
      return response;
    } catch (error) {
      throw error;
    }
  }
}



