/**
 * Generate a bcrypt hash for ADMIN_PASSWORD_HASH.
 * Usage:  npm run hash-password
 * The password is read from a hidden prompt (never from argv, so it stays out of shell history).
 */
import bcrypt from 'bcryptjs';
import readline from 'readline';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
const out = rl as unknown as { _writeToOutput: (s: string) => void; output: NodeJS.WriteStream };
let muted = false;
out._writeToOutput = (s: string) => {
  if (!muted || s.includes('\n')) out.output.write(s);
};

rl.question('Admin password (12-72 chars): ', (pw) => {
  muted = false;
  process.stdout.write('\n');
  rl.close();
  if (pw.length < 12 || pw.length > 72) {
    console.error('Password must be 12-72 characters.');
    process.exit(1);
  }
  const hash = bcrypt.hashSync(pw, 12);
  console.log('\nSet these in Vercel → Project → Settings → Environment Variables:\n');
  console.log('ADMIN_USERNAME=<your username>');
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
  console.log('JWT_SECRET=<output of: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'base64\'))">');
});
muted = true;
