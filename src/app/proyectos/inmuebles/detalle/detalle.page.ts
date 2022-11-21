import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { AgenteService } from 'src/app/services/agente.service';
import { AlertController } from '@ionic/angular';
import { FotoService } from './../../../services/foto.service';
import { Imagen } from 'src/app/interfaces/imagen';
import { Inmueble } from 'src/app/interfaces/inmueble';
import { InmuebleService } from 'src/app/services/inmueble.service';
import { Notario } from 'src/app/interfaces/notario';
import { NotarioService } from 'src/app/services/notario.service';
import { Proyecto } from 'src/app/interfaces/proyecto';
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
    private proyectosService: ProyectosService,
    private fotoService: FotoService
  ) {}

  ngOnInit() {
    this.sessionService.get('inmobiliaria').then((inmobiliaria) => {
      if (inmobiliaria) {
        //active route, url
        this.activatedRoute.params.subscribe((params) => {
          console.log(params);

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
              });
            this.inmuebleService
              .getInmueble(inmobiliaria, params.proyecto, params.titulo)
              .subscribe((inmueble) => {
                this.inmueble = inmueble;
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
  eliminar(imagen: Imagen) {
    this.alertConttroller
      .create({
        header: 'ALTO',
        subHeader: '¿Está seguro? ',
        message: '¿Desea eliminar la imagen?',
        buttons: [
          'NO',
          {
            text: 'SI',
            handler: () => {
              this.inmuebleService.deleteImagen(imagen).subscribe((val) => {
                if (val.results) {
                  this.imagenes = this.imagenes.filter((img) => img != imagen);
                } else {
                  console.log(val);
                }
              });
            },
          },
        ],
      })
      .then((alert) => {
        alert.present();
      });
  }

  actualizarInmueble() {
    this.inmuebleService
      .postInmueble(this.inmueble)
      .subscribe((res) => console.log(res));
  }
  eliminarInmueble() {
    this.inmuebleService
      .deleteInmueble(this.inmueble)
      .subscribe((resultado) => {
        console.log(resultado);
      });
  }
}
