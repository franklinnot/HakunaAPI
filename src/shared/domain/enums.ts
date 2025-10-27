export enum Estado {
  HABILITADO = 'Habilitado',
  DESHABILITADO = 'Deshabilitado',
}

export enum TipoArchivo {
  DOCUMENTO = 'Documento',
  AUDIO = 'Audio',
  IMAGEN = 'Imagen',
  VIDEO = 'Video',
}

export enum DocumentoExtension {
  PDF = 'pdf',
  DOCX = 'docx',
}

export enum TipoChat {
  PRIVADO = 'Privado',
  GRUPAL = 'Grupal',
}

export enum TipoIntegrante {
  ADMIN = 'Admin',
  MIEMBRO = 'Miembro',
}

export enum TipoEvento {
  USUARIO_ACTUALIZADO = 'usuarioConectado',
  //
  NUEVO_MENSAJE_PRIVADO = 'nuevoMensajePrivado',
  NUEVO_MENSAJE_GRUPAL = 'nuevoMensajeGrupal',
  MENSAJE_ACTUALIZADO = 'mensajeActualizado',
  MENSAJE_ELIMINADO = 'mensajeEliminado',
  MENSAJE_LEIDO = 'mensajeLeido',
  //
  NUEVO_CHAT_GRUPAL = 'nuevoChatGrupal',
  CHAT_GRUPAL_ACTUALIZADO = 'chatGrupalActualizado',
  NUEVO_INTEGRANTE = 'nuevoIntegrante',
  INTEGRANTE_ACTUALIZADO = 'integranteActualizado',
  INTEGRANTE_ELIMINADO = 'integranteEliminado',
}
