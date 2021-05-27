export const isValidUsername = (username: string) =>
  /^[\w\d_]+$/.test(username) && username.length > 5 && username.length < 15;
