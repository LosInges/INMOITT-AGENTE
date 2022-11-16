import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';

import { Agente } from 'src/app/interfaces/agente';
import { AgenteService } from '../services/agente.service';
import { AlertController } from '@ionic/angular';
import { FotoService } from './../services/foto.service';
import { Inmobiliaria } from '../interfaces/inmobiliaria';
import { InmobiliariaService } from '../services/inmobiliaria.service';
import { SessionService } from '../services/session.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  apellidoPat: string = '';
  apellidoMat: string = '';
  inmobiliarias: Inmobiliaria[];
  api = environment.api;
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
  confirmPassword = '';
  mensaje = '';

  constructor(
    private sessionService: SessionService,
    private inmobiliariaService: InmobiliariaService,
    private agenteService: AgenteService,
    private router: Router,
    private fotoService: FotoService,
    private alertController: AlertController
  ) {
    router.events.subscribe(e=>{
    if(e instanceof NavigationEnd){
      this.sessionService.keys().then(k=>{
        if(k.length <= 0){
          this.router.navigate([''])
        }
      })
    }
  })}

  ngOnInit() {
    this.sessionService.get('inmobiliaria').then((inmobiliaria) => {
      if (inmobiliaria) {
        this.sessionService.get('rfc')?.then((rfc) => {
          if (rfc) {
            this.agenteService
              .getAgente(inmobiliaria, rfc)
              .subscribe((agente) => {
                this.agente = agente;
                console.log(agente);
                this.apellidoPat = agente.apellido.split(' ')[0];
                this.apellidoMat = agente.apellido.split(' ')[1];
              });
          }
        });
      }
    });

    this.inmobiliariaService.getInmobiliarias()?.subscribe((inmobiliarias) => {
      this.inmobiliarias = inmobiliarias;
    });
  }

  actualizarPerfil() {
    // if (
    //   this.agente.rfc.trim() !== "" &&
    //   this.agente.inmobiliaria.trim() !== "" &&
    //   this.agente.nombre.trim() !== "" &&
    //   this.agente.correo.trim() !== "" &&
    //   this.agente.password.trim() !== "" &&
    //   this.agente.apellido.trim() !== "" &&
    //   this.agente.foto.trim() !== "" &&
    //   this.agente.telefono.trim() !== "" &&
    //   this.confirmPassword.trim() !== ""
    // )
    //{
    if (this.confirmPassword === this.agente.password) {
      this.agente.apellido = this.apellidoPat + ' ' + this.apellidoMat;
      this.agenteService
        .postAgente(this.agente)
        .subscribe((res) => console.log(res));
        this.mensaje = "Actualización EXITOSA"
       
    }else{
      this.mensaje ="Ingrese Todos los valores"
    }
    this.presentAlert(this.mensaje)
    //}
  }

  async presentAlert(mensaje) {
    const alert = await this.alertController.create({
      header: this.mensaje,
      cssClass: 'custom-alert',
      buttons: [
        {
          text: 'NO',
          cssClass: 'alert-button-cancel',
        },
        {
          text: 'OK',
          cssClass: 'alert-button-confirm',
        },
      ],
    });

      await alert.present();
    }

  eliminarPerfil() {
    if (this.confirmPassword === this.agente.password)
      this.agenteService.deleteAgente(this.agente.rfc).subscribe((res) => {
        if (res.results)
          this.sessionService.clear().then(() => this.router.navigate(['']));
        else console.log(res);
      });
  }

  tomarFotografia() {
    this.fotoService.tomarFoto().then((photo) => {
      // this.fotoService.subirMiniatura(photo.webPath).subscribe((data) => {
      //   console.log(data);
      // });
      console.log(photo);
      const reader = new FileReader();
      const datos = new FormData();
      reader.onload = () => {
        const imgBlob = new Blob([reader.result], {
          type: `image/${photo.format}`,
        });
        datos.append('img', imgBlob, `imagen.${photo.format}`);
        this.fotoService
          .subirMiniatura(datos)
          .subscribe((res) => (this.agente.foto = res.path));
      };
      const consulta = fetch(photo.webPath).then((v) =>
        v.blob().then((imagen) => reader.readAsArrayBuffer(imagen))
      );
    });
  }
}
