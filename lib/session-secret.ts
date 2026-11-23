export function sessionSecret(env:Record<string,string|undefined>=process.env):string {
  const secret=env.SESSION_SECRET||env.JWT_SECRET;
  if(!secret||secret.length<32)throw new Error('Set SESSION_SECRET (or JWT_SECRET) to a secret containing at least 32 characters.');
  return secret;
}
