import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { AgenteService } from 'src/app/services/agente.service';
import { AlertController } from '@ionic/angular';
import { Inmueble } from 'src/app/interfaces/inmueble';
import { InmuebleService } from 'src/app/services/inmueble.service';
import { Notario } from 'src/app/interfaces/notario';
import { NotarioService } from 'src/app/services/notario.service';
import { Proyecto } from 'src/app/interfaces/proyecto';
import { ProyectosService } from 'src/app/services/proyectos.service';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.page.html',
  styleUrls: ['./detalle.page.scss'],
})
export class DetallePage implements OnInit {
  correo: string = '';
  inmuebles: Inmueble[] = [];
  notarios: Notario[]=[];
  inmueble: Inmueble = {
    inmobiliaria: '',
    proyecto: '',
    titulo: '',
    estado: '',
    cuartos: 0,
    descripcion: '',

    direccion: {
      calle: '',
      codigopostal: '',
      colonia: '',
      numeroexterior: '',
      numerointerior: '',
      estado: '',
    },

    foto: '',
    metros_cuadrados: 0,

    notario: '',
    pisos: 0,
    precio_renta: 0,
    precio_venta: 0,
    servicios: [],
    agente: '',
    borrado: false,
    visible: true,
  };
  constructor(
    private inmuebleService: InmuebleService,
    private alertConttroller: AlertController,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private sessionService: SessionService,
    private activatedRoute: ActivatedRoute,
    private agenteService: AgenteService,
    private notarioService: NotarioService,
    private proyectosService: ProyectosService
  ) {}

  ngOnInit() {
    this.sessionService.get('inmobiliaria').then((inmobiliaria) => {
      if (inmobiliaria) {
        //active route, url
        this.activatedRoute.params.subscribe((params) => {
          console.log(params);

          if (params.proyecto && params.titulo) {
            this.proyectosService.getNotariosProyecto(params.proyecto, inmobiliaria).subscribe(a=>{
              a.forEach(notario => this.notarioService.getNotario(inmobiliaria, notario.notario).subscribe(n=>{
                this.notarios.push(n)
              }))
            })
            this.inmuebleService
              .getInmueble(inmobiliaria, params.proyecto, params.titulo)
              .subscribe((inmueble) => {
                this.inmueble = inmueble;
                console.log(inmueble);
              });
          }
        });
      }
    });
  }

  actualizarInmueble() {
    this.inmuebleService
      .postInmueble(this.inmueble)
      .subscribe((res) => console.log(res));
  }
}
