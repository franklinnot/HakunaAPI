// test/shared/infraestructure/base.repository.spec.ts
import { Model } from 'mongoose';
import { BaseRepository } from 'src/shared/infraestructure/repository/base.repository';
import { Estado } from 'src/shared/domain/enums';
import { IBaseEntity } from 'src/shared/domain/base.entity';

interface FakeEntity extends IBaseEntity {
  id: string;
  name: string;
  estado: Estado;
}

interface FakeDocument {
  _id: string;
  name: string;
  estado: Estado;
  save: jest.Mock<any, any>;
}

class FakeRepository extends BaseRepository<FakeEntity, FakeDocument> {
  protected toDomain(doc: FakeDocument): FakeEntity {
    return { id: doc._id, name: doc.name, estado: doc.estado };
  }
}

describe('BaseRepository', () => {
  let repository: FakeRepository;
  let model: jest.Mocked<Model<FakeDocument>>;

  beforeEach(() => {
    model = {
      exists: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
    } as any;

    repository = new FakeRepository(model);
  });

  it('should check if an entity exists', async () => {
    model.exists.mockResolvedValueOnce(true);
    const result = await repository.exists({ name: 'Pedro' });
    expect(model.exists).toHaveBeenCalledWith({ name: 'Pedro' });
    expect(result).toBe(true);
  });

  it('should check if an entity exists by id', async () => {
    model.exists.mockResolvedValueOnce(true);
    const result = await repository.existsById('1');
    expect(model.exists).toHaveBeenCalledWith({ _id: '1' });
    expect(result).toBe(true);
  });

  it('should find an entity by id', async () => {
    const doc = { _id: '1', name: 'Pedro', estado: Estado.HABILITADO };
    model.findById.mockReturnValueOnce({ exec: () => Promise.resolve(doc) });

    const result = await repository.findById('1');
    expect(result).toEqual({ id: '1', name: 'Pedro', estado: Estado.HABILITADO });
  });

  it('should create a new entity', async () => {
    const savedDoc = { _id: '1', name: 'John', estado: Estado.HABILITADO };
    const saveMock = jest.fn().mockResolvedValue(savedDoc);
    const createMock = jest.fn().mockImplementation(() => ({ save: saveMock }));

    (repository as any).model = Object.assign(createMock, model);

    const result = await repository.create({ name: 'John' } as any);
    expect(saveMock).toHaveBeenCalled();
    expect(result).toEqual({ id: '1', name: 'John', estado: Estado.HABILITADO });
  });
});
