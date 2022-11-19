import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { AgenteService } from 'src/app/services/agente.service';
import { AlertController } from '@ionic/angular';
import { Inmueble } from 'src/app/interfaces/inmueble';
import { InmuebleService } from 'src/app/services/inmueble.service';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.page.html',
  styleUrls: ['./detalle.page.scss'],
})
export class DetallePage implements OnInit {
  correo: string = ''
  inmuebles: Inmueble[] = [];
  inmueble: Inmueble = {
    inmobiliaria: '',
    proyecto:'',
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
   visible: true
  }
   constructor(
     private inmuebleService : InmuebleService,
     private alertConttroller: AlertController,
     private router: Router,
     private activeRoute: ActivatedRoute,
     private sessionService: SessionService,
     private activatedRoute: ActivatedRoute,
     private agenteService: AgenteService,
   ) { }

   ngOnInit() {    this.inmuebleService.postInmueble(this.inmueble).subscribe((val) => {
    if (val.results) {
      this.alertConttroller
        .create({
          header: 'ÉXITOSAME',
          message: 'Se registró INMUEBLE',
          buttons: ['CERRAR'],
        })
        .then((a) => {
          a.onDidDismiss().then((data) =>
            this.router.navigate(['../'], { relativeTo: this.activeRoute })
          );
          a.present();
        });

      return;
    }
    this.alertConttroller
      .create({
        header: 'ERROR',
        message: 'Inmueble  no registrado',
        buttons: ['CERRAR'],
      })
      .then((a) => a.present());
  });

   }

  actualizarInmueble(){
    this.inmuebleService.postInmueble(this.inmueble).subscribe(res => console.log(res))
  }


}
