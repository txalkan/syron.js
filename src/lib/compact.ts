export function compact<T>(array: Array<T[]>): T[] {
  let tmp: T[] = [];

  for (let index = 0; index < array.length; index++) {
    const element = array[index];
    tmp = [...tmp, ...element];
  }

  return tmp;
}
