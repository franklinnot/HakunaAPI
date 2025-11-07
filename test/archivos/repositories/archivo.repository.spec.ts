import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ArchivoRepository } from '../../../src/modules/archivos/infraestructure/repositories/archivo.repository'; // Ajusta la ruta
import { Archivo } from '../../../src/modules/archivos/infraestructure/schemas/archivo.schema'; // Ajusta la ruta
import { Estado, TipoArchivo } from 'src/shared/domain/enums'; // Ajusta la ruta
import { IArchivo } from '../../../src/modules/archivos/domain/archivos.entities'; // Ajusta la ruta

// Mock de la clase Model de Mongoose. Necesitamos simular los métodos que usa BaseRepository.
const mockArchivoModel = () => ({
  findOne: jest.fn(), // Usado por BaseRepository.findOne
  // Si BaseRepository.findOne usa find:
  find: jest.fn().mockReturnThis(), 
  lean: jest.fn().mockReturnThis(),
  exec: jest.fn(),
});

// Mock del objeto retornado por BaseRepository.findOne
const mockIArchivo: IArchivo = {
  _id: 'archivo-id-123',
  createdAt: new Date(),
  updatedAt: new Date(),
  estado: Estado.HABILITADO,
  nombre: 'documento.pdf',
  link: 'http://enlace.aqui/documento.pdf',
  tipo_archivo: TipoArchivo.DOCUMENTO,
  extension: 'pdf',
  size: '1024kb',
  filekey: 's3-key-123',
};

describe('ArchivoRepository', () => {
  let repository: ArchivoRepository;
  let archivoModel: Model<Archivo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArchivoRepository,
        {
          provide: getModelToken(Archivo.name),
          useValue: mockArchivoModel(),
        },
      ],
    }).compile();

    repository = module.get<ArchivoRepository>(ArchivoRepository);
    archivoModel = module.get<Model<Archivo>>(getModelToken(Archivo.name));
    
  });

  it('1. debe devolver el link del archivo cuando se encuentra por ID', async () => {
    const archivoId = 'valid-archivo-id';
    
    // Simulamos que BaseRepository.findOne encuentra y mapea la entidad IArchivo
    ((archivoModel as any).exec as jest.Mock).mockResolvedValue([mockIArchivo]); // find().exec() devuelve un array
    
    // Espiamos el método findOne, que se llama internamente en findLinkById
    const findOneSpy = jest.spyOn(repository, 'findOne' as any)
        .mockResolvedValue(mockIArchivo);

    const result = await repository.findLinkById(archivoId);

    // 1. Verificar que se llamó a findOne con el ID correcto
    expect(findOneSpy).toHaveBeenCalledWith({ _id: archivoId });

    // 2. Verificar el resultado (debe ser el link)
    expect(result).toBe(mockIArchivo.link);
    
    findOneSpy.mockRestore(); // Restaurar el mock
  });
  it('2. debe devolver null si el archivo no se encuentra', async () => {
    const archivoId = 'invalid-archivo-id';

    // Simulamos que BaseRepository.findOne devuelve null
    const findOneSpy = jest.spyOn(repository, 'findOne' as any)
        .mockResolvedValue(null); 

    const result = await repository.findLinkById(archivoId);

    // 1. Verificar que se llamó a findOne
    expect(findOneSpy).toHaveBeenCalled();

    // 2. Verificar el resultado
    expect(result).toBeNull();
    
    findOneSpy.mockRestore();
  });
it('3. debe mapear correctamente un documento de Mongoose a la entidad de dominio IArchivo', () => {
    const now = new Date();
    // Simular el documento que retorna Mongoose
    const mockDoc: Archivo = {
      _id: 'mongo-id-456',
      createdAt: now,
      updatedAt: now,
      estado: Estado.DESHABILITADO,
      nombre: 'imagen.jpg',
      link: 'http://cdn.com/img.jpg',
      tipo_archivo: TipoArchivo.IMAGEN,
      extension: 'jpg',
      size: '500kb',
      filekey: 's3-key-456',
    } as unknown as Archivo; 

    // Acceso al método protegido para la prueba
    const result: IArchivo = (repository as any).toDomain(mockDoc);

    // Verificar el mapeo de los campos
    expect(result._id).toBe('mongo-id-456');
    expect(result.estado).toBe(Estado.DESHABILITADO);
    expect(result.nombre).toBe('imagen.jpg');
    expect(result.link).toBe('http://cdn.com/img.jpg');
    expect(result.tipo_archivo).toBe(TipoArchivo.IMAGEN);
    expect(result.extension).toBe('jpg');
    expect(result.size).toBe('500kb');
    expect(result.filekey).toBe('s3-key-456');
  });
  
  it('4. debe usar valores por defecto en toDomain cuando las propiedades son nulas o indefinidas', () => {
    // Simular un documento con mínimos valores, donde la mayoría son nulos/undefined
    const mockDocMinimal: Archivo = {
      _id: 'min-id',
      // Los campos de timestamp y estado se asumen definidos o con lógica BaseRepository,
      // pero probamos los campos específicos de Archivo.
      nombre: undefined,
      link: null,
      tipo_archivo: undefined,
      extension: null, // Prueba el operador ?? null
      size: undefined,
      filekey: null,
    } as unknown as Archivo; 

    // Acceso al método protegido para la prueba
    const result: IArchivo = (repository as any).toDomain(mockDocMinimal);

    // Verificar valores por defecto (||) o ?? null
    expect(result.nombre).toBeNull(); // Usa || null
    expect(result.link).toBeNull();   // Usa || null
    expect(result.tipo_archivo).toBe(TipoArchivo.DOCUMENTO); // Usa || default
    expect(result.extension).toBeNull(); // Usa ?? null
    expect(result.size).toBe('');     // Usa || ''
    expect(result.filekey).toBeNull(); // Usa || null
  });
});



