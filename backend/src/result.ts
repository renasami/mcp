export type Result<T, U> = OK<T> | Err<U>;

export type OK<T> = {
  readonly isOk: true;
  readonly isErr: false;
  readonly value: T;
};
export type Err<E> = {
  readonly isOk: false;
  readonly isErr: true;
  readonly value: E;
};

export const createOk = <T>(value: T): OK<T> => ({
  isOk: true,
  isErr: false,
  value,
});
export const createErr = <E>(value: E): Err<E> => ({
  isOk: false,
  isErr: true,
  value,
});
