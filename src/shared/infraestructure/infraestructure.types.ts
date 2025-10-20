import { IBaseEntity } from '../domain/base.entity';

type FilterOperators<T> = {
  $eq?: T;
  $ne?: T;
  $in?: T[];
  $nin?: T[];
  $regex?: RegExp;
};

export type QueryFilter<T extends IBaseEntity> = Partial<{
  [P in keyof T]: T[P] | FilterOperators<T[P]>;
}> & {
  $or?: QueryFilter<T>[];
  $and?: QueryFilter<T>[];
};
