import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { Component, Input, OnInit } from '@angular/core';
import { MapsComponent } from 'src/app/maps/maps.component';
import { FotoService } from 'src/app/services/foto.service';
import { Inmueble } from 'src/app/interfaces/inmueble';
import { InmuebleService } from 'src/app/services/inmueble.service';
import { Notario } from 'src/app/interfaces/notario';
import { NotarioService } from 'src/app/services/notario.service';
import { ProyectosService } from 'src/app/services/proyectos.service';
import { ServiciosService } from 'src/app/services/servicios.service';
import { SessionService } from './../../../services/session.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage implements OnInit {
  @Input() notarios: Notario[] = [];
  @Input() servicios: string[] = this.serviciosService.getServicios();

  venta = false;
  renta = false;
  api = environment.api;

  inmueble: Inmueble = {
    inmobiliaria: '',
    proyecto: '',
    titulo: '',
    estado: '',
    cuartos: 1,
    descripcion: '',
    direccion: {
      lat: 0,
      lng: 0,
    },
    foto: '',
    metros_cuadrados: 0,
    notario: '',
    pisos: 1,
    precio_renta: 0,
    precio_venta: 0,
    servicios: [],
    agente: '',
    borrado: false,
    visible: true,
  };

  constructor(
    private inmuebleService: InmuebleService,
    private modalController: ModalController,
    private fotoService: FotoService,
    private alertConttroller: AlertController,
    private proyectoService: ProyectosService,
    private sessionService: SessionService,
    private activeRoute: ActivatedRoute,
    private notarioService: NotarioService,
    private alertCtrl: AlertController,
    private serviciosService: ServiciosService,
    private router: Router
  ) {}

  async mostrarAlerta(titulo: string, subtitulo: string, mensaje: string) {
    const alert = await this.alertCtrl.create({
      header: titulo,
      subHeader: subtitulo,
      message: mensaje,
      buttons: ['OK'],
    });
    await alert.present();
    const result = await alert.onDidDismiss();
    console.log(result);
  }

  ngOnInit() {
    this.sessionService.get('rfc').then((rfc) => {
      if (rfc) {
        this.inmueble.agente = rfc;
        this.sessionService.get('inmobiliaria').then((inmobiliaria) => {
          this.inmueble.inmobiliaria = inmobiliaria;
          this.activeRoute.params.subscribe((params) => {
            console.log(params.proyecto);

            if (params.proyecto) {
              this.proyectoService
                .getProyectoInmobiliaria(inmobiliaria, params.proyecto)
                .subscribe((proyecto) => {
                  console.log(proyecto);
                  this.inmueble.proyecto = proyecto.nombre;
                  this.inmueble.estado = proyecto.ciudad;
                  this.proyectoService
                    .getNotariosProyecto(proyecto.nombre, inmobiliaria)
                    .subscribe((notarios) => {
                      notarios.forEach((notario) =>
                        this.notarioService
                          .getNotario(notario.inmobiliaria, notario.notario)
                          .subscribe((n) => {
                            this.notarios.push(n);
                          })
                      );
                    });
                });
            }
          });
        });
      }
    });
  }

  registrarInmueble() {
    if (
      this.inmueble.inmobiliaria.trim().length <= 0 ||
      this.inmueble.titulo.trim().length <= 0 ||
      this.inmueble.estado.trim().length <= 0 ||
      this.inmueble.notario.trim().length <= 0 ||
      this.inmueble.pisos <= 0 ||
      this.inmueble.cuartos <= 0 ||
      this.inmueble.metros_cuadrados <= 0 ||
      this.inmueble.descripcion.trim().length <= 0 ||
      this.inmueble.servicios.length <= 0 ||
      this.inmueble.precio_venta <= 0
    ) {
      this.mostrarAlerta(
        'Error',
        'Campos vacios',
        'No deje espacios en blanco.'
      );
    } else {
      this.inmuebleService.postInmueble(this.inmueble).subscribe((val) => {
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
  }

  tomarFotografia() {
    this.fotoService.tomarFoto().then((photo) => {
      const reader = new FileReader();
      const datos = new FormData();
      reader.onload = () => {
        const imgBlob = new Blob([reader.result], {
          type: `image/${photo.format}`,
        });
        datos.append('img', imgBlob, `imagen.${photo.format}`);
        this.fotoService.subirImgMiniatura(datos).subscribe((res) => {
          this.inmueble.foto = res.miniatura;
          console.log(this.api, this.inmueble.foto);
        });
      };
      fetch(photo.webPath).then((v) =>
        v.blob().then((imagen) => reader.readAsArrayBuffer(imagen))
      );
    });
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

  cerrar() {
    this.router.navigate(['../'], { relativeTo: this.activeRoute });
  }
}
