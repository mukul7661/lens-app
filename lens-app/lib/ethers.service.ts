import { TypedDataDomain } from "@ethersproject/abstract-signer";
import { ethers, utils, Wallet } from "ethers";
import omitDeep from "omit-deep";

const omit = (object: any, name: string) => {
  return omitDeep(object, name);
};

export const ethersProvider = new ethers.providers.JsonRpcProvider(
  "https://rpc-mumbai.matic.today"
);

export const getSigner = () => {
  return new Wallet(
    "b9a058bcc096eefdab4e76d0befe857d2311b0e6683f93ed0bbce7a675fde3b1",
    ethersProvider
  );
};

export const getAddressFromSigner = () => {
  return getSigner().address;
};

export const signedTypeData = async (
  domain: TypedDataDomain,
  types: Record<string, any>,
  value: Record<string, any>
) => {
  const signer = getSigner();

  // remove the __typedname from the signature!
  const result = await signer._signTypedData(
    omit(domain, "__typename"),
    omit(types, "__typename"),
    omit(value, "__typename")
  );

  // console.log('typed data - domain', omit(domain, '__typename'));
  // console.log('typed data - types', omit(types, '__typename'));
  // console.log('typed data - value', omit(value, '__typename'));
  // console.log('typed data - signature', result);

  // const whoSigned = utils.verifyTypedData(
  //   omit(domain, '__typename'),
  //   omit(types, '__typename'),
  //   omit(value, '__typename'),
  //   result
  // );
  // console.log('who signed', whoSigned);

  return result;
};

export const splitSignature = (signature: string) => {
  return utils.splitSignature(signature);
};

export const sendTx = (
  transaction: ethers.utils.Deferrable<ethers.providers.TransactionRequest>
) => {
  const signer = getSigner();
  return signer.sendTransaction(transaction);
};

export const signText = (text: string) => {
  return getSigner().signMessage(text);
};
