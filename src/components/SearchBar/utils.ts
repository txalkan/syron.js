import { DidScheme, Resolver } from 'tyron';

export const isValidUsername = (username: string) =>
  /^[\w\d_]+$/.test(username) && username.length > 5 && username.length < 15;

export const resolvedDid = async ({
  username,
  domain
}: {
  username: string;
  domain: string;
}) => {
  const network = DidScheme.NetworkNamespace.Testnet;
  const initTyron = Resolver.InitTyron.Testnet;
  const didAddress = await Resolver.default.resolveDns(
    network,
    initTyron,
    username,
    domain
  );

  return didAddress;
};
