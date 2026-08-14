import { uuidv4 as uuidv4IdGenerator } from "lib0/random.js";
import { nanoid as nanoidGenerator } from "nanoid";
export const uuidv4 = () => {
  return uuidv4IdGenerator();
};
export const nanoid = () => {
  return nanoidGenerator(10);
};
