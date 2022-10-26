import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Inmobiliaria } from '../interfaces/inmobiliaria';
import { InmobiliariaService } from '../services/inmobiliaria.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {

  inmobiliaria: Inmobiliaria = {
    correo: '',
    password: '',
    nombre: '',
    estado: '',
    direccion: {
      calle: '',
      codigopostal: '',
      colonia: '',
      numeroexterior: '',
      numerointerior: '',
      estado: '',
    },
    notarios: [],
    agentes: []
  };

  constructor(
    private modalController: ModalController,
    private inmobiliariaService: InmobiliariaService
  ) { }

  ngOnInit() {

  }

  actualizarPerfil(){}

  cerrar() {
    return this.modalController.dismiss();
  }

}
