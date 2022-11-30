/* eslint-disable @typescript-eslint/naming-convention */

import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';

import { AgenteService } from 'src/app/services/agente.service';
import { Direccion } from 'src/app/interfaces/direccion';
import { FotoService } from './../../../services/foto.service';
import { Imagen } from 'src/app/interfaces/imagen';
import { Inmueble } from 'src/app/interfaces/inmueble';
import { InmuebleService } from 'src/app/services/inmueble.service';
import { MapsComponent } from 'src/app/maps/maps.component';
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
  venta = false;
  renta = false;
  correo = '';
  api = environment.api;
  imagenes: Imagen[] = [];
  clientes: string[];
  inmuebles: Inmueble[] = [];
  notarios: Notario[] = [];
  inmueble: Inmueble = {
    inmobiliaria: '',
    proyecto: '',
    titulo: '',
    estado: '',
    cuartos: 0,
    descripcion: '',
    direccion: {
      lat: 0,
      lng: 0,
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
    private modalController: ModalController,
    private sessionService: SessionService,
    private activatedRoute: ActivatedRoute,
    private alertController: AlertController,
    private notarioService: NotarioService,
    private proyectosService: ProyectosService,
    private fotoService: FotoService,
    private router: Router
  ) {}

  async mostrarAlerta(titulo: string, subtitulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      subHeader: subtitulo,
      message: mensaje,
      buttons: ['OK'],
    });
    return alert.present();
  }

  ngOnInit() {
    this.sessionService.get('inmobiliaria').then((inmobiliaria) => {
      if (inmobiliaria) {
        //active route, url
        this.activatedRoute.params.subscribe((params) => {
          if (params.proyecto && params.titulo) {
            this.proyectosService
              .getNotariosProyecto(params.proyecto, inmobiliaria)
              .subscribe((a) => {
                a.forEach((notario) =>
                  this.notarioService
                    .getNotario(inmobiliaria, notario.notario)
                    .subscribe((n) => {
                      this.notarios.push(n);
                    })
                );
                this.inmuebleService
                  .getInmueble(inmobiliaria, params.proyecto, params.titulo)
                  .subscribe((inmueble) => {
                    this.inmueble = inmueble;
                    this.renta = inmueble.precio_renta > 0;
                    this.venta = inmueble.precio_venta > 0;
                    console.log(inmueble);
                    this.inmuebleService
                      .getClientesInmueble(
                        inmueble.inmobiliaria,
                        inmueble.proyecto,
                        inmueble.titulo
                      )
                      .subscribe((clientes) => {
                        this.clientes = [];
                        clientes.forEach((cliente) =>
                          this.clientes.push(cliente.cliente)
                        );
                        console.log(this.clientes);
                      });
                    this.inmuebleService
                      .getFotos(
                        inmueble.inmobiliaria,
                        inmueble.proyecto,
                        inmueble.titulo
                      )
                      .subscribe((imagenes) => (this.imagenes = imagenes));
                  });
              });
          }
        });
      }
    });
  }

  agregarFotoGaleria() {
    this.fotoService.tomarFoto().then((photo) => {
      const reader = new FileReader();
      const datos = new FormData();
      reader.onload = () => {
        const imgBlob = new Blob([reader.result], {
          type: `image/${photo.format}`,
        });
        datos.append('img', imgBlob, `imagen.${photo.format}`);
        this.fotoService.subirImg(datos).subscribe((res) => {
          const imagen = {
            inmobiliaria: this.inmueble.inmobiliaria,
            proyecto: this.inmueble.proyecto,
            titulo: this.inmueble.titulo,
            ruta: res.path,
          };
          this.inmuebleService.postFotos(imagen).subscribe((val) => {
            if (val.results) {
              this.imagenes.push(imagen);
            }
          });
        });
      };
      fetch(photo.webPath).then((v) =>
        v.blob().then((imagen) => reader.readAsArrayBuffer(imagen))
      );
    });
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

  eliminar(imagen: Imagen) {
    this.alertController
      .create({
        header: 'ALTO',
        subHeader: '¿Está seguro? ',
        message: '¿Desea eliminar la imagen?',
        buttons: [
          'NO',
          {
            text: 'SI',
            handler: () => {
              this.eliminarFoto(imagen);
            },
          },
        ],
      })
      .then((alert) => {
        alert.present();
      });
  }

  actualizarInmueble() {
    //eso se queda, pegalo abajo. sustituyendo todo ese ifesote, sip
    this.inmueble.precio_renta = this.renta ? this.inmueble.precio_renta : 0;
    this.inmueble.precio_venta = this.renta ? this.inmueble.precio_venta : 0;
    if (this.validaciones()) {
      this.inmuebleService.postInmueble(this.inmueble).subscribe((res) => {
        if (res.results) {
          this.mostrarAlerta(
            'ÉXITO',
            'Se actualizó correctamente el inmueble',
            ''
          );
        } else {
          this.mostrarAlerta('ERROR', 'Intentelo de nuevo', '');
        }
      });
    }
  }

  async verPosicion() {
    const modal = await this.modalController.create({
      component: MapsComponent,
      componentProps: { position: this.inmueble.direccion },
      cssClass: 'modalGeneral',
    });
    return modal.present();
  }

  async guardarDireccion() {
    const modal = await this.modalController.create({
      component: MapsComponent,
      componentProps: { position: this.inmueble.direccion },
      cssClass: 'modalGeneral',
    });
    modal.onDidDismiss().then((res) => {
      if (res.data) {
        this.inmueble.direccion = res.data.pos;
      }
    });
    return modal.present();
  }

  eliminarInmueble() {
    this.imagenes.forEach((imagen) => this.eliminarFoto(imagen));
    this.clientes.forEach((cliente) => {
      this.inmueble.cliente = cliente;
      this.inmuebleService
        .deleteInmuebleCliente(this.inmueble)
        .subscribe((res) => {});
    });
    this.inmuebleService.deleteInmueble(this.inmueble).subscribe((res) => {
      if (res.results) {
        this.alertController
          .create({
            header: 'EXITO',
            message: 'Se eliminó el Inmueble',
            buttons: [
              {
                text: 'CERRAR',
                handler: () => {
                  this.router.navigate(['../../'], {
                    relativeTo: this.activatedRoute,
                  });
                },
              },
            ],
          })
          .then((a) => a.present());
      } else {
        this.alertController
          .create({
            header: 'ERROR',
            message: 'No se eliminó el Inmueble',
            buttons: ['CERRAR'],
          })
          .then((a) => a.present());
      }
    });
  }

  eliminarFoto(imagen: Imagen) {
    this.inmuebleService.deleteImagen(imagen).subscribe((res) => {
      if (res.results) {
        this.imagenes = this.imagenes.filter((img) => img !== imagen);
      } else {
        this.alertController
          .create({
            header: 'ERROR',
            message: 'No se eliminó la Foto',
            buttons: ['CERRAR'],
          })
          .then((a) => a.present());
      }
    });
  }

  validaciones(): boolean {
    if (this.inmueble.inmobiliaria.trim().length <= 0) {
      this.mostrarAlerta(
        'Error',
        'Campos vacios',
        'Debe tener una inmobiliaria asignada'
      );
      return false;
    }
    if (this.inmueble.titulo.trim().length <= 0) {
      this.mostrarAlerta(
        'Error',
        'Campos vacios',
        'Rellene el campo de título'
      );
      return false;
    }
    if (this.inmueble.estado.trim().length <= 0) {
      this.mostrarAlerta(
        'Error',
        'Campos vacios',
        'Tiene que tener asignado un Estado'
      );
      return false;
    }
    if (this.inmueble.notario.trim().length <= 0) {
      this.mostrarAlerta('Error', 'Campos vacios', 'Escoga un Notario');
      return false;
    }
    if (this.inmueble.pisos <= 0) {
      this.mostrarAlerta(
        'Error',
        'Campos vacios',
        'Ingrese la cantidad de pisos'
      );
      return false;
    }
    if (this.inmueble.cuartos <= 0) {
      this.mostrarAlerta(
        'Error',
        'Campos vacios',
        'Ingrese la cantidad de cuartos'
      );
      return false;
    }
    if (this.inmueble.metros_cuadrados <= 0) {
      this.mostrarAlerta(
        'Error',
        'Campos vacios',
        'Ingrese los Metros cuadrados'
      );
      return false;
    }
    if (this.inmueble.descripcion.trim().length <= 0) {
      this.mostrarAlerta(
        'Error',
        'Campos vacios',
        'Tiene que ingresar una descripción'
      );
      return false;
    }
    if (this.inmueble.servicios.length <= 0) {
      this.mostrarAlerta('Error', 'Campos vacios', '¿QUÉ servicios tiene?');
      return false;
    }
    if (!this.venta && !this.renta) {
      this.mostrarAlerta(
        'Error',
        'Campos vacios',
        'Seleccione por lo menos una opción de comercialización'
      );
      return false;
    }
    //Aqui venta o renta estan seleccionados, por lo menos uno de ellos
    if (this.venta && this.inmueble.precio_venta <= 0) {
      this.mostrarAlerta(
        'Error',
        'Precio de venta no valido',
        'Ingrese un valor positivo mayor a 0 para la venta'
      );
      return false;
    }
    if (this.renta && this.inmueble.precio_renta <= 0) {
      this.mostrarAlerta(
        'Error',
        'Precio de renta no valido',
        'Ingrese un valor positivo mayor a 0 para la renta'
      );
      return false;
    }

    if (this.inmueble.direccion.lat === 0 && this.inmueble.direccion.lng === 0) {
      this.mostrarAlerta('Error', 'Campos vacios', 'Ingrese la dirección.');
      return false;
    }

    return true;
  }
}
