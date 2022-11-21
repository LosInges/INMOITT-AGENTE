import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Agente } from 'src/app/interfaces/agente';
import { Inmobiliaria } from 'src/app/interfaces/inmobiliaria';
import { AgenteService } from 'src/app/services/agente.service';
import { EstadosService } from 'src/app/services/estados.service';
import { InmobiliariaService } from 'src/app/services/inmobiliaria.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {
  apellidoPat = '';
  apellidoMat = '';
  inmobiliarias: Inmobiliaria[];
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

  estados = this.estadosService.getEstados();

  constructor(
    private estadosService: EstadosService,
    private inmobiliariaService: InmobiliariaService,
    private agenteService: AgenteService,
    private modalController: ModalController,
    private alertCtrl: AlertController,
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
    this.router.navigate(['/', 'login']);
  }

  ngOnInit() {
    this.inmobiliariaService.getInmobiliarias()?.subscribe((inmobiliarias) => {
      this.inmobiliarias = inmobiliarias;
    });
  }

  onSubmit() {
    if (
      this.agente.rfc.trim().length <= 0 ||
      this.agente.nombre.trim().length <= 0 ||
      this.apellidoPat.trim().length <= 0 ||
      this.apellidoMat.trim().length <= 0 ||
      this.agente.correo.trim().length <= 0 ||
      this.agente.password.trim().length <= 0 ||
      this.agente.telefono.trim().length <= 0
    ) {
      this.mostrarAlerta(
        'Error',
        'Campos vacios',
        'No deje espacios en blanco.'
      );
    } else {
      if (this.confirmPassword === this.agente.password) {
        this.agente.apellido = this.apellidoPat + ' ' + this.apellidoMat;
        this.agenteService.postAgente(this.agente).subscribe((res) => {
          console.log(res);
          if (res.results) {this.modalController.dismiss();}
          else {console.log(res);}
          this.mostrarAlerta(
            'Completado',
            'Creación',
            'Cliente creado exitosamente.'
          );
          window.location.reload();
        });
      } else {
        this.mostrarAlerta(
          'Error:',
          'Confirmación de clave incorrecta',
          '¿es correcta o esta vacia?'
        );
      }
    }
  }
  cerrar() {
    this.modalController.dismiss();
  }
}
