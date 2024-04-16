export interface Command {
  command: string;
  help: string;
  alias?: string[];
}

export interface Line {
  text: string;
  type?: 'select';
  active?: boolean;
  spacing?: number;
}

export const TIPS: string[] = [
  "You can do simple math in the terminal. Try typing '2 + 2'.",
  "You can use the 'clear' command to clear the terminal.",
  "You can use the 'theme' command to change the terminal theme.",
  'You can use the arrow keys to navigate the terminal history.',
];

export const COMMANDS: Command[] = [
  {
    command: 'clear',
    help: 'Clear the terminal.',
  },
  // {
  //   command: 'dir',
  //   alias: ['ls'],
  //   help: 'Lists the files and directories in the current directory.',
  // },
  {
    command: 'funfact',
    help: 'Display a fun fact about Aaron.',
  },
  {
    command: 'tip',
    help: 'Display a tip about this terminal.',
  },
  {
    command: 'hello',
    help: 'Display a greeting',
  },
  {
    command: 'help',
    help: 'Display this help.',
  },
  // {
  //   command: 'theme',
  //   help: 'Change the terminal theme.',
  // },
  {
    command: 'version',
    alias: ['v', '--version', '--v'],
    help: 'Display this version of the terminal.',
  },
];

export const FUN_FACTS: string[] = [
  'Aaron has a dog named Faye.',
  'Aaron used to play football and track and has been to state for both.',
  'Aaron was an Army Ranger.',
  'Aaron has a skydiving license, and has jumped all over the world.',
];

export const WELCOME_MESSAGES: string[] = [
  'Hello, hacker! Ready to explore the digital frontier?',
  'Welcome back to the console. Let’s decode the day’s challenges.',
  'Good day, commander. What systems shall we conquer today?',
  'Hey there! All systems online and ready to go.',
  'Greetings, pioneer. The digital realm awaits your commands.',
  'Hello, world! Ready to create something amazing today?',
  "Welcome to your terminal. Type 'help' to explore available commands.",
  'Access granted. Welcome to your dashboard, adventurer.',
  'System ready. Awaiting your input...',
  'Command line loaded. Lead the way to innovation.',
  'Terminal active. Let’s disrupt the status quo.',
  'Hi there! Dive into the matrix and make your mark.',
  'Welcome, user. Let’s navigate through the code jungle today.',
  'Greetings from the server side! Ready to send some queries?',
  'Hello, developer. Your virtual workspace is set for greatness.',
  "Welcome! Type 'start' to begin your coding journey.",
  'System initialized. Your adventure starts here.',
  'Ready for a coding session? Let’s fire up those engines!',
  "Welcome aboard, navigator. Let's chart the digital seas.",
  'Console ready. What will you build today?',
];
