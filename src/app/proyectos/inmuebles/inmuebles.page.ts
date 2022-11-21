import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';

import { Agente } from 'src/app/interfaces/agente';
import { AgenteService } from 'src/app/services/agente.service';
import { Inmueble } from 'src/app/interfaces/inmueble';
import { InmuebleService } from 'src/app/services/inmueble.service';
import { Notario } from 'src/app/interfaces/notario';
import { Proyecto } from 'src/app/interfaces/proyecto';
import { ProyectosService } from 'src/app/services/proyectos.service';
import { RegistroPage } from './registro/registro.page';
import { ServiciosService } from 'src/app/services/servicios.service';
import { SessionService } from 'src/app/services/session.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-inmuebles',
  templateUrl: './inmuebles.page.html',
  styleUrls: ['./inmuebles.page.scss'],
})
export class InmueblesPage implements OnInit {
  proyecto: string = this.activatedRoute.snapshot.paramMap.get('proyecto');
  inmuebles: Inmueble[] = [];
  agentesProyecto: Agente[];
  notariosProyecto: Notario[];
  servicios = this.serviciosService.getServicios();
  inmobiliaria: string;
  api = environment.api;
  apellidoPat = '';
  apellidoMat = '';
  estado: string;
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
    private inmuebleService: InmuebleService,
    private agenteService: AgenteService,
    private modalController: ModalController,
    private serviciosService: ServiciosService,
    private alertConttroller: AlertController
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
    this.sessionService.get('rfc').then((rfc) => {
      if (rfc) {
        this.sessionService.get('inmobiliaria').then((inmobiliaria) => {
          if (inmobiliaria) {
            this.activatedRoute.params.subscribe((params) => {
              if (params.proyecto) {
                this.agenteService
                  .getInmueblesProyectoAgente(
                    rfc,
                    inmobiliaria,
                    params.proyecto
                  )
                  .subscribe((inmuebles) => {
                    this.inmuebles = inmuebles.filter(
                      (inmueble) => !inmueble.borrado
                    );
                  });
              }
            });
          }
        });
      }
    });
  }

  verInmueble(titulo: string) {
    this.router.navigate(['./', 'detalle', titulo], {
      relativeTo: this.activatedRoute,
    });
  }

  eliminarInmueble(inmueble: Inmueble) {
    this.inmuebleService
      .getFotos(inmueble.inmobiliaria, inmueble.proyecto, inmueble.titulo)
      .subscribe((imagenes) => {
        imagenes.forEach((imagen) =>
          this.inmuebleService.deleteImagen(imagen).subscribe(() => {})
        );
      });
    this.inmuebleService
      .getClientesInmueble(this.inmobiliaria, this.proyecto, inmueble.titulo)
      .subscribe((clientes) => {
        clientes.forEach((cliente) => {
          inmueble.cliente = cliente.cliente;
          this.inmuebleService.deleteInmuebleCliente(inmueble);
        });
        this.inmuebleService.deleteInmueble(inmueble).subscribe((valor) => {
          if (valor.results) {
            this.inmuebles = this.inmuebles.filter(
              (inmuebleIterable) => inmueble !== inmuebleIterable
            );
            this.alertConttroller.create({
              header: 'ÉXITOSAME',
              message: 'Se eliminó el INMUEBLE',
              buttons: ['CERRAR'],
            });
          } else {
            this.alertConttroller.create({
              header: 'ERROR',
              message: 'NO se pudo elminar el INMUEBLE',
              buttons: ['CERRAR'],
            });
            console.log(valor);
          }
        });
      });
  }

  consultarInmuebles() {
    this.inmuebleService
      .getInmueblesProyecto(this.proyecto, this.inmobiliaria)
      .subscribe((inmuebles) => {
        this.inmuebles = inmuebles.filter(
          (inmuebleIterable) => !inmuebleIterable.borrado
        );
      });
  }
  async agregarInmueble() {
    this.router.navigate(['./', 'registro'], {
      relativeTo: this.activatedRoute,
    });
  }

  // verInmueblesAgente(){
  //   this.sessionService.get('rfc').then((rfc) => {
  //     if (rfc) {
  //       this.agenteService.getInmueblesAgente(rfc).subscribe((inmuebles) => {
  //         this.inmuebles = inmuebles.filter((inmueble) => !inmueble.borrado);
  //       });
  //       this.sessionService.get('inmobiliaria').then((inmobiliaria)=>{
  //         this.agenteService.getAgente(inmobiliaria, rfc).subscribe((agente) => {
  //           this.agente = agente;
  //           console.log(agente);
  //           this.apellidoPat = agente.apellido.split(' ')[0];
  //           this.apellidoMat = agente.apellido.split(' ')[1];
  //         });
  //       })
  //     }
  //   });
  // }
}
