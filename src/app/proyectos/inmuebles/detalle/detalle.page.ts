import { Component, OnInit } from '@angular/core';

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
     private sessionService: SessionService
   ) { }

   ngOnInit() {
     this.sessionService.get('correo')?.then(correo => {
      this.correo = correo
     })

   }

  actualizarInmueble(){
    this.inmuebleService.postInmueble(this.inmueble).subscribe(res => console.log(res))
  }


}
