

import { set, get, del } from "idb-keyval";

export const saveKeys = async (privateKey, publicKey) => {
  await set("privateKey", privateKey);
  await set("publicKey", publicKey);
};

export const getKeys = async () => {
  const privateKey = await get("privateKey");
  const publicKey = await get("publicKey");

  return { privateKey, publicKey };
};


export const clearKeys = async () => {
  await del("privateKey");
  await del("publicKey");
};