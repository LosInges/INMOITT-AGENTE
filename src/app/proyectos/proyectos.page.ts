import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { Agente } from '../interfaces/agente';
import { AgenteService } from '../services/agente.service';
import { AlertController } from '@ionic/angular';
import { Inmueble } from '../interfaces/inmueble';
import { Proyecto } from '../interfaces/proyecto';
import { ProyectosService } from '../services/proyectos.service';
import { SessionService } from '../services/session.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-proyectos',
  templateUrl: './proyectos.page.html',
  styleUrls: ['./proyectos.page.scss'],
})
export class ProyectosPage implements OnInit {
  proyectos: Proyecto[] = [];
  api = environment.api;
  apellidoPat = '';
  apellidoMat = '';
  agente: Agente = {
    rfc: '',
    inmobiliaria: '',
    nombre: '',
    correo: '',
    password: '',
    apellido: '',
    telefono: '',
    foto: '',
  };

  constructor(
    private router: Router,
    private alertController: AlertController,
    private sessionService: SessionService,
    private activatedRoute: ActivatedRoute,
    private proyectosService: ProyectosService,
    private agenteService: AgenteService
  ) {
    router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        this.sessionService.keys().then((k) => {
          if (k.length <= 0) {
            this.router.navigate(['']);
          }
        });
      }
    });
  }

  ngOnInit() {
    this.sessionService.get('rfc').then((rfc)=>{
      this.agenteService.getProyectos(rfc).subscribe((proyectos)=>{
        this.proyectos = proyectos
        console.log(proyectos)
      })
    })
  } 
  
  verInmueble(inmueble: Inmueble) {
    this.router.navigate([
      'proyectos',
      inmueble.proyecto,
      'inmuebles',
      'inmueble',
      inmueble.titulo,
    ]);
  } 

  verProyecto(proyecto: Proyecto){
  this.router.navigate(['./','inmuebles',proyecto.nombre],{relativeTo:this.activatedRoute})
  }
}
