import { Dispatch, SetStateAction } from 'react';

const buildHandler =
  (setState: Dispatch<SetStateAction<string>>) =>
  (e: React.FormEvent<HTMLInputElement>) =>
    setState(e.currentTarget.value);

export default buildHandler;
