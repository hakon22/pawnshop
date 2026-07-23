export const isSqljsDatabase = (): boolean => {
  return process.env.DB_TYPE === 'sqljs';
};
