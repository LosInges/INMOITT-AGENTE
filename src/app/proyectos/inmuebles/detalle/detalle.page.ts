import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { MapsComponent } from 'src/app/maps/maps.component';
import { Direccion } from 'src/app/interfaces/direccion';
import { ModalController } from '@ionic/angular';
import { Inmueble } from 'src/app/interfaces/inmueble';
import { InmuebleService } from 'src/app/services/inmueble.service';
import { Notario } from 'src/app/interfaces/notario';
import { NotarioService } from 'src/app/services/notario.service'; 
import { ProyectosService } from 'src/app/services/proyectos.service';
import { SessionService } from 'src/app/services/session.service';
import { environment } from 'src/environments/environment';

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
    lat: 0,
    lng: 0
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

  api = environment.api;
  
  constructor(
    private inmuebleService: InmuebleService, 
    private modalController: ModalController, 
    private sessionService: SessionService,
    private activatedRoute: ActivatedRoute, 
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

  async verPosicion(position: Direccion) {
    const modal = await this.modalController.create({
      component: MapsComponent,
      componentProps: { position },
      cssClass: 'modalGeneral'
    });
    return modal.present();
  }

  async guardarDireccion() {
    const modal = await this.modalController.create({
      component: MapsComponent,
      cssClass: 'modalGeneral',
    });
    modal.onDidDismiss().then((res) => {
      if (res.data) {
        this.inmueble.direccion = res.data.pos;
      }
    });
    return modal.present();
  }
}
