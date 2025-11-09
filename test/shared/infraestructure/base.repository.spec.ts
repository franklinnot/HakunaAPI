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

describe('BaseRepository (Full Coverage)', () => {
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

  // ---------- exists ----------
  it('should return true when entity exists', async () => {
    model.exists.mockResolvedValueOnce(true);
    const result = await repository.exists({ name: 'Pedro' });
    expect(result).toBe(true);
  });

  it('should return false when entity does not exist', async () => {
    model.exists.mockResolvedValueOnce(null);
    const result = await repository.exists({ name: 'NotFound' });
    expect(result).toBe(false);
  });

  // ---------- existsById ----------
  it('should return true when entity exists by id', async () => {
    model.exists.mockResolvedValueOnce(true);
    const result = await repository.existsById('123');
    expect(result).toBe(true);
  });

  it('should return false when entity does not exist by id', async () => {
    model.exists.mockResolvedValueOnce(null);
    const result = await repository.existsById('123');
    expect(result).toBe(false);
  });

  // ---------- findById ----------
  it('should return entity when found by id', async () => {
    const doc = { _id: '1', name: 'Pedro', estado: Estado.HABILITADO };
    model.findById.mockReturnValueOnce({ exec: () => Promise.resolve(doc) });
    const result = await repository.findById('1');
    expect(result?.id).toBe('1');
  });

  it('should return null when not found by id', async () => {
    model.findById.mockReturnValueOnce({ exec: () => Promise.resolve(null) });
    const result = await repository.findById('not-found');
    expect(result).toBeNull();
  });

  // ---------- findOne ----------
  it('should return entity when found by filter', async () => {
    const doc = { _id: '2', name: 'Maria', estado: Estado.HABILITADO };
    model.findOne.mockReturnValueOnce({ exec: () => Promise.resolve(doc) });
    const result = await repository.findOne({ name: 'Maria' });
    expect(result?.name).toBe('Maria');
  });

  it('should return null when not found by filter', async () => {
    model.findOne.mockReturnValueOnce({ exec: () => Promise.resolve(null) });
    const result = await repository.findOne({ name: 'Missing' });
    expect(result).toBeNull();
  });

  // ---------- findAll ----------
  it('should return all entities', async () => {
    const docs = [
      { _id: '1', name: 'A', estado: Estado.HABILITADO },
      { _id: '2', name: 'B', estado: Estado.DESHABILITADO },
    ];
    model.find.mockReturnValueOnce({ exec: () => Promise.resolve(docs) });
    const result = await repository.findAll({});
    expect(result).toHaveLength(2);
  });

  it('should return empty array when no entities found', async () => {
    model.find.mockReturnValueOnce({ exec: () => Promise.resolve([]) });
    const result = await repository.findAll({});
    expect(result).toEqual([]);
  });

  // ---------- create ----------
  it('should create and return a new entity', async () => {
    const savedDoc = { _id: '1', name: 'John', estado: Estado.HABILITADO };
    const saveMock = jest.fn().mockResolvedValue(savedDoc);
    const createMock = jest.fn().mockImplementation(() => ({ save: saveMock }));

    (repository as any).model = Object.assign(createMock, model);
    const result = await repository.create({ name: 'John' } as any);
    expect(saveMock).toHaveBeenCalled();
    expect(result?.name).toBe('John');
  });

  it('should throw if create fails', async () => {
    const createMock = jest.fn().mockImplementation(() => ({
      save: jest.fn().mockRejectedValue(new Error('Save failed')),
    }));
    (repository as any).model = Object.assign(createMock, model);
    await expect(repository.create({ name: 'Bad' } as any)).rejects.toThrow('Save failed');
  });

  // ---------- update ----------
  it('should update and return entity', async () => {
    const updated = { _id: '1', name: 'Updated', estado: Estado.HABILITADO };
    model.findByIdAndUpdate.mockReturnValueOnce({
      exec: () => Promise.resolve(updated),
    });
    const result = await repository.update('1', { name: 'Updated' });
    expect(result?.name).toBe('Updated');
  });

  it('should return null when update finds nothing', async () => {
    model.findByIdAndUpdate.mockReturnValueOnce({ exec: () => Promise.resolve(null) });
    const result = await repository.update('x', { name: 'Updated' });
    expect(result).toBeNull();
  });

  // ---------- delete ----------
  it('should return true when delete succeeds', async () => {
    model.findByIdAndDelete.mockReturnValueOnce({ exec: () => Promise.resolve(true) });
    const result = await repository.delete('1');
    expect(result).toBe(true);
  });

  it('should return false when delete finds nothing', async () => {
    model.findByIdAndDelete.mockReturnValueOnce({ exec: () => Promise.resolve(null) });
    const result = await repository.delete('missing');
    expect(result).toBe(false);
  });

  // ---------- enable / disable ----------
  it('should disable an entity', async () => {
    jest.spyOn(repository, 'update').mockResolvedValueOnce({
      id: '1',
      name: 'User',
      estado: Estado.DESHABILITADO,
    });
    const result = await repository.disable('1');
    expect(result?.estado).toBe(Estado.DESHABILITADO);
  });

  it('should enable an entity', async () => {
    jest.spyOn(repository, 'update').mockResolvedValueOnce({
      id: '1',
      name: 'User',
      estado: Estado.HABILITADO,
    });
    const result = await repository.enable('1');
    expect(result?.estado).toBe(Estado.HABILITADO);
  });
});
